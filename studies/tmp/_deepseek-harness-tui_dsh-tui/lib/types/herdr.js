import { execFileNoThrow } from './utils/execFileNoThrow.js';
const REPORT_TIMEOUT_MS = 2000;
const RELEASE_TIMEOUT_MS = 500;
const RETRY_DELAYS_MS = [100, 250, 500, 1000];
function withTimeout(promise, timeoutMs) {
    return new Promise(resolve => {
        const timer = setTimeout(() => resolve(undefined), timeoutMs);
        void promise.then(value => {
            clearTimeout(timer);
            resolve(value);
        }, () => {
            clearTimeout(timer);
            resolve(undefined);
        });
    });
}
/** Report this TUI's lifecycle to the owning Herdr pane when Herdr launches it. */
export function attachHerdrIntegration(options) {
    const env = options.env ?? process.env;
    const executable = env.HERDR_BIN_PATH?.trim();
    const paneId = env.HERDR_PANE_ID?.trim();
    if (env.HERDR_ENV !== '1' || !executable || !paneId)
        return undefined;
    const reportTimeoutMs = options.reportTimeoutMs ?? REPORT_TIMEOUT_MS;
    const releaseTimeoutMs = options.releaseTimeoutMs ?? RELEASE_TIMEOUT_MS;
    const retryDelays = options.retryDelaysMs ?? RETRY_DELAYS_MS;
    const run = options.run ?? ((file, args) => execFileNoThrow(file, args, { timeout: reportTimeoutMs }));
    const runSafely = (args) => {
        try {
            return Promise.resolve(run(executable, args));
        }
        catch {
            return Promise.reject(new Error('Herdr command could not be started'));
        }
    };
    const now = options.now ?? Date.now;
    let sequence = 0;
    const nextSequence = () => {
        const clock = now() * 1000;
        sequence = clock > sequence ? clock : sequence + 1;
        return String(sequence);
    };
    let lastConfirmedReport = '';
    let disposed = false;
    let running = false;
    let wakeDelay;
    let settledPromise = Promise.resolve();
    const computeState = () => {
        const blocked = options.questions.getSnapshot() !== null || options.approvals.getSnapshot() !== null;
        return { state: blocked ? 'blocked' : options.channel.working ? 'working' : 'idle', blocked };
    };
    const waitForRetry = (delayMs) => new Promise(resolve => {
        const timer = setTimeout(() => {
            wakeDelay = undefined;
            resolve();
        }, delayMs);
        wakeDelay = () => {
            clearTimeout(timer);
            wakeDelay = undefined;
            resolve();
        };
    });
    const processQueue = async () => {
        let failedState = '';
        let attempts = 0;
        try {
            while (!disposed) {
                const { state, blocked } = computeState();
                if (state === lastConfirmedReport)
                    break;
                if (state !== failedState) {
                    failedState = state;
                    attempts = 0;
                }
                attempts += 1;
                const result = await withTimeout(runSafely([
                    'pane', 'report-agent', paneId,
                    '--source', 'custom:dsh-tui',
                    '--agent', 'dsh-tui',
                    '--state', state,
                    ...(blocked ? ['--message', 'Waiting for user input'] : []),
                    '--seq', nextSequence(),
                ]), reportTimeoutMs);
                if (disposed)
                    break;
                if (result?.code === 0) {
                    lastConfirmedReport = state;
                    failedState = '';
                    attempts = 0;
                    continue;
                }
                if (attempts > retryDelays.length)
                    break;
                await waitForRetry(retryDelays[attempts - 1] ?? 0);
            }
        }
        finally {
            running = false;
        }
    };
    const report = () => {
        if (disposed)
            return;
        if (running) {
            wakeDelay?.();
            return;
        }
        if (computeState().state === lastConfirmedReport)
            return;
        running = true;
        settledPromise = processQueue();
    };
    const unsubscribes = [
        options.channel.subscribe(report),
        options.questions.subscribe(report),
        options.approvals.subscribe(report),
    ];
    report();
    let disposePromise;
    return {
        settled: () => settledPromise,
        dispose: () => {
            if (disposePromise !== undefined)
                return disposePromise;
            disposed = true;
            wakeDelay?.();
            for (const unsubscribe of unsubscribes)
                unsubscribe();
            const release = runSafely([
                'pane', 'release-agent', paneId,
                '--source', 'custom:dsh-tui',
                '--agent', 'dsh-tui',
                '--seq', nextSequence(),
            ]);
            disposePromise = withTimeout(release, releaseTimeoutMs).then(() => undefined);
            return disposePromise;
        },
    };
}

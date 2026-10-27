/**
 * Signals and exit in this package's entry go through the TUI's exit funnel
 * (./plugin.ts) when it is up, else the entry disposes the root, bounded. A
 * termination signal ends the process by that signal, not `runProfile`'s 0 /
 * 130 (the launcher reads non-zero as a crash, 0 hides it from `timeout`,
 * tmux and service managers); a second signal forces the exit at once.
 */
export const TERMINATION_SIGNALS = ['SIGTERM', 'SIGHUP', 'SIGINT'];
/** dsh `process-shutdown` PROCESS_SHUTDOWN_TIMEOUT_MS (0.2.1-rc.3): the dispose bound. */
export const PROCESS_SHUTDOWN_TIMEOUT_MS = 5000;
/** Last-resort bound for a funnel exit: outlasts its terminal cleanup plus the dispose bound. */
const BACKSTOP_MS = PROCESS_SHUTDOWN_TIMEOUT_MS + 2000;
/** How long a re-raised signal may be held by foreign listeners before they go. */
const RERAISE_GRACE_MS = 500;
const installed = new Map();
/**
 * End the process by `signal`. Only the entry's own listeners come off, so the
 * renderer's signal-exit hook still restores the terminal; a foreign listener
 * would keep the process alive, so after a short grace every listener goes.
 */
export function dieBySignal(signal) {
    for (const [name, listener] of installed)
        process.removeListener(name, listener);
    installed.clear();
    setTimeout(() => {
        process.removeAllListeners(signal);
        process.kill(process.pid, signal);
    }, RERAISE_GRACE_MS);
    process.kill(process.pid, signal);
}
/** Once per process. */
export function installEntrySignals(options) {
    let first;
    const onSignal = (signal) => {
        if (first !== undefined) {
            options.log?.('signal: second signal, forcing the exit', { first, signal });
            dieBySignal(signal);
            return;
        }
        first = signal;
        const answer = options.seam.request?.({ kind: 'signal', signal }) ?? 'refused';
        options.log?.('signal: received', { signal, answer });
        if (answer === 'supervising') {
            // The replacement decides; a second signal still forces this process.
            return;
        }
        setTimeout(() => {
            options.log?.('signal: backstop reached, forcing the exit', { signal });
            dieBySignal(signal);
        }, answer === 'refused' ? PROCESS_SHUTDOWN_TIMEOUT_MS : BACKSTOP_MS);
        if (answer === 'refused') {
            void options.disposeRoot().then(() => { dieBySignal(signal); }, () => { dieBySignal(signal); });
        }
    };
    for (const signal of TERMINATION_SIGNALS) {
        const listener = () => { onSignal(signal); };
        installed.set(signal, listener);
        process.on(signal, listener);
    }
}

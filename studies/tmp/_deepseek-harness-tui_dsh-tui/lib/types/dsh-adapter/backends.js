import { formatSessionRef } from '../agent/refs.js';
import { getBackend, listOfferedBackends, loadBackend } from './backend-registry.js';
import { reserveMount, reserveNewSession } from '../sessionMounts.js';
import { resumeTargetFromArgv } from '../sessionHistory.js';
import { mountFailureText } from '../sessions/resumeFailure.js';
import { getLang } from '../i18n.js';
import { installedTuiVersion } from '../update.js';
import { logForDebugging } from '../utils/debug.js';
import { backendDataDir } from '../utils/paths.js';
import { installExecutor } from './install/executors.js';
import { fileChannelTokens } from '../backends/shared/channel-tokens.js';
/**
 * The install surface of one registered backend (Stage B / B-1): the manifest's
 * recipe with the actions of the executor that recipe names. Undefined when the
 * entry declares no recipe, is not registered, or names an executor this host
 * does not implement — all three are "no install surface", which the picker
 * renders as the dim row's dead-end reason.
 *
 * The manifest says **what** (specifier + pin) and **which executor**; nothing
 * here imports a backend, and nothing is resolved before the user picks a row:
 * the entry behind that row is the one whose recipe gets run (§6 item 12).
 *
 * The id is a plain `string` on purpose, exactly like `getBackend`: membership is
 * half of what this answers, so asking about an id that was never registered is a
 * question with an answer, not a type error.
 */
export function installSurfaceFor(id) {
    const recipe = getBackend(id)?.manifest.install;
    if (recipe === undefined)
        return undefined;
    const executor = installExecutor(recipe.executor);
    if (executor === undefined)
        return undefined;
    return {
        ...recipe,
        resolveTarget: () => executor.resolveTarget(),
        start: (dir) => executor.start(recipe.specifier, dir),
        preflight: () => executor.preflight(),
    };
}
const credentialSources = new Map();
/**
 * The host services of one backend. Built per backend (not once for all of
 * them) because `dataDir` is backend-scoped: `<DATA_DIR>/backends/<id>` is the
 * only place a backend has any business writing, and the id is what names it.
 *
 * `locale` is a live read, not a snapshot: `/lang` switches the whole UI at
 * runtime, and a backend's own text follows it string by string (B-3). The
 * language union is restated by `getLang()`'s own return type, so a new
 * shipped language fails to compile here until the domain contract knows it.
 */
export async function createBackendHost(ctx, backendId, cwd, stderr) {
    const { createOAuthCredentialSource } = await import('./oauth-credential-source.js');
    const appVersion = installedTuiVersion();
    return {
        cwd,
        dataDir: backendDataDir(backendId),
        locale: () => getLang(),
        ...(appVersion === undefined ? {} : { appVersion }),
        debug: message => logForDebugging(message),
        warn: message => ctx.logger.warn(message),
        stderr,
        tokenStore: fileChannelTokens(undefined, message => logForDebugging(message)),
        oauthCredential: provider => {
            let source = credentialSources.get(provider);
            if (source === undefined) {
                source = createOAuthCredentialSource(provider);
                credentialSources.set(provider, source);
            }
            return source;
        },
    };
}
/**
 * What the channel needs about the startup backend before its session exists,
 * plus `start()`, which opens it (mount claim, open, history); the screen
 * mounts in between.
 * A resume failure rejects `start()`; no fresh session is started instead.
 */
export async function prepareBackendStartup(ctx, backend, input) {
    const launch = backend.launch;
    if (launch === undefined)
        throw new Error(`dsh-tui: backend "${backend.id}" does not support startup`);
    const host = await createBackendHost(ctx, backend.id, input.cwd, input.stderr);
    const prefs = launch.sessionPrefs(host);
    const requested = (input.configuredSessionId ?? resumeTargetFromArgv(input.argv, () => prefs.lastSession()))?.trim();
    const resumeId = requested === undefined || requested === ''
        ? undefined
        : requested.startsWith(`${backend.id}:`) ? requested.slice(backend.id.length + 1) : requested;
    const start = async () => {
        if (resumeId === undefined) {
            const session = await backend.open({ kind: 'create', cwd: input.cwd }, host);
            const { reservation } = await reserveNewSession(formatSessionRef(session.ref));
            reservation.settle();
            return { session, initialHistory: [] };
        }
        const key = formatSessionRef({ backendId: backend.id, sessionId: resumeId });
        const reserved = await reserveMount(key);
        if (!reserved.ok) {
            throw new Error(`dsh-tui: cannot resume ${backend.descriptor.label} session "${resumeId}": ${mountFailureText(reserved)} — ` +
                'two processes driving one session would interleave its transcript. Close that terminal, or drop --resume to start a fresh session.');
        }
        let session;
        let initialHistory;
        try {
            session = await backend.open({ kind: 'resume', sessionId: resumeId }, host);
            try {
                initialHistory = await session.history();
            }
            catch (error) {
                await session.dispose().catch(() => undefined);
                throw error;
            }
        }
        catch (error) {
            reserved.reservation.abandon();
            const reason = error instanceof Error ? error.message : String(error);
            throw new Error(`dsh-tui: cannot resume ${backend.descriptor.label} session "${resumeId}": ${reason} — no fresh session was started instead. ` +
                'Drop --resume to start a fresh session.', { cause: error });
        }
        reserved.reservation.settle();
        prefs.setLastSession(resumeId);
        prefs.touch(resumeId);
        return { session, initialHistory };
    };
    return {
        // Boot and landing-page state use the target this backend actually opened.
        resumedSessionId: resumeId,
        label: backend.descriptor.label,
        backendId: backend.id,
        catalog: backend.catalog,
        sessionPrefs: prefs,
        start,
        // A submitted user row means the backend has persisted a resumable transcript.
        persisted: (_sessionId, rows) => rows.some(row => row.kind === 'user'),
        resumeCommand: (sessionId) => launch.resumeCommand(sessionId),
        open: (target) => backend.open(target, target.kind === 'create' ? { ...host, cwd: target.cwd } : host),
    };
}
/** Resume failures abort boot; history is read before the channel's first paint. */
export async function openBackendStartup(ctx, backend, input) {
    const prepared = await prepareBackendStartup(ctx, backend, input);
    return { ...prepared, ...await prepared.start() };
}
/**
 * Probe every optional backend once (`dsh` is always available and has no
 * loader). Loading goes through the registry, so a probed backend's pool hook is
 * booked just like an opened one's — a backend that builds its pool in `detect()`
 * (the contract does not forbid it) is then still closed at exit. Failures leave
 * their row unavailable instead of failing the probe.
 */
export async function probeKernels(ctx, cwd) {
    const statuses = {};
    for (const entry of listOfferedBackends()) {
        if (entry.load === undefined)
            continue;
        // One host per entry: `dataDir` is backend-scoped, and a probe must not
        // hand a backend a directory that is not its own.
        const host = await createBackendHost(ctx, entry.id, cwd, () => undefined);
        try {
            statuses[entry.id] = await (await loadBackend(entry.id)).detect(host);
        }
        catch (error) {
            host.debug('dsh-tui: kernel probe failed (' + (error instanceof Error ? error.message : String(error)) + ')');
            statuses[entry.id] = { installed: false };
        }
    }
    return statuses;
}

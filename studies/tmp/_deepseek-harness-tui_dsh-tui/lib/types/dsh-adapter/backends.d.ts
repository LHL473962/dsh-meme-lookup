/** Non-DSH backend loading, detection and startup session ownership. */
import type { Context } from '@deepseek-ai/cordis';
import type { AgentBackend, BackendHost, OpenTarget, SdkInstallSurface } from '../agent/backend.js';
import type { AgentEvent } from '../agent/events.js';
import type { AgentSession } from '../agent/session.js';
import type { KernelStatus } from '../components/kernelCatalog.js';
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
export declare function installSurfaceFor(id: string): SdkInstallSurface | undefined;
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
export declare function createBackendHost(ctx: Context, backendId: string, cwd: string, stderr: (line: string) => void): Promise<BackendHost>;
/**
 * What the channel needs about the startup backend before its session exists,
 * plus `start()`, which opens it (mount claim, open, history); the screen
 * mounts in between.
 * A resume failure rejects `start()`; no fresh session is started instead.
 */
export declare function prepareBackendStartup(ctx: Context, backend: AgentBackend, input: {
    readonly cwd: string;
    readonly stderr: (line: string) => void;
    readonly configuredSessionId?: string;
    readonly argv: readonly string[];
}): Promise<{
    resumedSessionId: string | undefined;
    label: string;
    backendId: string;
    catalog: import("../agent/backend.js").SessionCatalog | undefined;
    sessionPrefs: import("../agent/backend.js").BackendSessionPrefs;
    start: () => Promise<{
        session: AgentSession;
        initialHistory: readonly AgentEvent[];
    }>;
    persisted: (_sessionId: string, rows: readonly {
        readonly kind: string;
    }[]) => boolean;
    resumeCommand: (sessionId: string) => string;
    open: (target: Extract<OpenTarget, {
        readonly kind: "create" | "resume";
    }>) => Promise<AgentSession>;
}>;
/** Resume failures abort boot; history is read before the channel's first paint. */
export declare function openBackendStartup(ctx: Context, backend: AgentBackend, input: Parameters<typeof prepareBackendStartup>[2]): Promise<{
    session: AgentSession;
    initialHistory: readonly AgentEvent[];
    resumedSessionId: string | undefined;
    label: string;
    backendId: string;
    catalog: import("../agent/backend.js").SessionCatalog | undefined;
    sessionPrefs: import("../agent/backend.js").BackendSessionPrefs;
    start: () => Promise<{
        session: AgentSession;
        initialHistory: readonly AgentEvent[];
    }>;
    persisted: (_sessionId: string, rows: readonly {
        readonly kind: string;
    }[]) => boolean;
    resumeCommand: (sessionId: string) => string;
    open: (target: Extract<OpenTarget, {
        readonly kind: "create" | "resume";
    }>) => Promise<AgentSession>;
}>;
/**
 * Probe every optional backend once (`dsh` is always available and has no
 * loader). Loading goes through the registry, so a probed backend's pool hook is
 * booked just like an opened one's — a backend that builds its pool in `detect()`
 * (the contract does not forbid it) is then still closed at exit. Failures leave
 * their row unavailable instead of failing the probe.
 */
export declare function probeKernels(ctx: Context, cwd: string): Promise<Record<string, KernelStatus>>;
//# sourceMappingURL=backends.d.ts.map
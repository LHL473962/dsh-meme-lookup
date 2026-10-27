import { type RawSessionHeader } from './header.js';
import type { SessionSummary } from './types.js';
/**
 * The slice of `ctx.sessionPersistence` this module uses.
 *
 * Structural and fully optional: the service is resolved from a running
 * context whose packages may be a version apart from ours, and a listing that
 * degrades is worth more than one that throws.
 */
export interface SessionSource {
    /** Public provider configuration scopes optional disk snapshots. */
    readonly name?: string;
    readonly config?: unknown;
    /** Stable through Context proxies, unlike the service wrapper object. */
    readonly identity?: symbol;
    /** Headers plus per-log change tokens — the contract built for this. */
    listSnapshots?: (signal?: AbortSignal) => Promise<readonly unknown[]>;
    /** Headers alone, for a backend or version without snapshots. */
    list?: (signal?: AbortSignal) => Promise<readonly unknown[]>;
    /** Absolute artifact path for one header; absent for storeless backends. */
    locate?: (meta: unknown) => unknown;
}
/** A header paired with the backend's change token, when it offered one. */
interface Listed {
    readonly header: RawSessionHeader;
    readonly raw: unknown;
    readonly revision: string | undefined;
}
/**
 * Enumerate stored sessions.
 *
 * Prefers `listSnapshots()` because its revision is the backend's own answer
 * to "has this log changed", and falls back to `list()` when the resolved
 * service predates it — in which case the change token is derived from the
 * file's own size and mtime further down. Both are honest change tokens for an
 * append-only log; only the authority differs.
 *
 * `list()` itself is read dual-shape: 0.1.5 folded snapshots INTO it (each
 * element is `{ header, revision, sizeBytes }`), while every older backend
 * returns bare headers — so each element is tried as a snapshot first and
 * then as a bare header.
 */
export declare function enumerateSessions(source: SessionSource, signal?: AbortSignal): Promise<Listed[]>;
/**
 * Read every stored session into a complete summary.
 *
 * @param source - The persistence service.
 * @param signal - Optional cancellation for the backend's own listing work.
 * @param priorityCwd - Resolve this workspace before others for partial results;
 *   the final listing still includes every workspace, sorted by activity.
 * @returns One summary per stored session, most recently active first. No
 *   filtering of any kind is applied — sub-agent runs and sessions with no
 *   conversation are present and labelled as such.
 */
export declare function listSummaries(source: SessionSource, signal?: AbortSignal, onEnriched?: (summary: SessionSummary) => void, onPartial?: (summaries: readonly SessionSummary[]) => void, priorityCwd?: string): Promise<readonly SessionSummary[]>;
/**
 * Resolve one session's artifact path.
 *
 * Listing headers is a first-line-only read per log — about 2 ms across a
 * fifty-session history — so the preview pane resolves its target this way
 * rather than making every summary carry a filesystem path it has no business
 * knowing about.
 *
 * @param source - The persistence service.
 * @param sessionId - Session to locate.
 * @returns The absolute artifact path, or undefined when the backend owns no
 *   per-session file or the session is gone.
 */
export declare function locateSession(source: SessionSource, sessionId: string, signal?: AbortSignal): Promise<string | undefined>;
export {};
//# sourceMappingURL=list.d.ts.map
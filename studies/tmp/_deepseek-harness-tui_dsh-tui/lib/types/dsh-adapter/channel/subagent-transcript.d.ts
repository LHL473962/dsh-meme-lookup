/**
 * DSH child transcript source (docs/dsh-child-transcript.md): the DSH
 * implementation of the backend-neutral `SubagentControl.history` contract,
 * next to Claude's on-disk child lane. Reads one direct child's own durable
 * session log through the public persistence range API only
 * (`ctx.sessionPersistence.open(id, 'read')` + `SessionHandle.read(offset,
 * length)`) and translates the page through a throwaway DSH translator into
 * the shared leaf vocabulary. The deprecated Session snapshot-events API and
 * the raw session-log file readers are not used.
 *
 * Read shape (every step bounded and fenced):
 *  1. ownership: the parent-owned `subagents.listChildren(parentId)` roster
 *     must name the child; a UI-supplied id is never opened on its own;
 *  2. durability: when the agents registry still holds the child's exact
 *     live Session, the public `ctx.sessions.flush(session)` barrier runs
 *     first (no whenIdle wait, no Agent create/resume); a failed or timed-out
 *     flush falls back to whatever prefix is already persisted;
 *  3. windows: the child's own events are `[inheritedEventCount, total)`;
 *     the fork-inherited prefix is never paged (a seeded header without its
 *     exact cut fails closed). `total` comes from `stat().eventCount` when
 *     the host states it, else from bounded single-event tail probes of the
 *     public range reader (never an unbounded whole-log read + slice);
 *  4. translation: a fresh translator instance per call; only the leaf
 *     kinds (`assistant.message` / `tool.call` / `tool.result`) survive,
 *     each stamped with the child lane's `parentCallId`, so the shared
 *     fold/page/merge pipeline consumes them exactly like Claude's;
 *  5. fences: the binding capture (session + generation) is re-checked after
 *     every await; a parent that moved on discards the page. The handle is
 *     closed exactly once on every path.
 */
import { type SessionEvent } from '@deepseek-ai/dsh-session';
import type { SubagentTranscriptPage, SubagentTranscriptWindow } from '../../agent/capabilities.js';
import type { DshTranslator } from '../backend/translate.js';
import type { SubagentsServiceView } from './subagent-projection.js';
/**
 * One page window in source events. Claude pages by 400 SDK messages
 * (`SUBAGENT_TRANSCRIPT_PAGE`) and the shared "load older" chunk is
 * `TRANSCRIPT_OLDER_CHUNK = 400`, so DSH pages by 400 SessionEvents and the
 * neutral cursor stays one unit wide for both backends.
 */
export declare const CHILD_TRANSCRIPT_PAGE_EVENTS = 400;
/** The binding identity one read captures and re-checks after every await. */
export interface ChildTranscriptCapture {
    readonly sessionId: string;
    readonly generation: number;
    /** The bound session object, opaque here; the `isCurrent` fence compares
     *  identity (the caller's binding owns the real type). */
    readonly session: object;
}
/** Structural slice of `ctx.sessionPersistence` the child transcript uses. */
export interface ChildPersistenceSource {
    /** Cheap metadata observation; `eventCount` optional by contract. */
    stat?(id: string, options?: {
        readonly signal?: AbortSignal;
    }): Promise<{
        readonly eventCount?: unknown;
    } | undefined>;
    open(id: string, access: 'read', options?: {
        readonly signal?: AbortSignal;
    }): Promise<ChildPersistenceHandle>;
}
/** The public read-only `SessionHandle` as this module reads it. */
export interface ChildPersistenceHandle {
    readonly id: unknown;
    readonly header: {
        readonly version?: unknown;
        readonly id?: unknown;
        readonly parentSession?: unknown;
        readonly isSeeded?: unknown;
    };
    /** Exact fork-inherited prefix length stored with the log (0 unseeded). */
    readonly inheritedEventCount?: unknown;
    read(offset?: number, length?: number, options?: {
        readonly signal?: AbortSignal;
    }): Promise<{
        readonly events: readonly SessionEvent[];
    }>;
    close(): Promise<void>;
}
/** Structural slice of `ctx.sessions` (dsh-session SessionStore). */
export interface ChildSessionsStore {
    flush(session: object): Promise<unknown>;
}
export interface ChildTranscriptDeps {
    /** Current binding identity; undefined when the DSH binding is gone. */
    capture(): ChildTranscriptCapture | undefined;
    /** False once the channel re/switched away from the captured binding. */
    isCurrent(capture: ChildTranscriptCapture): boolean;
    /** The continuation service (parent-owned child catalog). */
    subagents(): SubagentsServiceView | undefined;
    /** The persistence service, re-resolved per call (never cached stale). */
    persistence(): ChildPersistenceSource | undefined;
    /** The live sessions store for the pre-read flush barrier; optional. */
    sessionsStore(): ChildSessionsStore | undefined;
    /** Registry child lookup: the exact live Session when it is held. */
    lookupChild(id: string): {
        readonly session?: unknown;
    } | undefined;
    /** A throwaway translator per call: history must not touch the live
     *  translator's frame fence or open-call ledger (backend/session.ts's
     *  own `history()` rule). */
    createTranslator(): DshTranslator;
    /** Aborted when the channel owner releases; cancels a page read. */
    readonly ownerSignal?: AbortSignal;
}
/**
 * Read one child transcript page: the newest window, or the
 * `window`-addressed older slice, of the child's own durable events. Null =
 * the parent's catalog holds no such direct child; a rejection = the read
 * failed (the transcript view shows "unavailable", never a fabricated empty
 * page).
 */
export declare function readChildTranscriptPage(deps: ChildTranscriptDeps, agentId: string, window?: SubagentTranscriptWindow): Promise<SubagentTranscriptPage | null>;
//# sourceMappingURL=subagent-transcript.d.ts.map
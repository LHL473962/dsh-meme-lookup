import type { TitleSource } from './types.js';
/** Cheap file generation check for asynchronous listing writes. */
export declare function indexFileStamp(): string | undefined;
/** Facts derived from a log at one revision. */
export interface DerivedEntry {
    readonly revision: string;
    /** Artifact size at this observation; append growth can retain older title evidence. */
    readonly bytes: number;
    /** Last-write time observed with this revision, for the revision-only path. */
    readonly modifiedAt: number | undefined;
    /** Physical file identity; a replacement invalidates append-only evidence. */
    readonly identity: string | undefined;
    /** Optional in older indexes; certifies only the physical-file-derived summary. */
    readonly artifactStamp?: string;
    /** Old EOF neighborhood hash, paired with the backend's append-only contract. */
    readonly anchor: string | undefined;
    readonly title: string;
    readonly titleSource: TitleSource;
    /** False keeps the same revision eligible for another progressive attempt. */
    readonly titleComplete: boolean;
    readonly hasPrompt: boolean;
    readonly model: string | undefined;
    /** Older caches lack this proof and are enriched even on a revision hit. */
    readonly modelComplete?: boolean;
    readonly label: string | undefined;
}
/** One session's cached record: derived facts plus this install's own notes. */
export interface IndexEntry {
    readonly derived: DerivedEntry | undefined;
    /** Git branch this install was on when it last used the session. */
    readonly branch: string | undefined;
}
/** The whole cache, session id → entry. */
export type SessionIndex = Map<string, IndexEntry>;
/**
 * Load the cache.
 * @returns The parsed index; version 3 derivations are upgraded lazily and
 *   version 2 retains branch notes only.
 */
export declare function readIndex(): SessionIndex;
/**
 * Persist the cache, atomically.
 *
 * The write goes to a per-process temporary name and is renamed into place, so
 * a reader never observes a half-written file and a crash never leaves one.
 * A concurrent writer may win the rename; the loser's derivations are simply
 * recomputed next time.
 *
 * @param index - The index to store. Stable id order ignores scan scheduling.
 */
export declare function writeIndex(index: SessionIndex): void;
/**
 * Record the git branch this install is on for a session.
 *
 * Kept here rather than in the log because it is not a fact about the session,
 * it is a fact about how this machine used it — the same reason it is reported
 * as "branch when last used" and omitted entirely for sessions that predate
 * the note. Inventing a branch for them would be worse than showing none.
 *
 * @param sessionId - Session being used.
 * @param branch - Current branch, or undefined to leave any note untouched.
 */
export declare function noteBranch(sessionId: string, branch: string | undefined): void;
//# sourceMappingURL=store.d.ts.map
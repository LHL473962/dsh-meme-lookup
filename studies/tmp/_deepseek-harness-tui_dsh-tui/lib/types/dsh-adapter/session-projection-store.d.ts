/**
 * One host session-projection key, folded for the session on screen.
 *
 * The host projection feed is process-wide and carries whole values, so a
 * read side needs the same three pieces every time: drop other keys, narrow
 * the wire value with a local guard (the producer package is never imported),
 * and read one baseline snapshot when a session binds — a value is only
 * published on change, so a resumed session would otherwise wait for its next
 * event. The store keeps only the watched session's value: a background
 * session must not overwrite what the screen shows.
 *
 * @module
 */
import type { Context } from '@deepseek-ai/cordis';
import type { ProjectionRegistryLike } from './activity-store.js';
/** The session whose projection value the session on screen shows. */
export interface WatchedSession {
    readonly id: string;
    /** The live session object, when there is one to read a baseline from. */
    readonly session?: unknown;
}
export interface SessionProjectionStoreOptions<T> {
    /** Projection key the value is published under. */
    readonly key: string;
    /** Narrow one wire value of a session; anything else is dropped, never half-rendered. */
    narrow(value: unknown, sessionId: string): T | undefined;
    /** Map the bound session to the session it reads (default: itself). */
    watch?(session: unknown): WatchedSession;
    /** Read-failure sink, reported once per attached registry (the composition root's logger). */
    warn?(message: string): void;
}
export interface SessionProjectionStore<T> {
    /** Remember the host registry; a late registry seeds the bound session. */
    attachRegistry(registry: ProjectionRegistryLike): void;
    /** Forget a registry that left; nothing is read from it again and the value clears. */
    detachRegistry(registry: ProjectionRegistryLike): void;
    /** Bind the session on screen and read its watched value once. */
    seed(session: unknown): void;
    /** Record one value from the change feed. */
    update(sessionId: string, value: unknown): void;
    /**
     * Read the bound session's baseline again. For a change the feed does not
     * carry: a projection definition that left (its key reads as absent) or
     * came back.
     */
    reseed(): void;
    /** The bound session's id, once a session bound. */
    readonly boundId: string | undefined;
    /** The watched session's id, once a session bound. */
    readonly watchedId: string | undefined;
    /** The watched session's current value, stable between updates. */
    read(): T | undefined;
    subscribe(listener: () => void): () => void;
    noteReadFailure(error: unknown): void;
}
export declare function createSessionProjectionStore<T>(options: SessionProjectionStoreOptions<T>): SessionProjectionStore<T>;
/**
 * Wire one store to the host's projection registry once it exists. The
 * registry and the unit that publishes the key are mounted by other plugins,
 * so both may arrive later — or never, which leaves the store empty.
 * @param ctx - Host context of the composition root.
 * @param key - Projection key the store folds.
 * @param store - Store to fill.
 */
export declare function attachSessionProjection(ctx: Context, key: string, store: SessionProjectionStore<unknown>): void;
//# sourceMappingURL=session-projection-store.d.ts.map
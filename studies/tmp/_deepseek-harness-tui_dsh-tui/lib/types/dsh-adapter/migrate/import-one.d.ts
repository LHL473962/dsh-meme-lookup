/**
 * Import ONE foreign conversation through the host's persistence service —
 * the session screen's "select to start" path (the CLI batch keeps
 * importSessions, which mounts its own backend).
 *
 * Order is chosen so a failure never leaves a half-written log that the
 * next click would take for "already imported":
 *   1. the deterministic id already exists → open it, nothing is written;
 *   2. the working directory must exist (resuming into a missing cwd fails
 *      later and less clearly);
 *   3. the whole conversation is parsed and sessionized in memory;
 *   4. only then create → append → flush → close; a write failure removes
 *      what was written, best effort — except a create that lost to a
 *      concurrent writer of the same deterministic id: that log is the
 *      winner's, and the import simply opens it.
 *
 * @module @deepseek-harness-tui/dsh-tui/migrate/import-one
 */
import { SessionId, type SessionEvent, type SessionHeader } from '@deepseek-ai/dsh-session';
import type { LoadSkip, MigrationAdapter, MigrationSession } from './types.js';
/** Structural slice of the persistence service a single import needs. */
export interface ImportPersistence {
    create(header: SessionHeader): Promise<ImportWriteHandle>;
    /** Present on current backends: one session's snapshot, undefined when absent. */
    stat?(id: SessionId): Promise<unknown>;
    list(): Promise<readonly {
        header: {
            id: string;
        };
    }[]>;
}
export interface ImportWriteHandle {
    append(events: readonly SessionEvent[]): Promise<void>;
    flush(): Promise<void>;
    close(): Promise<void>;
}
/** Outcome of one import request. */
export type ForeignImportResult = {
    readonly kind: 'ready';
    readonly sessionId: string;
    readonly created: boolean;
} | {
    readonly kind: 'cwd-missing';
    readonly cwd: string;
} | {
    readonly kind: 'failed';
    readonly reason: LoadSkip['skip'] | 'write-failed';
    readonly detail?: string;
};
/** Deterministic DSH session id of one foreign conversation (same as /migrate). */
export declare function foreignSessionId(agentId: string, sourceId: string): SessionId;
/**
 * Write one sessionized conversation (the CLI batch path; the single import
 * phases create/append itself so a create race stays out of its cleanup).
 * Both paths produce byte-identical logs: sessionize is deterministic in
 * the id and the events.
 */
export declare function writeImportedSession(persistence: Pick<ImportPersistence, 'create'>, id: SessionId, agentId: string, session: MigrationSession): Promise<void>;
export interface ImportRequest {
    /** The listed conversation's stable source id (ForeignSessionSummary.sessionKey). */
    readonly sessionKey: string;
    readonly ref: string;
    /** The listed cwd; '' when the summary did not know it. */
    readonly cwd: string;
}
export interface ImportDeps {
    readonly cwdExists?: (path: string) => boolean;
    /** Best-effort removal of a partially written log. */
    readonly discard?: (sessionId: string) => void;
}
/**
 * Import one conversation unless it is already present.
 * @returns ready (with whether it was written now), cwd-missing, or failed.
 */
export declare function importForeignSession(persistence: ImportPersistence, adapter: MigrationAdapter, request: ImportRequest, deps?: ImportDeps): Promise<ForeignImportResult>;
/**
 * One importer per host: a second request for a conversation already being
 * imported joins the running one instead of starting another write.
 *
 * Requests are keyed by the conversation's IDENTITY (the id it will be written
 * under), not by its locator: two artifacts of one source can carry the same
 * source id (a Claude session continued in another project directory), and
 * two concurrent writes to one id would have the loser's cleanup delete the
 * winner's log. The locator is the key only when the identity is not known yet.
 */
export declare function createForeignImporter(persistence: () => ImportPersistence | undefined, deps?: ImportDeps): {
    import(adapter: MigrationAdapter, request: ImportRequest): Promise<ForeignImportResult>;
};
//# sourceMappingURL=import-one.d.ts.map
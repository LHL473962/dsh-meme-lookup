import type { SessionCapabilities } from '../../agent/capabilities.js';
export interface ClaudeTranscriptHistoryDeps {
    /** The session (a function when it can change: a conversation reset moves
     *  the CLI to a new session id, whose file has no older history yet). */
    readonly sessionId: string | (() => string);
    readonly cwd: string;
    /** The CLI's config directory (where its `projects/` live). */
    configDir(): string;
    /** Where the resumed chain began (a compaction), if it did. */
    readonly compactedFrom?: string;
    /** Entries per older slice (bounded; tests lower it). */
    readonly sliceEntries?: number;
    readonly debug?: (message: string) => void;
}
export declare function createClaudeTranscriptHistory(deps: ClaudeTranscriptHistoryDeps): NonNullable<SessionCapabilities['transcript']>;
//# sourceMappingURL=older-history.d.ts.map
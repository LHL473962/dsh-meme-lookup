/**
 * Browsing other coding agents' conversations for the session screen's source
 * tabs: which agents have any, what they are, and importing one.
 *
 * Everything that knows how a foreign agent stores its conversations stays in
 * this directory. The channel forwards these three calls unchanged, and the UI
 * sees rows whose `key` it only hands back — never a path, a fingerprint or a
 * source id.
 *
 * Nothing is persisted, and the cost is paid only by the tab that needs it:
 * - opening the session screen probes presence alone — each source's walk
 *   stops at its first candidate, a handful of directory reads;
 * - a source is listed when its tab is opened, and within this run an
 *   unchanged conversation (same mtime and size) is not read a second time.
 *
 * @module @deepseek-harness-tui/dsh-tui/migrate/browse
 */
import type { ForeignImportOutcome, ForeignSessionRow, ForeignSource } from '../../adapter/ports/channel-session.js';
import type { MigrationAdapter } from './types.js';
/** Whether an adapter can be browsed (summary scan + full load). */
export declare function isBrowsable(adapter: MigrationAdapter): boolean;
/**
 * The browser behind one channel.
 * @param persistence - The host's session persistence (imports go through it,
 *   so an imported session is immediately visible to resume).
 * @param signal - Aborts in-flight walks when the channel is torn down.
 * @param adapters - Every registered adapter; only browsable ones are used.
 */
export declare function createForeignBrowser(persistence: () => unknown, signal?: AbortSignal, adapters?: readonly MigrationAdapter[]): {
    /** Sources with at least one candidate, in registry order. */
    listSources(): Promise<readonly ForeignSource[]>;
    /**
     * One source's conversations, newest first. A listing superseded by a
     * newer one of the same source resolves to what is known, without
     * publishing its own result.
     */
    listSessions(agentId: string, onRow?: (row: ForeignSessionRow) => void): Promise<readonly ForeignSessionRow[]>;
    /** Import one listed conversation (or find the copy already imported). */
    importSession(agentId: string, key: string): Promise<ForeignImportOutcome>;
};
export type ForeignBrowser = ReturnType<typeof createForeignBrowser>;
//# sourceMappingURL=browse.d.ts.map
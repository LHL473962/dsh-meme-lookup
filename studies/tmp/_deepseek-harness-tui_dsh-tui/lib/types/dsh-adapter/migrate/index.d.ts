import { SessionId } from '@deepseek-ai/dsh-session';
import type { MigrationAdapter, MigrationSession } from './types.js';
export declare const MIGRATION_ADAPTERS: readonly MigrationAdapter[];
/**
 * The default import target: the shared DSH session store, resolved exactly
 * like the persistence backend's root (cordis.patch.yml): an explicit
 * `DSH_TUI_SESSION_ROOT` first, then `$DSH_HOME/sessions`, then
 * `~/.dsh/sessions`. Resolving it any other way would let the CLI import into
 * a store the TUI (and the source tabs) never read.
 */
export declare function defaultSessionRoot(): string;
/** Deterministic session id for one foreign conversation. */
export declare function migrationSessionId(adapter: MigrationAdapter, session: MigrationSession): SessionId;
export interface ImportRun {
    readonly imported: number;
    readonly existing: number;
    readonly failed: number;
    /** One-line cause per failed conversation, for the CLI summary. */
    readonly failures: readonly string[];
}
/**
 * Import every discovered conversation of one adapter into the DSH store.
 *
 * The persistence backend is mounted ONCE per run (one Context, one plugin
 * lifecycle) and disposed after the loop; sessions already present (same
 * deterministic id) are skipped, and a failed conversation never aborts the
 * batch — both properties the retired-store migration established first.
 *
 * @param adapter - the foreign agent to import from.
 * @param root - the DSH session root to write into.
 * @param sessions - the conversations to import (usually adapter.discover()).
 * @returns the per-run counters.
 */
export declare function importSessions(adapter: MigrationAdapter, root: string, sessions: readonly MigrationSession[]): Promise<ImportRun>;
//# sourceMappingURL=index.d.ts.map
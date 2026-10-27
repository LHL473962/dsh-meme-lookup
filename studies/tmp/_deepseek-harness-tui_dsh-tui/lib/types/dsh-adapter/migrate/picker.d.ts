import { type AdapterScanSpec } from './recent-agents.js';
/** One selectable picker row (rendered by components/MigratePicker.tsx). */
export interface MigratePickerRow {
    readonly agentId: string;
    readonly label: string;
    readonly count: number;
    /** Minutes since the newest source activity, when inside the window. */
    readonly minutesAgo?: number;
}
/** Each adapter's name-only scan shape, shared by count() callers and the activity hint. */
export declare const MIGRATE_SCAN_SPECS: Readonly<Record<string, AdapterScanSpec>>;
/**
 * Collect picker rows for every registered adapter: scan count plus a
 * recent-activity badge when the source was used inside the window. Recent
 * sources sort first (newest activity at top), cold sources keep registry
 * order. Sub-second at real-world scale, but still meant for a background
 * pass — never the render path.
 */
export declare function collectMigratePickerRows(nowMs: number): MigratePickerRow[];
/** One source's import outcome, parsed from the CLI child's stdout. */
export interface ImportSummary {
    readonly agentId: string;
    readonly imported: number;
    readonly existing: number;
}
/**
 * Parse per-source import counters out of the CLI's report lines
 * (`[<agentId>] imported 12 · already present 3`). Pure string work so the
 * TUI's completion notification can carry real numbers (PRD #3) without
 * re-running any scan.
 */
export declare function parseImportSummary(stdout: string): ImportSummary[];
/**
 * Classify one `/migrate` command line (the text AFTER the command word) into
 * the action Chat must take. Pure and registry-driven on purpose: whether a
 * command is valid must never depend on the picker having been opened first
 * (`migrateRows` is empty on a fresh mount, which used to make every
 * `/migrate <agent>` report an unknown source), and the CLI keeps the same
 * one-source rule (`dsh-tui migrate a b` is a usage error there too).
 *
 * @param rawInput - arguments after `/migrate`, e.g. `" claude-code --dry-run"`.
 * @param knownAgentIds - the adapter registry's ids (see MIGRATION_ADAPTERS).
 */
export declare function resolveMigrateCommand(rawInput: string, knownAgentIds: readonly string[]): MigrateCommand;
/** What one `/migrate` line asks for. */
export type MigrateCommand = {
    readonly kind: 'picker';
} | {
    readonly kind: 'import';
    readonly agentId: string;
    readonly dryRun: boolean;
} | {
    readonly kind: 'unknown';
    readonly agentId: string;
}
/** More than one source named: rejected, like the CLI's usage error. */
 | {
    readonly kind: 'usage';
}
/** `--dry-run` with no source: previewing needs to know what to preview. */
 | {
    readonly kind: 'dry-run-needs-source';
};
//# sourceMappingURL=picker.d.ts.map
/**
 * Hide the official automation-tasks entry while the board is on.
 *
 * The shell mounts two scheduling surfaces side by side in the sidebar: the
 * official `ui-schedule` client half ("Automation tasks" — the Host Schedule
 * service's own page) and this package's board ("Task board" — a Host ledger
 * that runs real DSH sessions). The board is the family's complete surface, so
 * while it is enabled the official row is hidden and the sidebar offers one
 * scheduling entry instead of two.
 *
 * The shell owns that row: it renders the button, the label, the tooltip, the
 * active highlight and the collapsed rail, and the host's own end-to-end suite
 * addresses the row by its accessible name. The row is therefore located the
 * same way — the shell's global panel list seat (`sidebar.panellist`), whose
 * per-row anchor the slot renderer stamps — and it is identified by the label
 * the shell itself resolves for that entry (`resolveSlotLabel`, exactly the
 * call the shell's panel projection makes), so the match follows the active
 * language instead of a hard-coded translation.
 *
 * The write is one inline `display: none` on the shell's own button: the row
 * stays mounted (React keeps owning it) and the official panel keeps working
 * everywhere else it is reachable — only the duplicate sidebar entry goes
 * away. The board's master switch owns the state, exactly as it owns the
 * board's own row: with the board off, the official row comes back.
 */
import { type StoredEntry } from '@deepseek-ai/dsh-client-ui-slots';
/**
 * The official automation-tasks panel id.
 *
 * The host `ui-schedule` client half registers its sidebar row and its
 * center-column page under this id; the shell's panel projection addresses
 * both by it.
 */
export declare const OFFICIAL_SCHEDULE_PANEL_ID = "schedules";
/** The slot-service slice the guard reads. */
export interface PanelSlotReader {
    entriesOfSlot?(key: string): readonly StoredEntry[];
}
/** The context slice the guard needs. */
export interface ScheduleRowGuardContext {
    slots?: PanelSlotReader;
}
/** The guard's controls. */
export interface ScheduleRowGuard {
    /** Hide the official row, and keep it hidden while the board is on. */
    hide(): void;
    /** Restore the official row: the board's master switch is off. */
    show(): void;
    /** Release the listeners and restore the row. */
    dispose(): void;
}
/**
 * The accessible name the shell renders on the official automation-tasks row.
 *
 * The shell projects its panel list with `resolveSlotLabel(options.label) ??
 * id`, and that value becomes the row's accessible name. Reading the same
 * value out of the same ledger is what keeps the DOM match correct in every
 * language.
 * @param entries - the live panel-list ledger.
 * @returns the row's accessible name, or undefined when the official panel is not mounted.
 */
export declare function officialScheduleRowLabel(entries: readonly StoredEntry[]): string | undefined;
/**
 * The shell's button for the panel row carrying this accessible name.
 *
 * Every global panel row renders one slot anchor inside the shell's own
 * button, so the anchor is the row's handle and the button is what the user
 * sees. Rows a plugin owns (they carry the family's own entry hook) are
 * skipped.
 * @param root - the document (or a subtree) to search.
 * @param label - the accessible name to match.
 * @returns the row button, or undefined when no row carries that name.
 */
export declare function findPanelRow(root: ParentNode, label: string): HTMLElement | undefined;
/**
 * Guard the official automation-tasks row against the board's presence.
 *
 * The guard hides the row while the board is enabled and restores it when the
 * board is switched off. It re-applies its write after every DOM change,
 * because the shell owns the row and may mount or replace it at any time (a
 * re-render, a panel-list change, the official plugin arriving late).
 * @param ctx - client context carrying the slot registry.
 * @param root - the document to search; defaults to the ambient one.
 * @returns the guard's controls.
 */
export declare function createScheduleRowGuard(ctx: ScheduleRowGuardContext, root?: ParentNode): ScheduleRowGuard;

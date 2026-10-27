/**
 * Data, derived state and actions for the session screen's foreign-source
 * tabs: another coding agent's conversations, grouped by directory, imported
 * on selection.
 *
 * It mirrors the DSH half's ownership rules rather than sharing its code: the
 * two lists carry different data (a DSH summary has live state, pins and a
 * registry; a foreign summary has none of those), and pretending one is the
 * other is exactly what the design ruled out. What is kept identical is the
 * cursor model — the cursor is ONE fact, the key of the row it stands on, and
 * every index is derived from it — because that is what makes Enter act on
 * the row under `❯` after a filter or a streamed row moved the rows.
 *
 * State is only what the visible tab needs: its rows and its cursor. Switching
 * tabs starts the new one fresh, and nothing outlives the screen — reopening a
 * source relists it, which the channel keeps cheap for unchanged ones.
 *
 * Every call is optional on the channel: a host (or a regression stub) that
 * predates the foreign-session facade simply has no source tabs.
 */
import type { ForeignSessionRow, ForeignSource } from '../../adapter/ports/channel-session.js';
import type { ResumeResult } from '../../adapter/ports/channel-view.js';
import type { ChannelUi as Channel } from '../../adapter/channel/ui-policy.js';
import { type RailEntry } from './model.js';
/** The tab id of the screen's own sessions; every other tab is an agent id. */
export declare const DSH_TAB = "dsh";
/** Rail key of the group holding conversations with no recorded directory. */
export declare const FOREIGN_UNKNOWN_GROUP = "foreign:unknown";
/** One rail row of a source tab: every conversation recorded in one directory. */
export interface ForeignGroup {
    /** Normalised directory, or {@link FOREIGN_UNKNOWN_GROUP}. */
    readonly key: string;
    /** The directory as recorded ('' for the unknown group). */
    readonly path: string;
    /** The DSH workspace title for a registered directory, else its basename. */
    readonly title: string;
    /** False when the recorded directory no longer exists. */
    readonly present: boolean;
    /** Newest first. */
    readonly rows: readonly ForeignSessionRow[];
    readonly newest: number;
}
type Notice = {
    text: string;
    tone: 'info' | 'error';
} | undefined;
export interface ForeignSessionsInput {
    readonly channel: Channel;
    /** The screen's active tab: {@link DSH_TAB} or a foreign agent id. */
    readonly tab: string;
    /** The DSH workspace registry, so a known directory keeps its DSH title. */
    readonly registry: readonly RailEntry[];
    /** The screen's live query (shared with the DSH half, cleared on tab switch). */
    readonly query: string;
    setNotice(next: Notice): void;
    /** Mount a persisted session (the channel's unified resume path). */
    onOpenSession(sessionId: string): Promise<ResumeResult>;
}
/**
 * Case-insensitive match over what a person searches a foreign row by: its
 * title and the directory it ran in.
 * @param row - The conversation to test.
 * @param needle - Lower-cased query; empty matches everything.
 * @returns True when the row stays visible.
 */
export declare function foreignRowMatchesQuery(row: ForeignSessionRow, needle: string): boolean;
/**
 * Group a source's conversations by directory, newest group first.
 *
 * A directory the DSH registry knows keeps the title the user gave it there,
 * so "the same project" reads the same in every tab; anything else is named by
 * its basename. Conversations with no recorded directory share one group.
 * @param rows - The source's conversations, any order.
 * @param registry - DSH workspace registry rows.
 * @param exists - Directory probe (injected for the regression).
 * @returns Groups sorted by their newest conversation, rows newest first.
 */
export declare function groupForeignRows(rows: readonly ForeignSessionRow[], registry: readonly RailEntry[], exists?: (path: string) => boolean): readonly ForeignGroup[];
/**
 * Derive the foreign-source half of the screen.
 * @param input - Channel, active tab, registry, shared query and notice, and
 *   the host's open action.
 * @returns The tab list, the active source's panes, and their actions.
 */
export declare function useForeignSessions(input: ForeignSessionsInput): {
    sources: readonly ForeignSource[];
    rows: readonly ForeignSessionRow[];
    loading: boolean;
    groups: readonly ForeignGroup[];
    selected: ForeignGroup | undefined;
    railFocus: number;
    visibleRows: ForeignSessionRow[];
    rowIndex: number;
    focusedRow: ForeignSessionRow;
    pane: "list" | "rail";
    selectGroup: (group: ForeignGroup) => void;
    moveRail: (by: 1 | -1) => void;
    moveList: (by: 1 | -1) => void;
    activateRail: () => void;
    activateList: () => void;
    focusRow: (row: ForeignSessionRow) => void;
    openRow: (row: ForeignSessionRow) => void;
    rescan: () => void;
};
export type ForeignSessionsModel = ReturnType<typeof useForeignSessions>;
export {};
//# sourceMappingURL=useForeignSessions.d.ts.map
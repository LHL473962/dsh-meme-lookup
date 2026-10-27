import React from 'react';
import type { ForeignSessionsModel } from './useForeignSessions.js';
/**
 * Chrome the right pane of a source tab spends outside its rows: the screen
 * header and divider, the pane banner, the filter, the notice and the hints.
 * Two rows fewer than the DSH pane, which also carries the new-session card.
 */
export declare const FOREIGN_PANE_CHROME_ROWS = 6;
/**
 * First visible row of a scroll window that keeps `focus` on screen, the same
 * anchoring the DSH list uses.
 * @param focus - Cursor index.
 * @param total - Rows in the list.
 * @param capacity - Rows the window shows.
 * @returns Index of the first row to draw.
 */
export declare function windowTop(focus: number, total: number, capacity: number): number;
/**
 * The two panes of a source tab: the source's directories on the left, the
 * conversations of the selected one on the right.
 *
 * Presentational only; every value and action comes from
 * {@link ForeignSessionsModel}. The shape follows the DSH panes on purpose so
 * the tabs read as one screen, with what a foreign source cannot do removed:
 * no workspace menu (the rail is derived, not a ledger), no new-session card,
 * no live state and no pins.
 */
export declare function ForeignSessionPanes({ model, sourceLabel, home, now, query, notice, railVisible, railWidth, railEntryCapacity, sessionWidth, rows, isTerminalFocused, filterFocused, cursorActive, onFilterFocus, }: {
    model: ForeignSessionsModel;
    /** The active source's display name. */
    sourceLabel: string;
    home: string;
    now: number;
    query: string;
    notice: {
        text: string;
        tone: 'info' | 'error';
    } | undefined;
    railVisible: boolean;
    railWidth: number;
    railEntryCapacity: number;
    sessionWidth: number;
    /** Terminal rows of the whole screen. */
    rows: number;
    isTerminalFocused: boolean;
    filterFocused: boolean;
    cursorActive: boolean;
    onFilterFocus(focused: boolean): void;
}): React.ReactNode;
//# sourceMappingURL=ForeignSessionPanes.d.ts.map
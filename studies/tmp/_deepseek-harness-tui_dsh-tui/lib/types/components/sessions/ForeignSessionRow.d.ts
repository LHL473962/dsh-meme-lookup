import React from 'react';
import type { ClickEvent } from '../../ink/events/click-event.js';
import type { ForeignSessionRow as ForeignSessionSummary } from '../../adapter/ports/channel-session.js';
/**
 * One conversation of another agent in a source tab: its title and age.
 * The directory is shown once for the selected group above both panes.
 *
 * It looks like a DSH session row on purpose — the same two lines, the same
 * `❯`, green selection and blue hover (see SessionListRow) — so the tabs read
 * as one screen. It is its own component rather than a shared core so the DSH
 * row stays untouched; the handful of lines below are the whole overlap.
 *
 * Deliberately NO import status. Selecting a row imports it on the spot (or
 * opens the copy an earlier selection made), so "imported or not" is a detail
 * of the selection, not a fact the user has to read before choosing; showing it
 * would also invite a sync the feature does not do.
 */
export declare function ForeignSessionRow({ session, width, focused, declareCursor, now, onClick, }: {
    session: ForeignSessionSummary;
    /** Columns available to the row. */
    width: number;
    focused: boolean;
    /** Park the native caret on this row while the list owns it. */
    declareCursor?: boolean;
    /** Epoch ms used for every relative time in this render pass. */
    now: number;
    /** Mouse click: import and open (same path as Enter). */
    onClick?(event: ClickEvent): void;
}): React.ReactNode;
//# sourceMappingURL=ForeignSessionRow.d.ts.map
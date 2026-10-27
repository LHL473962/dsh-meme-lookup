import React from 'react';
import type { ClickEvent } from '../../ink/events/click-event.js';
import type { ContextMenuEvent } from '../../ink/events/context-menu-event.js';
/**
 * One workspace in the home screen's left rail.
 *
 * Two lines, like every other navigable row in this app: the name line is what
 * the user named it, the detail line is where it actually is and how much is in
 * it. The path is not decoration — two workspaces can carry the same basename
 * (`.../a/work` and `.../b/work`), and the ledger allows duplicate titles, so
 * the path is the only thing that tells them apart.
 *
 * Widths are resolved here rather than left to flexbox for the same reason the
 * session rows resolve them: a row must be exactly two lines at every terminal
 * width, and a wrapped row destroys the alignment a list is scanned by.
 */
export declare function HomeWorkspaceRow({ title, path, home, sessionCount, historyOnly, present, selected, focused, declareCursor, width, onSelect, onMenu, }: {
    title: string;
    /** Canonical directory path recorded in the ledger. */
    path: string;
    /** Home directory, for collapsing the path to `~`. */
    home: string;
    sessionCount: number;
    /** Derived from session history, without a workspace registration. */
    historyOnly?: boolean;
    /** False when the recorded directory no longer exists. */
    present: boolean;
    /** Whether this workspace's sessions are the ones on the right. */
    selected: boolean;
    /** Keyboard cursor. */
    focused: boolean;
    /** Park the native caret on this row while the rail owns it. */
    declareCursor?: boolean;
    /** Columns available to the row. */
    width: number;
    /** Left click: show this workspace's sessions (same path as Enter). */
    onSelect?(event: ClickEvent): void;
    /** Right click: open the workspace action menu. */
    onMenu?(event: ContextMenuEvent): void;
}): React.ReactNode;
/**
 * The `+` row that opens the directory picker.
 *
 * Deliberately the FIRST row of the rail and always clickable: adding a
 * workspace is the rail's only creation action, and a control that is only
 * reachable by keyboard is a control most users never find in a terminal.
 */
export declare function HomeAddWorkspaceRow({ focused, width, onOpen, }: {
    focused: boolean;
    width: number;
    onOpen?(event: ClickEvent): void;
}): React.ReactNode;
//# sourceMappingURL=HomeWorkspaceRow.d.ts.map
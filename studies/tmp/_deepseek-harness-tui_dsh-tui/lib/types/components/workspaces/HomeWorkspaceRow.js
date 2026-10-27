import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Text } from '../../ui.js';
import { t } from '../../i18n.js';
import { formatProject, spreadRow, truncateWidth } from '../../sessions/format.js';
import { useDeclaredCursor, useNativeCursor } from '../../ink/hooks/use-declared-cursor.js';
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
export function HomeWorkspaceRow({ title, path, home, sessionCount, historyOnly = false, present, selected, focused, declareCursor = false, width, onSelect, onMenu, }) {
    const [hovered, setHovered] = useState(false);
    const nativeCursor = useNativeCursor();
    const cursorRef = useDeclaredCursor({ line: 0, column: 0, active: focused && declareCursor, visible: nativeCursor, hideOnIdle: true });
    const body = Math.max(8, width - 4);
    // The pane already labels the count; keep the rail's badge numeric and use
    // its selected ring rather than a second check mark for the same state.
    const badge = present ? String(sessionCount) : `${t('home-workspace-missing')} · ${sessionCount}`;
    const name = historyOnly ? `${t('supervisor-history-only')} · ${title}` : title;
    const heading = spreadRow(`${selected ? '▣' : '▢'} ${name}`, badge, body);
    const detail = formatProject(path, home);
    // The cursor (green) outranks the selection ring (green); both outrank the
    // idle colour. Blue is not part of this ladder at all — see the background.
    const headingColor = (focused || selected) ? 'success' : present ? 'text' : 'inactive';
    return (_jsxs(Box, { flexDirection: "column", flexShrink: 0, paddingX: 1, onClick: onSelect, onContextMenu: onMenu, onMouseEnter: onSelect === undefined && onMenu === undefined ? undefined : () => setHovered(true), onMouseLeave: onSelect === undefined && onMenu === undefined ? undefined : () => setHovered(false), 
        // Hover is the BLUE prompt — pointer feedback and nothing else, so it
        // never marks the focused or the selected row. Selection itself is green
        // in the text, which is why this row draws no box while selected.
        backgroundColor: hovered && !focused ? 'userMessageBackgroundHover' : undefined, children: [_jsxs(Box, { ref: cursorRef, height: 1, flexShrink: 0, overflow: "hidden", children: [_jsx(Text, { color: focused ? 'success' : 'subtle', children: focused ? '❯ ' : '  ' }), _jsx(Text, { color: headingColor, bold: focused || selected, children: heading.left }), _jsx(Text, { dimColor: !focused, children: `${' '.repeat(heading.gap)}${heading.right}` })] }), _jsx(Text, { color: (focused || selected) ? 'success' : undefined, dimColor: !(focused || selected), wrap: "truncate-end", children: `  ${truncateWidth(detail, body - 2)}` })] }));
}
/**
 * The `+` row that opens the directory picker.
 *
 * Deliberately the FIRST row of the rail and always clickable: adding a
 * workspace is the rail's only creation action, and a control that is only
 * reachable by keyboard is a control most users never find in a terminal.
 */
export function HomeAddWorkspaceRow({ focused, width, onOpen, }) {
    const [hovered, setHovered] = useState(false);
    const body = Math.max(8, width - 4);
    return (_jsxs(Box, { flexDirection: "column", flexShrink: 0, paddingX: 1, onClick: onOpen, onMouseEnter: onOpen === undefined ? undefined : () => setHovered(true), onMouseLeave: onOpen === undefined ? undefined : () => setHovered(false), backgroundColor: focused || hovered ? 'userMessageBackgroundHover' : undefined, children: [_jsxs(Box, { height: 1, flexShrink: 0, overflow: "hidden", children: [_jsx(Text, { color: focused ? 'suggestion' : 'subtle', children: focused ? '❯ ' : '  ' }), _jsx(Text, { color: "remember", bold: true, children: `＋ ${t('home-add-workspace')}` })] }), _jsx(Text, { dimColor: true, wrap: "truncate-end", children: `  ${truncateWidth(t('home-add-hint'), body - 2)}` })] }));
}

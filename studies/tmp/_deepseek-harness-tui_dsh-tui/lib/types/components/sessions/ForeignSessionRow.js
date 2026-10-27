import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Text } from '../../ui.js';
import { useTooltip } from '../Tooltip.js';
import { formatAbsolute, formatWhen, truncateWidth } from '../../sessions/format.js';
import { useDeclaredCursor, useNativeCursor } from '../../ink/hooks/use-declared-cursor.js';
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
export function ForeignSessionRow({ session, width, focused, declareCursor = false, now, onClick, }) {
    const [hovered, setHovered] = useState(false);
    const nativeCursor = useNativeCursor();
    const cursorRef = useDeclaredCursor({ line: 0, column: 0, active: focused && declareCursor, visible: nativeCursor, hideOnIdle: true });
    // Two cells for the focus marker.
    const body = Math.max(8, width - 2);
    const shownTitle = truncateWidth(session.title, Math.max(4, body - 2));
    const titleTooltip = useTooltip(() => {
        const parts = [];
        if (shownTitle !== session.title)
            parts.push(session.title);
        parts.push(formatAbsolute(session.updatedAt));
        if (session.cwd !== '')
            parts.push(session.cwd);
        return parts.join('\n');
    });
    const when = formatWhen(session.updatedAt, now);
    return (_jsxs(Box, { flexDirection: "column", flexShrink: 0, onClick: onClick, onMouseEnter: onClick === undefined ? undefined : () => setHovered(true), onMouseLeave: onClick === undefined ? undefined : () => setHovered(false), 
        // Hover is the blue prompt and never marks the focused row; selection is
        // the green foreground below, as on the DSH row.
        backgroundColor: hovered && !focused ? 'userMessageBackgroundHover' : undefined, children: [_jsxs(Box, { ref: cursorRef, children: [_jsx(Text, { color: focused ? 'success' : 'subtle', children: focused ? '❯ ' : '  ' }), _jsx(Box, { ...titleTooltip, children: _jsx(Text, { color: focused ? 'success' : undefined, bold: focused, children: shownTitle }) })] }), _jsx(Text, { color: focused ? 'success' : undefined, dimColor: !focused, children: `  ${truncateWidth(when, body)}` })] }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Text } from '../../ui.js';
import { t } from '../../i18n.js';
import { formatProject, formatWhen, projectName, spreadRow, truncateWidth } from '../../sessions/format.js';
/** One two-line working-directory choice in the /resume browser. */
export function WorkspaceListRow({ workspace, all, totalProjects, totalSessions, width, focused, selected, home, now, onClick, }) {
    const [hovered, setHovered] = useState(false);
    const body = Math.max(8, width - 4);
    const count = all ? totalSessions : workspace?.count ?? 0;
    const title = all ? t('session-workspace-all') : projectName(workspace?.cwd ?? '');
    const badge = all
        ? t('session-workspace-project-count', { n: totalProjects })
        : workspace?.current
            ? `${t('session-workspace-current')} · ${t('session-count-shown', { n: count })}`
            : t('session-count-shown', { n: count });
    const heading = spreadRow(`${all ? '◎' : '▣'} ${title}`, `${selected ? '✓ ' : ''}${badge}`, body);
    const detail = all
        ? t('session-workspace-all-detail', { n: count })
        : [
            formatProject(workspace?.cwd ?? '', home),
            count > 0 && workspace !== undefined
                ? formatWhen(workspace.updatedAt, now)
                : t('session-workspace-empty'),
        ].filter(Boolean).join(' · ');
    return (_jsxs(Box, { flexDirection: "column", flexShrink: 0, paddingX: 1, onClick: onClick, onMouseEnter: onClick === undefined ? undefined : () => setHovered(true), onMouseLeave: onClick === undefined ? undefined : () => setHovered(false), backgroundColor: focused || hovered ? 'userMessageBackgroundHover' : undefined, children: [_jsxs(Box, { height: 1, flexShrink: 0, overflow: "hidden", children: [_jsx(Text, { color: focused ? 'suggestion' : 'subtle', children: focused ? '❯ ' : '  ' }), _jsx(Text, { color: focused ? 'suggestion' : selected ? 'success' : 'text', bold: focused || selected, children: heading.left }), _jsx(Text, { dimColor: !focused, children: `${' '.repeat(heading.gap)}${heading.right}` })] }), _jsx(Text, { dimColor: true, wrap: "truncate-end", children: `  ${truncateWidth(detail, body - 2)}` })] }));
}

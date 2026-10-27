import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Box, Text, useTerminalSize, useAnimationFrame } from '../ui.js';
import { t } from '../i18n.js';
import { jobOutputRows } from './Chat/JobCard.js';
import { isMinimalUiMode } from '../minimalUiMode.js';
function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m${seconds % 60}s`;
}
/** Status glyph and color of a team member (`·`-style in minimal UI). */
export function teamStatusGlyph(status, minimalUi) {
    switch (status) {
        case 'running': return minimalUi ? { glyph: '·' } : { glyph: '🟡', color: 'warning' };
        case 'idle': return minimalUi ? { glyph: '○' } : { glyph: '🔵', color: 'accent' };
        case 'active': return minimalUi ? { glyph: '◇' } : { glyph: '🟣', color: 'accent' };
        case 'provisioning': return minimalUi ? { glyph: '…' } : { glyph: '⚪', color: 'subtle' };
        case 'failed': return minimalUi ? { glyph: '×' } : { glyph: '🔴', color: 'error' };
    }
}
export function SubagentCard({ subagent, focused, onClick, variant = 'default', teamMember }) {
    const panelMode = variant === 'panel';
    const running = teamMember !== undefined
        ? teamMember.status === 'running'
        : subagent.status === 'running' || subagent.status === 'starting';
    const [clockRef] = useAnimationFrame(running ? 1000 : null);
    // Unknown rows have no completion time, so they do not get a fabricated duration.
    const elapsed = running
        ? Date.now() - subagent.startedAt
        : subagent.completedAt !== undefined ? subagent.completedAt - subagent.startedAt : undefined;
    // Prefer backend-reported totals; fall back to the locally observed records.
    const toolsCount = subagent.reportedToolUses ?? subagent.toolCalls.length;
    const shownDuration = subagent.reportedDurationMs ?? elapsed;
    const total = subagent.tokens?.total ?? ((subagent.tokens?.input ?? 0) + (subagent.tokens?.output ?? 0) || 0);
    // Mouse affordance: clickable cards tint on hover; the keyboard-focused
    // card keeps its brand-color header (no double highlight).
    const [hovered, setHovered] = useState(false);
    const liveLine = running ? subagent.output[subagent.output.length - 1] : undefined;
    const minimalUi = isMinimalUiMode();
    const teamGlyph = teamMember === undefined ? undefined : teamStatusGlyph(teamMember.status, minimalUi);
    const glyph = teamGlyph !== undefined ? teamGlyph.glyph
        : running ? (minimalUi ? '·' : '🟡')
            : subagent.status === 'unknown' ? (minimalUi ? '·' : '⚪')
                : subagent.status === 'failed' || subagent.status === 'cancelled' ? (minimalUi ? '×' : '🔴')
                    : (minimalUi ? '✓' : '🟢');
    const glyphColor = teamGlyph !== undefined ? teamGlyph.color
        : minimalUi ? undefined
            : running ? 'warning'
                : subagent.status === 'unknown' ? 'subtle'
                    : subagent.status === 'failed' || subagent.status === 'cancelled' ? 'error'
                        : 'success';
    const hoverTint = onClick !== undefined && hovered && !focused;
    // Keep the description on one row; narrower panels progressively drop metadata.
    const { columns } = useTerminalSize();
    const previewRows = panelMode && running
        ? jobOutputRows(subagent.output.map(text => ({ text })), Math.max(1, columns - 5), 2)
        : [];
    const metaParts = [];
    if (columns >= 56)
        metaParts.push(subagent.model ?? subagent.provider ?? 'default');
    if (shownDuration !== undefined)
        metaParts.push(formatDuration(shownDuration));
    if (columns >= 44)
        metaParts.push(`${total || '—'} tok`);
    if (columns >= 34 && (!panelMode || toolsCount > 0))
        metaParts.push(`${toolsCount} tools`);
    const meta = metaParts.join(' · ');
    const panelMeta = [
        subagent.model ?? subagent.provider,
        subagent.effort,
        shownDuration === undefined ? undefined : formatDuration(shownDuration),
    ].filter(part => part !== undefined && part !== '').join(' · ');
    return _jsxs(Box, { ref: clockRef, flexDirection: "column", paddingLeft: 1, marginBottom: panelMode ? 0 : 1, onClick: onClick, onMouseEnter: onClick !== undefined ? () => setHovered(true) : undefined, onMouseLeave: onClick !== undefined ? () => setHovered(false) : undefined, backgroundColor: hoverTint ? 'userMessageBackgroundHover' : undefined, children: [_jsxs(Box, { flexDirection: "row", children: [_jsx(Box, { flexShrink: 0, marginRight: 1, children: _jsx(Text, { color: glyphColor, children: glyph }) }), _jsx(Box, { flexGrow: 1, flexShrink: 1, overflow: "hidden", children: _jsx(Text, { bold: true, color: focused ? 'accent' : undefined, wrap: "truncate-end", children: teamMember !== undefined ? teamMember.name : panelMode ? subagent.description : `${t('subagent-card-prefix')}${subagent.description}` }) }), teamMember !== undefined && (_jsx(Box, { flexShrink: 0, marginLeft: 1, children: _jsx(Text, { color: focused ? 'accent' : teamGlyph?.color, dimColor: teamMember.status === 'provisioning', children: t(`team-status-${teamMember.status}`) }) })), teamMember === undefined && subagent.mode === 'continuable' && (_jsx(Box, { flexShrink: 0, marginLeft: 1, children: _jsx(Text, { color: focused ? 'accent' : 'warning', children: t('subagent-mode-continuable') }) })), teamMember === undefined && subagent.mode === 'one-shot' && (_jsx(Box, { flexShrink: 0, marginLeft: 1, children: _jsx(Text, { dimColor: true, children: t('subagent-mode-one-shot') }) })), !panelMode && meta !== '' && (_jsx(Box, { flexShrink: 0, marginLeft: 1, children: _jsx(Text, { dimColor: true, wrap: "truncate-end", children: meta }) }))] }), panelMode && panelMeta !== '' && _jsx(Box, { paddingLeft: 3, children: _jsx(Text, { dimColor: true, wrap: "wrap", children: panelMeta }) }), panelMode
                ? previewRows.map(row => _jsx(Text, { dimColor: true, wrap: "truncate", children: `  ${row.text}` }, row.key))
                : liveLine !== undefined && _jsx(Text, { dimColor: true, wrap: "truncate", children: `  │ ${liveLine}` })] });
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Box, Text, useAnimationFrame, useTerminalSize } from '../../ui.js';
import { formatJobDuration } from '../../dsh-adapter/jobs.js';
import { t } from '../../i18n.js';
import { wrapTextLines } from '../../ink/wrap-text.js';
import { isMinimalUiMode } from '../../minimalUiMode.js';
import { ProgressBar } from '../design-system/ProgressBar.js';
/** The waterfall window mirrors the subagent card: a constant-height region. */
const WATERFALL_ROWS = 2;
const COMMAND_MARK = process.platform === 'win32' ? '>' : '❯';
/** Static status marker — deliberately NOT the animated activity-indicator
 *  preset: a background job is parked work, and reusing the main spinner
 *  language for every card reads as clutter. ● = live background work
 *  (echoing the status-line chip), ✓/✗ for terminal states. NOTE: no ⚙ —
 *  U+2699 is East-Asian Ambiguous: ink measures it 1 cell while CJK
 *  terminal fonts paint it 2, so the following text overlaps the glyph. */
function statusInfo(status) {
    const minimalUi = isMinimalUiMode();
    switch (status) {
        case 'completed':
            return { glyph: '✓', label: t('jobs-status-completed'), color: minimalUi ? undefined : 'success' };
        case 'failed':
            return { glyph: '✗', label: t('jobs-status-failed'), color: minimalUi ? undefined : 'error' };
        case 'killed':
            return { glyph: '✗', label: t('jobs-status-killed'), color: minimalUi ? undefined : 'error' };
        case 'stopping':
            return { glyph: '●', label: t('jobs-status-stopping'), color: minimalUi ? undefined : 'warning' };
        default:
            return { glyph: '●', label: t('jobs-status-running'), color: minimalUi ? undefined : 'warning' };
    }
}
/**
 * Producer progress as the design system's bar: `n/m` draws a 5-cell
 * sub-cell-accurate `ProgressBar` (same primitive the rest of the TUI uses)
 * plus the raw counter; any other shape passes through verbatim. Exported for
 * the /jobs panel so both surfaces read the same.
 */
export function JobProgress({ progress }) {
    const match = /^(\d+)\s*\/\s*(\d+)$/.exec(progress.trim());
    const current = match === null ? Number.NaN : Number(match[1]);
    const total = match === null ? Number.NaN : Number(match[2]);
    if (!Number.isFinite(current) || !Number.isFinite(total) || total <= 0) {
        return _jsx(Text, { color: "accent", wrap: "truncate-end", children: progress });
    }
    return (_jsxs(Box, { flexDirection: "row", gap: 1, children: [_jsx(ProgressBar, { ratio: Math.min(current, total) / total, width: 5, fillColor: "accent", emptyColor: "inactive" }), _jsx(Text, { color: "accent", children: progress.trim() })] }));
}
/**
 * The waterfall window: every entry is WRAPPED at the card width FIRST, then
 * the last `budget` VISUAL rows are kept. A 400-cell JSON line therefore
 * shows its ending folded over the rows instead of a clipped head — and the
 * window still costs a constant number of rows, which is what the
 * transcript's virtualization measures.
 */
export function jobOutputRows(entries, width, budget) {
    const rows = [];
    // One cell of slack: a line that lands exactly on the boundary is re-wrapped
    // by ink's own renderer, which would silently double that row's height.
    const textWidth = Math.max(1, width - 1);
    for (let index = entries.length - 1; index >= 0 && rows.length < budget; index--) {
        const entry = entries[index];
        const wrapped = wrapTextLines(entry.text, textWidth).map(line => line.text);
        for (let row = wrapped.length - 1; row >= 0 && rows.length < budget; row--) {
            rows.unshift({
                key: `${index}-${row}`,
                text: wrapped[row] ?? '',
            });
        }
        if (entry.gapBefore === true && rows.length < budget)
            rows.unshift({ key: `gap-${index}`, text: '', gap: true });
    }
    return rows;
}
/** Command content shares normalization and wrapping with the full jobs panel. */
export function jobCommandRows(text, width, expanded) {
    const command = text.trim();
    const script = command.replace(/^(?:pwsh|powershell)(?:\.exe)?\s+(?:(?:-(?:NoProfile|NoLogo|NonInteractive)|-ExecutionPolicy\s+\S+)\s+)*-Command\s+/i, '');
    const body = (script === command ? script : script.replace(/^(['"])([\s\S]*)\1$/, '$2')).replace(/\r\n?/g, '\n').trim();
    const source = body.split('\n').filter((line, index, lines) => line.trim() !== '' || index === 0 || lines[index - 1]?.trim() !== '').join('\n');
    const shown = expanded ? source : source.split('\n')[0];
    const rows = wrapTextLines(COMMAND_MARK + ' ' + shown, Math.max(1, width)).map(line => line.text);
    return expanded ? rows : rows.slice(0, 1);
}
/** The renderer draws the continuous section edge across all content rows. */
export function JobSection({ rows, color, onToggle, children }) {
    if (rows.length === 0 && children === undefined)
        return null;
    return _jsx(Box, { flexDirection: "column", borderStyle: "single", borderTop: false, borderBottom: false, borderRight: false, borderLeft: true, borderColor: color, paddingLeft: 1, onClick: onToggle === undefined ? undefined : event => { event.stopImmediatePropagation(); onToggle(); }, children: children === undefined ? rows.map((line, index) => _jsx(Text, { dimColor: true, wrap: "truncate-end", children: line === '' ? ' ' : line }, index)) : children });
}
/** Transcript job card: command folding is independent of the fixed output tail. */
export function JobCard({ job, marginTopOnTurn, onClick, onWatchOutput, expanded = false, onToggle }) {
    const settled = job.status === 'completed' || job.status === 'failed' || job.status === 'killed';
    React.useEffect(() => (settled || onWatchOutput === undefined ? undefined : onWatchOutput(job.id)), [settled, onWatchOutput, job.id]);
    const [viewportRef] = useAnimationFrame(settled ? null : 1000);
    const { columns } = useTerminalSize();
    const info = statusInfo(job.status);
    const [hovered, setHovered] = React.useState(false);
    const contentWidth = Math.max(1, columns - 2);
    const commandRows = jobCommandRows(job.label, contentWidth, expanded);
    const output = jobOutputRows(job.outputLines, Math.max(1, contentWidth - 1), WATERFALL_ROWS);
    const outputRows = output.map((entry, index) => (index === 0 ? '≡ ' : '') + (entry.gap === true ? t('jobs-output-gap') : entry.text));
    const headerDetail = job.detail !== undefined && job.detail !== '' ? job.detail : undefined;
    const headerName = `${t('jobs-card-prefix')}${job.id}`;
    const duration = formatJobDuration(job);
    const liveProgress = settled || job.progress === undefined || job.progress === '' ? undefined : job.progress;
    return _jsxs(Box, { flexDirection: "column", marginTop: marginTopOnTurn ? 1 : 0, ref: viewportRef, onClick: onToggle === undefined ? undefined : event => { event.stopImmediatePropagation(); onToggle(); }, onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false), children: [_jsxs(Box, { flexDirection: "row", gap: 1, height: 1, overflow: "hidden", onClick: onClick === undefined ? undefined : event => { event.stopImmediatePropagation(); onClick(); }, children: [_jsx(Box, { flexShrink: 0, children: _jsx(Text, { color: hovered ? 'accent' : info.color, children: info.glyph }) }), _jsx(Box, { flexShrink: 0, children: _jsx(Text, { bold: true, color: hovered ? 'accent' : undefined, children: headerName }) }), _jsx(Box, { flexShrink: 0, children: _jsx(Text, { dimColor: true, children: job.kind }) }), liveProgress !== undefined && _jsx(Box, { width: 12, flexShrink: 0, children: _jsx(JobProgress, { progress: liveProgress }) }), _jsx(Box, { flexShrink: 0, children: _jsx(Text, { dimColor: true, children: duration }) }), headerDetail !== undefined && _jsx(Box, { flexShrink: 0, children: _jsx(Text, { dimColor: true, wrap: "truncate-end", children: headerDetail }) }), _jsx(Box, { flexShrink: 0, children: _jsx(Text, { color: info.color, children: info.label }) })] }), _jsx(JobSection, { rows: commandRows, color: "accent" }), _jsx(JobSection, { rows: outputRows, color: "success" })] });
}

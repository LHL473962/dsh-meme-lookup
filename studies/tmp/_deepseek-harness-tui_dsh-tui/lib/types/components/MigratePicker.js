import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { t } from '../i18n.js';
import { Box, Text } from '../ui.js';
import { Pane } from './design-system/Pane.js';
import { ListItem } from './design-system/ListItem.js';
import { HintLine } from './design-system/HintLine.js';
import { listWindow } from './listWindow.js';
import { useOverlayListRows } from './OverlayAbove.js';
/**
 * `/migrate` source picker (multi-select, PRD revision): each row shows a
 * checkbox, the scannable file count, and a recent-activity badge. Keys
 * (Chat owns the logic): space toggles the focused source, `a` selects
 * all/none, Enter proceeds to the confirmation layer with the checked set
 * (the focused row when nothing is checked), Esc closes. While the rows are
 * still being collected it says so — the scan takes a moment on real stores
 * and "no sources available" would be a lie in that window.
 */
export function MigratePicker({ rows, focusIndex, checked, loading = false, onPick, }) {
    // 每项恒占 2 行（主行 + 描述行），预算同 SkillsPicker（OverlayAbove 高度
    // 减 Pane 2 + 标题 2 + 页脚 1 + marginTop 1 = 6）。
    const listRows = useOverlayListRows(6);
    const { start, end } = listWindow(rows.map(() => 2), focusIndex, listRows);
    return (_jsxs(Pane, { color: "permission", children: [_jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: "remember", bold: true, children: t('picker-title-migrate') }) }), loading ? (_jsx(Text, { dimColor: true, children: t('migrate-picker-scanning') })) : rows.length === 0 ? (_jsx(Text, { dimColor: true, children: t('migrate-picker-empty') })) : (rows.slice(start, end).map((row, index) => {
                        const absoluteIndex = start + index;
                        const description = row.minutesAgo !== undefined
                            ? t('migrate-picker-recent', { minutes: row.minutesAgo })
                            : t('migrate-picker-cold');
                        return (_jsx(ListItem, { isFocused: absoluteIndex === focusIndex, description: description, showScrollUp: absoluteIndex === start && start > 0, showScrollDown: absoluteIndex === end - 1 && end < rows.length, onClick: onPick ? () => onPick(absoluteIndex) : undefined, children: `${checked.has(row.agentId) ? '[x]' : '[ ]'} ${row.label} · ${t('migrate-picker-count', { n: row.count })}` }, row.agentId));
                    }))] }), _jsx(Text, { dimColor: true, italic: true, children: _jsx(HintLine, { text: t('migrate-picker-hint') }) })] }));
}
/**
 * The second confirmation layer (PRD #2): one line per checked source with
 * its scannable count and the repeat-safe note. Keys (Chat): Enter imports,
 * `d` dry-runs, Esc returns to the picker with the checked set preserved.
 */
export function MigrateConfirm({ rows, }) {
    return (_jsxs(Pane, { color: "permission", children: [_jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: "remember", bold: true, children: t('migrate-confirm-title') }) }), rows.map(row => (_jsx(Box, { paddingLeft: 1, children: _jsx(Text, { children: t('migrate-confirm-line', { label: row.label, n: row.count }) }) }, row.agentId))), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: t('migrate-confirm-note') }) })] }), _jsx(Text, { dimColor: true, italic: true, children: _jsx(HintLine, { text: t('migrate-confirm-actions') }) })] }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { t } from '../i18n.js';
import { Box, Text } from '../ui.js';
import { useTerminalFocus } from '../ink/hooks/use-terminal-focus.js';
import { Pane } from './design-system/Pane.js';
import { ListItem } from './design-system/ListItem.js';
import { HintLine } from './design-system/HintLine.js';
import { SearchBox } from './SearchBox.js';
import { listWindow } from './listWindow.js';
import { useOverlayListRows } from './OverlayAbove.js';
import { historyEntryId } from '../history.js';
/**
 * The ctrl+r history search dialog: a permission-colored Pane with a bold
 * title, the ⌕ SearchBox, the filtered history as ListItem rows (newest
 * first), and the ↑/↓ · Enter · Esc hint line. Keyboard handling lives in
 * the caller (Chat).
 */
export function HistorySearchDialog({ query, cursorOffset, matches, focusIndex, onPick, }) {
    const isTerminalFocused = useTerminalFocus();
    // 焦点窗口化按行预算：每项恒 2 行（命令 + age 描述，ListItem 保证单行
    // 截断），容器 gap={1} 项间再空 1 行。只数项数会把焦点裁出浮层（二次
    // 审查实证）。
    // 预算来自最近一层 OverlayAbove 的有效高度，减去框架行（按实际渲染数）：
    // 挂载包裹 marginTop 1 + Pane 2 + 标题 1 + gap 1 + SearchBox 3（圆角边框）
    // + gap 1 + gap 1 + 页脚 1 = 11。
    const listRows = useOverlayListRows(11);
    const { start, end } = listWindow(matches.map(() => 2), focusIndex, listRows, 1);
    return (_jsx(Pane, { color: "permission", children: _jsxs(Box, { flexDirection: "column", gap: 1, children: [_jsx(Text, { bold: true, color: "permission", children: t('history-search-title') }), _jsx(SearchBox, { query: query, cursorOffset: cursorOffset, isFocused: true, isTerminalFocused: isTerminalFocused, placeholder: t('history-search-placeholder') }), matches.length === 0 ? (_jsx(Text, { dimColor: true, children: t('history-search-empty') })) : (matches.slice(start, end).map((entry, index) => {
                    const absoluteIndex = start + index;
                    return (_jsx(ListItem, { isFocused: absoluteIndex === focusIndex, 
                        // The SearchBox owns the native-cursor declaration while this
                        // dialog is open — result rows must not park the cursor on
                        // themselves, or IME preedit lands on a list row.
                        declareCursor: false, description: formatRelativeAge(entry.ts), showScrollUp: absoluteIndex === start && start > 0, showScrollDown: absoluteIndex === end - 1 && end < matches.length, onClick: onPick ? () => onPick(absoluteIndex) : undefined, children: entry.text }, historyEntryId(entry, absoluteIndex)));
                })), _jsx(Text, { dimColor: true, italic: true, children: _jsx(HintLine, { text: t('hint-history-search') }) })] }) }));
}
/** Localized relative-age labels such as "now" and "5m ago". */
function formatRelativeAge(ts) {
    const elapsed = Date.now() - ts;
    if (elapsed < 60_000)
        return t('time-now');
    if (elapsed < 3_600_000)
        return t('time-minutes-ago', { n: Math.floor(elapsed / 60_000) });
    if (elapsed < 86_400_000)
        return t('time-hours-ago', { n: Math.floor(elapsed / 3_600_000) });
    return t('time-days-ago', { n: Math.floor(elapsed / 86_400_000) });
}

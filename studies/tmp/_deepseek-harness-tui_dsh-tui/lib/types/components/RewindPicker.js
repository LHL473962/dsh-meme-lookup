import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { t } from '../i18n.js';
import { Box, Text } from '../ui.js';
import { Pane } from './design-system/Pane.js';
import { ListItem } from './design-system/ListItem.js';
import { HintLine } from './design-system/HintLine.js';
import { listWindow } from './listWindow.js';
import { useOverlayListRows } from './OverlayAbove.js';
/**
 * Double-Esc rewind picker (double-tap Esc rewinds the selected message and/or
 * conversation to a previous point in time: lists the user's past messages
 * newest-first; selecting one and confirming rewinds the conversation to
 * that point (the message comes back into the input for re-editing).
 *
 * The confirm pane has two shapes: the plain one (Enter rewinds), and —
 * when a plugin answered the tui/rewind-prompt decision with extra modes —
 * a choice list whose option zero is always the built-in conversation-only
 * rewind, followed by the plugin's modes (e.g. "also restore files").
 */
export function RewindPicker({ rows, focusIndex, confirmRow, modes = null, modeIndex = 0, busy = false, onPickRow, onConfirm, onPickMode, }) {
    // 两个列表的行预算都来自最近一层 OverlayAbove 的有效高度（已钳到输入簇
    // 上方的真实空间，#493/#698）。hook 不进条件分支：无论当前画的是模式列
    // 表、纯确认页还是消息列表，调用顺序都一致。框架行按实际渲染数：
    // 模式列表：挂载包裹 marginTop 1 + Pane 2 + 标题/预览同一行 1 + marginBottom 1
    //   + 页脚 1 = 6（rowCosts 只算选项行，首项是带描述的"仅对话"选项）；
    // 消息列表：挂载包裹 marginTop 1 + Pane 2 + 标题+副标题 2 + marginBottom 1
    //   + 页脚 1 = 7，插件决策在途时再多一行「等待插件」状态行（busy）。
    const modeListRows = useOverlayListRows(6);
    const listRows = useOverlayListRows(confirmRow === null && busy ? 8 : 7);
    if (confirmRow !== null) {
        if (modes !== null) {
            // Plugin modes: a described choice list (one extra row per
            // description), windowed like the message list below.
            const rowCosts = [2, ...modes.map(mode => (mode.description === undefined ? 1 : 2))];
            const { start, end } = listWindow(rowCosts, modeIndex, modeListRows);
            const options = [
                { key: 'conversation', label: t('rewind-mode-default'), description: t('rewind-confirm-desc') },
                ...modes.map(mode => ({
                    key: mode.id,
                    label: mode.label,
                    ...(mode.description === undefined ? {} : { description: mode.description }),
                })),
            ];
            return (_jsxs(Pane, { color: "permission", children: [_jsxs(Box, { flexDirection: "column", children: [_jsxs(Box, { marginBottom: 1, children: [_jsx(Text, { color: "remember", bold: true, children: t('rewind-confirm-title') }), _jsx(Text, { dimColor: true, children: preview(confirmRow.text) })] }), options.slice(start, end).map((option, index) => {
                                const absoluteIndex = start + index;
                                return (_jsx(ListItem, { isFocused: absoluteIndex === modeIndex, description: option.description, showScrollUp: absoluteIndex === start && start > 0, showScrollDown: absoluteIndex === end - 1 && end < options.length, onClick: onPickMode === undefined ? undefined : () => onPickMode(absoluteIndex), children: option.label }, option.key));
                            })] }), _jsx(Text, { dimColor: true, italic: true, children: _jsx(HintLine, { text: t('hint-select-exit') }) })] }));
        }
        return (_jsx(Pane, { color: "permission", children: _jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: "remember", bold: true, children: t('rewind-confirm-title') }) }), _jsx(ListItem, { isFocused: false, description: t('rewind-confirm-desc'), onClick: onConfirm, children: preview(confirmRow.text) }), _jsx(Text, { dimColor: true, italic: true, children: _jsx(HintLine, { text: t('hint-rewind-back') }) })] }) }));
    }
    // 焦点窗口化按行预算：首项带 'last message' 描述占 2 行、其余 1 行
    //（ListItem 保证单行截断）。rewind 是不可见确认的高危操作，焦点必须
    // 始终在屏。
    const { start, end } = listWindow(rows.map((_, i) => (i === 0 ? 2 : 1)), focusIndex, listRows);
    return (_jsxs(Pane, { color: "permission", children: [_jsxs(Box, { flexDirection: "column", children: [_jsxs(Box, { marginBottom: 1, flexDirection: "column", children: [_jsx(Text, { color: "remember", bold: true, children: t('rewind-title') }), _jsx(Text, { dimColor: true, children: t('rewind-subtitle') })] }), rows.length === 0 ? (_jsx(ListItem, { isFocused: false, children: t('rewind-empty') })) : (rows.slice(start, end).map((row, index) => {
                        const absoluteIndex = start + index;
                        return (_jsx(ListItem, { isFocused: absoluteIndex === focusIndex, description: absoluteIndex === 0 ? t('rewind-last-message') : undefined, showScrollUp: absoluteIndex === start && start > 0, showScrollDown: absoluteIndex === end - 1 && end < rows.length, onClick: onPickRow !== undefined && !busy
                                ? () => onPickRow(absoluteIndex)
                                : undefined, children: preview(row.text) }, row.id));
                    })), busy && _jsx(Text, { dimColor: true, children: t('rewind-waiting-plugins') })] }), _jsx(Text, { dimColor: true, italic: true, children: _jsx(HintLine, { text: t('hint-select-exit') }) })] }));
}
/** One-line preview of a message (newlines flattened, capped). */
function preview(text) {
    const flat = text.replace(/\s+/g, ' ').trim();
    return flat.length <= 80 ? flat : `${flat.slice(0, 80)}…`;
}

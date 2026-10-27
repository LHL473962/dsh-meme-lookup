import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Box, Text, InputCaret } from '../../../ui.js';
import { t } from '../../../i18n.js';
import { nextCodePoint, previousCodePoint } from '../../AgentMessageComposer.js';
/**
 * 单行 composer 的键语义。返回 null = 未消费（面板形态交宿主回退键，
 * 全屏形态交场景其余分支）；返回对象按 exitFocus > submit > 编辑 写回。
 * ←/→ 先移光标，贴到行首/行尾后返回未消费——面板形态据此切面板。
 * ↑ 让位给列表（选中轮，见 BtwPanelAdapter 的选中态）；↓ 在单行框里没有
 * 语义，吃掉即可，免得漏给主聊天去滚 transcript。
 */
export function btwComposerKey(state, input, key) {
    if (key.escape === true)
        return { exitFocus: true };
    // The caret is per surface while the draft is shared through the store:
    // an edit on the other surface can leave this caret past the end.
    const caret = Math.min(state.caret, state.text.length);
    const plainReturn = (key.return_ === true || key.return === true || /^[\r\n]+$/u.test(input))
        && key.ctrl !== true && key.meta !== true && key.shift !== true;
    if (plainReturn)
        return { submit: true };
    // Tab 离开编辑层去列表（与 TrajectoryPanel 同款双形态判定）。
    if (key.tab === true || input === '\t')
        return { exitFocus: true };
    // ↑ 也从编辑层上到列表：光标落在本轮标题上（列表形态默认选中最后一条）。
    if (key.upArrow === true)
        return { exitFocus: true };
    if (key.downArrow === true)
        return {};
    if (key.backspace === true || key.delete === true) {
        if (caret <= 0)
            return { state: { ...state, caret } };
        const at = previousCodePoint(state.text, caret);
        return { state: { text: state.text.slice(0, at) + state.text.slice(caret), caret: at } };
    }
    // Shift+←/→ 不归编辑层：返回未消费，面板形态下落宿主切面板（宿主的
    // leftArrow 判定不看 shift）——编辑中途也能一键换面板，不必先 Esc 收起。
    if ((key.leftArrow === true || key.rightArrow === true) && key.shift === true)
        return null;
    // 光标先走、到头让位：还能移就移一格，已经贴着行首/行尾则返回未消费——
    // 面板形态下落宿主切面板，底栏「←/→ 切换」因此在编辑层同样成立；场景
    // 形态下无人接管，等于空操作。
    if (key.leftArrow === true) {
        const previous = previousCodePoint(state.text, caret);
        return previous === caret ? null : { state: { ...state, caret: previous } };
    }
    if (key.rightArrow === true) {
        const next = nextCodePoint(state.text, caret);
        return next === caret ? null : { state: { ...state, caret: next } };
    }
    if (key.home === true)
        return { state: { ...state, caret: 0 } };
    if (key.end === true)
        return { state: { ...state, caret: state.text.length } };
    if (input !== '' && key.ctrl !== true && key.meta !== true) {
        return { state: { text: state.text.slice(0, caret) + input + state.text.slice(caret), caret: caret + input.length } };
    }
    return null;
}
export function BtwComposer({ state, focused, busy, notice, onActivate, }) {
    const { text, caret } = state;
    const shown = Math.min(caret, text.length);
    const afterCaret = nextCodePoint(text, shown);
    return (_jsxs(Box, { flexDirection: "column", flexShrink: 0, children: [_jsx(Box, { width: "100%", flexShrink: 0, borderStyle: "round", borderColor: focused ? 'accent' : undefined, onClick: onActivate === undefined ? undefined : () => onActivate(), children: _jsxs(Box, { flexDirection: "row", flexShrink: 0, paddingLeft: 1, paddingRight: 1, children: [_jsx(Text, { color: focused ? 'accent' : undefined, bold: true, children: '›' }), _jsx(Text, { children: ' ' }), focused ? (_jsxs(_Fragment, { children: [_jsxs(Box, { flexDirection: "row", flexShrink: 1, minWidth: 0, children: [_jsx(Text, { wrap: "truncate", children: text.slice(0, shown) }), _jsx(InputCaret, { children: text.slice(shown, afterCaret) || ' ' }), text.slice(afterCaret) !== '' ? _jsx(Text, { wrap: "truncate", children: text.slice(afterCaret) }) : null] }), _jsx(Box, { flexGrow: 1, flexShrink: 0, children: _jsx(Text, { children: " " }) }), _jsx(Box, { flexShrink: 0, children: _jsxs(Text, { dimColor: true, children: [" ", t('btw-input-hint-edit')] }) })] })) : (_jsx(Text, { dimColor: true, wrap: "truncate", children: text === '' ? t('btw-input-placeholder') : text }))] }) }), notice !== undefined && (_jsx(Text, { color: notice.failure ? 'error' : undefined, wrap: "truncate", children: notice.text }))] }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { t } from '../i18n.js';
import { Box, Text } from '../ui.js';
import { Pane } from './design-system/Pane.js';
import { ListItem } from './design-system/ListItem.js';
import { HintLine } from './design-system/HintLine.js';
import { LoadingState } from './design-system/LoadingState.js';
import { listWindow } from './listWindow.js';
import { useOverlayListRows } from './OverlayAbove.js';
/** 来源桶 → 本地化标签（未知桶原样显示，SkillSource 对自定义桶开放）。 */
function sourceLabel(source) {
    switch (source) {
        case 'bundled':
            return t('skills-source-bundled');
        case 'user-dsh':
        case 'user-agents':
            return t('skills-source-user');
        case 'project-dsh':
        case 'project-agents':
            return t('skills-source-project');
        case 'runtime':
            return t('skills-source-runtime');
        case 'custom':
            return t('skills-source-custom');
        default:
            return source;
    }
}
/**
 * `/skills` picker (issue #204) in the ModelPicker style: a
 * permission-colored Pane listing the live agent's skill catalog —
 * user-invocable skills lead with `/name`（它们在 / 菜单里也是这个形态），
 * 描述行是「来源 · 简述」。Enter 由 Chat 填回 `/name `，Esc 关闭。
 *
 * 长列表按焦点窗口化（ModelPicker 同款）：picker 经 OverlayAbove 浮层挂载后
 * 有 maxHeight 裁剪，全量渲染会让焦点行被裁掉（看不到焦点按 Enter）。
 */
export function SkillsPicker({ skills, focusIndex, onPick, }) {
    // 每项恒占 2 行（正文 + 来源/简述描述行，均 truncate 成单行）。
    // 预算来自最近一层 OverlayAbove 的有效高度（ModelPicker 同款），减去框架行：
    // Pane 2 + 标题 2 + 页脚 1 + 挂载包裹 marginTop 1 = 6。
    const listRows = useOverlayListRows(6);
    const { start, end } = listWindow(skills.map(() => 2), focusIndex, listRows);
    return (_jsxs(Pane, { color: "permission", children: [_jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: "remember", bold: true, children: t('picker-title-skills') }) }), skills.length === 0 ? (_jsx(Text, { dimColor: true, children: t('skills-empty') })) : (skills.slice(start, end).map((skill, index) => {
                        const absoluteIndex = start + index;
                        return (_jsx(ListItem, { isFocused: absoluteIndex === focusIndex, description: `${sourceLabel(skill.source)}${skill.description === '' ? '' : ` · ${skill.description}`}`, showScrollUp: absoluteIndex === start && start > 0, showScrollDown: absoluteIndex === end - 1 && end < skills.length, onClick: onPick ? () => onPick(absoluteIndex) : undefined, children: skill.userInvocable ? `/${skill.name}` : skill.name }, skill.name));
                    }))] }), _jsx(Text, { dimColor: true, italic: true, children: _jsx(HintLine, { text: t('hint-fill-exit') }) })] }));
}
/** `/skills` while the registry snapshot is still in flight (ModelPickerLoading 同款). */
export function SkillsPickerLoading() {
    return (_jsx(Pane, { color: "permission", children: _jsxs(Box, { flexDirection: "column", gap: 1, children: [_jsx(Text, { bold: true, color: "permission", children: t('picker-title-skills') }), _jsx(LoadingState, { message: t('skills-loading'), bold: true, subtitle: t('skills-loading-subtitle') })] }) }));
}

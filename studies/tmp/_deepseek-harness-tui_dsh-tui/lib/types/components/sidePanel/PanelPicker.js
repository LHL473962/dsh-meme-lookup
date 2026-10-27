import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * /panel 无参的面板选择器：Pane + Select 行列出「已启用 ∩ 已注册」的
 * 面板（内置与插件同席——图标、标题、badge 状态点都来自 PanelStore），
 * 当前活动面板带 current 标记。Enter 打开并聚焦，Esc 取消。
 */
import React from 'react';
import { Box, Text } from '../../ui.js';
import { t } from '../../i18n.js';
import { Pane } from '../design-system/Pane.js';
import { Select } from '../Select.js';
import { HintLine } from '../design-system/HintLine.js';
import { panelStore } from './PanelStore.js';
function badgeGlyph(level) {
    if (level === 'warning')
        return '!';
    if (level === 'error')
        return '×';
    return '●';
}
function badgeColor(level) {
    if (level === 'warning')
        return 'warning';
    if (level === 'error')
        return 'error';
    return 'accent';
}
export function usePanelPickerRows(controller) {
    const entries = React.useSyncExternalStore(panelStore.subscribe, () => panelStore.list());
    return controller.enabledPanelIds
        .map(id => entries.find(entry => entry.definition.id === id))
        .filter((entry) => entry !== undefined)
        .map(entry => ({
        id: entry.definition.id,
        title: entry.definition.titleKey !== undefined ? t(entry.definition.titleKey) : entry.definition.title ?? entry.definition.id,
        icon: entry.definition.icon,
        badge: entry.badge,
    }));
}
export function PanelPicker({ rows, focusIndex, activeId, onPick, }) {
    return (_jsx(Pane, { color: "accent", children: _jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: "remember", bold: true, children: t('picker-title-panel') }) }), _jsx(Select, { options: rows.map(row => ({
                        value: row.id,
                        label: (_jsxs(Text, { children: [_jsx(Text, { dimColor: true, children: (row.icon ?? row.title.slice(0, 1)) + ' ' }), row.title, row.badge != null && (_jsx(Text, { color: badgeColor(row.badge.level), children: ' ' + badgeGlyph(row.badge.level) }))] })),
                    })), focusIndex: focusIndex, selectedValue: activeId, onPick: onPick }), _jsx(Text, { dimColor: true, italic: true, children: _jsx(HintLine, { text: t('hint-confirm-exit') }) })] }) }));
}

import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Box, Text } from '../../ui.js';
import { stringWidth } from '../../ink/stringWidth.js';
import { useTooltip } from '../Tooltip.js';
function badgeColor(level) {
    if (level === 'warning')
        return 'warning';
    if (level === 'error')
        return 'error';
    return 'accent';
}
function tabLabel(tab) {
    const icon = tab.icon ?? Array.from(tab.title)[0] ?? '?';
    const unread = tab.badge?.unread ?? 0;
    return icon + (unread > 0 ? String(unread) : '');
}
function truncateCells(text, maxCells) {
    if (stringWidth(text) <= maxCells)
        return text;
    let out = '';
    let cells = 0;
    for (const char of text) {
        const width = stringWidth(char);
        if (cells + width > Math.max(1, maxCells - 1))
            break;
        out += char;
        cells += width;
    }
    return out + '…';
}
function ActiveTitle({ title, left, width, focused }) {
    const clipped = stringWidth(title) > width;
    const tooltip = useTooltip(title);
    return (_jsx(Box, { position: "absolute", left: left, top: 0, width: width, height: 1, justifyContent: "center", overflow: "hidden", ...(clipped ? tooltip : {}), children: _jsx(Text, { bold: true, color: focused ? 'accent' : 'inactive', wrap: "truncate-end", children: truncateCells(title, width) }) }));
}
function PanelIcon({ tab, left, width, focused, hovered, onHover, onSelect }) {
    const tooltip = useTooltip(tab.title);
    const label = tabLabel(tab);
    return (_jsx(Box, { position: "absolute", left: left, top: 0, width: width, height: 1, flexShrink: 0, justifyContent: "center", ...tooltip, onMouseEnter: event => { tooltip.onMouseEnter(event); onHover(tab.id); }, onMouseLeave: () => { tooltip.onMouseLeave(); onHover(null); }, onClick: onSelect === undefined ? undefined : event => {
            event.stopImmediatePropagation();
            onSelect(tab.id);
        }, children: _jsx(Text, { bold: hovered || tab.badge != null, dimColor: !hovered && tab.badge == null && !focused, color: tab.badge != null ? badgeColor(tab.badge.level) : hovered || focused ? 'accent' : undefined, children: label }) }));
}
export function PanelBar({ tabs, activeId, width, focused, canExpand, onExpand, onSelect }) {
    const [expandHovered, setExpandHovered] = React.useState(false);
    const [hoveredTab, setHoveredTab] = React.useState(null);
    const activeIndex = Math.max(0, tabs.findIndex(tab => tab.id === activeId));
    const active = tabs[activeIndex];
    const hasArrows = tabs.length > 1;
    const contentWidth = Math.max(0, width - 2);
    const arrowWidth = hasArrows ? 1 : 0;
    const expandWidth = canExpand === true ? 2 : 0;
    const middleStart = arrowWidth;
    const middleWidth = Math.max(0, contentWidth - arrowWidth * 2 - expandWidth);
    const icons = [];
    for (let distance = 1; icons.length < tabs.length - 1; distance += 1) {
        icons.push({ tab: tabs[(activeIndex + distance) % tabs.length], side: 'right' });
        if (icons.length < tabs.length - 1) {
            icons.push({ tab: tabs[(activeIndex - distance + tabs.length) % tabs.length], side: 'left' });
        }
    }
    const iconWidth = Math.max(2, ...icons.map(icon => stringWidth(tabLabel(icon.tab))));
    const titleWidth = active === undefined
        ? 0
        : Math.max(6, Math.min(stringWidth(active.title), Math.max(6, middleWidth - icons.length * iconWidth)));
    const pitch = icons.length === 0 ? 0 : Math.max(2, Math.floor((middleWidth - titleWidth) / icons.length));
    const titleLeft = middleStart + Math.floor((middleWidth - titleWidth) / 2);
    let rightIndex = 0;
    let leftIndex = 0;
    const iconPositions = icons.map(icon => {
        const index = icon.side === 'right' ? rightIndex++ : leftIndex++;
        return {
            ...icon,
            left: icon.side === 'right'
                ? titleLeft + titleWidth + index * pitch
                : titleLeft - (index + 1) * pitch,
        };
    });
    const changePanel = (delta) => {
        if (active === undefined || tabs.length <= 1)
            return;
        onSelect?.(tabs[(activeIndex + delta + tabs.length) % tabs.length].id);
    };
    return (_jsx(Box, { height: 1, flexShrink: 0, paddingX: 1, overflow: "hidden", children: _jsxs(Box, { width: contentWidth, height: 1, position: "relative", overflow: "hidden", flexShrink: 0, children: [active !== undefined && _jsx(ActiveTitle, { title: active.title, left: titleLeft, width: titleWidth, focused: focused }), iconPositions.map(icon => (_jsx(PanelIcon, { tab: icon.tab, left: icon.left, width: pitch, focused: focused, hovered: hoveredTab === icon.tab.id, onHover: setHoveredTab, onSelect: onSelect }, icon.tab.id))), hasArrows && (_jsxs(_Fragment, { children: [_jsx(Box, { position: "absolute", left: 0, top: 0, width: 1, height: 1, justifyContent: "center", onClick: event => { event.stopImmediatePropagation(); changePanel(-1); }, children: _jsx(Text, { color: focused ? 'accent' : 'inactive', children: "\u25C0" }) }), _jsx(Box, { position: "absolute", left: contentWidth - expandWidth - 1, top: 0, width: 1, height: 1, justifyContent: "center", onClick: event => { event.stopImmediatePropagation(); changePanel(1); }, children: _jsx(Text, { color: focused ? 'accent' : 'inactive', children: "\u25B6" }) })] })), canExpand === true && (_jsx(Box, { position: "absolute", left: contentWidth - 1, top: 0, width: 1, height: 1, onMouseEnter: () => { setExpandHovered(true); }, onMouseLeave: () => { setExpandHovered(false); }, onClick: event => { event.stopImmediatePropagation(); onExpand?.(); }, children: _jsx(Text, { bold: expandHovered, color: expandHovered || focused ? 'accent' : 'inactive', children: "\u2922" }) }))] }) }));
}

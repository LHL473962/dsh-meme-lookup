import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { Box } from '../ui.js';
import { SurfaceEdgesContext } from './SurfaceEdges.js';
import { TerminalSizeContext, } from '../ink/components/TerminalSizeContext.js';
import { useTerminalSize } from '../ink/hooks/use-terminal-size.js';
import { getPageMarginSetting, resolvePageMargin, subscribePageMargin, } from '../tuiDisplayPrefs.js';
/** 嵌套安全的 inset（若未来出现嵌套 PageMargin 会累加）。 */
export const PageInsetContext = React.createContext({ x: 0, y: 0 });
/**
 * 内容区相对屏幕原点的偏移。供"出血"（full-bleed）chrome 使用：页面级
 * 分割线、右侧滚动轨这类结构性元素直通终端边缘，而内容（文本、卡片）
 * 保持页边距内缩——常规排版设计的做法（内容列留边距、横线/滚动轨出血
 * 到版面边缘）。无 PageMargin 时恒为 {x:0, y:0}。
 */
export function usePageInset() {
    return React.useContext(PageInsetContext);
}
/**
 * 根级页边距容器：给整棵 UI 加一圈可配置的小边距，并把「终端尺寸」收敛
 * 成「内容区尺寸」下传（见文件头三层策略）。flexGrow={1} 让它撑满
 * AlternateScreen 的定高盒（inline 无定高父级时为内容自然高，与现状
 * 一致）。
 */
export function PageMargin({ children, }) {
    const setting = React.useSyncExternalStore(subscribePageMargin, getPageMarginSetting);
    const { x, y } = resolvePageMargin(setting);
    const size = useTerminalSize();
    const parentInset = React.useContext(PageInsetContext);
    const inner = {
        columns: Math.max(1, size.columns - 2 * x),
        rows: Math.max(1, size.rows - 2 * y),
        screenRows: size.screenRows ?? size.rows,
    };
    const inset = {
        x: parentInset.x + x,
        y: parentInset.y + y,
    };
    return (_jsx(PageInsetContext.Provider, { value: inset, children: _jsx(SurfaceEdgesContext.Provider, { value: { left: inset.x, right: inset.x }, children: _jsx(TerminalSizeContext.Provider, { value: inner, children: _jsx(Box, { flexDirection: "column", flexGrow: 1, width: "100%", paddingX: x, paddingY: y, children: _jsx(Box, { flexDirection: "column", flexGrow: 1, width: inner.columns, children: children }) }) }) }) }));
}

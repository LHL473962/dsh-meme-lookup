/**
 * 侧栏 context 两件套：
 * - SidePanelRuntimeContext：useSidePanel 创建的运行时（键盘分发）+
 *   当前 channel（内置 Adapter 的数据源；插件 Panel 不经过这里，它们
 *   在 Phase 6 拿策展快照）。
 * - PanelContext：PanelHost 为每个 Panel 子树提供的身份（panelId），
 *   usePanelInput 据此把业务键注册进分发器；不在 Panel 里（整屏
 *   形态）时为 null，usePanelInput 退化为普通 useInput。
 */
import React from 'react';
export const SidePanelRuntimeContext = React.createContext(null);
export function useSidePanelChannel() {
    const ctx = React.useContext(SidePanelRuntimeContext);
    if (ctx === null)
        throw new Error('useSidePanelChannel must be used under PanelHost');
    return ctx.channel;
}
/** 会话轨迹投影；Chat 还没折叠出来（或不在 PanelHost 下）时 undefined。 */
export function useSidePanelTrajectory() {
    return React.useContext(SidePanelRuntimeContext)?.trajectory;
}
/** 「全屏」出口：宿主没接时返回 undefined（按钮点击静默无效）。 */
export function useSidePanelFullscreen() {
    return React.useContext(SidePanelRuntimeContext)?.openFullscreen;
}
/** 「回主输入框」出口：宿主没接时返回 undefined（送聊天后焦点不动）。 */
export function useSidePanelFocusChat() {
    return React.useContext(SidePanelRuntimeContext)?.focusChat;
}
export const PanelContext = React.createContext(null);

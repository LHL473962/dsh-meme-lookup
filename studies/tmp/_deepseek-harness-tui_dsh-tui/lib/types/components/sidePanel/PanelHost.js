import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
/**
 * PanelHost（设计文档 §6.3 + v2.1 修订）：
 * - 计算 bounds 并以 PanelProps 传入；为 Panel 子树再嵌套一层
 *   TerminalSizeContext（columns = panel width），现有组件直接放进来
 *   就能拿到正确宽度。
 * - 每个 Panel 独立 PanelErrorBoundary（registrationId 重挂）。
 * - mountPolicy（v2.1）：active=只挂 active（插件默认）；enabled=启用
 *   即挂载，非 active 时 display:none + focused/visible=false——状态
 *   保留但不动画、不收键（内置 todo/jobs/agents/companion）。
 * - 不自动包 ScrollBox（v2.1）：滚动由 Panel 自己决定（右栏内的
 *   ScrollBox 按命中节点接收滚轮）。
 * - 打开某 Panel 时清它的 badge（soft follow：后台更新只亮点不切换）。
 * - 键盘：焦点在右栏时，useSidePanel 先经 SidePanelRuntime.dispatchKey
 *   问活动 Panel（usePanelInput 注册），Panel 没吃才轮到宿主回退键。
 * - 不知道 Chat 消息、输入、Thinking、工具。
 */
import React from 'react';
import { Box, Text } from '../../ui.js';
import { t } from '../../i18n.js';
import { TerminalSizeContext } from '../../ink/components/TerminalSizeContext.js';
import { useTerminalSize } from '../../ink/hooks/use-terminal-size.js';
import { panelStore } from './PanelStore.js';
import { PanelContext, SidePanelRuntimeContext } from './SidePanelRuntimeContext.js';
import { PanelErrorBoundary } from './PanelErrorBoundary.js';
function TooNarrow({ minColumns }) {
    return (_jsx(Box, { flexDirection: "column", flexGrow: 1, alignItems: "center", justifyContent: "center", paddingX: 1, children: _jsx(Text, { dimColor: true, wrap: "truncate-end", children: t('panel-too-narrow', { min: minColumns }) }) }));
}
/** 插件 Panel 连续崩溃后的会话内禁用卡（§18.4）：不再挂载插件组件，只
 * 提示原因；toast 一次（每 Panel 每会话）。 */
const disabledToasted = new Set();
function PluginDisabled({ panelId, channel }) {
    React.useEffect(() => {
        if (disabledToasted.has(panelId))
            return;
        disabledToasted.add(panelId);
        channel.notify(t('panel-plugin-disabled-toast'));
    }, [panelId, channel]);
    return (_jsxs(Box, { flexDirection: "column", flexGrow: 1, alignItems: "center", justifyContent: "center", paddingX: 1, children: [_jsx(Text, { color: "warning", children: t('panel-plugin-disabled') }), _jsx(Box, { height: 1 }), _jsx(Text, { dimColor: true, wrap: "truncate-end", children: t('panel-plugin-disabled-hint') })] }));
}
export function PanelHost({ controller, channel, width, height, activity, attention, trajectory, openFullscreen }) {
    const entries = React.useSyncExternalStore(panelStore.subscribe, () => panelStore.list());
    // Forward the real screen rows so panel animations (useAnimationFrame →
    // useTerminalViewport) measure visibility against the screen, not the
    // host's narrowed rows.
    const parentSize = useTerminalSize();
    const screenRows = parentSize.screenRows ?? parentSize.rows;
    const enabledIds = controller.enabledPanelIds;
    // 只画「已启用 ∩ 已注册」的 Panel，顺序 = 设置里的启用顺序。
    const visibleEntries = React.useMemo(() => enabledIds
        .map(id => entries.find(entry => entry.definition.id === id))
        .filter((entry) => entry !== undefined), [enabledIds, entries]);
    const activeEntry = visibleEntries.find(entry => entry.definition.id === controller.activePanelId)
        ?? visibleEntries[0];
    // Soft follow：后台更新只亮 PanelBar 状态点；用户打开该 Panel 时清零。
    const activeId = activeEntry?.definition.id;
    React.useEffect(() => {
        if (activeId !== undefined)
            panelStore.clearBadge(activeId);
    }, [activeId]);
    const mode = controller.zoom ? 'zoom' : 'split';
    // focusChat 从控制器注入：面板送聊天后要能把列焦点交回聊天（见
    // SidePanelRuntimeContext 的出口注释）。控制器对象每次渲染都是新的，
    // 但 focusChat 本身是空依赖 useCallback，引用稳定。
    const focusChat = controller.focusChat;
    const runtimeContext = React.useMemo(() => ({ runtime: controller.runtime, channel, activity, attention, trajectory, openFullscreen, focusChat }), [controller.runtime, channel, activity, attention, trajectory, openFullscreen, focusChat]);
    return (_jsx(SidePanelRuntimeContext.Provider, { value: runtimeContext, children: visibleEntries.map(entry => {
            const def = entry.definition;
            const isActive = activeEntry !== undefined && def.id === activeEntry.definition.id;
            if (!isActive && def.mountPolicy !== 'enabled')
                return null;
            if (entry.disabled === true) {
                return (_jsx(Box, { flexDirection: "column", flexGrow: 1, overflow: "hidden", display: isActive ? 'flex' : 'none', children: _jsx(PluginDisabled, { panelId: def.id, channel: channel }) }, def.id));
            }
            const tooNarrow = def.minColumns !== undefined && width < def.minColumns;
            const body = tooNarrow ? (_jsx(TooNarrow, { minColumns: def.minColumns })) : (_jsx(PanelErrorBoundary, { panelId: def.id, children: _jsx(PanelContext.Provider, { value: { panelId: def.id }, children: _jsx(TerminalSizeContext.Provider, { value: { columns: width, rows: height, screenRows }, children: React.createElement(def.component, {
                            width,
                            height,
                            focused: controller.focus === 'panel' && isActive,
                            visible: isActive,
                            mode,
                        }) }) }) }, entry.registrationId));
            return (_jsx(Box, { flexDirection: "column", flexGrow: 1, overflow: "hidden", display: isActive ? 'flex' : 'none', children: body }, def.id));
        }) }));
}

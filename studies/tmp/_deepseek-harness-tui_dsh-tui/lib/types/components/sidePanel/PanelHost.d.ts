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
import type { ChannelUi } from '../../adapter/channel/ui-policy.js';
import type { SidePanelController } from './useSidePanel.js';
export interface PanelHostProps {
    readonly controller: SidePanelController;
    readonly channel: ChannelUi;
    readonly width: number;
    readonly height: number;
    readonly activity?: import('../../dsh-adapter/activity-store.js').ActivityView;
    readonly attention?: {
        readonly approvals: number;
        readonly questions: number;
    };
    /** 会话轨迹投影（Chat 折好的那一份；轨迹 Panel 直接渲染）。 */
    readonly trajectory?: import('../../dsh-adapter/trajectory/index.js').TrajBuild;
    /** 宿主「全屏」出口（PanelBar 的 ⤢ 经 SidePanelColumn 传进来）。 */
    readonly openFullscreen?: (panelId: string) => void;
}
export declare function PanelHost({ controller, channel, width, height, activity, attention, trajectory, openFullscreen }: PanelHostProps): React.ReactNode;
//# sourceMappingURL=PanelHost.d.ts.map
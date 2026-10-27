import React from 'react';
import type { SubagentState } from '../dsh-adapter/subagents.js';
import type { SidePanelKeyFlags } from './sidePanel/types.js';
import type { AgentMessageView, AgentIdentity } from './messages/agentTeam.js';
import type { TeamView } from '../adapter/ports/channel-view.js';
export interface SubagentDashboardProps {
    subagents: readonly SubagentState[];
    /** Optional cross-session agents, kept separate from this session children. */
    readonly peers?: readonly AgentIdentity[];
    /** 整屏/浮层形态的退出通道（Esc / ✕ 按钮）。panel 形态不传：面板不自己
     *  关侧栏——Esc 让给宿主（焦点回聊天，见 usePanelInput 契约）。 */
    onClose?: () => void;
    onSelect?: (agentId: string) => void;
    /** 打开主屏只读 Agent View：行点击/Enter 仍进 Detail，这是另一个专用
     *  动作（'v' 键或行内 ⤢）。 */
    onOpenView?: (agentId: string) => void;
    /** 代理↔代理消息流：每张卡下显示最后一条 from → to 摘要。 */
    messages?: readonly AgentMessageView[];
    /** Agent Teams: present → team mode (members joined with their subagent
     *  rows, a read-only task board, the failure banner). */
    team?: TeamView;
    /** The session on screen: inside a teammate the subagent rows are its own
     *  children, so the roster is not joined with them. */
    sessionId?: string;
    /** `panel` 挂在侧栏宿主里（去外层 padding、键盘走 usePanelInput 分发器）；
     *  default（缺省）与整屏形态逐字节一致。 */
    variant?: 'default' | 'panel';
    /** panel 形态：宿主报告焦点/可见性；非 active 时保留状态但收不到键。 */
    focused?: boolean;
    visible?: boolean;
}
/** Accept Ink's Enter flag and the panel dispatcher's normalized alias. */
export declare function isPanelPlainReturn(input: string, key: SidePanelKeyFlags): boolean;
/** 可点击 ✕ 退出按钮：整屏/浮层场景的鼠标退出通道（Esc 等价）。 */
export declare function ExitButton({ onClick }: {
    onClick: () => void;
}): React.ReactNode;
/**
 * SubagentDashboard — overlay panel showing all active/recent subagents.
 * Keyboard: up/down to navigate, Enter to view detail, Esc to close.
 */
export declare function SubagentDashboard({ subagents, team, sessionId, peers, onClose, onSelect, onOpenView, messages, variant, focused, visible, }: SubagentDashboardProps): React.ReactNode;
//# sourceMappingURL=SubagentDashboard.d.ts.map
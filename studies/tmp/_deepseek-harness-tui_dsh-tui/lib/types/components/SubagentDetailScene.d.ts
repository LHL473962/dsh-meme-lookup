import React from 'react';
import type { SubagentState } from '../dsh-adapter/subagents.js';
import type { AgentComposeTarget, AgentMessageControl, AgentMessageView } from './messages/agentTeam.js';
import { type TranscriptLoader } from './messages/subagentTranscript.js';
export interface SubagentDetailSceneProps {
    subagent: SubagentState;
    /** Called only while this specific failed child is visible. */
    onFailureRead?: (subagent: SubagentState) => void;
    onBack: () => void;
    onInterrupt?: (agentId: string) => void;
    /** The child's full transcript (`subagentControl.history`). Absent = no
     *  transcript source for this session: no Transcript page, and the
     *  output tail keeps its retained-range note. */
    loadTranscript?: TranscriptLoader;
    /** 打开主屏只读 Agent View。 */
    onOpenView?: () => void;
    /** 代理↔代理消息流：非空时出现 Messages 页。 */
    messages?: readonly AgentMessageView[];
    /** 发送能力：存在才渲染 composer；独立草稿，不经父 PromptInput。 */
    compose?: {
        readonly control: AgentMessageControl;
        readonly target: AgentComposeTarget;
    };
    /** 'panel' 挂在侧栏宿主里（去外层 padding、键盘走 usePanelInput 分发器）；
     *  default（缺省）与整屏形态逐字节一致。 */
    variant?: 'default' | 'panel';
    /** panel 形态：宿主报告焦点/可见性；非 active 时保留状态但收不到键。 */
    focused?: boolean;
    visible?: boolean;
}
/**
 * SubagentDetailScene — full-screen paged detail view for one subagent.
 * Header block (identity + stats) stays fixed; the body pages through
 * 摘要 / 输出 / 工具 with ←/→. Follow-up delivery was removed: the official
 * seam only accepts continuable children, and one-shot spawn children are
 * disposed at settlement, so the affordance would be a dead control.
 */
export declare function SubagentDetailScene({ subagent, onFailureRead, onBack, onInterrupt, loadTranscript, onOpenView, messages, compose, variant, focused, visible, }: SubagentDetailSceneProps): React.ReactNode;
//# sourceMappingURL=SubagentDetailScene.d.ts.map
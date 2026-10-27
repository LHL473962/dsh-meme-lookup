import type { Agent, AgentHandle } from '@deepseek-ai/dsh-agent';
import type { AgentSession } from '../../agent/session.js';
import { resetSessionProjection } from './session-reset.js';
import type { DshChannelBinding } from './binding.js';
import type { ChannelState, ResumeResult } from './types.js';
type Binding = DshChannelBinding;
type LiveAdoptionState = Pick<ChannelState, 'status' | 'agentId' | 'sessionId' | 'cwd' | 'displayCwd' | 'agentPreset' | 'provider' | 'model' | 'loadedContext' | 'contextWindow' | 'effortLevels' | 'reasoningEffort' | 'tps' | 'tpsSamples' | 'lastUsage' | 'turnUsage' | 'working' | 'emit'> & Parameters<typeof resetSessionProjection>[0];
/** Adopt an already-live agent, preserving a meaningful previous handle in the background ledger. */
export declare function createLiveAgentAdoption(state: LiveAdoptionState, deps: {
    binding: Pick<Binding, 'switchTo'>;
    /** Wrap the target (and the parked handle this channel owns for it, if
     *  any) as the session handed to the binding. */
    openSession(agent: Agent, handle: AgentHandle | undefined): AgentSession;
    backgroundHandles: Map<string, AgentHandle>;
    rowIds: {
        value: number;
    };
    resetProjector(): void;
    resetSubagents(): void;
    restoreSubagents(agent: Agent): void;
    parkSubagents(agent: Agent): void;
    resetJobs(): void;
    replay(events: readonly import('@deepseek-ai/dsh-session').SessionEvent[]): void;
    settleReplay(): void;
    describeWorkspace(cwd: string): {
        description?: string;
    };
    refreshGitBranch(): void;
    bindAgent(): void;
    refreshCommands(): void;
    refreshLoadedContext(): Promise<void>;
    refreshSkillCommands(): Promise<void>;
    clearStagedImages(): void;
    /** Drop the live IDE selection: the adopted session's cwd differs from
     *  the one the selection was made in. */
    resetIdeSelection(): void;
    notifySessionSwitched(kind: 'agent-view', sessionId: string, previousSessionId: string): void;
    notifyAgentView(): void;
}): (target: Agent) => Promise<ResumeResult>;
export {};
//# sourceMappingURL=session-live-adoption.d.ts.map
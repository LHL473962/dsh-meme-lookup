import type { Agent, AgentHandle } from '@deepseek-ai/dsh-agent';
import type { Context } from '@deepseek-ai/cordis';
import { type SessionEvent } from '@deepseek-ai/dsh-session';
import { resetSessionProjection } from './session-reset.js';
import type { DshChannelBinding } from './binding.js';
import type { ChannelOwner } from './owner.js';
import { type AdapterRuntimeOptions } from '../../adapter/kernel/runtime.js';
import type { ChannelState, ResumeResult } from './types.js';
import type { NewSessionOpener } from './core/session-switch.js';
type Binding = DshChannelBinding;
type ResumeState = Pick<ChannelState, 'working' | 'status' | 'agentId' | 'sessionId' | 'cwd' | 'displayCwd' | 'agentPreset' | 'provider' | 'model' | 'loadedContext' | 'contextWindow' | 'effortLevels' | 'reasoningEffort' | 'working' | 'emit'> & Parameters<typeof resetSessionProjection>[0];
export type { NewSessionTarget } from './core/session-switch.js';
/** Persisted-session and fresh-session foreground actions. */
export declare function createSessionResumeActions(ctx: Context, state: ResumeState, options: {
    configuredPreset?: string;
    configuredProvider?: string;
    configuredModel?: string;
    provider: string;
    model: string;
}, deps: {
    owner: Pick<ChannelOwner, 'current'>;
    binding: Pick<Binding, 'agent' | 'capture' | 'isCurrent' | 'prepare' | 'abandon' | 'adopt' | 'waitForDisposal'>;
    /**
     * Adopt an agent this process already has live. `/resume` uses it so a
     * target that is already running here is re-attached in place (parking the
     * session left behind) instead of being resumed a second time from its log.
     */
    adoptLive(target: Agent): Promise<ResumeResult>;
    backgroundHandles: Map<string, AgentHandle>;
    rowIds: {
        value: number;
    };
    resetProjector(): void;
    resetSubagents(): void;
    parkSubagents(agent: Agent): void;
    resetJobs(): void;
    replay(events: readonly SessionEvent[]): void;
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
    settleCompaction(): Promise<void>;
    sessionSwitchVetoed(kind: 'new' | 'resume' | 'agent-view', targetSessionId?: string): Promise<boolean>;
    notify: ChannelState['notify'];
    notifySessionSwitched(kind: 'new' | 'resume' | 'agent-view', sessionId: string, previousSessionId: string): void;
    runtime: AdapterRuntimeOptions;
}): {
    resumeInto: (sessionId: string, kind: "resume" | "agent-view", keepCurrent: boolean) => Promise<ResumeResult>;
    resumeTo: (sessionId: string) => Promise<ResumeResult>;
    newSessionOpener: NewSessionOpener;
};
//# sourceMappingURL=session-resume.d.ts.map
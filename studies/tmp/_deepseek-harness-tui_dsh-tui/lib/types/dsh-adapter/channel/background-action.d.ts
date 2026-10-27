import type { AgentHandle } from '@deepseek-ai/dsh-agent';
import type { Context } from '@deepseek-ai/cordis';
import { resetSessionProjection } from './session-reset.js';
import type { DshChannelBinding } from './binding.js';
import type { ChannelOwner } from './owner.js';
import type { BackgroundResult, ChannelState } from './types.js';
type Binding = DshChannelBinding;
/** `/bg` foreground handoff. The binding remains the sole identity writer;
 * this action only parks the exact previous handle passed by its transaction. */
export declare function createBackgroundCurrentAction(ctx: Context, state: Pick<ChannelState, 'cwd' | 'status' | 'agentId' | 'sessionId' | 'loadedContext' | 'contextWindow' | 'effortLevels' | 'reasoningEffort' | 'emit' | 'notify'> & Parameters<typeof resetSessionProjection>[0], options: {
    configuredPreset?: string;
    configuredProvider?: string;
    configuredModel?: string;
    provider: string;
    model: string;
}, deps: {
    owner: Pick<ChannelOwner, 'current'>;
    binding: Pick<Binding, 'capture' | 'isCurrent' | 'prepare' | 'abandon' | 'adopt'>;
    backgroundHandles: Map<string, AgentHandle>;
    rowIds: {
        value: number;
    };
    resetProjector(): void;
    resetSubagents(): void;
    parkSubagents(agent: AgentHandle['agent']): void;
    resetJobs(): void;
    refreshEffortLevels(): void;
    bindAgent(): void;
    refreshCommands(): void;
    refreshLoadedContext(): Promise<void>;
    refreshSkillCommands(): Promise<void>;
    clearStagedImages(): void;
    notifySessionSwitched(kind: 'background', sessionId: string, previousSessionId: string): void;
    /** Owner-guarded channel notification; never call raw state.notify here. */
    notify(text: string, options?: {
        color?: 'error' | 'warning';
        timeoutMs?: number;
    }): unknown;
    notifyAgentView(): void;
}): () => Promise<BackgroundResult>;
export {};
//# sourceMappingURL=background-action.d.ts.map
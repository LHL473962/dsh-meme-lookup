import type { AgentSession } from '../../agent/session.js';
import type { SessionEvent, SessionId } from '@deepseek-ai/dsh-session';
import type { ChannelState } from './types.js';
import type { DshChannelBinding } from './binding.js';
import { resetSessionProjection } from './session-reset.js';
type Binding = DshChannelBinding;
type AdoptionState = Pick<ChannelState, 'status' | 'agentId' | 'sessionId' | 'agentPreset' | 'working' | 'emit'>;
/**
 * Binding-transaction tails shared by session actions. Construction is inert:
 * callers install the returned operations only after their ChannelState exists.
 */
export declare function createSessionAdoption(state: AdoptionState & Parameters<typeof resetSessionProjection>[0], deps: {
    binding: Pick<Binding, 'adopt'>;
    rowIds: {
        value: number;
    };
    resetProjector(): void;
    resetSubagents(): void;
    resetJobs(): void;
    replay(events: readonly SessionEvent[]): void;
    settleReplay(): void;
    bindAgent(): void;
    refreshCommands(): void;
    refreshLoadedContext(): Promise<void>;
    refreshSkillCommands(): Promise<void>;
    clearStagedImages(): void;
    touchSession(sessionId: SessionId): void;
}): {
    adoptForkedAgent: (candidate: AgentSession, capture: ReturnType<Binding["capture"]>, seed: readonly SessionEvent[], agentPreset: string | undefined, childId: SessionId) => string;
};
export {};
//# sourceMappingURL=session-adoption.d.ts.map
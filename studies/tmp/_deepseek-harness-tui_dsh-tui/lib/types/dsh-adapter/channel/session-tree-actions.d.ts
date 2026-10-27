import type { Context } from '@deepseek-ai/cordis';
import { SessionId, type SessionEvent } from '@deepseek-ai/dsh-session';
import type { AgentSession } from '../../agent/session.js';
import type { DshChannelBinding } from './binding.js';
import type { ChannelOwner } from './owner.js';
import type { ChannelState } from './types.js';
type Binding = DshChannelBinding;
type TreeRewindState = Pick<ChannelState, 'working' | 'cwd' | 'provider' | 'model'>;
/** Rewind or fork a selected tree node; loading foreign family logs stays in this persistence adapter seam. */
export declare function createTreeRewindAction(ctx: Context, state: TreeRewindState, deps: {
    owner: Pick<ChannelOwner, 'current'>;
    binding: Pick<Binding, 'agent' | 'capture' | 'isCurrent' | 'prepare' | 'abandon'>;
    settleCompaction(): Promise<void>;
    notify: ChannelState['notify'];
    adoptForkedAgent(candidate: AgentSession, capture: ReturnType<Binding['capture']>, seed: readonly SessionEvent[], agentPreset: string | undefined, childId: SessionId): string;
    notifySessionSwitched(kind: 'rewind' | 'fork', sessionId: string, previousSessionId: string): void;
}): (sessionId: string, seq: number, mode?: "rewind" | "fork") => Promise<string | null>;
export {};
//# sourceMappingURL=session-tree-actions.d.ts.map
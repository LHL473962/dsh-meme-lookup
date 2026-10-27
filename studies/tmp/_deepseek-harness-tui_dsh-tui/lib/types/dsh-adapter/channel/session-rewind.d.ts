import type { AgentSession } from '../../agent/session.js';
import type { Context } from '@deepseek-ai/cordis';
import { SessionId, type SessionEvent } from '@deepseek-ai/dsh-session';
import type { DshChannelBinding } from './binding.js';
import type { ChannelOwner } from './owner.js';
import type { ChannelState, ChatRow } from './types.js';
type Binding = DshChannelBinding;
type RewindState = Pick<ChannelState, 'working' | 'cwd' | 'provider' | 'model'>;
/** Rewind a selected transcript row into a prepared, binding-owned fork. */
export declare function createRewindToAction(ctx: Context, state: RewindState, deps: {
    owner: Pick<ChannelOwner, 'current'>;
    binding: Pick<Binding, 'agent' | 'capture' | 'prepare' | 'isCurrent' | 'abandon'>;
    settleCompaction(): Promise<void>;
    notify: ChannelState['notify'];
    adoptForkedAgent(candidate: AgentSession, capture: ReturnType<Binding['capture']>, seed: readonly SessionEvent[], agentPreset: string | undefined, childId: SessionId): string;
    notifySessionSwitched(kind: 'rewind', sessionId: string, previousSessionId: string): void;
}): (row: ChatRow, mode?: string | null) => Promise<string | null>;
export {};
//# sourceMappingURL=session-rewind.d.ts.map
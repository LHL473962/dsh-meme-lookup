import type { Agent } from '@deepseek-ai/dsh-agent';
import type { Context } from '@deepseek-ai/cordis';
import type { ChannelOwner } from './owner.js';
import type { ChannelState } from './types.js';
type CompactionState = Pick<ChannelState, 'agentId' | 'cwd' | 'working' | 'compaction' | 'emit' | 'emitStream'>;
type Notify = ChannelState['notify'];
/** One manual compaction transaction per live agent, including agents parked
 * by `/bg`. `settle` aborts the transaction of the FOREGROUND binding — the
 * session a switch is leaving — so returning to a compacting background session
 * keeps it running while navigating to a different one still settles it. */
export declare function createManualCompaction(ctx: Context, state: CompactionState, deps: {
    owner: Pick<ChannelOwner, 'current' | 'signal' | 'own'>;
    agent(): Agent;
    withDecisionPending<T>(name: string, pending: Promise<T>): Promise<T>;
    notify: Notify;
}): {
    compact: () => void;
    settle: () => Promise<void>;
    cancel: () => void;
    restore: () => void;
    ownsProgress: () => boolean;
};
export {};
//# sourceMappingURL=compaction.d.ts.map
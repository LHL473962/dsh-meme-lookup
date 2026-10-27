import type { AgentHandle } from '@deepseek-ai/dsh-agent';
import type { Context } from '@deepseek-ai/cordis';
import { type Session } from '@deepseek-ai/dsh-session';
import type { ChannelOwner } from './owner.js';
import type { ChannelState } from './types.js';
type ForkState = Pick<ChannelState, 'working' | 'cwd' | 'provider' | 'model' | 'modelDisplay' | 'sessionTitle'>;
/** Create a detached `/fork` copy without adopting it into the foreground. */
export declare function createForkSessionAction(ctx: Context, state: ForkState, deps: {
    owner: Pick<ChannelOwner, 'current'>;
    settleCompaction(): Promise<void>;
    notify: ChannelState['notify'];
    source(): Session;
    createDetachedHandle(create: () => Promise<AgentHandle>): Promise<{
        handle: AgentHandle;
        release(): Promise<void>;
    }>;
}): () => Promise<boolean>;
export {};
//# sourceMappingURL=session-fork.d.ts.map
import type { AgentHandle } from '@deepseek-ai/dsh-agent';
import type { ChannelOwner } from './owner.js';
/** Owns temporary Agent handles until a caller explicitly transfers them. */
export declare function createDetachedHandleFactory(owner: Pick<ChannelOwner, 'assertActive' | 'current' | 'own'>): (create: () => Promise<AgentHandle>) => Promise<{
    handle: AgentHandle;
    transfer(): void;
    release(): Promise<void>;
}>;
//# sourceMappingURL=lifetime-resources.d.ts.map
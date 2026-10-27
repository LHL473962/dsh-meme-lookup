import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import { type SessionTreeData } from '../sessionTree.js';
import type { ChannelUi } from '../../adapter/ports/channel-ui.js';
import type { ChannelOwner } from './owner.js';
/** Bounded family-tree assembly owns budgets; binding remains the caller's authority. */
export declare function createSessionTreeReader(ctx: Context, binding: {
    readonly agent: Agent;
}, cwd: () => string, notify: ChannelUi['notify'], owner: ChannelOwner): () => Promise<SessionTreeData | null>;
//# sourceMappingURL=session-tree.d.ts.map
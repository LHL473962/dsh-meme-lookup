import type { AgentEvent, AgentEventMeta } from '../../agent/events.js';
import type { ChannelOwner } from './owner.js';
import type { ChannelState } from './types.js';
/** Notify once a successful live turn has settled with no automatic follow-up. */
export declare function createTaskCompletion(state: ChannelState, owner: ChannelOwner, notify: (preview?: string) => void): (batch: readonly AgentEvent[], meta: AgentEventMeta, current: () => boolean) => void;
//# sourceMappingURL=task-completion.d.ts.map
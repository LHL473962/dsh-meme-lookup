/** Declare which Agent Domain events the Claude backend emits. */
import type { AgentEventType } from '../../../agent/events.js';
/**
 * The Claude backend's decision for every Agent Domain event type (checked by
 * `verify:agent-domain`): a new `AgentEvent` variant fails `tsc` here until
 * this backend decides whether it emits it.
 */
export declare function claudeEmits(type: AgentEventType): boolean;
//# sourceMappingURL=events.d.ts.map
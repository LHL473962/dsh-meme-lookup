/** Declare which Agent Domain events the Codex backend emits. */
import type { AgentEventType } from '../../../agent/events.js';
/**
 * The Codex backend's decision for every Agent Domain event type (checked by
 * `verify:agent-domain`): a new `AgentEvent` variant fails `tsc` here until
 * this backend decides whether it emits it.
 */
export declare function codexEmits(type: AgentEventType): boolean;
//# sourceMappingURL=events.d.ts.map
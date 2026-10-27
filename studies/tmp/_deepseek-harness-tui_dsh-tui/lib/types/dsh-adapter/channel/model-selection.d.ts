import type { Context } from '@deepseek-ai/cordis';
import type { Agent, ModelSelectionRef } from '@deepseek-ai/dsh-agent';
import { type ChannelOwner } from './owner.js';
/** Routing belongs to the live agent, including turns running while parked.
 * The foreground facade follows the binding; each waterfall captures its own
 * agent's ref so a later binding can never supply its route. */
export declare function createModelSelection(ctx: Context, deps: {
    owner: ChannelOwner;
    agent(): Agent;
}): {
    selection: ModelSelectionRef;
    bind: (agent: Agent, route: {
        provider: string;
        model: string;
    }) => void;
};
//# sourceMappingURL=model-selection.d.ts.map
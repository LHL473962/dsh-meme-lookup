import type { Context } from '@deepseek-ai/cordis';
import type { ModelSelectionRef } from '@deepseek-ai/dsh-agent';
import type { createChannelBinding } from './binding.js';
import type { ChannelOwner } from './owner.js';
import type { ChannelState } from './types.js';
type Binding = ReturnType<typeof createChannelBinding>;
type SwitchState = Pick<ChannelState, 'working' | 'provider' | 'model' | 'contextWindow' | 'effortLevels' | 'reasoningEffort' | 'emit'>;
/** Select the next request's route without replacing the conversation or its agent. */
export declare function createModelSwitchAction(ctx: Context, state: SwitchState, deps: {
    owner: Pick<ChannelOwner, 'current'>;
    binding: Pick<Binding, 'capture' | 'isCurrent'>;
    selection: ModelSelectionRef;
    /** Legacy DSH delegates from immutable creation options instead of request headers. */
    supportsRouteSwitch: boolean;
    applyPreferredEffort(): Promise<void>;
    dropModelCompletion(): void;
    /** No bind follows an in-session switch, so seed the new route here. */
    seedUpstreamRetry(provider: string): void;
    notify: ChannelState['notify'];
}): (provider: string, model: string) => Promise<boolean>;
export {};
//# sourceMappingURL=model-switch.d.ts.map
import type { Context } from '@deepseek-ai/cordis';
import { type LlmModelInfo } from '@deepseek-ai/dsh-llm';
import type { Agent, ModelSelectionRef } from '@deepseek-ai/dsh-agent';
import { type CommandCompletionNode } from '../../commands.js';
import type { DshChannelBinding } from './binding.js';
import type { ChannelOwner } from './owner.js';
import type { ChannelState, EffortOption, PresetOption } from './types.js';
type Binding = DshChannelBinding;
/**
 * Route metadata, effort preference and preset/model catalog actions.
 * This owns the async catalog caches and their generation fences; callers only
 * compose its surface into ChannelState after the state has been constructed.
 */
export declare function createModelActions(ctx: Context, state: Pick<ChannelState, 'provider' | 'model' | 'reasoningEffort' | 'effortLevels' | 'agentPreset' | 'working' | 'contextWindow' | 'emit'>, deps: {
    owner: Pick<ChannelOwner, 'current'>;
    binding: Pick<Binding, 'capture' | 'isCurrent'>;
    selection: ModelSelectionRef;
    initialEffort?: string;
    agent(): Agent;
    notify: ChannelState['notify'];
    /** Re-check the context-low warning after a refreshed route metadata
     * answer carries a newer contextWindow than the session started with. */
    checkContextWarning(): void;
}): {
    selection: ModelSelectionRef;
    applyPreferredEffort: (preserveSessionEffort?: boolean) => Promise<void>;
    refreshEffortLevels: () => void;
    listEfforts: (route?: {
        provider: string;
        model: string;
    }) => Promise<{
        efforts: readonly EffortOption[];
        defaultEffort: string | undefined;
        levelsFallback?: true;
    }>;
    setEffort: (id: string) => Promise<boolean>;
    setDefaultEffort: (id: string | undefined) => void;
    warmEffortLevels: () => void;
    listModels: () => Promise<readonly LlmModelInfo[]>;
    listProviders: () => Promise<{
        id: string;
        name: string;
    }[]>;
    dropModelNodeCache: () => void;
    warmModelNodes: () => void;
    modelNodes: () => readonly CommandCompletionNode[];
    warmPresetOptions: () => void;
    presetOptions: () => readonly PresetOption[];
    listPresets: () => Promise<readonly PresetOption[]>;
    switchPreset: (presetId: string) => Promise<boolean>;
};
export {};
//# sourceMappingURL=model-actions.d.ts.map
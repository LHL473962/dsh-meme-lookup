import type { ProviderModelCapabilities } from '../adapter/ports/channel-settings.js';
export declare const PROVIDER_REASONING_LEVELS: readonly ["off", "minimal", "low", "medium", "high", "xhigh", "max"];
export declare const MODEL_CAPABILITY_FIELDS: readonly ["contextWindow", "maxTokens", "reasoningEfforts", "input"];
/** Empty restores inheritance; K/M are decimal token-count suffixes. */
export declare function parseModelCapacity(text: string): number | undefined;
/** Editable level list, including explicit wire aliases and off-by-omission. */
export declare function formatModelReasoning(value: ProviderModelCapabilities['reasoningEfforts']): string;
/** Decode offered levels, not the current conversation's selected effort. */
export declare function parseModelReasoning(text: string): ProviderModelCapabilities['reasoningEfforts'];
//# sourceMappingURL=model-capabilities.d.ts.map
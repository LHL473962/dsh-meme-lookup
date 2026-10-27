import type { ProviderModelEditor } from '../adapter/ports/channel-settings.js';
import type { LlmDiscoveredModel } from '../adapter/ports/channel-view.js';
export { MODEL_CAPABILITY_FIELDS, PROVIDER_REASONING_LEVELS, formatModelReasoning, parseModelCapacity, parseModelReasoning } from '../channel/model-capabilities.js';
export declare const CATALOG_MODEL_OVERRIDES_AVAILABLE: boolean;
/** Stage edits until the surrounding model selection / add confirmation commits. */
export declare function createProviderModelEditor(entryFor: (id: string) => Record<string, unknown>, discoveredById: ReadonlyMap<string, LlmDiscoveredModel>): {
    editor: ProviderModelEditor;
    entries: ReadonlyMap<string, Record<string, unknown>>;
};
//# sourceMappingURL=provider-model-capabilities.d.ts.map
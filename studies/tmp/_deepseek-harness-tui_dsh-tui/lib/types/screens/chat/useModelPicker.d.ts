import type { ChannelUi } from '../../adapter/ports/channel-ui.js';
import type { LlmModelInfo, LlmProviderInfo } from '../../adapter/ports/channel-view.js';
import { type ModelRef } from '../../modelGroups.js';
import type { Key } from '../../ui.js';
/**
 * Which picker region owns the terminal caret. The picker declares the
 * native cursor at whichever region the user touched last, so terminals
 * with cursor animation or trails glide between providers, models and
 * effort levels (see `ModelPicker`). `model` is the resting zone.
 */
export type ModelCursorZone = 'provider' | 'model' | 'effort';
/** Provider/model navigation and per-model effort drafts for the single-page picker. */
export declare function useModelPicker({ channel, models, providers, recents, open, onPick, onCancel }: {
    channel: ChannelUi;
    models: readonly LlmModelInfo[];
    providers: readonly LlmProviderInfo[];
    /** Omitted for a backend-owned flat catalog without provider tabs. */
    recents?: readonly ModelRef[];
    open: boolean;
    onPick(model: LlmModelInfo, effort: string | undefined): void;
    onCancel(): void;
}): {
    groups: readonly import("../../modelGroups.js").ModelGroupRow[];
    provider: string;
    models: readonly LlmModelInfo[];
    index: number;
    efforts: readonly import("../../dsh-adapter/channel.js").EffortOption[];
    effortId: string | undefined;
    effortsLoading: boolean;
    effortError: boolean;
    levelsFallback: boolean;
    cursorZone: ModelCursorZone;
    reset: () => void;
    focusProvider: (provider: string) => void;
    focusModel: (index: number) => void;
    moveModel: (delta: 1 | -1) => void;
    pickEffort: (index: number) => void;
    confirm: () => void;
    cancel: () => void;
    handleKey: (input: string, key: Key, plainReturn: boolean) => void;
};
//# sourceMappingURL=useModelPicker.d.ts.map
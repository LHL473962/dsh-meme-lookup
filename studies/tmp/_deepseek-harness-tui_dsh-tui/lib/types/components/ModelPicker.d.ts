import React from 'react';
import type { EffortOption, LlmModelInfo } from '../adapter/ports/channel-view.js';
import type { ModelGroupRow } from '../modelGroups.js';
import type { ModelCursorZone } from '../screens/chat/useModelPicker.js';
/**
 * Optional provider tabs, a windowed model list, and the focused model's effort draft.
 *
 * The native caret is parked on the region the user last touched
 * (`cursorZone`): the provider strip, the focused model row, or the effort
 * strip. Terminals with cursor animation or trail effects then glide the
 * caret from one region to the next. Static rendering keeps the painted
 * highlights (inverse tabs, ❯ pointer) as the fallback.
 */
export declare function ModelPicker({ groups, provider, models, focusIndex, currentModel, loading, efforts, effortId, effortsLoading, effortError, levelsFallback, cursorZone, onProvider, onFocus, onEffort, onMove, onConfirm, onCancel, }: {
    groups: readonly ModelGroupRow[];
    provider: string;
    models: readonly LlmModelInfo[];
    focusIndex: number;
    currentModel: string;
    loading: boolean;
    efforts: readonly EffortOption[];
    effortId: string | undefined;
    effortsLoading: boolean;
    effortError: boolean;
    levelsFallback: boolean;
    /** Region that owns the native caret; falls back to the model list when absent. */
    cursorZone?: ModelCursorZone;
    onProvider(provider: string): void;
    onFocus(index: number): void;
    onEffort(index: number): void;
    onMove(delta: 1 | -1): void;
    onConfirm(): void;
    onCancel(): void;
}): React.ReactNode;
//# sourceMappingURL=ModelPicker.d.ts.map
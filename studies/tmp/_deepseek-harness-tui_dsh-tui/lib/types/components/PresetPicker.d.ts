import React from 'react';
import type { PresetOption } from '../dsh-adapter/channel.js';
/**
 * Agent-preset picker (issue #8) using the ActivityPicker layout: a
 * permission-colored Pane listing every roster
 * preset with its display name and description, `❯` focus pointer and `✓`
 * on the preset the current session runs. Enter applies through
 * `channel.switchPreset`, Esc cancels. Broken presets are listed (the
 * roster's discovery contract) but marked with their reason; the roster
 * default is tagged.
 *
 * The header says "内核 Agent 预设 / Kernel agent preset" (not just "Agent
 * preset"): this screen changes the model-facing tool catalog, and must never
 * be confused with the `/settings → 极简界面` (Minimal UI) display switch.
 */
export declare function PresetPicker({ presets, focusIndex, currentPreset, onPick, }: {
    presets: readonly PresetOption[];
    focusIndex: number;
    currentPreset: string | undefined;
    /** Mouse pick (fullscreen): clicked row's absolute index (Chat applies
     *  the same code path as the keyboard Enter). */
    onPick?: (index: number) => void;
}): React.ReactNode;
//# sourceMappingURL=PresetPicker.d.ts.map
import React from 'react';
/**
 * Working-activity indicator picker (ported from the pi extension's
 * `/activity` interactive select): a
 * permission-colored Pane listing every preset (random first) with its
 * frame preview, `❯` focus pointer and `✓` on the active preset. Enter
 * applies through `channel.setActivityFrames`, Esc cancels.
 */
export declare function ActivityPicker({ focusIndex, currentPreset, onPick, }: {
    focusIndex: number;
    currentPreset: string | undefined;
    /** Mouse pick (fullscreen): clicked row's absolute index (Chat applies
     *  the same code path as the keyboard Enter). */
    onPick?: (index: number) => void;
}): React.ReactNode;
//# sourceMappingURL=ActivityPicker.d.ts.map
import React from 'react';
/**
 * The `/thinking` display dialog: a permission-colored Pane with a bold
 * title, the Shown/Hidden select, and the Enter/Esc hint line.
 */
export declare function ThinkingToggle({ currentValue, focusIndex, onPick, }: {
    currentValue: boolean;
    focusIndex: number;
    /** Mouse pick (fullscreen): reports the clicked row's index — Chat
     *  applies it with the same code path as the keyboard Enter. */
    onPick?: (index: number) => void;
}): React.ReactNode;
//# sourceMappingURL=ThinkingToggle.d.ts.map
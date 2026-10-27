import React from 'react';
/**
 * Session accent color picker (bare `/color`): a permission-colored Pane
 * listing the whole palette with a colored swatch per row, `❯` focus
 * pointer and `✓` on the session's current color. Enter applies through
 * `channel.setSessionColor`, Esc cancels. The palette is static, so the
 * picker never needs an async list.
 */
export declare function ColorPicker({ focusIndex, currentColor, onPick, }: {
    focusIndex: number;
    /** The session's current accent color name ('' = theme default). */
    currentColor: string;
    /** Mouse pick (fullscreen): clicked row's absolute index (Chat applies
     *  the same code path as the keyboard Enter). */
    onPick?: (index: number) => void;
}): React.ReactNode;
//# sourceMappingURL=ColorPicker.d.ts.map
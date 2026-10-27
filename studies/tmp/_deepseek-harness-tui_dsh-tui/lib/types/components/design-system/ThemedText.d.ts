import React from 'react';
import type { Color, Styles } from '../../ink/styles.js';
import type { DOMElement } from '../../ink/dom.js';
import { type Theme } from '../../theme.js';
/**
 * Colors uncolored ThemedText in the subtree. Precedence: explicit `color` >
 * this > dimColor. Message rows set it to `text` on hover.
 */
export declare const TextHoverColorContext: React.Context<keyof Theme | undefined>;
export type Props = {
    /**
     * Change text color. Accepts a theme key or raw color value.
     */
    readonly color?: keyof Theme | Color;
    /**
     * Same as `color`, but for background.
     */
    readonly backgroundColor?: keyof Theme | Color;
    /**
     * Dim the color using the theme's inactive color.
     * This is compatible with bold (unlike ANSI dim).
     */
    readonly dimColor?: boolean;
    /**
     * Make the text bold.
     */
    readonly bold?: boolean;
    /**
     * Make the text italic.
     */
    readonly italic?: boolean;
    /**
     * Make the text underlined.
     */
    readonly underline?: boolean;
    /**
     * Make the text crossed with a line.
     */
    readonly strikethrough?: boolean;
    /**
     * Inverse background and foreground colors.
     */
    readonly inverse?: boolean;
    /**
     * This property tells Ink to wrap or truncate text if its width is larger than container.
     */
    readonly wrap?: Styles['textWrap'];
    /**
     * Ref to the underlying ink-text DOMElement (e.g. useDeclaredCursor
     * parking the native cursor on an inline caret cell).
     */
    readonly ref?: React.Ref<DOMElement>;
    /** Typed paint metadata; see ink Text's decoration prop. */
    readonly decoration?: Styles['decoration'];
    readonly children?: React.ReactNode;
};
/**
 * Theme-aware Text component that resolves theme color keys to raw colors
 * in the dsh-TUI visual language). This lets components use
 * `color="subtle"`-style theme keys consistently.
 */
export default function ThemedText({ color, backgroundColor, dimColor, bold, italic, underline, strikethrough, inverse, wrap, ref, decoration, children, }: Props): React.ReactNode;
//# sourceMappingURL=ThemedText.d.ts.map
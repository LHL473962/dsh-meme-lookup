import type { ReactNode, Ref } from 'react';
import React from 'react';
import type { Color, Styles } from '../styles.js';
import type { DOMElement } from '../dom.js';
type BaseProps = {
    /**
     * Change text color. Accepts a raw color value (rgb, hex, ansi).
     */
    readonly color?: Color;
    /**
     * Ref to the underlying ink-text DOMElement. dsh-tui addition: lets
     * useDeclaredCursor park the native cursor on an inline caret cell without
     * wrapping it in a Box (a wrapper Box changes flex shrink behaviour and
     * breaks wrapped-line layouts).
     */
    readonly ref?: Ref<DOMElement>;
    /**
     * Same as `color`, but for background.
     */
    readonly backgroundColor?: Color;
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
     * If `wrap` is passed (by default), Ink will wrap text and split it into multiple lines.
     * If `truncate-*` is passed, Ink will truncate text instead, which will result in one line of text with the rest cut off.
     */
    readonly wrap?: Styles['textWrap'];
    /**
     * Typed paint metadata (Styles.decoration): header row, per-row
     * prefix, and wrap-continuation hanging indent painted alongside this
     * leaf's own text. Producers must memo the object — style diffing
     * compares it by reference.
     */
    readonly decoration?: Styles['decoration'];
    readonly children?: ReactNode;
};
/**
 * Bold and dim are mutually exclusive in terminals.
 * This type ensures you can use one or the other, but not both.
 */
type WeightProps = {
    bold?: never;
    dim?: never;
} | {
    bold: boolean;
    dim?: never;
} | {
    dim: boolean;
    bold?: never;
};
export type Props = BaseProps & WeightProps;
/** A text leaf. Empty children produce no layout node. */
declare function Text({ children, ref, wrap, color, backgroundColor, bold, dim, italic, underline, strikethrough, inverse, decoration, }: Props): React.JSX.Element | null;
declare const _default: React.MemoExoticComponent<typeof Text>;
export default _default;
//# sourceMappingURL=Text.d.ts.map
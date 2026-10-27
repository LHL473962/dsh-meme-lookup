import { type Boxes, type BoxStyle } from 'cli-boxes';
import type { DOMNode } from './dom.js';
import type Output from './output.js';
import type { Color } from './styles.js';
/** Options for embedding a text label into a border line. */
export type BorderTextOptions = {
    content: string;
    position: 'top' | 'bottom';
    align: 'start' | 'end' | 'center';
    offset?: number;
};
/** Built-in border styles beyond those provided by cli-boxes. */
export declare const CUSTOM_BORDER_STYLES: {
    readonly dashed: {
        readonly top: "╌";
        readonly left: "╎";
        readonly right: "╎";
        readonly bottom: "╌";
        readonly topLeft: " ";
        readonly topRight: " ";
        readonly bottomLeft: " ";
        readonly bottomRight: " ";
    };
};
/** A border style: a cli-boxes key, a custom style key, or an explicit box style. */
export type BorderStyle = keyof Boxes | keyof typeof CUSTOM_BORDER_STYLES | BoxStyle;
/**
 * Render the node's border, including any embedded border text, into the
 * output buffer when a border style is set.
 * @param x - the border's left column.
 * @param y - the border's top row.
 * @param node - the node whose border style to render.
 * @param output - the output buffer receiving the border writes.
 * @param background - the surface color the border's cells belong to, when the
 *   node paints its own rect (own background, `opaque`, or an occlusion color
 *   while a terminal image sits behind it). Transparent bordered overlays pass
 *   undefined and keep terminal-transparent border cells.
 */
declare const renderBorder: (x: number, y: number, node: DOMNode, output: Output, background?: Color) => void;
export default renderBorder;
//# sourceMappingURL=render-border.d.ts.map
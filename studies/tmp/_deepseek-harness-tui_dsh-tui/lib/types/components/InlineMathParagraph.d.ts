import React from 'react';
import type { Tokens } from 'marked';
import type { CliHighlight } from '../terminal-utils/cliHighlight.js';
/**
 * A top-level paragraph whose inline formulas show as terminal images
 * (`mathRendering: image`, Kitty or Sixel graphics, a measured cell size).
 *
 * It renders exactly like the plain <Text> paragraph until it can switch
 * whole: the paragraph's width is measured, and every formula has settled
 * (typeset into a one-row image, or failed). The switch then happens once,
 * so formulas arriving one by one never shift the wrap points. Formulas that
 * failed or would shrink below legibility on one row keep their Unicode
 * form. Each row is laid out by `layoutInlineMedia` and drawn as text
 * pieces with one-row <Image> slots between them.
 */
type Props = {
    token: Tokens.Paragraph;
    highlight: CliHighlight | null;
};
export declare function InlineMathParagraph({ token, highlight }: Props): React.ReactNode;
export {};
//# sourceMappingURL=InlineMathParagraph.d.ts.map
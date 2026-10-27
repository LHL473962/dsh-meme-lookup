/**
 * Per-line character budget for transcript text.
 *
 * A single source line longer than this is clipped BEFORE it reaches the
 * layout engine. Wrapping is what costs: one minified-JS line, a 300k-char
 * pasted log line, or a file written through a tool call turns into
 * thousands of visual rows, and the per-frame wrap + measure over that text
 * (not the row count) is what stalls the transcript. Clipping at the source
 * keeps the rendered line count — and therefore the layout work — bounded
 * no matter what the model, the user, or a tool pastes in.
 *
 * 1000 characters is roughly ten terminal rows at a common width: long
 * enough that ordinary prose, commands and URLs never notice, short enough
 * that the pathological single line cannot dominate a frame. The exact
 * threshold is a display choice, not a contract — `Ctrl+O` (global
 * transcript expansion) always paints the raw text.
 */
export declare const LONG_LINE_MAX_CHARS = 1000;
export type LongLineFold = {
    /** Text to render. Identity-equal to the input when nothing was folded. */
    readonly text: string;
    /** Characters elided across every folded line (0 → nothing folded). */
    readonly hiddenChars: number;
    /** Number of lines that were clipped. */
    readonly foldedLines: number;
};
/**
 * Clip every line of `text` longer than `max` characters, appending an
 * inline localized fold marker (`long-line-folded`) to the clipped line.
 *
 * Line boundaries are preserved (never re-flowed, never merged), so the
 * result stays valid input for the markdown renderer and for diff-style
 * line pairing. The caller decides WHEN to fold (e.g. not while the global
 * expansion is on); this function is a pure, allocation-free fast path when
 * no line exceeds the budget.
 */
export declare function foldLongLines(text: string, max?: number): LongLineFold;
//# sourceMappingURL=fold-long-lines.d.ts.map
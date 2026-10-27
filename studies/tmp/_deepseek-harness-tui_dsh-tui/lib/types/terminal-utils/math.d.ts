/**
 * LaTeX math in replies: delimiter recognition for the shared `marked`
 * instance and the render policy around the vendored Unicode renderer
 * (./latex.ts).
 *
 * Math is recognized at lex time as its own token, before marked's escape
 * handling can eat `\{`, `\,` or `\\` and before `*`/`_` inside a formula
 * turn into emphasis. That keeps the exact source available for every
 * fallback: a formula that is unsupported, too long, too wide, still
 * streaming, or switched off in settings shows its original text, never a
 * half-rendered or backslash-stripped one.
 *
 * Lexing does not depend on the settings switch — tokens are cached by
 * content, so only rendering reads it.
 *
 * Delimiters: `$…$`, `\(…\)` inline; `$$…$$`, `\[…\]` as a block when the
 * opener starts a line and the closer ends one, inline otherwise; a line
 * opening a display environment (`\begin{align}` …) is a block too. The `$`
 * rules follow Pi's markdown tokenizer and Codex's TUI math scanner so that
 * prices, shell variables and PIDs stay prose.
 */
import type { TokenizerExtension, Tokens } from 'marked';
/** Which delimiter introduced a formula. */
export type MathDelimiter = 'dollar' | 'double-dollar' | 'paren' | 'bracket' | 'environment';
/** A recognized formula. `text` is the TeX between the delimiters (for an
 *  environment, the whole `\begin…\end`), `raw` the full source span. */
export interface MathToken extends Tokens.Generic {
    type: 'math' | 'mathBlock';
    raw: string;
    text: string;
    /** TeX display style (`$$`, `\[…\]`, environments) — how it typesets. */
    display: boolean;
    /** Owns its Markdown lines (a `mathBlock`) — how it lays out. `foo $$x$$
     *  bar` is display but not standalone. */
    standalone: boolean;
    delimiter: MathDelimiter;
    /** Block only: the closer has not arrived yet (streaming, or an unclosed
     *  block at the end of a reply). Always shown as source. */
    pending?: boolean;
}
/**
 * Single-line Unicode for a formula, or undefined when it has none. Inline
 * math sits inside wrapped prose, so a multi-line result (cases, matrices,
 * aligned rows) would be torn apart by wrapping — those keep their source.
 */
export declare function renderInlineMath(text: string): string | undefined;
/** Display-mode layout (stacked fractions, operator limits) as lines. */
export declare function renderDisplayMath(text: string): string[] | undefined;
export declare function isMathToken(token: {
    type: string;
}): token is MathToken;
export declare function isMathBlockToken(token: {
    type: string;
}): token is MathToken;
/**
 * Whether a block formula lexed right after `paragraph` is still provisional
 * in a streaming reply: the paragraph leaves a backtick run open, and no
 * blank line in `following` (the source after the paragraph) has ended it
 * yet, so a closer may still arrive and turn the paragraph, the formula and
 * the text up to the closer into one code span. A streaming renderer must
 * not seal the paragraph until this is false.
 */
export declare function mayBecomeCodeSpan(paragraph: string, following: string): boolean;
/** Tokenizer extensions for `marked.use({ extensions })`. */
export declare const MATH_MARKDOWN_EXTENSIONS: readonly TokenizerExtension[];
//# sourceMappingURL=math.d.ts.map
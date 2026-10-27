/**
 * CJK-adjacent strong emphasis for the shared `marked` instance.
 *
 * CommonMark cannot close `**label：**text` in CJK prose: the closing
 * delimiter run must be right-flanking, and a run preceded by a
 * punctuation mark (the fullwidth colon/period/quote that ends a Chinese
 * label) only qualifies when whitespace or more punctuation follows.
 * Chinese does not space after punctuation, so the exact shape models
 * write for emphasis labels — `**证据与影响：**源码中…` — keeps literal
 * asterisks on GitHub and every strict CommonMark renderer alike.
 *
 * The tokenizer below takes over exactly that shape: a `**` pair whose
 * body ends with a Unicode punctuation mark and whose closer is
 * immediately followed by a CJK ideograph, kana, hangul syllable or
 * fullwidth form. Every other case is declined, so the built-in em
 * tokenizer keeps its behavior — including the ASCII one
 * (`**note:**see`), which stays literal to stay consistent with GitHub.
 *
 * Deliberately left literal (same gap upstream, rarer):
 * - `***` triple runs (em+strong) and single-`*` emphasis — terminal
 *   italics are barely legible for CJK anyway;
 * - bodies containing a backtick, where the pair could straddle a code
 *   span (the math tokenizer guards `$` bodies the same way).
 */
import type { TokenizerExtension } from 'marked';
/** Tokenizer extensions for `marked.use({ extensions })`. */
export declare const CJK_EMPHASIS_EXTENSIONS: readonly TokenizerExtension[];
//# sourceMappingURL=cjk-emphasis.d.ts.map
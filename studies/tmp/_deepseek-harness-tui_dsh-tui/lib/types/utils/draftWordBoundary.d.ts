/**
 * Whether the seam at `offset` (`text[offset-1] | text[offset]`) is a word
 * boundary. `offset` is a code-unit index, as produced by the composer's
 * grapheme-normalized caret.
 */
export declare function isDraftWordBoundary(text: string, offset: number): boolean;
/**
 * The word interval `[start, end)` containing the character at `index`: the
 * ICU segment when that character is word-like, otherwise just the character
 * itself (whitespace and punctuation are boundaries, never part of a
 * multi-character word). A deletion run uses this as the range it may keep
 * consuming.
 *
 * The window widens until the segment no longer touches its edge: ICU
 * segmentation is length-dependent, so a truncated copy of a repeated-Han run
 * can split differently from the full draft (and the ±32 window would then
 * read the wrong word at the seam).
 */
export declare function draftWordRangeAt(text: string, index: number): {
    start: number;
    end: number;
};
//# sourceMappingURL=draftWordBoundary.d.ts.map
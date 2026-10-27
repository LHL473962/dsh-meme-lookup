/**
 * Memoized `Intl.Segmenter` with grapheme granularity for width-aware string
 * handling in the renderer and terminal parser.
 * @returns The shared grapheme segmenter, created once on first use.
 */
export declare function getGraphemeSegmenter(): Intl.Segmenter;
/**
 * Memoized `Intl.Segmenter` with word granularity (UAX #29 + ICU dictionary)
 * for the prompt draft's word boundaries. Locale is fixed to `'en'`: it
 * matches `getGraphemeSegmenter`, and measured Han/kana results are identical
 * to `'zh'`/`'ja'` for the segmentation the draft needs.
 * @returns The shared word segmenter, created once on first use.
 */
export declare function getWordSegmenter(): Intl.Segmenter;
//# sourceMappingURL=intl.d.ts.map
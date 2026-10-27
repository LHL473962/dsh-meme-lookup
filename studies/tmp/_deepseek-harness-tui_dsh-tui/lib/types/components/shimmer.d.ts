/**
 * Shared shimmer utilities: the blue-white color ladder of the header and a
 * moving-highlight text painter used by the header wordmark/tagline and the
 * working-activity status line.
 */
export interface Rgb {
    r: number;
    g: number;
    b: number;
}
/** Header blue-white ladder: brand → ice → pale → soft ice flash.
 *  FLASH stays visibly blue (never pure white) — the highlight reads as a
 *  mist-brightened crest, not a white strobe. */
export declare const BRAND: Rgb;
/** Header ladder ice blue (`#93BEFF`). */
export declare const ICE: Rgb;
/** Header ladder pale blue (`#D7E4FF`). */
export declare const PALE: Rgb;
/** Soft ice flash blue (`#C6D8F8`); stays visibly blue, never pure white. */
export declare const FLASH: Rgb;
/**
 * Claude 陶土橙阶（claude 品牌开屏用，branding.ts / theme.ts 双主题共用）：
 * 深底从正色 `#D77757` 起步、经亮橙、奔奶油橙收——三档对比拉满（用户反馈
 * "渐变要明显、要亮"，起点不再用暗端）；浅底（claude-paper）反向：深化橙
 * 起步、正色收（浅底上"亮"是加深）。
 */
export declare const EMBER: Rgb;
export declare const EMBER_BRIGHT: Rgb;
export declare const EMBER_PALE: Rgb;
export declare const EMBER_LIGHT: Rgb;
export declare const EMBER_FLASH: Rgb;
export declare const EMBER_PAPER: Rgb;
export declare const EMBER_PAPER_FLASH: Rgb;
/**
 * Codex 薰衣草紫阶（codex 品牌开屏用，branding.ts / theme.ts 双主题共用）：
 * 与 claude 同构——深底从亮紫起步、经淡紫、奔近白的薰衣草收（三档对比拉
 * 满）；浅底（codex-paper）反向：深化紫起步、正色收（浅底上"亮"是加深）。
 */
export declare const LAVENDER: Rgb;
export declare const LAVENDER_BRIGHT: Rgb;
export declare const LAVENDER_SOFT: Rgb;
export declare const LAVENDER_PALE: Rgb;
export declare const LAVENDER_LIGHT: Rgb;
export declare const LAVENDER_FLASH: Rgb;
export declare const LAVENDER_PAPER: Rgb;
export declare const LAVENDER_PAPER_FLASH: Rgb;
/**
 * Paint `word` with a 10-column highlight window sweeping across it. The
 * window advances one column per `stepMs` and the brightness pulse follows
 * the same cadence (period 2π·stepMs·... — one full sine per ~6 steps).
 * The shimmer cadence is configurable; callers pass 60 for the lively
 * sweep.
 * @param word - Text to paint.
 * @param time - Elapsed time in milliseconds; drives the sweep position and the brightness pulse.
 * @param base - Color for cells outside the highlight window.
 * @param highlight - Color mixed into the sweeping highlight window.
 * @param stepMs - Milliseconds per column of sweep advance (default 60).
 * @returns The ANSI bold-colored word with the moving highlight.
 */
export declare function sweep(word: string, time: number, base: Rgb, highlight: Rgb, stepMs?: number): string;
//# sourceMappingURL=shimmer.d.ts.map
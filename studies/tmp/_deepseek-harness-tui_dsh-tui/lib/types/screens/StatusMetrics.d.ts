import type { Color } from '../ink/styles.js';
import type { Theme } from '../theme.js';
import type { ContextBreakdown, ContextOccupancy } from '../adapter/ports/channel-view.js';
/**
 * The occupancy reading a screen renders.
 *
 * The channel publishes `contextOccupancy` (see
 * `dsh-adapter/context-occupancy.ts`); this resolves the same reading for ports
 * that do not carry the member — the partial channel literals the verify/repro
 * harnesses hand the real screens, and third-party scenes built against an
 * older port. The channel itself always publishes it, so a production render
 * has exactly one source, and a member that IS present is never second-guessed.
 * @param channel - The channel surface (or a partial one).
 * @returns Occupancy for the footer/bar/warning, or `undefined` when unknown.
 */
export declare function channelContextOccupancy(channel: {
    readonly contextOccupancy?: ContextOccupancy | undefined;
    readonly lastUsage?: {
        input: number;
        cacheRead: number;
        cacheWrite: number;
    } | undefined;
    readonly contextWindow: number | undefined;
}): ContextOccupancy | undefined;
/** Context bar segments, in bar order — the theme key that fills each one,
 *  its label pair, and the fill a palette without that key falls back to (the
 *  pre-theme DeepSeek blue family, dark-theme friendly: deep navy → brand
 *  blue, neutral grey free segment).
 *
 *  The bar draws NO text inside a used segment: the fill color is the whole
 *  signal (community feedback — the old `s`/`p`/`t` letters read as noise on
 *  a row that is already decorative). `labels` therefore belongs to the hover
 *  breakdown only: index 0 is the readable name, index 1 the short form the
 *  supplemental row falls back to on a narrow terminal. Exported for the
 *  hoverable JSX bar (ContextBarView), which re-derives the same column split
 *  this module's ANSI path renders. */
export declare const USED_SEGMENTS: readonly [{
    readonly key: "system";
    readonly themeKey: "contextBarSystem";
    readonly fallback: "#22305F";
    readonly labels: readonly ["system", "sys"];
}, {
    readonly key: "prompt";
    readonly themeKey: "contextBarPrompt";
    readonly fallback: "#2B3D78";
    readonly labels: readonly ["prompt", "pr"];
}, {
    readonly key: "assistant";
    readonly themeKey: "contextBarAssistant";
    readonly fallback: "#344A92";
    readonly labels: readonly ["assistant", "ast"];
}, {
    readonly key: "thinking";
    readonly themeKey: "contextBarThinking";
    readonly fallback: "#4D6BFE";
    readonly labels: readonly ["thinking", "th"];
}, {
    readonly key: "tools";
    readonly themeKey: "contextBarTools";
    readonly fallback: "#5A7CFF";
    readonly labels: readonly ["tools", "tl"];
}];
/** 渲染期取一个已用分段的填充色（品牌档渲染时读取，见 `branding.ts`）：品牌在
 *  档时品牌表优先——那是「切后端整屏换色」的语义，与当前主题声明了什么无关；
 *  其余情形原样返回入参（主题声明的键或固定 ramp）。 */
export declare function usedSegmentColor(segment: {
    key: string;
    color: Color;
}): Color;
/** The five used-segment fills a palette declares, in bar order. A palette
 *  predating the keys (community themes) keeps the fixed ramp above, so both
 *  the JSX bar and its hover legend stay renderable without the theme.
 *
 *  纯粹的调色板投影：只回答「这个调色板声明了什么」。品牌覆盖在渲染点叠加
 *  （`usedSegmentColor`），两套机制因此不会互相顶掉。 */
export declare function contextBarSegmentColors(theme?: Theme): readonly Color[];
/** A single used block when the backend reports occupancy without composition. */
export declare function contextBarUsedColor(colors?: readonly Color[]): Color;
/** Local token estimates per context content type (system, prompt, assistant, thinking, tools). */
export type ContextSegments = Record<(typeof USED_SEGMENTS)[number]['key'], number>;
/** Free-segment colors: light grey fill, dark grey readout. Exported so the
 *  JSX bar (ContextBarView) and the hover chip paint the same free color the
 *  ANSI path does instead of re-declaring the hex. */
export declare const FREE_SEGMENT_FILL = "#E8E8E8";
export declare const FREE_SEGMENT_TEXT = "#4A4A4A";
/** Compact token count like pi's: `988`, `3.4k`, `12k`, `1.0M`.
 * @param count - The raw token count; negative values clamp to zero.
 * @returns The compact count string.
 */
export declare function formatTokens(count: number): string;
/** Which pressure step a context occupancy falls in: undefined while the
 *  context is comfortable, then the shared `warning` / `error` theme colors.
 * @param pct - Context occupancy percent (0–100+).
 * @returns The theme color key, or undefined below the amber threshold.
 */
export declare function contextPressureStep(pct: number): 'warning' | 'error' | undefined;
/**
 * The bar's right-aligned usage readout, longest form first: token counts and
 * percent (`13k/64k 19.5%`), then the percent alone once the free segment is
 * too narrow to carry the counts.
 * @param usedTokens - Total context tokens in use.
 * @param contextWindow - The context window size in tokens.
 * @returns The readout ladder, widest option first.
 */
export declare function contextBarReadout(usedTokens: number, contextWindow: number): readonly string[];
/**
 * Blank-pad to `width` cells and right-align the first readout option that
 * fits. Shared by the ANSI string path (renderContextBar) and the hoverable
 * JSX bar (ContextBarView) so both render identical readouts.
 */
export declare function rightAlignBarText(options: readonly string[], width: number): string;
/**
 * The five fills' weights, in bar order — the composition the bar is drawn
 * from: the meter's `contextBreakdown` joined with the estimates that stay
 * useful for the part it does not break down.
 *
 * DSH's meter prices the composition it can see (`contextBreakdown`: the system
 * prompt, the newest request ENVELOPE's tool schemas, and every other visible
 * surface node, injected context included). This app's own `segments` estimates
 * are what remains useful for the part the meter does not break down: the
 * message side, where only the transcript distinguishes a human prompt from
 * assistant text, reasoning and tool results. The join is therefore:
 *
 *  - `system` ← the meter's `systemTokens`;
 *  - `tools` ← the meter's `toolsTokens` (the tool SCHEMAS, which no transcript
 *    estimate can see) plus this app's tool-RESULT estimate;
 *  - `prompt`/`assistant`/`thinking` ← the meter's `messageTokens` shared in the
 *    proportions the estimates report.
 *
 * One weight set feeds every reader of the composition: the bar's own column
 * split (`contextBarColumns`, which the hoverable twin calls too) and the hover
 * legend (`contextBarBreakdown`), so the numbers under the pointer describe the
 * fills above them.
 *
 * Without a meter value this is the estimates alone — the pre-existing
 * behavior — and the bar spans whatever the occupancy says regardless, since
 * the weights only divide a span the occupancy already fixed.
 * @param segments - Used tokens per content type (this app's estimates).
 * @param breakdown - The meter's composition, when the harness publishes one.
 * @returns One weight per used fill, in bar order.
 */
export declare function barSegments(segments: ContextSegments, breakdown: ContextBreakdown | undefined): ContextSegments;
/**
 * Attribute the composition's weights to the one authoritative token total:
 * largest remainders, integers that sum EXACTLY to it, so the hover legend's
 * numbers add up to the reading beside them instead of reporting a second,
 * unrelated total.
 *
 * All-zero weights — no composition known at all — attribute nothing: the bar
 * paints its measured span as one `unclassified` block, so the legend names
 * that block as measured `used` rather than inventing five equal slices.
 * @param weights - The composition's weights, one per used fill.
 * @param total - Tokens to attribute (the occupancy numerator).
 * @returns Integer weights summing to `total` (all zero for a non-positive total).
 */
export declare function attributeBarTokens(weights: ContextSegments, total: number): ContextSegments;
/** One entry of the context bar's hover breakdown: the fill color, the name
 *  to put next to a swatch of it, and the token count already folded into
 *  `label` (`system 1.2k`). */
export type ContextBarBreakdownEntry = {
    /** `system` … `tools`, or `free`. */
    key: string;
    /** The chip label, e.g. `thinking 5.0k`. */
    label: string;
    /** The segment's fill color — the hover chip paints with it, which is what
     *  ties each number back to a slice of the bar. */
    color: Color;
};
/** Separator between breakdown entries, chosen by the width ladder below. */
export type ContextBarBreakdown = {
    readonly entries: readonly ContextBarBreakdownEntry[];
    readonly separator: string;
};
/**
 * The context bar's hover breakdown — the legend the bar no longer carries
 * itself. Local content estimates come first, measured free space last. When
 * composition is unavailable, one measured used entry replaces the estimates.
 *
 * `columns` picks the label form: readable names with a ` · ` separator while
 * the line fits, then the short forms, then a bare space separator (the color
 * chip already separates the entries). The caller renders each entry as
 * `chip + space + label`, which is what the fit test measures.
 *
 * @param segments - Local token estimates per content type.
 * @param usedTokens - Total used tokens; the remainder is the free entry.
 * @param contextWindow - The context window size in tokens.
 * @param columns - Terminal width; the footer's own padding is subtracted here.
 * @param colors - The bar's fills: `used` (bar order, from the palette) and the
 *   free segment's fill. Absent fields fall back to the fixed ramp / grey.
 * @returns The breakdown entries and the separator to join them with.
 */
export declare function contextBarBreakdown(segments: ContextSegments, usedTokens: number, contextWindow: number, columns: number, colors?: {
    used?: readonly Color[];
    freeFill?: Color;
}): ContextBarBreakdown;
/** Share a fixed used-column budget, keeping small segments visible when it fits. */
export declare function allocateBarColumns(values: readonly number[], width: number): number[];
/** Occupancy fixes the used/free boundary; estimates only divide the used part. */
export declare function contextBarColumns(segments: ContextSegments, usedTokens: number, contextWindow: number, width: number): {
    used: number[];
    unclassified: number;
    free: number;
};
/**
 * The segmented context bar: used segments by content type, then the
 * remainder as a light free segment whose right edge carries the usage
 * readout (`13k/64k 19.5%`). No other text — the bar is read by color, and
 * the pointer supplies the names and numbers (contextBarBreakdown). The
 * readout tints amber / red as the context fills (contextPressureStep).
 * @param segments - Local token estimates per content type.
 * @param usedTokens - Measured occupancy, driving both fill length and readout.
 * @param contextWindow - The context window size in tokens.
 * @param width - Total bar width in terminal columns.
 * @param colors - The free segment's fill/text override; absent fields keep
 *   the fixed defaults. The used fills stay on the fixed ramp unless a brand
 *   overrides them (see usedSegmentColor).
 * @returns The ANSI-styled segmented bar, or '' when `width` or `contextWindow` is non-positive.
 */
export declare function renderContextBar(segments: ContextSegments, usedTokens: number, contextWindow: number, width: number, colors?: {
    freeFill: string;
    freeText: string;
}): string;
/** Pressure-colored text: green below 80%, amber ≥ 80, red ≥ 95.
 * @param pct - Context occupancy percent (0–100+).
 * @param text - Text to color.
 * @returns The capability-aware color-wrapped text.
 */
export declare function pressureColor(pct: number, text: string): string;
/** Compact 1/8-cell context gauge for the footer's ctx field on hover:
 *  `▕██████▋···▏`, fill proportional to context occupancy, colored by the
 *  amber/red pressure thresholds. Same block ramp as the TPS gauge.
 * @param usedTokens - Total context tokens in use.
 * @param contextWindow - Context window size in tokens.
 * @param width - Gauge width in terminal columns (fill cells, brackets excluded).
 * @returns The ANSI gauge string, or '' for a non-positive window.
 */
export declare function renderMiniContextBar(usedTokens: number, contextWindow: number, width?: number): string;
/** Speed color: green ≥ 50, yellow ≥ 20, red below (pi-tps-meter).
 * @param tps - Tokens per second; selects the color threshold.
 * @param text - Text to color.
 * @returns The capability-aware color-wrapped text.
 */
export declare function speedColor(tps: number, text: string): string;
/** Live 1/8-cell horizontal gauge: `▕███████▋···▏`.
 * @param tps - Current tokens per second.
 * @param peak - Scaling peak; values below 40 scale against the floor instead.
 * @returns The ANSI gauge string.
 */
export declare function renderTpsGauge(tps: number, peak: number): string;
/** Min-max normalized 12-sample sparkline: `▁▄▇▅▂▁▇█▅▃▆▇`.
 * @param samples - Turn TPS samples; only the last 12 are rendered.
 * @returns The ANSI sparkline string.
 */
export declare function renderTpsSparkline(samples: readonly {
    tps: number;
}[]): string;
/** Rolling stats: 60s average, all-time mean and p95.
 * @param samples - Turn TPS samples with their timestamps in milliseconds.
 * @param nowMs - Current time in milliseconds; the 60s rolling window keeps samples with `nowMs - at <= 60_000`.
 * @returns The 60s average, all-time mean, and all-time p95 (all zero for an empty sample list).
 */
export declare function tpsStats(samples: readonly {
    tps: number;
    at: number;
}[], nowMs: number): {
    avg: number;
    mean: number;
    p95: number;
};
//# sourceMappingURL=StatusMetrics.d.ts.map
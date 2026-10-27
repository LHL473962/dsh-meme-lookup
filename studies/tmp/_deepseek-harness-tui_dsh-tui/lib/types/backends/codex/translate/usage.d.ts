/**
 * Token usage and rate limits (docs/codex-backend-design.md §7.5).
 *
 * `thread/tokenUsage/updated` reports `last` (the latest model call) and
 * `total`. OpenAI counts cached and cache-written prompt tokens inside
 * `inputTokens`; the shared vocabulary keeps them apart (occupancy is
 * input + cacheRead + cacheWrite), so the uncached share is what remains.
 */
import type { RateLimitView, UsageDelta } from '../../../agent/events.js';
import { type Rec } from '../narrow.js';
/** One `TokenUsageBreakdown` in the shared vocabulary. */
export declare function usageOf(breakdown: unknown): UsageDelta | undefined;
/** Sum two usages (absent counts stay absent only when both are). */
export declare function addUsage(a: UsageDelta | undefined, b: UsageDelta | undefined): UsageDelta | undefined;
/** A `thread/tokenUsage/updated` payload: the latest call and the window. */
export declare function tokenUsageOf(params: Rec): {
    readonly last?: UsageDelta;
    readonly window?: number;
};
/** The status line's window name for a window length (5 h / 7 d keep the
 *  names the status line localizes; anything else reads as minutes). */
export declare function windowName(minutes: number | undefined): string;
/** `account/rateLimits/updated` → the shared view; undefined when the
 *  snapshot carries no window (a relay reports none). */
export declare function rateLimitOf(params: Rec): {
    readonly view?: RateLimitView;
    readonly reached?: string;
};
//# sourceMappingURL=usage.d.ts.map
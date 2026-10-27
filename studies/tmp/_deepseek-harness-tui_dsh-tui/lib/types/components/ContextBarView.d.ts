import React from 'react';
import type { Color } from '../ink/styles.js';
import { type ContextSegments } from '../screens/StatusMetrics.js';
import type { ContextBreakdown } from '../adapter/ports/channel-view.js';
/**
 * The hoverable JSX twin of `renderContextBar`: the same segmented context
 * bar (same largest-remainder column split, same free-segment readout),
 * rendered as one Box per segment so the bar can react to the pointer.
 *
 * A used segment is its fill color and nothing else — no label (community
 * feedback on the old `s`/`p`/`t` letters: they read as noise on a row that is
 * already decorative, and they never fit the narrow segments anyway). The only
 * text left is the free segment's right-aligned usage readout.
 *
 * ONE hover target for the whole bar rather than one per segment. The colors
 * are named where there is room for words: hovering anywhere on the bar parks
 * the full per-content-type breakdown on the footer's supplemental row. A
 * per-segment target also made every crossing of the five fills an
 * enter+leave pair, hence a footer re-render per crossing.
 *
 * The component path follows the ANSI path's geometry: this exists so the bar
 * can react to the pointer, not to restyle it.
 */
export declare function ContextBarView({ segments, breakdown, usedTokens, contextWindow, width, colors, onHover, }: {
    /** Local token estimates per content type, dividing the filled portion only. */
    segments: ContextSegments;
    /** The meter's composition, when the harness publishes one; the estimates
     *  above then only split its message side. */
    breakdown?: ContextBreakdown | undefined;
    /** Measured occupancy, driving both fill length and readout. */
    usedTokens: number;
    /** The context window size in tokens. */
    contextWindow: number;
    /** Total bar width in terminal columns. */
    width: number;
    /** Theme overrides for the free segment (light theme passes its own). */
    colors?: {
        freeFill: Color;
        freeText: Color;
    };
    /** Hover signal: true while the pointer is anywhere on the bar, false on
     *  leave. Absent handlers render a static bar (tests, headless embeds). */
    onHover?: (hovered: boolean) => void;
}): React.ReactNode;
//# sourceMappingURL=ContextBarView.d.ts.map
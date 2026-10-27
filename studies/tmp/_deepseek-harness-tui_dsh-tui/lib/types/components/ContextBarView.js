import { jsx as _jsx } from "react/jsx-runtime";
import { Box, Text, useTheme } from '../ui.js';
import { getTheme } from '../theme.js';
import { FREE_SEGMENT_FILL, FREE_SEGMENT_TEXT, USED_SEGMENTS, usedSegmentColor, barSegments, contextBarColumns, contextBarReadout, contextBarSegmentColors, contextBarUsedColor, contextPressureStep, rightAlignBarText, } from '../screens/StatusMetrics.js';
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
export function ContextBarView({ segments, breakdown, usedTokens, contextWindow, width, colors, onHover, }) {
    // The five used fills come from the palette (contextBar* keys); only the free
    // segment still takes an override, since its shading is a light/dark call the
    // call site already made.
    const [themeName] = useTheme();
    if (width <= 0 || contextWindow <= 0)
        return null;
    const segmentColors = contextBarSegmentColors(getTheme(themeName));
    // The composition re-weights the fills only: the occupancy still fixes the
    // span, so the fills can never add up to a longer or shorter bar than the
    // readout right of them quotes.
    const columns = contextBarColumns(barSegments(segments, breakdown), usedTokens, contextWindow, width);
    // The readout is the bar's only text, and its one pressure signal: amber
    // from 80% occupancy, red from 95% (the footer's shared thresholds). The
    // theme key wins over the free-text color, which stays for comfortable
    // occupancy.
    const readout = contextBarReadout(usedTokens, contextWindow);
    const pressure = contextPressureStep((usedTokens / contextWindow) * 100);
    const nodes = [];
    for (const [index, segment] of USED_SEGMENTS.entries()) {
        const segmentWidth = columns.used[index] ?? 0;
        if (segmentWidth <= 0)
            continue;
        // Childless on purpose: the renderer fills a node's own rect with its
        // backgroundColor, so the segment is a pure colored block (render-node-to-
        // output's ownBackgroundColor fill).
        nodes.push(_jsx(Box, { width: segmentWidth, height: 1, flexShrink: 0, backgroundColor: usedSegmentColor({
                key: segment.key,
                color: segmentColors[index] ?? segment.fallback,
            }) }, segment.key));
    }
    if (columns.unclassified > 0) {
        nodes.push(_jsx(Box, { width: columns.unclassified, height: 1, flexShrink: 0, backgroundColor: contextBarUsedColor(segmentColors) }, "used"));
    }
    const freeWidth = columns.free;
    if (freeWidth > 0) {
        nodes.push(_jsx(Box, { width: freeWidth, height: 1, flexShrink: 0, backgroundColor: colors?.freeFill ?? FREE_SEGMENT_FILL, children: _jsx(Text, { color: pressure ?? colors?.freeText ?? FREE_SEGMENT_TEXT, wrap: "truncate", children: rightAlignBarText(readout, freeWidth) }) }, "free"));
    }
    return (_jsx(Box, { flexDirection: "row", flexShrink: 0, width: width, onMouseEnter: onHover === undefined ? undefined : () => onHover(true), onMouseLeave: onHover === undefined ? undefined : () => onHover(false), children: nodes }));
}

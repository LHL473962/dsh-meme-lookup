import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import stripAnsi from 'strip-ansi';
import { Box, Text, useTerminalSize } from '../ui.js';
import { useTerminalFocus } from '../ink/hooks/use-terminal-focus.js';
import { useSelection } from '../ink/hooks/use-selection.js';
import { hasSelection } from '../ink/selection.js';
import { stringWidth } from '../ink/stringWidth.js';
import { getGraphemeSegmenter } from '../utils/intl.js';
import { PageInsetContext } from './PageMargin.js';
/**
 * Tooltip hover system — the terminal equivalent of the HTML `title`
 * attribute. Attach {@link useTooltip} props to any Box whose visible text
 * may be truncated (tool-call header paths, wrapped prompts, status-line
 * fields); after a ~600ms dwell the full content pops up in a floating card
 * anchored at the pointer, and disappears the moment the pointer leaves.
 *
 * Attach it ONLY when the text is actually hidden: a float that repeats
 * content already visible next to the pointer is noise, not detail (the
 * tool-call header gates on folded/clipped content for this reason).
 *
 * Tooltips and text selection are mutually exclusive: a drag-copy reads the
 * painted screen, and the card REPLACES the cells it covers, so
 * {@link TooltipLayer} hides all tooltips while a selection drag or an
 * active selection exists (see its subscription on selection mutations).
 *
 * Hover events only exist in fullscreen (alternate screen + mouse
 * tracking); inline mode never fires the handlers, so the store can only
 * be written from a live fullscreen tree.
 */
/** Default dwell before the tooltip appears (GUI `title` convention). */
const DEFAULT_TOOLTIP_DELAY_MS = 600;
// Module-level store (the `src/ink/instances.ts` single-instance pattern):
// writers are the hover handlers, the single reader is TooltipLayer.
let state = null;
let invalidationGeneration = 0;
const listeners = new Set();
function notify() {
    for (const listener of listeners)
        listener();
}
/** Subscribe to tooltip show/hide; returns an unsubscribe function. */
export function subscribeTooltip(listener) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}
/** Stable snapshot for useSyncExternalStore (identity kept until changed). */
export function getTooltipSnapshot() {
    return state;
}
function showTooltip(owner, col, row, content) {
    state = { owner, anchorCol: col, anchorRow: row, content };
    notify();
}
function hideTooltip(owner) {
    if (state !== null && state.owner === owner) {
        state = null;
        notify();
    }
}
/** Hide shown content and invalidate every pending dwell timer. */
export function clearTooltip() {
    invalidationGeneration++;
    if (state !== null) {
        state = null;
        notify();
    }
}
/**
 * Hover props that pop a tooltip with the full content after a dwell.
 *
 * The pointer position (screen col/row) is taken from the PointerEvent the
 * renderer hands to `onMouseEnter` — the runtime always passes one even
 * though the prop type is `() => void`, which is why the handler's parameter
 * is optional (a `() => void` prop accepts a function with only optional
 * parameters).
 */
export function useTooltip(content, opts) {
    const ownerRef = React.useRef(null);
    if (ownerRef.current === null)
        ownerRef.current = { timer: null };
    const owner = ownerRef.current;
    // Resolve function content at show time so callers can pass getters that
    // read live channel state without re-binding the handlers.
    const contentRef = React.useRef(content);
    contentRef.current = content;
    const delayMs = opts?.delayMs ?? DEFAULT_TOOLTIP_DELAY_MS;
    React.useEffect(() => () => {
        // Unmount clears our pending timer and our tooltip — a screen swap must
        // not leave a ghost anchored to geometry that no longer exists.
        if (owner.timer !== null)
            clearTimeout(owner.timer);
        hideTooltip(owner);
    }, [owner]);
    return React.useMemo(() => ({
        onMouseEnter: (event) => {
            const col = event?.col ?? 0;
            const row = event?.row ?? 0;
            if (owner.timer !== null)
                clearTimeout(owner.timer);
            const generationAtEnter = invalidationGeneration;
            owner.timer = setTimeout(() => {
                owner.timer = null;
                if (generationAtEnter !== invalidationGeneration)
                    return;
                const resolved = typeof contentRef.current === 'function'
                    ? contentRef.current()
                    : contentRef.current;
                if (resolved === '')
                    return;
                showTooltip(owner, col, row, resolved);
            }, delayMs);
        },
        onMouseLeave: () => {
            if (owner.timer !== null) {
                clearTimeout(owner.timer);
                owner.timer = null;
            }
            hideTooltip(owner);
        },
    }), [owner, delayMs]);
}
/**
 * Convenience wrapper for list rows built from data (a component boundary
 * makes the hook call legal per item). Renders a plain Box carrying the
 * hover props around `children`.
 */
export function TooltipTarget({ content, children, }) {
    const hover = useTooltip(content);
    return _jsx(Box, { ...hover, children: children });
}
/**
 * The singleton floating layer: subscribes to the tooltip store and renders
 * the rounded card above the anchor row (below it when there is no room),
 * horizontally clamped inside the terminal. Mount once, LAST in the tree so
 * it paints over everything else. Terminal resize hides the tooltip — its
 * anchor is screen geometry that just went stale.
 */
export function TooltipLayer({ invalidationKey, subscribeInvalidation, } = {}) {
    const { columns, rows } = useTerminalSize();
    const inset = React.useContext(PageInsetContext);
    const terminalFocused = useTerminalFocus();
    const tooltip = React.useSyncExternalStore(subscribeTooltip, getTooltipSnapshot);
    // A text selection and a floating tooltip are mutually exclusive: the copy
    // reads the PAINTED screen, and the tooltip card REPLACES the cells of the
    // text it covers — dragging across a shown tooltip (or letting one pop
    // mid-drag via its dwell timer) puts the tooltip fragment in the clipboard
    // instead of the message text. Every selection mutation (drag start, each
    // motion event, release, clear) funnels through this notification, so the
    // layer goes dark the instant a drag begins and stays dark until the
    // selection settles. The render guard below is belt-and-suspenders: a
    // dwell that fires between two motion events must still never paint.
    const selection = useSelection();
    const selectionBusy = React.useSyncExternalStore(selection.subscribe, () => {
        const state = selection.getState();
        return state !== null && (state.isDragging || hasSelection(state));
    }, () => false);
    React.useEffect(() => {
        return selection.subscribe(() => {
            // Every selection mutation (drag start, motion, release, clear) resets
            // the tooltip system wholesale: while busy the card must never paint,
            // and the settle must also invalidate dwell timers armed while dark,
            // so a finished copy is not immediately followed by a surprise card.
            clearTooltip();
        });
    }, [selection]);
    // Remounts and modal/screen transitions invalidate shown AND pending tips.
    React.useEffect(() => {
        clearTooltip();
    }, [invalidationKey]);
    React.useEffect(() => {
        if (!terminalFocused)
            clearTooltip();
    }, [terminalFocused]);
    React.useEffect(() => {
        if (subscribeInvalidation === undefined)
            return;
        return subscribeInvalidation(clearTooltip);
    }, [subscribeInvalidation]);
    const prevSize = React.useRef({ columns, rows });
    React.useEffect(() => {
        if (prevSize.current.columns !== columns || prevSize.current.rows !== rows) {
            prevSize.current = { columns, rows };
            clearTooltip();
        }
    }, [columns, rows]);
    if (tooltip === null)
        return null;
    // Never paint over an active drag/selection (see the subscription above).
    if (selectionBusy)
        return null;
    // A bordered card needs at least one content cell plus two border cells.
    // Below that, hiding is safer than creating geometry wider/taller than the
    // terminal (Yoga would clip unpredictably on 1–2 column/row resize states).
    if (columns < 3 || rows < 3)
        return null;
    const maxWidth = Math.max(3, columns - 4);
    // Grapheme-aware wrap consistent with PromptInput's wrapToWidth: code-point
    // iteration splits ZWJ emoji and combining sequences across rows, leaving
    // broken halves at the row edges. Newlines are honoured like wrapWidth.
    let lines = wrapTooltipContent(tooltip.content, maxWidth - 2);
    // A tooltip taller than the terminal is useless; keep the head.
    const maxLines = Math.max(1, rows - 2);
    if (lines.length > maxLines)
        lines = lines.slice(0, maxLines);
    const innerWidth = Math.min(maxWidth - 2, Math.max(1, ...lines.map(stringWidth)));
    const width = innerWidth + 2;
    const height = lines.length + 2;
    // Prefer resting on the row ABOVE the anchor; when there is no room
    // (anchor at the top of the screen), drop below it, clamped on-screen.
    // The anchor is SCREEN geometry (pointer events) while the absolute box is
    // placed relative to the inset content-area origin, and useTerminalSize()
    // already reports the content size: convert the anchor into content
    // coordinates first, then clamp inside the content area. Adding the inset
    // (the earlier bug) moved the whole card by the page margin — with the
    // default margin one row low and two columns right, so its bottom border
    // landed ON the hovered row and that row's glyphs showed beside the card.
    const anchorRow = tooltip.anchorRow - inset.y;
    const anchorCol = tooltip.anchorCol - inset.x;
    const topAbove = anchorRow - height;
    const top = Math.max(0, Math.min(topAbove >= 0 ? topAbove : anchorRow + 1, Math.max(0, rows - height)));
    const left = Math.max(0, Math.min(anchorCol, Math.max(0, columns - width)));
    return (_jsx(Box, { position: "absolute", left: left, top: top, width: width, height: height, flexDirection: "column", flexShrink: 0, borderStyle: "round", borderColor: "permission", backgroundColor: "toolCardBackground", children: lines.map((line, index) => (_jsx(Text, { wrap: "truncate-end", children: line === '' ? ' ' : line }, index))) }));
}
/**
 * Wrap tooltip content to display width, breaking only BETWEEN grapheme
 * clusters (ZWJ emoji, combining sequences and CJK wide cells stay whole).
 * Newlines in the input are honoured. Mirrors PromptInput.wrapToWidth's
 * break rule so the tooltip shows exactly the text the input would wrap.
 */
function wrapTooltipContent(text, width) {
    const rows = [];
    if (width <= 0)
        return rows;
    // Tooltip content is display-only: remove ANSI/C0 controls before grapheme
    // segmentation so a CSI sequence cannot be split and counted as visible
    // columns. Newlines remain structural; tabs become deterministic spaces.
    text = stripAnsi(text)
        .replace(/\t/gu, '        ')
        .replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/gu, '');
    const segmenter = getGraphemeSegmenter();
    for (const line of text.split('\n')) {
        if (line === '') {
            rows.push('');
            continue;
        }
        let current = '';
        let used = 0;
        for (const { segment } of segmenter.segment(line)) {
            const w = stringWidth(segment);
            if (used + w > width && current !== '') {
                rows.push(current);
                current = segment;
                used = w;
            }
            else {
                current += segment;
                used += w;
            }
        }
        rows.push(current);
    }
    return rows;
}

import React from 'react';
import { type ScrollBoxHandle } from '../ui.js';
/**
 * Proportional scrollbar for the fullscreen transcript's gutter — the
 * `scrollbar` option of the `dsh-tui.scrollGutter` setting (the timeline
 * rail's sibling; same 2-column slot, same chrome rules):
 *
 *  - the thumb (██) shows the visible window's position AND size over the
 *    whole content (viewport²/content tall, positioned by scrollTop);
 *  - clicking the track scrolls the clicked position to the viewport top
 *    (classic scrollbar semantics — the thumb centers under the click
 *    through the follow-up renders);
 *  - dragging the track scrubs the transcript: the drag protocol's
 *    per-target localRow maps through the SAME trackScrollTop as a click
 *    (absolute mapping — drag to point, no grabbed thumb offset), so a
 *    drag is a continuous run of click-to-position jumps. The mapping only
 *    reads the render-time maxScroll/trackH and never re-reads scrollTop
 *    mid-gesture, so a throttled/clamped scrollTo cannot feed back into the
 *    pointer mapping (no jitter). Dragging the thumb therefore lands the
 *    pointer's row at the viewport top, exactly like clicking that row;
 *  - a landing (drag or the back-to-bottom affordance) breaks and re-pins
 *    sticky, which unmounts the chrome that had shrunk the transcript row;
 *    the re-pinning Ink pass follows the commit and fires no subscriber
 *    notify, so the gutter re-reads the handle once that frame lands (see
 *    the subscribe effect). Without it the thumb stays painted from the
 *    shrunken viewport and floats a few rows above the bottom until an
 *    unrelated render (hover) re-reads the handle;
 *  - the gutter is permanent while scrollable (Qwen's rule: an
 *    auto-hiding gutter that changes content width rewraps everything);
 *    hidden below 60 terminal columns or when the content fits (inline
 *    mode keeps the terminal's native scrollback);
 *  - NoSelect fences the glyphs out of click-drag text selection; the
 *    wheel over the gutter scrolls the transcript. Because the track is a
 *    drag target, an unmodified left drag scrubs instead of selecting, and
 *    multi-clicks on the track no longer feed the select-line chain;
 *    Shift/Alt/Ctrl drags never open a drag session and keep the
 *    selection path.
 */
export declare function ScrollbarGutter({ handle, terminalWidth, }: {
    handle: ScrollBoxHandle | null;
    terminalWidth: number;
}): React.ReactNode;
//# sourceMappingURL=ScrollbarGutter.d.ts.map
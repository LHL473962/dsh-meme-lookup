import type { DOMElement } from './dom.js';
import type { Rectangle } from './layout/geometry.js';
import type Output from './output.js';
import type { SoftWrapFlag } from './output.js';
import { type Screen } from './screen.js';
import { type StyledSegment } from './squash-text-nodes.js';
import type { Color } from './styles.js';
/** Reset the per-frame layout-shift flag. */
export declare function resetLayoutShifted(): void;
/**
 * Whether any node's layout position or size shifted this frame, or a child was removed.
 * @returns true when the full-damage path is needed this frame.
 */
export declare function didLayoutShift(): boolean;
/**
 * DECSTBM scroll optimization hint: when a ScrollBox's scrollTop changed
 * between frames and nothing else moved, log-update.ts can emit a hardware
 * scroll (DECSTBM + SU/SD) instead of rewriting the whole viewport.
 * top/bottom are 0-indexed inclusive screen rows; delta > 0 means content
 * moved up (scrollTop increased, CSI n S).
 */
export type ScrollHint = {
    top: number;
    bottom: number;
    delta: number;
};
export type AbsoluteHitEntry = {
    node: DOMElement;
    rect: Rectangle;
};
export type OcclusionSurface = {
    node: DOMElement;
    x: number;
    y: number;
    width: number;
    height: number;
    filled: boolean;
};
/**
 * The current frame's absolute-positioned nodes in paint order.
 * @returns read-only list; reverse-iterate for topmost-first hit-testing.
 */
export declare function getAbsoluteHitList(): readonly AbsoluteHitEntry[];
/** Reset the scroll hint for the next frame and rotate the per-frame buffers. */
export declare function resetScrollHint(): void;
/**
 * Frame-end check: did any PREVIOUS frame's absolute overlay vacate cells
 * that no CURRENT overlay rect covers (the overlay shrank or moved)?
 *
 * Opaque/filled absolute overlays (OverlayAbove pickers above the input,
 * tooltips) paint over non-sibling subtrees (e.g. the transcript ScrollBox,
 * which rendered EARLIER in tree order). When such a rect shrinks, the cells
 * it vacated exist in prevScreen only as the overlay's own pixels; the
 * underlying subtree is clean, so its blit would restore those stale pixels
 * and the diff never clears them (real-machine report: the slash menu keeps
 * its old rows after a filter narrows it, until any unrelated repaint).
 * DOM removal covers the CLOSE case (consumeAbsoluteRemovedFlag); this check
 * covers shrink/move: the caller poisons the NEXT frame (renders without
 * prevScreen) so the vacated cells are re-derived from the real tree.
 * Growth is fine — a current rect that fully contains the previous rect
 * repaints the whole area itself this frame — but only when that current
 * node is opaque (own background or `opaque`). A transparent absolute node
 * (a click-catcher spanning the transcript) paints nothing of its own, so
 * it cannot stand in for the cells an opaque sibling card vacated when it
 * shrank: the clean subtree underneath would blit the old card's pixels
 * back from prevScreen (real-machine report: switching the image preview to
 * a smaller image left the wider card's borders and title on screen).
 */
export declare function hasOverlayVacatedCells(): boolean;
/**
 * Frame-end check: occlusion surfaces whose recorded cover decision no
 * longer matches the frame's terminal-image placements.
 *
 * Two paths leave a surface stale: (1) it painted before a same-frame
 * image that registers later in walk order — output.getImages() had not
 * admitted the placement yet and the previous frame had none; (2) a
 * clean-subtree blit skipped the surface entirely, restoring its old
 * cells while an image behind it appeared, moved, or was removed. The
 * caller re-walks each stale surface (markDirty) and schedules a frame
 * so the cover follows image changes even with no pending React commit.
 * @param output - the output whose previous/current placements re-decide.
 * @returns surfaces (nodes) whose recorded decision mismatches; may be empty.
 */
export declare function getOcclusionMismatchNodes(output: Output): DOMElement[];
/**
 * The scroll hint captured this frame, or null.
 * @returns the scroll hint, or null when none was captured.
 */
export declare function getScrollHint(): ScrollHint | null;
/** Clear the pending scroll drain node for the next frame. */
export declare function resetScrollDrainNode(): void;
/**
 * The ScrollBox node still draining pending scroll delta, or null.
 * @returns the draining ScrollBox node, or null.
 */
export declare function getScrollDrainNode(): DOMElement | null;
/**
 * At-bottom follow scroll recorded this frame: the scroll delta and
 * viewport bounds, consumed by ink.tsx to translate the active text
 * selection so the highlight stays anchored to the text.
 */
export type FollowScroll = {
    delta: number;
    viewportTop: number;
    viewportBottom: number;
    viewportLeft?: number;
    viewportRight?: number;
    /** Current viewport rows map to PREVIOUS screen rows by this offset. */
    screenRowOffset?: number;
};
/**
 * A ScrollBox viewport-edges change with NO content scroll: chrome mounting
 * or unmounting around the box (the new-messages pill, the sticky prompt
 * header, the working spinner, prompt multi-line growth) moves the edges
 * while scrollTop stands still, so no FollowScroll fires. `delta` is
 * therefore always 0 — the type extends FollowScroll only so
 * pickFollowForSelection can attribute the change by the PREVIOUS bounds
 * (viewportTop/viewportBottom carry the old edges, exactly what
 * anchor-containment needs). Equal movement of both edges is a viewport
 * translation, not an edge resize: its rowDelta must move the selection
 * without capturing or popping scroll debt. ink.tsx consumes these alongside
 * followScrolls and dispatches the two geometries separately.
 */
export type ViewportResize = FollowScroll & {
    /** Geometry kind: chrome edge change or a same-height viewport move. */
    kind: 'edge-resize' | 'translate';
    /** Screen-row movement for a `translate`; 0 for an edge resize. */
    rowDelta: number;
    /** Viewport bounds BEFORE this frame's layout (= the frontFrame's). */
    prevTop: number;
    prevBottom: number;
    /** Viewport bounds AFTER this frame's layout. */
    top: number;
    bottom: number;
};
/**
 * Classify a viewport edge change without consulting scroll state. A valid
 * same-height range whose two edges move by the same non-zero amount is a
 * screen-space translation; every other change is an edge resize. Invalid
 * ranges deliberately stay on the resize path so its collapse guards can
 * clear or preserve selection safely.
 * @param prevTop - previous viewport top row.
 * @param prevBottom - previous viewport bottom row.
 * @param top - current viewport top row.
 * @param bottom - current viewport bottom row.
 * @returns the geometry kind for the viewport event.
 */
export declare function classifyViewportChange(prevTop: number, prevBottom: number, top: number, bottom: number): 'edge-resize' | 'translate';
/**
 * Read and clear this frame's viewport-resize events. At most one per
 * ScrollBox per frame; empty unless some box's edges moved.
 * @returns this frame's viewport-resize events; empty when none.
 */
export declare function consumeViewportResizes(): ViewportResize[];
/**
 * Read and clear the follow-scroll events recorded this frame. At most one
 * per ScrollBox (a box that follows AND drains reports only the follow —
 * the follow branch clears pendingScrollDelta before the drain runs);
 * several boxes may each report when they scroll in the same frame.
 * @returns this frame's follow-scroll events; empty when none.
 */
export declare function consumeFollowScroll(): FollowScroll[];
/**
 * Build a mapping from each character position in the plain text to its segment index.
 * Returns an array where charToSegment[i] is the segment index for character i.
 * @param segments - the styled segments whose characters to map.
 * @returns an array mapping each plain-text character index to its segment index.
 */
declare function buildCharToSegmentMap(segments: StyledSegment[]): number[];
/**
 * Apply styles to wrapped text by mapping each character back to its original segment.
 * This preserves per-segment styles even when text wraps across lines.
 * @param wrappedPlain - the wrapped plain text to style.
 * @param segments - the original styled segments.
 * @param charToSegment - character-to-segment index map for the original plain text.
 * @param originalPlain - the original unwrapped plain text.
 * @param trimEnabled - Whether whitespace trimming is enabled (wrap-trim mode).
 *   When true, we skip whitespace in the original that was trimmed from the output.
 *   When false (wrap mode), only separators marked 'gap' are skipped.
 * @param softWrap - per-line flags from wrapWithSoftWrap; a 'gap' line had its
 *   leading separator space elided, so that original character is skipped.
 * @returns the styled wrapped text.
 */
declare function applyStylesToWrappedText(wrappedPlain: string, segments: StyledSegment[], charToSegment: number[], originalPlain: string, trimEnabled?: boolean, softWrap?: SoftWrapFlag[]): string;
/**
 * Render a laid-out node subtree into the output buffer.
 * After yoga lays out the tree, each node is painted to the output object,
 * which later gets written to the terminal.
 * @param node - the DOM node to render.
 * @param output - the output buffer receiving paint operations.
 * @param options - render options: the child coordinate offset, the
 *   previous frame's screen for blitting, whether to skip the node's own
 *   blit, and the inherited background color.
 */
declare function renderNodeToOutput(node: DOMElement, output: Output, options: {
    offsetX?: number;
    offsetY?: number;
    prevScreen: Screen | undefined;
    skipSelfBlit?: boolean;
    inheritedBackgroundColor?: Color;
}): void;
export { buildCharToSegmentMap, applyStylesToWrappedText };
export default renderNodeToOutput;
//# sourceMappingURL=render-node-to-output.d.ts.map
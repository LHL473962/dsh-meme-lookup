import type { DOMElement } from './dom.js';
import type { DragEvent } from './events/drag-event.js';
/**
 * Find the deepest DOM element whose rendered rect contains (col, row).
 *
 * Uses the nodeCache populated by renderNodeToOutput — rects are in screen
 * coordinates with all offsets (including scrollTop translation) already
 * applied. Children are traversed in reverse so later siblings (painted on
 * top) win. Nodes not in nodeCache (not rendered this frame, or lacking a
 * yogaNode) are skipped along with their subtrees.
 *
 * Ancestor containment is NOT required: an unclipped node's children can
 * paint (and receive hits) outside the parent's rect — negative margins
 * (the PageMargin bleed row: the transcript gutter rail sits at the
 * terminal edge while its ancestors end at the content column) and plain
 * overflow. Pruning at such a node would leave the overflow region dead to
 * the mouse. Only clipped nodes (overflow hidden/scroll) confine their
 * subtree and prune. Each node still gates on its OWN rect, so the walk
 * stays cheap whenever the point falls inside a clipped subtree (the
 * transcript ScrollBox prunes everything below it).
 *
 * Returns the hit node even if it has no onClick — dispatchClick walks up
 * via parentNode to find handlers.
 * @param node - the subtree root to test.
 * @param col - the screen column to test.
 * @param row - the screen row to test.
 * @returns the deepest element whose rect contains (col, row), or null.
 */
export declare function hitTest(node: DOMElement, col: number, row: number): DOMElement | null;
/**
 * Number of hitTestWithOverlays calls since the last reset (or module load).
 * @returns the call count.
 */
export declare function getHitTestWithOverlaysCount(): number;
/** Reset the hitTestWithOverlays call counter (test instrumentation). */
export declare function resetHitTestWithOverlaysCount(): void;
/**
 * hitTest, but overlay-aware: absolute-positioned nodes can paint OUTSIDE
 * every ancestor's rect (OverlayAbove's `bottom:'100%'` pickers float over
 * the transcript), so the plain containment recursion never reaches them —
 * a click on the picker lands in the ScrollBox's rows instead. Check the
 * frame's absolute hit list FIRST, in reverse paint order (later = visually
 * on top), then fall back to the in-flow tree.
 * @param root - the tree root for the in-flow fallback.
 * @param col - the screen column to test.
 * @param row - the screen row to test.
 * @returns the deepest element at (col, row), or null.
 */
export declare function hitTestWithOverlays(root: DOMElement, col: number, row: number): DOMElement | null;
/**
 * Hit-test the root at (col, row) and bubble a ClickEvent from the deepest
 * containing node up through parentNode. Only nodes with an onClick handler
 * fire. Stops when a handler calls stopImmediatePropagation(). Returns
 * true if at least one onClick handler fired.
 *
 * Each handler call is isolated: a throwing handler is logged and the
 * bubbling continues, so one broken onClick cannot swallow the click from
 * its ancestors or the rest of the input batch.
 *
 * @param root - the tree root to hit-test.
 * @param col - the screen column of the click.
 * @param row - the screen row of the click.
 * @param cellIsBlank - whether the clicked cell is blank, reported on the event.
 * @param button - raw SGR release byte (carries shift/alt/ctrl modifier bits).
 * @returns true when at least one onClick handler fired.
 */
export declare function dispatchClick(root: DOMElement, col: number, row: number, cellIsBlank?: boolean, button?: number): boolean;
/**
 * Hit-test the root at (col, row) and bubble a ContextMenuEvent from the
 * deepest containing node up through parentNode. Only nodes with an
 * onContextMenu handler fire. Stops when a handler calls
 * stopImmediatePropagation(). Returns true if at least one onContextMenu
 * handler fired.
 *
 * Unlike dispatchClick this does NOT move focus: the menu is a press-time
 * affordance and the target's own handler decides whether focus follows.
 * Handler isolation matches dispatchClick — a throwing handler is logged
 * and the bubbling continues.
 *
 * @param root - the tree root to hit-test.
 * @param col - the screen column of the press.
 * @param row - the screen row of the press.
 * @param button - raw SGR press byte (low bits 2 = right button, carries
 *   shift/alt/ctrl modifier bits).
 * @returns true when at least one onContextMenu handler fired.
 */
export declare function dispatchContextMenu(root: DOMElement, col: number, row: number, button?: number): boolean;
/**
 * Find the drag target at (col, row): hit-test the root (overlay-aware,
 * like dispatchClick), then walk the ancestor chain from the deepest hit
 * node and return the FIRST node carrying an onDragStart handler. That
 * node is captured as the drag session target — subsequent dragmove/
 * dragend events bubble from it even when the pointer leaves its rect.
 *
 * @param root - the tree root to hit-test.
 * @param col - the screen column of the press.
 * @param row - the screen row of the press.
 * @returns the deepest node with an onDragStart handler, or null when no
 *   ancestor of the hit node is a drag target.
 */
export declare function findDragTarget(root: DOMElement, col: number, row: number): DOMElement | null;
/**
 * Bubble a drag event (dragstart/dragmove/dragend) from the captured
 * drag session target up through parentNode. The handler prop is looked
 * up per event type (onDragStart/onDragMove/onDragEnd). Stops when a
 * handler calls stopImmediatePropagation(). Handler isolation matches
 * dispatchClick — a throwing handler is logged and the bubbling
 * continues.
 *
 * Unlike dispatchClick the target comes from the drag session captured
 * at press time, NOT a fresh hit-test: like DOM element capture, the
 * drag source keeps receiving events for the whole gesture.
 *
 * @param target - the captured drag session target node.
 * @param event - the drag event to dispatch.
 */
export declare function dispatchDragEvent(target: DOMElement, event: DragEvent): void;
/**
 * Fire onMouseLeave on every tracked hover node, then empty the set.
 *
 * The pointer-state resets (alt-screen swap, terminal resize) drop the hover
 * set because the geometry it was computed against is gone. But the React
 * components behind those nodes still hold their `hovered=true` state: a bare
 * `set.clear()` never tells them the pointer "left", so every row crossed
 * before the reset keeps its highlight forever — the next motion event only
 * fires enter on the new row (the old nodes are no longer in the set, so no
 * diff ever produces their leave). Firing leave first is what makes the
 * reset invisible to the rows.
 *
 * @param hovered - the tracked hover set; emptied in place.
 * @param col - pointer column for the synthetic leave events (-1 = unknown).
 * @param row - pointer row for the synthetic leave events.
 */
export declare function clearHovered(hovered: Set<DOMElement>, col?: number, row?: number): void;
/**
 * Route a wheel event to the ScrollBox (or any onWheel handler) under the
 * pointer. Dispatches through the shared Dispatcher at continuous priority
 * so the event bubbles from the deepest hit node and React schedules any
 * state updates at the right lane.
 *
 * @param root - the tree root to hit-test.
 * @param col - the screen column of the wheel event.
 * @param row - the screen row of the wheel event.
 * @param deltaY - rows to scroll (positive = scroll down).
 * @param deltaX - columns to scroll (positive = right; informational).
 * @param button - raw SGR byte (carries modifier bits).
 * @returns true when an onWheel handler existed under the pointer.
 */
export declare function dispatchWheel(root: DOMElement, col: number, row: number, deltaY: number, deltaX?: number, button?: number): boolean;
/**
 * Install or clear the hover-interest probe.
 * @param probe - the interest predicate, or null to clear it.
 */
export declare function setHoverInterestProbe(probe: ((node: DOMElement) => boolean) | null): void;
/**
 * Drop the cached no-interest rect. Call at every render commit and at the
 * start of every render pass (see the cache doc above); also call from
 * pointer-state resets. Idempotent and effectively free.
 */
export declare function invalidateNoInterestRect(): void;
/**
 * Fire onMouseEnter/onMouseLeave as the pointer moves. Like DOM
 * mouseenter/mouseleave: does NOT bubble — moving between children does
 * not re-fire on the parent. Walks up from the hit node collecting every
 * ancestor with a hover handler; diffs against the previous hovered set;
 * fires leave on the nodes exited, enter on the nodes entered.
 *
 * Handlers receive a PointerEvent ('hover') with the pointer position;
 * existing `() => void` handlers simply ignore the argument. Each call is
 * isolated so one throwing handler cannot break the rest of the diff.
 *
 * Mutates `hovered` in place so the caller (App instance) can hold it
 * across calls. Clears the set when the hit is null (cursor moved into a
 * non-rendered gap or off the root rect).
 * @param root - the tree root to hit-test.
 * @param col - the screen column of the pointer.
 * @param row - the screen row of the pointer.
 * @param hovered - the previously hovered element set; updated in place.
 */
export declare function dispatchHover(root: DOMElement, col: number, row: number, hovered: Set<DOMElement>): void;
//# sourceMappingURL=hit-test.d.ts.map
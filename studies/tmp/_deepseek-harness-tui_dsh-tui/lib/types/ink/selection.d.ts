/**
 * Text selection state for fullscreen mode.
 *
 * Tracks a linear selection in screen-buffer coordinates (0-indexed col/row).
 * Selection is line-based: cells from (startCol, startRow) through
 * (endCol, endRow) inclusive, wrapping across line boundaries. This matches
 * terminal-native selection behavior (not rectangular/block).
 *
 * The selection is stored as ANCHOR (where the drag started) + FOCUS (where
 * the cursor is now). The rendered highlight normalizes to start ≤ end.
 */
import type { Screen, StylePool } from './screen.js';
import type { TerminalImagePlacement } from './terminal-image.js';
type Point = {
    col: number;
    row: number;
};
/**
 * One copy region a screen row touches: a rectangle whose cells are not
 * text (a formula drawn as a terminal image) together with the text it
 * stands for. The text is the formula's SOURCE (see Image.copyText) and is
 * inserted at `at`, a character offset into the row's own text.
 */
export type SelectionRegion = {
    readonly at: number;
    /** Stable id of the region (Screen.copyRegion). */
    readonly id: number;
    readonly text: string;
};
/**
 * Text extracted from one screen row plus the copy regions it touched.
 * Regions travel OUTSIDE `text` on purpose: a row's characters are model
 * output, so nothing in them may be re-read as metadata (an earlier design
 * serialized regions into the text and let ordinary content impersonate
 * them — see getSelectedText).
 */
export type SelectionRow = {
    readonly text: string;
    /** The row continues the previous one: the `\n` came from word-wrap, not
     *  from the source. Captured at extraction time because the screen's
     *  softWrap bitmap shifts with content. */
    readonly sw: boolean;
    /** Region insertions, ascending by `at`. */
    readonly regions: readonly SelectionRegion[];
};
/**
 * Selection state for fullscreen mode: the anchor/focus cell pair plus
 * the off-screen row accumulators captured during drag-to-scroll.
 */
export type SelectionState = {
    /** Where the mouse-down occurred. Null when no selection. */
    anchor: Point | null;
    /** Current drag position (updated on mouse-move while dragging). */
    focus: Point | null;
    /** True between mouse-down and mouse-up. */
    isDragging: boolean;
    /** Monotonic copy-on-select revision: advances on drag completion or
     *  keyboard extension, never on scroll/resize or duplicate releases. */
    settledRevision: number;
    /** For word/line mode: the initial word/line bounds from the first
     *  multi-click. Drag extends from this span to the word/line at the
     *  current mouse position so the original word/line stays selected
     *  even when dragging backward past it. Null ⇔ char mode. The kind
     *  tells extendSelection whether to snap to word or line boundaries. */
    anchorSpan: {
        lo: Point;
        hi: Point;
        kind: 'word' | 'line';
    } | null;
    /** Rows that scrolled out ABOVE the viewport during drag-to-scroll, as
     *  extracted rows (text + wrap bit + copy regions). The screen buffer
     *  only holds the current viewport, so without this accumulator,
     *  dragging down past the bottom edge loses the top of the selection
     *  once the anchor clamps. Prepended to the on-screen rows by
     *  getSelectedText. Reset on start/clear. Newest at the end. */
    scrolledOffAbove: SelectionRow[];
    /** Symmetric: rows scrolled out BELOW when dragging up. Appended;
     *  newest at the front. */
    scrolledOffBelow: SelectionRow[];
    /** Pre-clamp anchor row. Set when shiftSelection clamps anchor so a
     *  reverse scroll can restore the true position and pop accumulators.
     *  Without this, PgDn (clamps anchor) → PgUp leaves anchor at the wrong
     *  row AND scrolledOffAbove stale — highlight ≠ copy. Undefined when
     *  anchor is in-bounds (no clamp debt). Cleared on start/clear. */
    virtualAnchorRow?: number;
    /** Same for focus. */
    virtualFocusRow?: number;
    /** Viewport bounds recorded by the LAST in-drag follow shift. During an
     *  active drag a wheel that pushes both ends off the same edge CLAMPS
     *  instead of clearing (the gesture must survive); finishSelection then
     *  re-checks these bounds and drops the selection if it is still fully
     *  off-edge at commit time — the ghost-highlight guard is deferred, not
     *  removed. Undefined while no drag shift has run. */
    dragBounds?: {
        top: number;
        bottom: number;
    };
    /** True if the mouse-down that started this selection had the alt
     *  modifier set (SGR button bit 0x08). On macOS xterm.js this is a
     *  signal that VS Code's macOptionClickForcesSelection is OFF — if it
     *  were on, xterm.js would have consumed the event for native selection
     *  and we'd never receive it. Used by the footer to show the right hint. */
    lastPressHadAlt: boolean;
    /** Rolling fingerprint (hash) of the rows under the highlight. Ink's
     *  render loop refreshes it every frame; a change between frames
     *  WITHOUT a paired follow-shift means screen content was replaced in
     *  place under a stationary selection (a streaming transcript
     *  overwriting the rows the highlight covers), and a copy from these
     *  coordinates would read whatever text now sits there — not what the
     *  user highlighted. Null until the first frame observes the
     *  selection. */
    coveredFingerprint: number | null;
    /** The text `getSelectedText` emitted for `coveredFingerprint`'s frame.
     *  The fingerprint is a cheap per-frame pre-filter: it hashes the covered
     *  cells plus the two soft-wrap inputs that decide how those cells lay out,
     *  so it can move while the COPIED TEXT stays byte-identical (flipping the
     *  next row's wrap bit from 0 to a value past the selection's last column
     *  only toggles trailing-blank trimming, which is invisible when the
     *  selected columns are already full). Judging staleness on that hash alone
     *  refused legitimate copies — "content under the selection changed; copy
     *  cancelled" while a streaming tail wrote somewhere else entirely. The
     *  verdict therefore re-checks the emitted text, exactly the bytes the copy
     *  would ship, and only latches when THEY differ. Null until baselined. */
    coveredText: string | null;
    /** Geometry key (start/end row:col) the fingerprint was taken at. Any
     *  user-driven geometry change (drag motion, word/line extension,
     *  keyboard pan, multi-click) re-baselines instead of judging — the
     *  guard only ever indicts a STATIONARY highlight whose text was
     *  swapped underneath. Owned by refreshSelectionFingerprint. */
    coveredGeometry: string | null;
    /** Sticky once the covered rows changed without follow coordination.
     *  Commit-time copy (copySelectionNoClear) refuses and clears instead
     *  of shipping the replaced text. Cleared on start/clear. */
    stale: boolean;
    /** Direction-aware noSelect fence. True when THIS gesture anchored on a
     *  noSelect cell (e.g. a drag that starts inside the side-panel column):
     *  for that gesture only, noSelect cells participate in the highlight,
     *  word bounds, and copy text — panel text becomes selectable/copyable.
     *  Gestures anchored anywhere else keep the exclusion verbatim, so a
     *  chat-origin drag still never captures panel glyphs (design doc §4.6).
     *  Set once per gesture by startSelection from the anchor cell's bit;
     *  reset by clearSelection. */
    includeNoSelectCells: boolean;
    /** The column run of noSelect cells containing the anchor (same gesture
     *  class as includeNoSelectCells): the selection rectangle is clamped to
     *  it, so a panel-origin drag that moves vertically selects only the
     *  panel's columns on every covered row — the chat column on intermediate
     *  rows is never captured. Undefined for gestures without the fence. */
    fence?: {
        colStart: number;
        colEnd: number;
    };
    paneId?: string;
};
/**
 * Create a new selection state with no active selection.
 * @returns the empty selection state.
 */
export declare function createSelectionState(): SelectionState;
/**
 * Begin a new drag selection at (col, row): set the anchor, mark the
 * state as dragging, and clear every accumulator. Focus stays null until
 * the first drag motion, so a bare click never highlights a cell.
 * @param s - the selection state to mutate.
 * @param col - anchor column in screen-buffer coordinates.
 * @param row - anchor row in screen-buffer coordinates.
 * @param screen - the current frame's screen, when the caller has it: the
 * anchor cell's noSelect bit seeds includeNoSelectCells (the direction
 * fence — see SelectionState). Omitted by tests that drive the state
 * directly against a hand-built screen; the flag then stays false.
 */
export declare function startSelection(s: SelectionState, col: number, row: number, screen?: Screen): void;
/**
 * Track the drag position: update focus to (col, row). No-op while not
 * dragging, and the first motion at the anchor cell is ignored so a bare
 * click never becomes a one-cell selection.
 * @param s - the selection state to mutate.
 * @param col - current mouse column.
 * @param row - current mouse row.
 */
export declare function updateSelection(s: SelectionState, col: number, row: number): void;
/**
 * End a drag: clear the dragging flag while keeping anchor/focus so the
 * highlight stays visible and the text can be copied. Call
 * clearSelection to drop the selection on Esc or a clearing copy action.
 *
 * Deferred ghost guard: a drag that scrolled both ends fully off the same
 * viewport edge (wheeled away while the button was held) is dropped HERE,
 * at commit time, instead of during the drag — the in-flight gesture must
 * survive the wheel, but a committed selection left entirely off-screen
 * would linger as an invisible ghost (see shiftSelectionForFollow).
 * @param s - the selection state to mutate.
 */
export declare function finishSelection(s: SelectionState): void;
/**
 * Reset the selection to the empty state: no anchor, focus, span, or
 * scrolled-off accumulators.
 * @param s - the selection state to mutate.
 */
export declare function clearSelection(s: SelectionState): void;
/**
 * Select the word at (col, row) by scanning the screen buffer for the
 * bounds of the same-class character run. Mutates the selection in place.
 * No-op if the click is out of bounds or lands on a noSelect cell.
 * Sets isDragging=true and anchorSpan so a subsequent drag extends the
 * selection word-by-word (native macOS behavior).
 * @param s - the selection state to mutate.
 * @param screen - the screen buffer to scan for word bounds.
 * @param col - click column.
 * @param row - click row.
 */
export declare function selectWordAt(s: SelectionState, screen: Screen, col: number, row: number): void;
/**
 * Scan the screen buffer for a plain-text URL at (col, row). Mirrors the
 * terminal's native Cmd+Click URL detection, which fullscreen mode's mouse
 * tracking intercepts. Called from getHyperlinkAt as a fallback when the
 * cell has no OSC 8 hyperlink.
 * @param screen - the screen buffer to scan.
 * @param col - click column.
 * @param row - click row.
 * @returns the URL at the click position, or undefined when the cell is
 *   not part of a plain-text URL.
 */
export declare function findPlainTextUrlAt(screen: Screen, col: number, row: number): string | undefined;
/**
 * Select the entire row. Sets isDragging=true and anchorSpan so a
 * subsequent drag extends the selection line-by-line. The anchor/focus
 * span from col 0 to width-1; getSelectedText handles noSelect skipping
 * and trailing-whitespace trimming so the copied text is just the visible
 * line content.
 * @param s - the selection state to mutate.
 * @param screen - the screen buffer providing the row width.
 * @param row - the row to select.
 */
export declare function selectLineAt(s: SelectionState, screen: Screen, row: number): void;
/**
 * Extend a word/line-mode selection to the word/line at (col, row). The
 * anchor span (the original multi-clicked word/line) stays selected; the
 * selection grows from that span to the word/line at the current mouse
 * position. Word mode falls back to the raw cell when the mouse is over a
 * noSelect cell or out of bounds, so dragging into gutters still extends.
 * @param s - the selection state to mutate.
 * @param screen - the screen buffer to scan for word bounds.
 * @param col - current mouse column.
 * @param row - current mouse row.
 */
export declare function extendSelection(s: SelectionState, screen: Screen, col: number, row: number): void;
/** Semantic keyboard focus moves. See moveSelectionFocus in ink.tsx for
 *  how screen bounds + row-wrap are applied. */
export type FocusMove = 'left' | 'right' | 'up' | 'down' | 'lineStart' | 'lineEnd';
/**
 * Set focus to (col, row) for keyboard selection extension (shift+arrow).
 * Anchor stays fixed; selection grows or shrinks depending on where focus
 * moves relative to anchor. Drops to char mode (clears anchorSpan) —
 * native macOS does this too: shift+arrow after a double-click word-select
 * extends char-by-char from the word edge, not word-by-word. Scrolled-off
 * accumulators are preserved: keyboard-extending a drag-scrolled selection
 * keeps the off-screen rows. Caller supplies coords already clamped/wrapped.
 * @param s - the selection state to mutate.
 * @param col - focus column.
 * @param row - focus row.
 */
export declare function moveFocus(s: SelectionState, col: number, row: number): void;
/**
 * Shift anchor AND focus by dRow, clamped to [minRow, maxRow]. Used for
 * keyboard scroll (PgUp/PgDn/ctrl+u/d/b/f): the whole selection must track
 * the content, unlike drag-to-scroll where focus stays at the mouse. Any
 * point that hits a clamp bound gets its col reset to the full-width edge —
 * its original content scrolled off-screen and was captured by
 * captureScrolledRows, so the col constraint was already consumed. Keeping
 * it would truncate the NEW content now at that screen row. Clamp col is 0
 * for dRow<0 (scrolling down, top leaves, 'above' semantics) or width-1 for
 * dRow>0 (scrolling up, bottom leaves, 'below' semantics).
 *
 * If both ends overshoot the SAME viewport edge (select text → Home/End/g/G
 * jumps far enough that both are out of view), clear — otherwise both clamp
 * to the same corner cell and a ghost 1-cell highlight lingers, and
 * getSelectedText returns one unrelated char from that corner. Symmetric
 * with shiftSelectionForFollow's top-edge check, but bidirectional: keyboard
 * scroll can jump either way.
 * @param s - the selection state to mutate.
 * @param dRow - signed row offset to shift by.
 * @param minRow - lowest allowed row (viewport top).
 * @param maxRow - highest allowed row (viewport bottom).
 * @param width - screen width, used for the clamp-edge column.
 */
export declare function shiftSelection(s: SelectionState, dRow: number, minRow: number, maxRow: number, width: number): void;
/**
 * Shift the anchor row by dRow, clamped to [minRow, maxRow]. Used during
 * drag-to-scroll: when the ScrollBox scrolls by N rows, the content that
 * was under the anchor is now at a different viewport row, so the anchor
 * must follow it. Focus is left unchanged (it stays at the mouse position).
 * @param s - the selection state to mutate.
 * @param dRow - signed row offset to shift by.
 * @param minRow - lowest allowed row (viewport top).
 * @param maxRow - highest allowed row (viewport bottom).
 */
export declare function shiftAnchor(s: SelectionState, dRow: number, minRow: number, maxRow: number): void;
/**
 * Whether both ends of the selection are strictly past the SAME edge of
 * [minRow, maxRow] — the fully-off-screen condition. Rows are read through
 * the virtual (pre-clamp) trackers so a clamped-then-reversed scroll
 * evaluates at the TRUE position. Called by finishSelection's deferred
 * commit-time check (shiftSelectionForFollow keeps its own inline copy).
 */
export declare function selectionFullyOffEdge(s: SelectionState, minRow: number, maxRow: number): boolean;
/**
 * Shift the whole selection (anchor + focus + anchorSpan) by dRow, clamped
 * to [minRow, maxRow]. Used when sticky/auto-follow scrolls the ScrollBox
 * while a selection is active — native terminal behavior is for the
 * highlight to walk up the screen with the text (not stay at the same
 * screen position).
 *
 * Differs from shiftAnchor: during drag-to-scroll, focus tracks the live
 * mouse position and only anchor follows the text. During streaming-follow,
 * the selection is text-anchored at both ends — both must move. The
 * isDragging check in ink.tsx picks which shift to apply.
 *
 * If both ends would shift strictly BELOW minRow or strictly ABOVE maxRow
 * (unclamped), the selected text has scrolled entirely off the viewport —
 * off the top via streaming follow / wheel-down, off the bottom via
 * wheel-up. Clear it — otherwise a single inverted cell lingers at the
 * edge as a ghost (native terminals drop the selection when it leaves
 * scrollback). Landing AT the edge row is
 * still valid: that cell holds the correct text. Returns true if the
 * selection was cleared so the caller can notify React-land subscribers
 * (useHasSelection) — the caller is inside onRender so it can't use
 * notifySelectionChange (recursion), must fire listeners directly.
 *
 * `allowClear` is false for ACTIVE DRAGS: a wheel must never kill the
 * in-flight gesture, so both ends clamp to the edge instead; the clear is
 * deferred to finishSelection's commit-time check via the recorded
 * dragBounds. Released selections keep the immediate clear.
 * @param s - the selection state to mutate.
 * @param dRow - signed row offset to shift by.
 * @param minRow - lowest allowed row (viewport top).
 * @param maxRow - highest allowed row (viewport bottom).
 * @param allowClear - clear when both ends exit the same edge (default true).
 * @returns true when the selection was cleared because it scrolled
 *   entirely off the top, false otherwise.
 */
export declare function shiftSelectionForFollow(s: SelectionState, dRow: number, minRow: number, maxRow: number, allowClear?: boolean): boolean;
/**
 * Translate selection screen coordinates when a ScrollBox moves without
 * changing height. This is layout movement, not content scrolling: existing
 * off-screen row accumulators remain untouched and both viewport edges move
 * by the same amount. During a drag only the text anchor moves; after release
 * both endpoints move when both are owned by the old viewport.
 * @param s - the selection state to mutate.
 * @param rowDelta - signed screen-row movement from the old viewport to the new one.
 * @param oldTop - viewport top before the layout move.
 * @param oldBottom - viewport bottom before the layout move.
 * @param newTop - viewport top after the layout move.
 * @param newBottom - viewport bottom after the layout move.
 * @returns true when the selection was cleared because it left the viewport.
 */
export declare function shiftSelectionForViewportTranslation(s: SelectionState, rowDelta: number, oldTop: number, oldBottom: number, newTop: number, newBottom: number): boolean;
/**
 * Translate the selection for a SCROLLBOX VIEWPORT RESIZE: chrome mounting
 * or unmounting around a ScrollBox (the new-messages pill, the sticky
 * prompt header, the working spinner, prompt multi-line growth) moves the
 * viewport edges WITHOUT any scroll delta — no followScroll event fires, so
 * the follow path never runs and the endpoints keep pointing at stale screen
 * rows. The visible failure: the anchor strands BELOW the shrunken viewport
 * (exactly onto the pill text row when the pill mounts), pickFollowForSelection
 * then rejects every subsequent follow event (anchor outside the viewport),
 * wheel tracking silently dies, and copy-on-select spans whatever the
 * highlight happens to cover — including the chrome row itself ("↓ 回到底部"
 * leaking into bottom-to-top copies, and the rows that scrolled under the
 * dead highlight never reaching the scrolledOff accumulators).
 *
 * Each SHRINKING edge contributes a band of rows the chrome covered:
 *   - top band [oldTop, newTop-1] (chrome above — sticky prompt header)
 *   - bottom band [newBottom+1, oldBottom] (chrome below — pill/spinner)
 * captureScrolledRows preserves the band's text from the PREVIOUS frame's
 * screen (the caller passes frontFrame.screen — the swap hasn't happened)
 * before this frame's paint overwrites it with chrome cells. Growth edges
 * have no band to capture; the shift below just re-widens the clamp.
 *
 * shiftSelection(dRow=0) then re-derives the endpoints: clamps stragglers
 * into the new bounds (virtual-row tracked, so a later re-widening restores
 * the true position and pops the accumulator), pops captured rows whose
 * debt a re-widening returned to the viewport, and clears when BOTH ends
 * land under the same band (the whole selection is under chrome). Unlike
 * the follow path's shiftAnchor/shiftSelectionForFollow split, this uses
 * shiftSelection for BOTH drag and released states: with dRow=0 a live drag
 * focus stays at the mouse unless the chrome covered it too, and
 * shiftSelection is the only shift that pops debt on re-widening — the
 * follow path never re-widens, a resize does (pill unmount).
 *
 * Degenerate bounds are handled explicitly: a collapsed new viewport
 * (innerHeight 0 — chrome taller than the box) clears the selection, an
 * invalid old range is a no-op, and neither ever reaches clamp/shiftSelection
 * with min > max.
 * @param s - the selection state to mutate.
 * @param screen - the PREVIOUS frame's screen buffer providing the band
 *   text (and the width for clamp-edge columns).
 * @param oldTop - viewport top before this frame's layout.
 * @param oldBottom - viewport bottom before this frame's layout.
 * @param newTop - viewport top after this frame's layout.
 * @param newBottom - viewport bottom after this frame's layout.
 */
export declare function shiftSelectionForViewportResize(s: SelectionState, screen: Screen, oldTop: number, oldBottom: number, newTop: number, newBottom: number): void;
/** A scroll event reported by a ScrollBox this frame (follow or wheel
 *  drain): signed delta plus the box's viewport bounds. Structurally
 *  identical to FollowScroll in render-node-to-output. */
export type ScrollEvent = {
    delta: number;
    viewportTop: number;
    viewportBottom: number;
    viewportLeft?: number;
    viewportRight?: number;
    /** Current viewport rows map to PREVIOUS screen rows by this offset. */
    screenRowOffset?: number;
};
/**
 * Pick which scroll event a selection belongs to when several ScrollBoxes
 * scrolled in the same frame (e.g., the transcript still draining a wheel
 * burst while an overlay panel's box scrolls). The selection follows the
 * INNERMOST viewport containing the anchor: overlay panels render on top
 * of the transcript, so a selection inside the overlap rows belongs to
 * the panel, not the covered transcript beneath it. A selection outside
 * every viewport (footer/prompt, static text) follows nothing — scrolling
 * doesn't move the content under it.
 * @param events - this frame's scroll events (signed deltas).
 * @param anchorRow - the selection anchor's screen row, or null when no
 *   selection is active.
 * @returns the event the selection should be translated by, or null.
 */
export declare function pickFollowForSelection<T extends ScrollEvent>(events: T[], anchorRow: number | null, anchorCol?: number): T | null;
/**
 * True when a selection is active, meaning both anchor and focus are set.
 * @param s - the selection state to inspect.
 * @returns true when a selection is active.
 */
export declare function hasSelection(s: SelectionState): boolean;
/**
 * Normalized selection bounds: start is always before end in reading order.
 * Returns null if no active selection.
 * @param s - the selection state to inspect.
 * @returns the normalized start/end cells, or null when there is no
 *   active selection.
 */
export declare function selectionBounds(s: SelectionState): {
    start: {
        col: number;
        row: number;
    };
    end: {
        col: number;
        row: number;
    };
} | null;
/**
 * Check if a cell at (col, row) is within the current selection range.
 * Used by the renderer to apply inverse style.
 * @param s - the selection state to inspect.
 * @param col - cell column.
 * @param row - cell row.
 * @returns true when the cell lies inside the selection range.
 */
export declare function isCellSelected(s: SelectionState, col: number, row: number): boolean;
/** Re-anchor by logical offsets, not screen columns, when a pane reflows. */
export declare function refreshSelectionPane(s: SelectionState, screen: Screen, previous?: Screen): boolean;
/**
 * Rehash the rows under the highlight and latch `stale` when they changed
 * without a coordinated shift this frame.
 *
 * Copy reads whatever text occupies the highlight's screen coordinates at
 * commit time. When the transcript REPLACES those rows in place while the
 * highlight sits still (streaming output overwriting folded rows, a card
 * collapsing under the anchor), the copied text is whatever moved in —
 * visibly wrong text, not mojibake from a width bug. The follow/resize
 * shifts keep the highlight anchored to text that MOVES; this guard catches
 * the complementary case: stationary coordinates, moving content.
 *
 * Called once per rendered frame (post-render, pre-swap) on the frame the
 * copy would read. The hash covers every visible cell of every covered row
 * (same visibility rules as getSelectedText: noSelect and spacer cells
 * skipped) via the cell's TEXT — `charPool.get(charId)` — not its pool
 * index, plus the two soft-wrap inputs that decide how those cells are laid
 * out into lines (the row's own `softWrap[row]`, and the `softWrap[row + 1]`
 * extractRowText reads as this row's content end). styleId is excluded so
 * the selection overlay and syntax highlighting themselves cannot trip the
 * guard.
 *
 * Why content and not charId: a charId is an index into a generational
 * CharPool, not a stable identity. Ink.resetPools() (ink.tsx) swaps in a
 * fresh CharPool every ~5 minutes and re-interns the front frame through
 * migrateScreenPools, so the SAME glyph comes back under a different
 * number. Hashing ids would read that renumbering as "the covered rows
 * changed" and refuse a perfectly legitimate copy with the stale-content
 * notice — a false positive on a screen where nothing was replaced. The
 * pool lookup is an array index plus a 1-2 code-unit hash loop, measured
 * at ~0.05ms for a full 200x50 selection (~0.14ms at 200x200), i.e. no
 * worse than hashing the ids themselves.
 *
 * The hash is only a PRE-FILTER; the verdict is the copied text. Hashing the
 * wrap inputs keeps a cheap screen-signature, but those inputs can move while
 * the bytes a copy would ship stay identical: flipping the next row's wrap bit
 * from 0 to a value past the selection's last column only toggles
 * trailing-blank trimming, which is invisible when the selected columns are
 * already full (measured live: a streaming tail wrote a row far below the
 * highlight, the wrap bookkeeping moved, and the guard refused a legitimate
 * copy — the "content under the selection changed" toast with the highlight
 * still sitting on exactly the right text). So when the hash moves, this
 * compares `getSelectedText` against the baselined text and latches only when
 * THE BYTES differ — the same expression the copy itself ships, which makes
 * the verdict complete (no real replacement is missed) and sound (no
 * unchanged text is refused). The text is compared, not stored per frame: the
 * extraction runs on a geometry change (once per drag motion) and on a
 * suspected change, never on the steady-state frame.
 *
 * @param s - the selection state to fingerprint.
 * @param screen - the frame's screen buffer.
 * @param coordinated - true when this frame translated the selection
 *   endpoints (follow-shift or viewport resize); a fingerprint change in
 *   such a frame is the expected content scroll, not an overwrite.
 * @returns true when an uncoordinated change latched `stale` this call.
 */
export declare function refreshSelectionFingerprint(s: SelectionState, screen: Screen, coordinated: boolean): boolean;
/**
 * Extract text from the screen buffer within the selection range.
 * Rows are joined with newlines unless the screen's softWrap bitmap
 * marks a row as a word-wrap continuation — those rows are concatenated
 * onto the previous row so the copied text matches the logical source
 * line, not the visual wrapped layout. Trailing whitespace on the last
 * fragment of each logical line is trimmed. Wide-char spacer cells are
 * skipped. Rows that scrolled out of the viewport during drag-to-scroll
 * are joined back in from the scrolledOffAbove/Below accumulators along
 * with their captured softWrap bits.
 * @param s - the selection state to read.
 * @param screen - the screen buffer to extract from.
 * @returns the selected text, or an empty string when no selection is
 *   active.
 */
export declare function getSelectedText(s: SelectionState, screen: Screen): string;
/**
 * Capture text from rows about to scroll out of the viewport during
 * drag-to-scroll, BEFORE scrollBy overwrites them. Only the rows that
 * intersect the selection are captured, using the selection's col bounds
 * for the anchor-side boundary row. After capturing the anchor row, the
 * anchor.col AND anchorSpan cols are reset to the pane boundary so
 * subsequent captures and the final getSelectedText don't re-apply a stale
 * col constraint to content that's no longer under the original anchor.
 * Both span cols are reset (not just the near side): after a blocked
 * reversal the drag can flip direction, and extendSelection then reads the
 * OPPOSITE span side — which would otherwise still hold the original word
 * boundary and truncate one subsequently-captured row.
 *
 * side='above': rows scrolling out the top (dragging down, anchor=start).
 * side='below': rows scrolling out the bottom (dragging up, anchor=end).
 * @param s - the selection state to update.
 * @param screen - the screen buffer to read rows from.
 * @param firstRow - first viewport row that is about to scroll out.
 * @param lastRow - last viewport row that is about to scroll out.
 * @param side - which viewport edge the rows scroll out of.
 */
export declare function captureScrolledRows(s: SelectionState, screen: Screen, firstRow: number, lastRow: number, side: 'above' | 'below', screenRowOffset?: number): void;
/**
 * Resolve the focus-side edge of the visible selection. Blank rows and
 * padding cannot own a native cursor; step toward the anchor until selected
 * content is found. Wide glyphs use their head cell, as text copying does.
 */
export declare function getSelectionCursor(screen: Screen, selection: SelectionState): Point | null;
/**
 * Apply the selection overlay directly to the screen buffer by changing
 * the style of every cell in the selection range. Called after the
 * renderer produces the Frame but before the diff — the normal diffEach
 * then picks up the restyled cells as ordinary changes, so LogUpdate
 * stays a pure diff engine with no selection awareness.
 *
 * Uses a SOLID selection background (theme-provided via StylePool.
 * setSelectionBg) that REPLACES each cell's bg while PRESERVING its fg —
 * matches native terminal selection. Previously SGR-7 inverse (swapped
 * fg/bg per cell), which fragmented badly over syntax-highlighted text:
 * every distinct fg color became a different bg stripe.
 *
 * Uses StylePool caches so on drag the only work per cell is a Map
 * lookup + packed-int write.
 * @param screen - the screen buffer to restyle.
 * @param selection - the selection whose range to highlight.
 * @param stylePool - the style pool providing the selection background.
 */
export declare function applySelectionOverlay(screen: Screen, selection: SelectionState, stylePool: StylePool, images?: readonly TerminalImagePlacement[]): void;
export {};
//# sourceMappingURL=selection.d.ts.map
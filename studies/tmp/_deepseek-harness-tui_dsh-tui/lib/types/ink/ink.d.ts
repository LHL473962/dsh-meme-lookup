import { type ReactNode } from 'react';
import * as dom from './dom.js';
import type { DragEvent } from './events/drag-event.js';
import { FocusManager } from './focus.js';
import { type FrameEvent } from './frame.js';
import type { ParsedKey } from './parse-keypress.js';
import { type MatchPosition } from './render-to-screen.js';
import { type FocusMove, type SelectionState } from './selection.js';
import { type ShutdownInput } from './shutdown-input.js';
export type Options = {
    stdout: NodeJS.WriteStream;
    stdin: NodeJS.ReadStream;
    stderr: NodeJS.WriteStream;
    exitOnCtrlC: boolean;
    patchConsole: boolean;
    terminalImages?: boolean;
    drainStdin?: () => void;
    waitUntilExit?: () => Promise<void>;
    onFrame?: (event: FrameEvent) => void;
};
export default class Ink {
    private readonly options;
    readonly shutdownInput: ShutdownInput;
    private readonly log;
    private readonly terminal;
    private readonly kittyGraphicsManager;
    private readonly sixelGraphicsManager;
    private readonly sixelCursorHeal;
    private sixelCursorCheckSupported;
    private sixelGraphicsSupported;
    private kittyGraphicsSupported;
    private kittyGraphicsProbeStarted;
    private terminalImageRequests;
    private measuredImageCellSize;
    private readonly terminalImageListeners;
    private readonly terminalImages;
    private terminalCellMetricsInFlight;
    private terminalCellMetricsRefreshPending;
    private terminalQueryResumeTimer;
    private app;
    private scheduleRender;
    private isUnmounted;
    private isDetachedForShutdown;
    private shutdownCleanup;
    private isPaused;
    private rawModeRecoveryTimer;
    private readonly container;
    private rootNode;
    readonly focusManager: FocusManager;
    private renderer;
    private readonly stylePool;
    private charPool;
    private hyperlinkPool;
    private exitPromise?;
    private restoreConsole?;
    private restoreStderr?;
    private readonly unsubscribeTTYHandlers?;
    private terminalColumns;
    private terminalRows;
    private currentNode;
    private frontFrame;
    private backFrame;
    private lastPoolResetTime;
    private drainTimer;
    private renderGeneration;
    private pendingRenderGeneration;
    private lastYogaCounters;
    private altScreenParkPatch;
    readonly selection: SelectionState;
    private searchHighlightQuery;
    private searchPositions;
    private readonly selectionListeners;
    private readonly hoveredNodes;
    private altScreenActive;
    private altScreenMouseTracking;
    private mainScreenFrameState;
    private prevFrameContaminated;
    private needsSurfaceRepaint;
    private needsEraseBeforePaint;
    private cursorDeclaration;
    private displayCursor;
    private nativeCursorVisible;
    private cursorIdleTimer;
    private cursorIdleNode;
    private cursorIdleHidden;
    private readonly cursorStyleReset;
    private cursorStyleHandedOff;
    private handleStdinError;
    constructor(options: Options);
    private handleResume;
    private handleResize;
    resolveExitPromise: () => void;
    rejectExitPromise: (reason?: Error) => void;
    unsubscribeExit: () => void;
    /**
     * Pause Ink and hand the terminal over to an external TUI (e.g. git
     * commit editor). In non-fullscreen mode this enters the alt screen;
     * in fullscreen mode we're already in alt so we just clear it.
     * Call `exitAlternateScreen()` when done to restore Ink.
     */
    enterAlternateScreen(): void;
    /**
     * Resume Ink after an external TUI handoff with a full repaint.
     * In non-fullscreen mode this exits the alt screen back to main;
     * in fullscreen mode we re-enter alt and clear + repaint.
     *
     * The re-enter matters: terminal editors (vim, nano, less) write
     * smcup/rmcup (?1049h/?1049l), so even though we started in alt,
     * the editor's rmcup on exit drops us to main screen. Without
     * re-entering, the 2J below wipes the user's main-screen scrollback
     * and subsequent renders land in main — native terminal scroll
     * returns, fullscreen scroll is dead.
     */
    exitAlternateScreen(): void;
    /**
     * One-shot viewport re-anchor for the NEXT main-screen frame: repaint the
     * visible viewport in place instead of diffing. Exposed for callers that
     * know a layout flip just rewrote the whole frame (Ctrl+O transcript
     * toggle): the ordinary scroll-based diff pushes rows into terminal
     * scrollback on every expand and nothing removes them on collapse — rapid
     * toggles drift the virtual↔scrollback mapping until writes misland.
     * In-place repaint adds nothing to scrollback. No-op in alt-screen
     * (already CSI H-anchored every frame). ONLY sets the flag: the caller's
     * own state change (setExpanded) drives the render that consumes it —
     * forcing an extra render here would paint the OLD layout once more and
     * burn the flag before the real frame lands.
     */
    reanchorViewport(): void;
    /** Render synchronously and invalidate older trailing/drain callbacks. */
    private renderNow;
    /**
     * Drain scrolling at quarter-frame cadence while keeping queued output
     * bounded on slow terminals. React-driven updates retain their normal
     * throttle, so typing and streaming do not wait behind a scroll backlog.
     */
    private scheduleDrain;
    onRender(): void;
    private resetCursorIdle;
    private reassertOwnedRawMode;
    private startRawModeRecovery;
    private stopRawModeRecovery;
    pause(): void;
    resume(): void;
    /**
     * Reset frame buffers so the next render writes the full screen from scratch.
     * Call this before resume() when the terminal content has been corrupted by
     * an external process (e.g. tmux, shell, full-screen TUI).
     */
    repaint(): void;
    /**
     * Clear the physical terminal and force a full redraw.
     *
     * The traditional readline ctrl+l — clears the visible screen and
     * redraws the current content. Also the recovery path when the terminal
     * was cleared externally (macOS Cmd+K) and Ink's diff engine thinks
     * unchanged cells don't need repainting. Scrollback is preserved.
     */
    forceRedraw(): void;
    /**
     * Establish a genuinely fresh terminal page: clear both the visible screen
     * and native scrollback, reset frame correspondence, then redraw the current
     * React tree. This is intentionally stronger than Ctrl+L/forceRedraw(),
     * which preserves history; use it only at a destructive UI boundary such as
     * `/new`, where showing the previous conversation above the new session is
     * misleading.
     */
    clearScrollbackAndRedraw(): void;
    /**
     * Mark the previous frame as untrustworthy for blit, forcing the next
     * render to do a full-damage diff instead of the per-node fast path.
     *
     * Lighter than forceRedraw() — no screen clear, no extra write. Call
     * from a useLayoutEffect cleanup when unmounting a tall overlay: the
     * blit fast path can copy stale cells from the overlay frame into rows
     * the shrunken layout no longer reaches, leaving a ghost title/divider.
     * onRender resets the flag at frame end so it's one-shot.
     */
    invalidatePrevFrame(): void;
    /**
     * Called by the <AlternateScreen> component on mount/unmount.
     * Controls cursor.y clamping in the renderer and gates alt-screen-aware
     * behavior in SIGCONT/resize/unmount handlers. The first alt-screen frame
     * redraws from blank; exit restores the saved main frame for a physical-
     * screen-matched diff, with repaint as the resize fallback.
     */
    setAltScreenActive(active: boolean, mouseTracking?: boolean): void;
    get isAltScreenActive(): boolean;
    /**
     * Read-only source of truth for "this host may receive SGR mouse reports":
     * true only while <AlternateScreen mouseTracking> is in effect. App injects
     * it into KeyParseState.mouseReportingActive on every processInput
     * (ADR-0007 D2); the parser only reads it. Public so instances.get()
     * callers can access it, mirroring the selection field above.
     */
    get isAltScreenMouseTracking(): boolean;
    /**
     * Re-assert terminal modes after a gap (>5s stdin silence).
     * Catches tmux detach→attach, ssh reconnect, and laptop
     * sleep/wake — none of which send SIGCONT. The terminal may reset DEC
     * private modes on reconnect; this method restores them.
     *
     * Always re-asserts extended key reporting and mouse tracking. Mouse
     * tracking is idempotent (DEC private mode set-when-set is a no-op). The
     * Kitty keyboard protocol is NOT — CSI >1u is a stack push, so we pop
     * first to keep depth balanced (pop on empty stack is a no-op per spec,
     * so after a terminal reset this still restores depth 0→1). Without the
     * pop, each >5s idle gap adds a stack entry, and the single pop on exit
     * or suspend can't drain them — the shell is left in CSI u mode where
     * Ctrl+C/Ctrl+D leak as escape sequences. The alt-screen
     * re-entry (ERASE_SCREEN + frame reset) is NOT idempotent — it blanks the
     * screen — so it's opt-in via includeAltScreen. The stdin-gap caller fires
     * on ordinary >5s idle + keypress and must not erase. The independent
     * raw-mode timer restores termios only, without re-entering alt. tmux attach / ssh
     * reconnect typically send a resize, which already covers alt-screen via
     * handleResize.
     */
    reassertTerminalModes: (includeAltScreen?: boolean) => void;
    /**
     * Release React effects while leaving terminal mode cleanup to finishExit.
     * Suppress Ink.writeRaw and later unmount() calls so AlternateScreen cleanup
     * cannot close the handoff buffer or clobber a resume hint. App's direct
     * SHOW_CURSOR write still runs during React cleanup. The old process may
     * wait on an updater or replacement, so its UI timers must stop before the
     * Channel lifetime ends.
     */
    detachForShutdown(): void | Promise<void>;
    /**
     * Fully detach stdin before handing the terminal to a child process that
     * inherits it (the /update restart). After `detachForShutdown()` releases
     * the renderer's stdin ownership, remove any remaining readers and pause
     * the stream. A parent that lingers waiting on the child must not keep a
     * libuv read pending on the console and race it for every keypress: the
     * restarted TUI sees dropped or entirely swallowed input (issues #284/#307). Remove
     * the listeners and pause the pump so the child is the sole reader.
     */
    detachStdinForHandoff(): void;
    /** @see drainStdin */
    drainStdin(): void;
    /**
     * Self-heal after a terminal-side mode reset. Windows conpty drops DEC
     * private modes on DPI changes, window moves between monitors and renderer
     * restarts — the user sees the app "exit fullscreen" with a dead mouse
     * while altScreenActive still claims we are in alt. Two layers:
     *
     * 1. Blind, idempotent mouse-tracking re-assert (covers the mode reset
     *    without a round trip; ~30 bytes).
     * 2. DECRQM probe of mode 1049. Re-entry (destructive: ERASE) happens
     *    ONLY on a positive "reset" answer, so iTerm2's
     *    enter-clears-when-already-in-alt quirk can never fire on a healthy
     *    screen, and terminals that ignore DECRQM stay inert.
     *
     * Called from every interaction dispatch (click/hover/wheel/key) plus the
     * focus/resize/stdin-gap triggers. The 250ms throttle keeps the round
     * trip bounded while active use is going on — a dropped 1049 heals on
     * the FIRST interaction after the drop instead of waiting for a focus
     * event or a >5s idle gap (mouse motion keeps lastStdinTime fresh, so
     * the gap path never fires during active use — the exact pattern that
     * left the app broken until the user gave up).
     */
    private lastHealthProbeAt;
    /**
     * True while a mouse button is held (press seen, no release/reset yet).
     * Set by App via setPointerGestureActive. The health probe must not write
     * while a gesture is in flight: the blind ENABLE_MOUSE_TRACKING re-assert
     * mid-drag resets button tracking on some emulators (WezTerm, xterm.js
     * family), silently killing the gesture's motion stream, and a DECRQM
     * "1049 reset" reply resolving mid-drag would erase the screen under the
     * user's pointer.
     */
    private pointerGestureActive;
    /**
     * Protocol-candidate latch: an SGR mouse prefix is in flight (parser hold
     * or tokenizer incomplete buffer). Cleared by App on any complete event
     * (mouse or key), ordinary text, paste/response boundary, or the 1s hold
     * deadline. Distinct from pointerGestureActive: a split wheel report
     * resolves to a ParsedKey (no physical button), and a stale candidate
     * must not leave the probe permanently blocked.
     */
    private protocolCandidateActive;
    /**
     * Set when a DECRPM reply confirmed "1049 reset" while a gesture was
     * latched. The re-entry (ENTER_ALT_SCREEN + ERASE_SCREEN + mouse
     * re-assert) is destructive mid-drag — it erases the screen under the
     * user's pointer and resets button tracking — so it is deferred to the
     * gesture's end and drained by setPointerGestureActive(false).
     */
    private pendingAltScreenReentry;
    /**
     * Set when probeAltScreenHealth was blocked by an active gesture. The
     * probe is retried at the release tail (drainAltScreenReentry) with the
     * original caller's skipMouseReassert semantics.
     */
    private pendingProbeRequest;
    setPointerGestureActive: (active: boolean) => void;
    setProtocolCandidateActive: (active: boolean) => void;
    /**
     * Execute a deferred alt-screen re-entry, if one was confirmed while a
     * gesture was latched. Called by App after the release tail completes.
     * Only clears the pending flag when the re-entry actually runs — a pause
     * or alt-screen exit during the gesture keeps the recovery signal alive
     * for the next safe boundary (resume, focus, or a later release).
     */
    drainAltScreenReentry: () => void;
    /**
     * Retry a health probe that was blocked by an active gesture. Called by
     * App after the release tail completes, with the original caller's
     * skipMouseReassert semantics preserved. The request is cleared ONLY
     * after the probe actually writes — a throttle hit keeps it pending and
     * schedules a retry once the 250ms window expires.
     */
    drainPendingProbe: () => void;
    /**
     * Combined drain for the release tail: re-entry first (destructive),
     * then the blocked probe retry (may discover a new 1049 loss and
     * schedule the NEXT re-entry).
     */
    drainReleaseTail: () => void;
    probeAltScreenHealth: (options?: {
        skipMouseReassert?: boolean;
    }) => void;
    /** Refocus = first observable moment after a conpty-side mode reset. */
    handleTerminalFocusProbe: (focused: boolean) => void;
    private notifyTerminalImagesChange;
    /** Probe on image demand, before lazy consumers need to decode a source. */
    private maybeProbeKittyGraphics;
    /** Refresh image pixel geometry after a resize, coalescing resize bursts. */
    private refreshTerminalCellMetrics;
    /** Reopen terminal queries only after late handoff replies are quarantined. */
    private resumeTerminalQueriesAfterHandoff;
    private get terminalQueriesSuspended();
    /**
     * Re-enter alt-screen, clear, home, re-enable mouse tracking, and reset
     * frame buffers so the next render repaints from scratch. Self-heal for
     * SIGCONT, resize, and stdin-gap/event-loop-stall (sleep/wake) — any of
     * which can leave the terminal in main-screen mode while altScreenActive
     * stays true. ENTER_ALT_SCREEN is a terminal-side no-op if already in alt.
     */
    private reenterAltScreen;
    /**
     * Seed prev/back frames with full-size BLANK screens (rows×cols of empty
     * cells, not 0×0). In alt-screen mode, next.screen.height is always
     * terminalRows; if prev.screen.height is 0 (emptyFrame's default),
     * log-update sees heightDelta > 0 ('growing') and calls renderFrameSlice,
     * whose trailing per-row CR+LF at the last row scrolls the alt screen,
     * permanently desyncing the virtual and physical cursors by 1 row.
     *
     * With a rows×cols blank prev, heightDelta === 0 → standard diffEach
     * → moveCursorTo (CSI cursorMove, no LF, no scroll).
     *
     * viewport.height = rows + 1 matches the renderer's alt-screen output,
     * preventing a spurious resize trigger on the first frame. cursor.y = 0
     * matches the physical cursor after ENTER_ALT_SCREEN + CSI H (home).
     */
    private resetFramesForAltScreen;
    /**
     * Copy the current selection to the clipboard without clearing the
     * highlight. Matches iTerm2's copy-on-select behavior where the selected
     * region stays visible after the automatic copy.
     */
    copySelectionNoClear(): string;
    /**
     * Copy the current text selection to the system clipboard via OSC 52
     * and clear the selection. Returns the copied text (empty if no selection).
     */
    copySelection(): string;
    /** Cancel an active drag or clear the current text selection without copying. */
    clearTextSelection(): void;
    /**
     * Set the search highlight query. Non-empty → all visible occurrences
     * are inverted (SGR 7) on the next frame; first one also underlined.
     * Empty → clears (prevFrameContaminated handles the frame after). Same
     * damage-tracking machinery as selection — setCellStyleId doesn't track
     * damage, so the overlay forces full-frame damage while active.
     */
    setSearchHighlight(query: string): void;
    /** Paint an EXISTING DOM subtree to a fresh Screen at its natural
     *  height, scan for query. Returns positions relative to the element's
     *  bounding box (row 0 = element top).
     *
     *  The element comes from the MAIN tree — built with all real
     *  providers, yoga already computed. We paint it to a fresh buffer
     *  with offsets so it lands at (0,0). Same paint path as the main
     *  render. Zero drift. No second React root, no context bridge.
     *
     *  ~1-2ms (paint only, no reconcile — the DOM is already built). */
    scanElementSubtree(el: dom.DOMElement): MatchPosition[];
    /** Set the position-based highlight state. Every frame, writes CURRENT
     *  style at positions[currentIdx] + rowOffset. null clears. The scan-
     *  highlight (inverse on all matches) still runs — this overlays yellow
     *  on top. rowOffset changes as the user scrolls (= message's current
     *  screen-top); positions stay stable (message-relative). */
    setSearchPositions(state: {
        positions: MatchPosition[];
        rowOffset: number;
        currentIdx: number;
    } | null): void;
    /**
     * Set the selection highlight background color. Replaces the per-cell
     * SGR-7 inverse with a solid theme-aware bg (matches native terminal
     * selection). Accepts the same color formats as Text backgroundColor
     * (rgb(), ansi:name, #hex, ansi256()) — colorize() routes through
     * chalk so the tmux/xterm.js level clamps in colorize.ts apply and
     * the emitted SGR is correct for the current terminal.
     *
     * Called by React-land once theme is known (ScrollKeybindingHandler's
     * useEffect watching useTheme). Before that call, withSelectionBg
     * falls back to withInverse so selection still renders on the first
     * frame; the effect fires before any mouse input so the fallback is
     * unobservable in practice.
     */
    /**
     * The colour a backdrop shade (`<Box backdrop="dim">`) fades explicit
     * colours toward — the terminal background from OSC 11, or black/white
     * by theme lightness when unknown. See StylePool.setShadeTarget.
     */
    setShadeTarget(rgb: {
        r: number;
        g: number;
        b: number;
    } | null): void;
    setSelectionBgColor(color: string): void;
    /**
     * Capture text from rows about to scroll out of the viewport during
     * drag-to-scroll. Must be called BEFORE the ScrollBox scrolls so the
     * screen buffer still holds the outgoing content. Accumulated into
     * the selection state and joined back in by getSelectedText.
     */
    captureScrolledRows(firstRow: number, lastRow: number, side: 'above' | 'below'): void;
    /**
     * Shift anchor AND focus by dRow, clamped to [minRow, maxRow]. Used by
     * keyboard scroll handlers (PgUp/PgDn etc.) so the highlight tracks the
     * content instead of disappearing. Unlike shiftAnchor (drag-to-scroll),
     * this moves BOTH endpoints — the user isn't holding the mouse at one
     * edge. Supplies screen.width for the col-reset-on-clamp boundary.
     */
    shiftSelectionForScroll(dRow: number, minRow: number, maxRow: number): void;
    /**
     * Keyboard selection extension (shift+arrow/home/end). Moves focus;
     * anchor stays fixed so the highlight grows or shrinks relative to it.
     * Left/right wrap across row boundaries — native macOS text-edit
     * behavior: shift+left at col 0 wraps to end of the previous row.
     * Up/down clamp at viewport edges (no scroll-to-extend yet). Drops to
     * char mode. No-op outside alt-screen or without an active selection.
     */
    moveSelectionFocus(move: FocusMove): void;
    /** Whether there is an active text selection. */
    hasTextSelection(): boolean;
    /**
     * Subscribe to selection state changes. Fires whenever the selection
     * is started, updated, cleared, or copied. Returns an unsubscribe fn.
     */
    subscribeToSelectionChange(cb: () => void): () => void;
    private notifySelectionChange;
    /**
     * Hit-test the rendered DOM tree at (col, row) and bubble a ClickEvent
     * from the deepest hit node up through ancestors with onClick handlers.
     * Returns true if a DOM handler consumed the click. Gated on
     * altScreenActive — clicks only make sense with a fixed viewport where
     * nodeCache rects map 1:1 to terminal cells (no scrollback offset).
     * The button byte is the raw SGR release code; its modifier bits land
     * on ClickEvent.shift/alt/ctrl.
     */
    /** Batch-tail probe for release-path clicks that deferred via deferProbe. */
    clickProbeAtBatchTail: () => void;
    dispatchClick(col: number, row: number, button?: number, deferProbe?: boolean): boolean;
    /**
     * Hit-test the rendered DOM tree at (col, row) and bubble a
     * ContextMenuEvent from the deepest hit node up through ancestors with
     * onContextMenu handlers. Returns true if a DOM handler consumed it.
     * Gated on altScreenActive like dispatchClick. The button byte is the
     * raw SGR press code; its low bits are 2 for the right button and the
     * modifier bits land on ContextMenuEvent.shift/alt/ctrl.
     */
    dispatchContextMenu(col: number, row: number, button?: number): boolean;
    /**
     * Route a wheel event to the ScrollBox (any onWheel handler) under the
     * pointer. Returns true when a handler consumed it, so App can skip the
     * legacy global wheel-key path and exactly one layer scrolls. Gated on
     * altScreenActive like dispatchClick — without mouse tracking there are
     * no wheel coordinates to route by.
     */
    dispatchWheelAt(col: number, row: number, deltaY: number, deltaX?: number, button?: number): boolean;
    dispatchHover(col: number, row: number): void;
    /**
     * Drag protocol entry: find the drag target at an unmodified left
     * press — the deepest node at (col, row) whose ancestor chain carries
     * an onDragStart handler. Gated on altScreenActive like dispatchClick
     * (drag needs mouse tracking + a fixed viewport). Returns null when no
     * drag target is under the pointer, in which case App keeps the
     * baseline selection/click path untouched.
     */
    findDragTargetAt(col: number, row: number): dom.DOMElement | null;
    /**
     * Dispatch a drag event to the drag session target captured at press
     * time (bubbles through its ancestors). Gated on altScreenActive like
     * dispatchClick.
     */
    dispatchDrag(target: dom.DOMElement, event: DragEvent): void;
    dispatchKeyboardEvent(parsedKey: ParsedKey): void;
    /**
     * Look up the URL at (col, row) in the current front frame. Checks for
     * an OSC 8 hyperlink first, then falls back to scanning the row for a
     * plain-text URL (mouse tracking intercepts the terminal's native
     * Cmd+Click URL detection, so we replicate it). This is a pure lookup
     * with no side effects — call it synchronously at click time so the
     * result reflects the screen the user actually clicked on, then defer
     * the browser-open action via a timer.
     */
    getHyperlinkAt(col: number, row: number): string | undefined;
    /**
     * Optional callback fired when clicking an OSC 8 hyperlink in fullscreen
     * mode. Set by FullscreenLayout via useLayoutEffect.
     */
    onHyperlinkClick: ((url: string) => void) | undefined;
    /**
     * Stable prototype wrapper for onHyperlinkClick. Passed to <App> as
     * onOpenHyperlink so the prop is a bound method (autoBind'd) that reads
     * the mutable field at call time — not the undefined-at-render value.
     */
    openHyperlink(url: string): void;
    /**
     * Handle a double- or triple-click at (col, row): select the word or
     * line under the cursor by reading the current screen buffer. Called on
     * PRESS (not release) so the highlight appears immediately and drag can
     * extend the selection word-by-word / line-by-line. Falls back to
     * char-mode startSelection if the click lands on a noSelect cell.
     */
    handleMultiClick(col: number, row: number, count: 2 | 3): void;
    /**
     * Begin a char-mode selection at (col, row), reading the anchor cell's
     * noSelect bit from the current frame so the gesture's direction fence is
     * seeded (SelectionState.includeNoSelectCells): a drag that starts inside
     * a noSelect region — the side-panel column — selects that region's own
     * text; a chat-origin drag keeps excluding panel glyphs (design §4.6).
     * Bound as the App prop onSelectionStart (replacing App's direct
     * startSelection calls, which had no screen to read the bit from).
     */
    handleSelectionStart(col: number, row: number): void;
    /**
     * Handle a drag-motion at (col, row). In char mode updates focus to the
     * exact cell. In word/line mode snaps to word/line boundaries so the
     * selection extends by word/line like native macOS. Gated on
     * altScreenActive for the same reason as dispatchClick.
     */
    handleSelectionDrag(col: number, row: number): void;
    private stdinListeners;
    private wasRawMode;
    suspendStdin(): void;
    resumeStdin(): void;
    private writeRaw;
    private setCursorDeclaration;
    private setAppRef;
    /**
     * Kitty placements report failures; an ENOENT means the terminal evicted a
     * dormant image under a quota smaller than our retention budget. Repaint so
     * the next reconcile uploads it again.
     */
    private handleUnsolicitedResponse;
    render(node: ReactNode): void;
    unmount(error?: Error | number | null): void;
    waitUntilExit(): Promise<void>;
    resetLineCount(): void;
    /**
     * Replace char/hyperlink pools with fresh instances to prevent unbounded
     * growth during long sessions. Migrates the front frame's screen IDs into
     * the new pools so diffing remains correct. The back frame doesn't need
     * migration — resetScreen zeros it before any reads.
     *
     * Call between conversation turns or periodically.
     */
    resetPools(): void;
    patchConsole(): () => void;
    /**
     * Intercept process.stderr.write so stray writes (config.ts, hooks.ts,
     * third-party deps) don't corrupt the alt-screen buffer. patchConsole only
     * hooks console.* methods — direct stderr writes bypass it, land at the
     * parked cursor, scroll the alt-screen, and desync frontFrame from the
     * physical terminal. Next diff writes only changed-in-React cells at
     * absolute coords → interleaved garbage.
     *
     * Swallows the write (routes text to the debug log) and, in alt-screen,
     * forces a full-damage repaint as a defensive recovery. Not patching
     * process.stdout — Ink itself writes there.
     */
    private patchStderr;
}
/**
 * Discard pending stdin bytes so in-flight escape sequences (mouse tracking
 * reports, bracketed-paste markers) don't leak to the shell after exit.
 *
 * Two layers of trickiness:
 *
 * 1. setRawMode is termios, not fcntl — the stdin fd stays blocking, so
 *    readSync on it would hang forever. Node doesn't expose fcntl, so we
 *    open /dev/tty fresh with O_NONBLOCK (all fds to the controlling
 *    terminal share one line-discipline input queue).
 *
 * 2. By the time forceExit calls this, detachForShutdown has already put
 *    the TTY back in cooked (canonical) mode. Canonical mode line-buffers
 *    input until newline, so O_NONBLOCK reads return EAGAIN even when
 *    mouse bytes are sitting in the buffer. We briefly re-enter raw mode
 *    so reads return any available bytes, then restore cooked mode.
 *
 * Safe to call multiple times. Call as LATE as possible in the exit path:
 * DISABLE_MOUSE_TRACKING has terminal round-trip latency, so events can
 * arrive for a few ms after it's written.
 */
export declare function drainStdin(stdin?: NodeJS.ReadStream): void;
//# sourceMappingURL=ink.d.ts.map
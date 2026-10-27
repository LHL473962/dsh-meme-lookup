import React, { PureComponent, type ReactNode } from "react";
import { EventEmitter } from "../events/emitter.js";
import { DragEvent } from "../events/drag-event.js";
import type { DOMElement } from "../dom.js";
import { type KeyParseState, type ParsedKey, type ParsedMouse } from "../parse-keypress.js";
import { type SelectionState } from "../selection.js";
import { TerminalQuerier } from "../terminal-querier.js";
import { type CursorDeclarationSetter } from "./CursorDeclarationContext.js";
type Props = {
    readonly children: ReactNode;
    readonly stdin: NodeJS.ReadStream;
    readonly ownsStdin?: () => boolean;
    readonly stdout: NodeJS.WriteStream;
    readonly stderr: NodeJS.WriteStream;
    readonly exitOnCtrlC: boolean;
    readonly onExit: (error?: Error) => void;
    readonly terminalColumns: number;
    readonly terminalRows: number;
    readonly selection: SelectionState;
    readonly onSelectionChange: () => void;
    readonly onClickAt: (col: number, row: number, button?: number, deferProbe?: boolean) => boolean;
    readonly onContextMenuAt: (col: number, row: number, button?: number) => boolean;
    readonly onHoverAt: (col: number, row: number) => void;
    readonly onWheelAt: (col: number, row: number, deltaY: number, deltaX: number, button?: number) => boolean;
    readonly getHyperlinkAt: (col: number, row: number) => string | undefined;
    readonly onOpenHyperlink: (url: string) => void;
    readonly onMultiClick: (col: number, row: number, count: 2 | 3) => void;
    readonly onSelectionStart: (col: number, row: number) => void;
    readonly onSelectionDrag: (col: number, row: number) => void;
    readonly onDragTargetAt?: (col: number, row: number) => DOMElement | null;
    readonly onDragDispatch?: (target: DOMElement, event: DragEvent) => void;
    readonly onPointerGestureChange?: (active: boolean) => void;
    readonly onProtocolCandidateChange?: (active: boolean) => void;
    readonly onReleaseTail?: () => void;
    readonly onClickProbe?: () => void;
    readonly onStdinResume?: () => void;
    readonly onTerminalFocus?: (focused: boolean) => void;
    readonly onCursorDeclaration?: CursorDeclarationSetter;
    readonly dispatchKeyboardEvent: (parsedKey: ParsedKey) => void;
};
type State = {
    readonly error?: Error;
};
export default class App extends PureComponent<Props, State> {
    static displayName: string;
    static getDerivedStateFromError(error: Error): {
        error: Error;
    };
    state: {
        error: undefined;
    };
    rawModeEnabledCount: number;
    shutdownDetached: boolean;
    internal_eventEmitter: EventEmitter;
    keyParseState: KeyParseState;
    incompleteEscapeTimer: NodeJS.Timeout | null;
    xtversionProbe: NodeJS.Immediate | null;
    xtversionAttempted: boolean;
    readonly NORMAL_TIMEOUT = 50;
    readonly PASTE_TIMEOUT = 500;
    querier: TerminalQuerier;
    lastClickTime: number;
    lastClickCol: number;
    lastClickRow: number;
    clickCount: number;
    pendingHyperlinkTimer: ReturnType<typeof setTimeout> | null;
    /**
     * Bitmask of currently held mouse buttons (bit 0 = left, 1 = middle,
     * 2 = right). Updated in the transport layer of handleMouseEvent BEFORE
     * the click-disabled gate, so DSH_TUI_DISABLE_MOUSE=1 still maintains
     * the physical latch. X10's generic release (low bits 3) cannot identify
     * which button ended and conservatively clears the entire set — a
     * no-button motion or focus-out is the reliable termination signal.
     */
    heldButtons: number;
    /**
     * Set when an X10 generic release (low bits 3) arrived with buttons still
     * potentially held — the release carries no button identity, so the probe
     * stays blocked until a reliable termination signal (no-button motion,
     * focus-out, or a fresh press identifying the still-held button).
     */
    ambiguousHeld: boolean;
    /**
     * Set when a release, focus-out, or no-button motion cleared the gesture
     * latch during the current batch. processKeysInBatch drains the deferred
     * alt-screen re-entry / blocked probe at the batch tail, not mid-batch —
     * a single stdin chunk can carry `release → next press`, and draining
     * between them would write probe bytes into the next gesture's opening
     * window.
     */
    pendingReleaseTail: boolean;
    /**
     * Set when FOCUS_IN arrived during the current batch. The focus probe
     * (handleTerminalFocusProbe) is deferred to the batch tail so a single
     * stdin chunk carrying FOCUS_IN + press doesn't write probe bytes before
     * the press latch is established.
     */
    pendingFocusProbe: boolean;
    /**
     * Set when a release-path click deferred its health probe (deferProbe).
     * The probe fires at the batch tail via onClickProbe.
     */
    pendingClickProbe: boolean;
    lastHoverCol: number;
    lastHoverRow: number;
    dragSession: {
        target: DOMElement;
        startCol: number;
        startRow: number;
        lastCol: number;
        lastRow: number;
        started: boolean;
    } | null;
    /**
     * End an in-flight drag session without a release event (focus lost,
     * screen swap, pointer-state reset): fire dragend at the last known
     * pointer position so consumers aren't left with an orphan session.
     * A session that never started (press without movement) ends silently.
     */
    finishDragSession(): void;
    /**
     * Reset all transient pointer state. Called by Ink when the alt screen
     * is entered/exited and on resize: rects, hover targets, and the click
     * chain from the previous screen geometry/scene must not leak into the
     * new one (stale hover sets would suppress the next real onMouseEnter;
     * a stale clickCount could turn the first click on a fresh screen into
     * a double-click).
     */
    resetPointerState(): void;
    lastStdinTime: number;
    private terminalSizeValue;
    private terminalSizeFor;
    writeRaw: (data: string) => void;
    isRawModeSupported(): boolean;
    render(): React.JSX.Element;
    componentDidMount(): void;
    componentWillUnmount(): void;
    /** Release timers and stdin ownership without requiring a React unmount. */
    detachForShutdown(): void;
    componentDidCatch(error: Error, errorInfo: {
        componentStack?: string;
    }): void;
    scheduleXtversionProbe: () => void;
    handleSetRawMode: (isEnabled: boolean) => void;
    flushIncomplete: () => void;
    processInput: (input: string | Buffer | null) => void;
    handleReadable: () => void;
    handleInput: (input: string | undefined) => void;
    handleExit: (error?: Error) => void;
    handleTerminalFocus: (isFocused: boolean) => void;
    /**
     * Re-assert owned raw mode after an external reset or SIGCONT. While the
     * job is stopped the shell owns the tty and leaves it in its own cooked
     * modes; the job is expected to restore its termios when it continues.
     * The readable listener survives the stop, so only the termios flag comes
     * back — deliberately not through handleSetRawMode, which would
     * double-count the raw-mode requests and re-add listeners.
     *
     * No `stdin.isRaw` guard: Node caches that flag as a plain property on the
     * stream, so it still reads `true` after the shell reset termios behind our
     * back. `setRawMode(true)` is an idempotent ioctl.
     */
    reassertRawMode: () => void;
}
/** Exported for testing. Mutates app.props.selection and click/hover state. */
export declare function handleMouseEvent(app: App, m: ParsedMouse): void;
export {};
//# sourceMappingURL=App.d.ts.map
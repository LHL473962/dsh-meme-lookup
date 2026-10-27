/**
 * Keyboard input parser - converts terminal input to key events
 *
 * Uses the termio tokenizer for escape sequence boundary detection,
 * then interprets sequences as keypresses.
 */
import { Buffer } from 'buffer';
import { type Tokenizer } from './termio/tokenize.js';
/** DECRPM status values (response to DECRQM) */
export declare const DECRPM_STATUS: {
    readonly NOT_RECOGNIZED: 0;
    readonly SET: 1;
    readonly RESET: 2;
    readonly PERMANENTLY_SET: 3;
    readonly PERMANENTLY_RESET: 4;
};
/**
 * A response sequence received from the terminal (not a keypress).
 * Emitted in answer to queries like DECRQM, DA1, OSC 11, etc.
 */
export type TerminalResponse = 
/** DECRPM: answer to DECRQM (request DEC private mode status) */
{
    type: 'decrpm';
    mode: number;
    status: number;
}
/** DA1: primary device attributes (used as a universal sentinel) */
 | {
    type: 'da1';
    params: number[];
}
/** DA2: secondary device attributes (terminal version info) */
 | {
    type: 'da2';
    params: number[];
}
/** Kitty keyboard protocol: current flags (answer to CSI ? u) */
 | {
    type: 'kittyKeyboard';
    flags: number;
}
/** Kitty graphics protocol response to an a=q capability query. */
 | {
    type: 'kittyGraphics';
    imageId: number;
    status: string;
}
/** DSR: cursor position report (answer to CSI 6 n) */
 | {
    type: 'cursorPosition';
    row: number;
    col: number;
    page?: number;
}
/** XTWINOPS: physical pixels for one cell or the terminal text area. */
 | {
    type: 'terminalPixelSize';
    scope: 'cell' | 'window';
    height: number;
    width: number;
}
/** OSC response: generic operating-system-command reply (e.g. OSC 11 bg color) */
 | {
    type: 'osc';
    code: number;
    data: string;
}
/** XTVERSION: terminal name/version string (answer to CSI > 0 q).
 *  Example values: "xterm.js(5.5.0)", "ghostty 1.2.0", "iTerm2 3.6". */
 | {
    type: 'xtversion';
    name: string;
};
/** Mutable cross-call state for the decomposed-paste matcher. */
export type Win32PasteState = {
    /** true between the decomposed start and end markers */
    active: boolean;
    /** progress into the marker pattern currently being matched */
    matched: number;
    /** keys held while a marker prefix match is in flight */
    held: ParsedKey[];
    /** collected paste content while active */
    buffer: string;
    /**
     * True when the last character appended to `buffer` came from a CR record
     * (Uc=13). Classic conhost spells a pasted CRLF break as a CR record
     * followed by an LF record (Uc=10); the LF half must fold into the CR's
     * newline instead of appending a second one (issue #1090).
     */
    lastWasCarriageReturn: boolean;
    /**
     * Payload offsets of the breaks this matcher opened with a Return/CR record
     * and has NOT closed with an LF record yet, in payload order. Only this lane
     * can say which `\n` bytes of the assembled payload are a break's CR HALF: a
     * half-leaked break may put its CR half in this lane (a translated Return,
     * whose newline lands in `buffer`) and its LF half in the payload TEXT as a
     * LEAKED record — and the characters of a leaked record are appended like
     * any other payload character, so they would erase the only trace of where
     * that `\n` came from ({@link appendWin32PasteChar}). The offsets travel to
     * the payload decoder through {@link createPasteKey}, which folds exactly
     * those newlines into the LF record that follows them (T08's X1d).
     */
    carriageReturnBreaks: number[];
};
export type Win32ProtocolState = {
    held: ParsedKey[];
    sequence: string;
};
/**
 * Parser state carried between parseMultipleKeypresses calls: paste mode,
 * buffered incomplete input, and the internal tokenizer instance.
 */
export type KeyParseState = {
    mode: 'NORMAL' | 'IN_PASTE';
    incomplete: string;
    pasteBuffer: string;
    /**
     * Host-injected platform gate: this machine MIGHT run the private win32
     * input mode (`supportsWin32InputMode()`). Read-only — capability alone is
     * not evidence and never lights anything by itself; only an explicit
     * `false` closes the gate, and leaving the field absent keeps the parser's
     * pre-gate behavior for direct callers.
     */
    win32Capable?: boolean;
    /**
     * Lit by successfully decoding a win32 record. Only behind that evidence
     * may a plain `ESC[` fragment extend the hold (see isRecordPrefix).
     */
    win32InputMode?: boolean;
    /** First capture of a buffered win32 record; never renewed by flushes. */
    win32InputStartedAt?: number;
    /** A flushed lone ESC may be followed by an ESC-less record fragment. */
    win32EscFlushedAt?: number;
    /**
     * Pending high surrogate from a win32-input-mode record. Uc is a UTF-16
     * code unit, so supplementary-plane characters (emoji, CJK ext-B) arrive
     * as two consecutive records; the high half waits here for its low half.
     */
    win32HighSurrogate?: number;
    /**
     * Pending high surrogate for the Alt+numpad synthesis path — separate
     * from win32HighSurrogate because the two Alt rounds of one supplementary
     * char interleave with keydown records (Alt-down, numpad digits) that
     * would settle the regular slot before the low half arrives.
     */
    win32AltHighSurrogate?: number;
    /**
     * Decomposed bracketed-paste tracking for win32-input-mode. Classic
     * conhost synthesizes pastes as per-char KEY_EVENT_RECORDs — including
     * the ESC[200~ / ESC[201~ markers themselves — so under W32IM the markers
     * arrive as ordinary key records and must be reassembled here (issue #147).
     */
    win32Paste?: Win32PasteState;
    /**
     * Terminal CSI bytes synthesized by classic conhost as one win32 input
     * record per character. Only Vk=0/Sc=0 records enter this matcher, keeping
     * physically typed text out of the protocol path.
     */
    win32Protocol?: Win32ProtocolState;
    /**
     * Pending prefix of an SGR mouse report that fragmented mid-sequence
     * (ConPTY split a report across reads and App's escape timer flushed the
     * buffered ESC prefix). Holds at most one incomplete `[<btn;col;row` tail;
     * the next chunk completes it (resynthesis) or it is invalidated — typed
     * `[`-led text never matches the guard pattern and passes through. A gated
     * hold (mouseTailHoldReleasable === true) is RELEASED as ordinary keys on
     * invalidation (ADR-0007 D5); a legacy hold keeps the pre-gate discard.
     * A hold never survives evidence that its report died: report bytes are
     * contiguous on the wire, so a fresh ESC sequence, a complete mouse
     * report, or text that cannot continue the pattern all invalidate it.
     */
    mouseTailHold?: string;
    /**
     * Date.now() of the FIRST capture of the current mouseTailHold. The hold
     * is discarded once this age exceeds MOUSE_TAIL_HOLD_GRACE_MS — checked at
     * the top of EVERY parse call, not only on flush: continuous input keeps
     * re-arming App's 50ms flush timer, so a flush-only check may never run
     * while the user types. Surviving a single quiet flush is not enough
     * either (the sentinel re-arms the timer, so the next quiet flush would
     * otherwise kill a slow split).
     */
    mouseTailHoldAt?: number;
    /**
     * Host-injected evidence (ADR-0007 D2): the terminal may emit SGR mouse
     * reports — `<AlternateScreen mouseTracking>` is in effect. App re-injects
     * it on every `processInput` from Ink's `altScreenMouseTracking`; the
     * parser only reads it. Absent keeps the pre-gate behavior for direct
     * callers, explicit `false` closes the gate (no shape is claimed).
     */
    mouseReportingActive?: boolean;
    /**
     * Date.now() of the most recent successfully decoded mouse report
     * (`kind:'mouse'`). The ambiguous `[`/`ESC[` head (ADR-0007 D4, evidence P2)
     * is only claimed while a real report is inside MOUSE_REPORT_ACTIVITY_MS.
     */
    lastMouseReportAt?: number;
    /**
     * True when the current `mouseTailHold` was claimed through the injected
     * mouseReportingActive gate: expiry/overflow RELEASES the held bytes as
     * ordinary keys (ADR-0007 D5). Untracked legacy shape-specific holds (direct
     * callers that never inject the gate) keep the pre-gate silent discard.
     */
    mouseTailHoldReleasable?: boolean;
    /**
     * Transport-level evidence for the ambiguous 2-byte `ESC[` head (ADR-0007
     * D4 addendum): `ESC[` when BOTH bytes were buffered inside ONE non-flush
     * read starting from an empty tokenizer buffer. Human two-stroke typing
     * (Esc, then `[`) cannot land in one read, so this is protocol-head shape
     * evidence that grants the P1 claim without P2; the head accumulated across
     * reads leaves this unset and still needs P2. Parser-internal only — App
     * never injects it. Consumed (and cleared) by the next parse call.
     */
    mouseHeadSingleRead?: string;
    /**
     * Date.now() of the most recent flush that emitted a lone Escape key from an
     * incomplete terminal sequence. Any text chunk inside the window may be that
     * sequence's delayed tail — the bound is time (TERMINAL_RESPONSE_TAIL_GRACE_MS),
     * not just the chunk that follows the flush.
     */
    terminalResponseTailAfterEscFlushAt?: number;
    /**
     * Date.now() of the FIRST capture of the reply prefix currently held open
     * across flushes (see TERMINAL_RESPONSE_TAIL_GRACE_MS). Later flushes and
     * continuations never renew it; the hold is released — bytes dropped — once
     * it expires or its in-flight claim disappears. Parser-maintained, like
     * mouseTailHoldAt; never host-injected.
     */
    terminalResponseHoldAt?: number;
    /**
     * Parser-maintained reply fragment held across calls after its introducer
     * ESC was already flushed as a standalone key (a ConPTY split that lands
     * mid-tail). The fragment has the synthesized ESC removed; the next text
     * chunk may complete it. It lives only inside the
     * terminalResponseTailAfterEscFlushAt window and is dropped — never
     * emitted as text — once that window closes, the evidence disappears or
     * the fragment stops being reply-shaped.
     */
    terminalResponseReattachTail?: string;
    /**
     * Host-injected, read-only in-flight evidence for terminal-query replies:
     * the response types of the queries still awaiting a reply
     * (querier.pendingResponseTypes). A reply is only claimed while one of
     * these types is both expected and shape-compatible with the bytes; an
     * absent or empty list means no evidence, so the parser never claims a
     * response tail and direct callers keep the pre-gate behavior. The host
     * re-injects it on every call, so a settled query stops counting at once.
     */
    terminalExpectedResponseTypes?: readonly TerminalResponse['type'][];
    _tokenizer?: Tokenizer;
};
/** Initial `KeyParseState` for a fresh parser. */
export declare const INITIAL_STATE: KeyParseState;
/**
 * Tokenize and parse a chunk of terminal input into parsed keys, mouse
 * events, and terminal responses, maintaining paste-mode state.
 * @param prevState - the state returned by the previous call, or INITIAL_STATE.
 * @param input - the input chunk; null applies the escape timeout (in-flight
 * win32 records keep their bounded recovery grace).
 * @returns the parsed inputs plus the state to pass to the next call.
 */
export declare function parseMultipleKeypresses(prevState: KeyParseState, input?: Buffer | string | null): [ParsedInput[], KeyParseState];
/**
 * Key names that never produce printable input (function keys, navigation,
 * modifiers, mouse), used to filter parsed keypresses.
 */
export declare const nonAlphanumericKeys: string[];
/**
 * A parsed user keypress or paste: the key name, modifier flags, the raw
 * escape sequence, and whether the input arrived via bracketed paste.
 */
export type ParsedKey = {
    kind: 'key';
    fn: boolean;
    name: string | undefined;
    ctrl: boolean;
    meta: boolean;
    shift: boolean;
    option: boolean;
    super: boolean;
    sequence: string | undefined;
    raw: string | undefined;
    code?: string;
    isPasted: boolean;
    /**
     * Pointer column (0-indexed) for wheel keys — SGR/X10 wheel sequences
     * carry the position the wheel event occurred at. Undefined for
     * non-wheel keys.
     */
    mouseCol?: number;
    /** Pointer row (0-indexed) for wheel keys. See mouseCol. */
    mouseRow?: number;
    /** Raw SGR/X10 button byte for wheel modifiers and direction. */
    mouseButton?: number;
};
/** A terminal response sequence (DECRPM, DA1, OSC reply, etc.) parsed
 *  out of the input stream. Not user input — consumers should dispatch
 *  to a response handler. */
export type ParsedResponse = {
    kind: 'response';
    /** Raw escape sequence bytes, for debugging/logging */
    sequence: string;
    response: TerminalResponse;
};
/** SGR mouse event with coordinates. Emitted for clicks, drags, and
 *  releases (wheel events remain ParsedKey). col/row are 1-indexed
 *  from the terminal sequence (CSI < btn;col;row M/m). */
export type ParsedMouse = {
    kind: 'mouse';
    /** Raw SGR button code. Low 2 bits = button (0=left,1=mid,2=right),
     *  bit 5 (0x20) = drag/motion, bit 6 (0x40) = wheel. */
    button: number;
    /** 'press' for M terminator, 'release' for m terminator */
    action: 'press' | 'release';
    /** 1-indexed column (from terminal) */
    col: number;
    /** 1-indexed row (from terminal) */
    row: number;
    sequence: string;
};
/** Everything that can come out of the input parser: a user keypress/paste,
 *  a mouse click/drag event, or a terminal response to a query we sent. */
export type ParsedInput = ParsedKey | ParsedMouse | ParsedResponse;
//# sourceMappingURL=parse-keypress.d.ts.map
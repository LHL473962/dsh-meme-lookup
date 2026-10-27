import type { Writable } from 'stream';
import type { Diff } from './frame.js';
import type { NotificationMethod } from './terminal-notification.js';
/**
 * Progress-report state for OSC 9;4: a state plus an optional percentage.
 */
export type Progress = {
    state: 'running' | 'completed' | 'error' | 'indeterminate';
    percentage?: number;
};
/**
 * Checks if the terminal supports OSC 9;4 progress reporting.
 * Supported terminals:
 * - ConEmu (Windows) - all versions
 * - Ghostty 1.2.0+
 * - iTerm2 3.6.6+
 *
 * Note: Windows Terminal interprets OSC 9;4 as notifications, not progress.
 * @returns true when the terminal supports OSC 9;4 progress reporting.
 */
export declare function isProgressReportingAvailable(): boolean;
/**
 * True when running inside a JetBrains IDE terminal (JediTerm). The IDE
 * injects `TERMINAL_EMULATOR=JetBrains-JediTerm` into the pty environment of
 * its local terminal sessions and sets no TERM_PROGRAM, so this is the only
 * reliable local-JediTerm marker; it is also not forwarded over SSH by
 * default (sshd only sends TERM), matching the local-terminal scope of the
 * behaviors it gates.
 *
 * JediTerm's emulation diverges from xterm.js in exactly the places the
 * renderer cares about (DEC 2026 support, DECSTBM semantics), so it is
 * detected explicitly rather than left to TERM/TERM_PROGRAM fallbacks.
 * @returns true when the process runs in a JetBrains IDE terminal.
 */
export declare function isJetBrainsIdeTerminal(): boolean;
/**
 * Detects zellij, which multiplexes the outer terminal instead of emulating
 * it. Capability probes therefore describe the *outer* terminal — zellij even
 * forwards KITTY_WINDOW_ID into the pane, so kitty detection matches — while
 * zellij's own grid decides how control sequences actually apply.
 * @returns true when the process runs inside a zellij pane.
 */
export declare function isZellij(): boolean;
/**
 * Whether DECSCUSR 0 restores the configured shape and blinking. XTerm and
 * older xterm.js instead select a blinking block, so keep their style intact.
 * Multiplexers interpret this sequence themselves; outer-terminal identity
 * is insufficient to opt them in.
 */
export declare function supportsCursorStyleReset(): boolean;
/**
 * Checks if the terminal supports DEC mode 2026 (synchronized output).
 * When supported, BSU/ESU sequences prevent visible flicker during redraws.
 * @returns true when the terminal supports DEC 2026.
 */
export declare function isSynchronizedOutputSupported(): boolean;
/**
 * Record the XTVERSION response. Called once from App.tsx when the reply
 * arrives on stdin. No-op if already set (defend against re-probe).
 * @param name - the terminal name reported by the XTVERSION reply.
 */
export declare function setXtversionName(name: string): void;
/** Notification protocol, using the existing SSH-capable terminal probe. */
export declare function getNotificationProtocol(): 'osc777' | 'osc99' | 'osc9' | 'bel';
/**
 * The transport a configured `notificationMethod` resolves to on `platform`.
 *
 * `auto` asks the platform: local Windows shows a native toast, every other platform
 * keeps whatever {@link getNotificationProtocol} probes for, so delivery there
 * is unchanged. An explicit `windows` is a platform capability rather than a
 * terminal sequence, so off Windows it falls back to that same probed protocol;
 * `osc9` and `bel` stay explicit overrides everywhere.
 *
 * `platform` is a parameter, like {@link supportsWin32InputMode}'s, so callers
 * and regressions can resolve for a host that is not this process.
 * @param method - the configured notification method.
 * @param platform - the host platform to resolve for.
 * @param env - SSH sessions keep notifying the attached terminal.
 * @returns the transport to deliver the notification through.
 */
export declare function resolveNotificationMethod(method: NotificationMethod, platform?: NodeJS.Platform, env?: NodeJS.ProcessEnv): 'windows' | 'osc777' | 'osc99' | 'osc9' | 'bel';
/**
 * True if running in an xterm.js-based terminal (VS Code, Cursor, Windsurf
 * integrated terminals). Combines TERM_PROGRAM env check (fast, sync, but
 * not forwarded over SSH) with the XTVERSION probe result (async, survives
 * SSH — query/reply goes through the pty). Early calls may miss the probe
 * reply — call lazily (e.g. in an event handler) if SSH detection matters.
 * @returns true when the terminal is xterm.js-based.
 */
export declare function isXtermJs(): boolean;
/**
 * True when the terminal can be safely probed with DECRQM
 * (`CSI ? <mode> $ p`).
 *
 * DECRQM carries a `$` intermediate byte before its final `p`. A conforming
 * parser consumes the whole sequence and either answers with DECRPM or stays
 * silent, so callers have historically treated an unanswered probe as
 * "unsupported" and sent it unconditionally. macOS Terminal.app breaks that
 * assumption: it does not implement DECRQM *and* its CSI parser gives up at
 * the `$`, printing the trailing `p` to the screen as literal text. Every
 * probe therefore leaks a visible `p` at the cursor.
 *
 * Terminal.app reports `TERM=xterm-256color`, so TERM sniffing cannot tell it
 * apart from a real xterm — `TERM_PROGRAM=Apple_Terminal` is the only marker.
 * It is not forwarded over SSH, which matches the scope of the bug: the leak
 * only happens when the sequence reaches Terminal.app's own parser, and a
 * remote session is parsed by whatever terminal is actually attached.
 *
 * Kept as an exclusion rather than an allowlist so unknown terminals keep the
 * (correct, spec-conforming) probe and only the known-broken one opts out.
 * Same failure mode as the extended-keys allowlist below: assuming terminals
 * silently ignore unknown CSI is not safe in practice.
 * @returns true when it is safe to send a DECRQM probe.
 */
export declare function supportsDecrqmProbe(): boolean;
/**
 * True if this terminal correctly handles extended key reporting
 * (Kitty keyboard protocol + xterm modifyOtherKeys).
 * WT_SESSION catches Windows Terminal regardless of TERM_PROGRAM (which WT
 * doesn't set and SSH doesn't forward) — its modifyOtherKeys implementation
 * covers navigation keys. It does NOT cover Enter (microsoft/terminal#530);
 * Shift+Enter on native Windows needs win32-input-mode instead — see
 * supportsWin32InputMode (issue #147).
 * @returns true when the terminal is on the extended-keys allowlist.
 */
export declare function supportsExtendedKeys(): boolean;
/**
 * True when win32-input-mode (DECSET 9001, `CSI ? 9001 h`) should drive
 * keyboard input. This is a ConPTY feature — both Windows Terminal and
 * classic conhost switch into it when the app emits the sequence. In this
 * mode every key arrives as a full INPUT_RECORD
 * (`CSI Vk;Sc;Uc;Kd;Cs;Rc _`), the only encoding that
 * preserves Enter's Shift/Ctrl bits on Windows (issue #147). It replaces
 * the kitty/modifyOtherKeys push — callers must treat them as mutually
 * exclusive. Non-ConPTY Windows terminals (mintty via winpty) ignore the
 * unknown private mode and fall back to classic VT input unchanged.
 *
 * Embedded xterm.js hosts may identify as `TERM_PROGRAM=vscode` while using
 * the xterm.js engine version as TERM_PROGRAM_VERSION (Termy 1.4.1 reports
 * 6.0.0). They do not provide native ConPTY's input-mode contract: enabling
 * 9001 can reduce arrows/mouse sequences to their trailing A-D/M bytes and
 * interfere with IME commits (issue #215). Native VS Code reports its own
 * 1.x application version and retains win32-input-mode support.
 * NVIM/VIM_TERMINAL identify nested VT hosts; the dedicated opt-out also
 * preserves classic input when an unrecognized embedding rejects mode 9001.
 * @param environment - optional capability environment, defaults to the process.
 * @returns true on supported native Windows hosts (never in WSL).
 */
export declare function supportsWin32InputMode(platform?: NodeJS.Platform, termProgram?: string | undefined, termProgramVersion?: string | undefined, environment?: NodeJS.ProcessEnv): boolean;
/**
 * True if the terminal scrolls the viewport when it receives cursor-up
 * sequences that reach above the visible area. On Windows, conhost's
 * SetConsoleCursorPosition follows the cursor into scrollback
 * (microsoft/terminal#14774), yanking users to the top of their buffer
 * mid-stream. WT_SESSION catches WSL-in-Windows-Terminal where platform
 * is linux but output still routes through conhost.
 * @returns true when the cursor-up viewport-yank bug applies.
 */
export declare function hasCursorUpViewportYankBug(): boolean;
/**
 * Whether synchronized output (DEC 2026) is available, computed once at
 * module load — terminal capabilities don't change mid-session. Exported
 * so callers can pass a sync-skip hint gated to specific modes.
 */
export declare const SYNC_OUTPUT_SUPPORTED: boolean;
/**
 * Whether the DECSTBM hardware-scroll optimization may be used to paint
 * ScrollBox scrolls. Called once per frame — the same env reads as the
 * SYNC_OUTPUT_SUPPORTED gate, so the extra cost is a single comparison.
 *
 * JediTerm is explicitly excluded even though it implements DEC 2026: its
 * scroll-region (DECSTBM) + CSI S/T handling deviates from xterm and, when
 * driven per-frame by a diffing renderer, corrupts the screen progressively
 * as content scrolls (the "JetBrains terminal slowly garbles" bug class).
 * The diff engine falls back to repainting the shifted rows cell-by-cell,
 * which every terminal renders identically. Disable DECSTBM on JetBrains terminals.
 *
 * zellij is excluded for the same class of reason. Its `CSI T`
 * (grid.rs rotate_scroll_region_up) shifts rows only while the cursor sits
 * inside the scroll region, and its `CSI r` does not home the cursor outside
 * origin mode — but the renderer parks the cursor on the last screen row,
 * below every ScrollBox. The shift is silently dropped while the diff assumes
 * it happened, so stale rows survive every scroll-up frame (tearing, leftover
 * transcript lines). Only DECSTBM is withdrawn: zellij does implement DEC
 * 2026, so BSU/ESU stay on and frames remain atomic.
 * @returns true when DECSTBM scroll optimization is safe on this terminal.
 */
export declare function isDecstbmSafe(): boolean;
/**
 * The output streams a terminal renders to.
 */
export type Terminal = {
    stdout: Writable;
    stderr: Writable;
};
/**
 * Write a frame diff to the terminal as a single buffered write. Wraps
 * the output in BSU/ESU synchronized-update markers unless skipSyncMarkers
 * is set. No-op when the diff contains no patches.
 * @param terminal - the terminal to write to.
 * @param diff - the frame diff patches to render.
 * @param skipSyncMarkers - when true, omit the BSU/ESU wrapping.
 */
/**
 * Serialize a frame diff into a single ANSI string (BSU/ESU-wrapped unless
 * skipSyncMarkers is set). Empty string when the diff has no patches.
 * Extracted from writeDiffToTerminal so shutdown paths can write the last
 * frame synchronously (issue #522: an async frame write racing the
 * synchronous EXIT_ALT_SCREEN lands on the MAIN screen after the alt
 * screen is gone, leaving misplaced residue).
 */
export declare function serializeDiff(terminal: Terminal, diff: Diff, skipSyncMarkers?: boolean): string;
/**
 * Write a frame diff to the terminal as a single buffered write. Wraps
 * the output in BSU/ESU synchronized-update markers unless skipSyncMarkers
 * is set. No-op when the diff contains no patches.
 * @param terminal - the terminal to write to.
 * @param diff - the frame diff patches to render.
 * @param skipSyncMarkers - when true, omit the BSU/ESU wrapping.
 */
export declare function writeDiffToTerminal(terminal: Terminal, diff: Diff, skipSyncMarkers?: boolean): void;
//# sourceMappingURL=terminal.d.ts.map
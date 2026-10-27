/**
 * OSC 7501 — Program Status Protocol
 *
 * A terminal escape sequence that lets a program tell the terminal what it is
 * doing: idle, working, blocked on the user, done, or failed. The terminal
 * owns presentation; the program only shares state.
 *
 * Spec: https://www.superlogical.com/rex/docs/build/program-status
 *
 * Wire format (the body is `:`-separated `key=value` pairs):
 *
 *   ESC ] 7501 ; state=working:app=dsh-tui:msg=<base64> ESC \
 *   ESC ] 7501 ; ?                                        ESC \   (detection)
 *
 * Every report REPLACES the addressed record, so a key that must survive has
 * to be repeated on every report. Terminals that do not know the sequence
 * ignore it, which is why reports are sent blind — no detection round trip.
 *
 * This module is pure encoding/parsing: no I/O, no React, no channel imports.
 * The value charset excludes `:` and `;`, so nothing needs escaping; free-text
 * values (`msg`, `title`) are base64 of single-line, control-free UTF-8.
 */
/** States a report may carry. `clear` removes records instead of setting one. */
export type ProgramState = 'idle' | 'working' | 'done' | 'blocked' | 'error' | 'clear';
/** What a `blocked` record is waiting for. */
export type ProgramBlockedKind = 'permission' | 'question' | 'auth';
/**
 * One OSC 7501 report. `app` is included by the encoder on every report
 * because each report replaces its record completely.
 */
export type ProgramStatusRecord = {
    state: ProgramState;
    /**
     * Record path such as `build/test`. Omitted addresses the root record,
     * which is what a single-program TUI uses.
     */
    id?: string;
    /** Stable machine-readable program id, e.g. `dsh-tui`. */
    app?: string;
    /** Only meaningful with `blocked`; ignored by the terminal otherwise. */
    kind?: ProgramBlockedKind;
    /** Only meaningful with `working`/`blocked`; 0-100, absent = indeterminate. */
    progress?: number;
    /** Short human-readable label (base64 on the wire). */
    title?: string;
    /** One human-readable line (base64 on the wire). */
    msg?: string;
};
/**
 * Collapse free text to the single control-free line the protocol requires.
 * Control characters (C0/C1, DEL) and line breaks would be rejected by a
 * conforming terminal and can smuggle sequence boundaries, so they are
 * dropped rather than escaped — there is no escape mechanism in the format.
 * Bidi overrides and isolates are also removed to keep untrusted labels
 * from changing the direction of surrounding status text.
 * @param text - untrusted text (session titles, tool commands, model output).
 * @returns the text with control characters and line breaks removed.
 */
export declare function sanitizeProgramText(text: string): string;
/**
 * Build one OSC 7501 report.
 *
 * Returns `''` when the record cannot be encoded legally (unknown state,
 * `kind`/`progress` on a state that forbids it, an `app`/`id` outside its
 * grammar, or a body past the sequence cap) — callers skip the write rather
 * than send a report the terminal would discard.
 *
 * The sequence is NOT wrapped for tmux/screen passthrough on purpose: a
 * passthrough report would reach the outer terminal, which cannot tell panes
 * apart and cannot see the program exit, breaking the protocol's record
 * lifetime. A multiplexer that implements OSC 7501 receives it directly.
 *
 * @param record - the report to encode.
 * @returns the complete sequence, or `''` when it cannot be encoded.
 */
export declare function programStatus(record: ProgramStatusRecord): string;
/**
 * Build a `clear` report. With an `id`, removes that record and every record
 * beneath it; without one, removes every record on the terminal.
 *
 * Note the protocol already drops `working`/`blocked` records when the process
 * exits or the next shell prompt begins, and deliberately keeps `done`/`error`
 * for the user to find — so a normal exit must NOT clear.
 * @param id - the record path to remove; omitted clears every record.
 * @returns the complete sequence, or `''` when the id is malformed.
 */
export declare function clearProgramStatus(id?: string): string;
/**
 * Whether to report program status.
 *
 * On by default: the protocol is a no-op on terminals that do not implement
 * it (unknown OSCs are ignored), so the only hard requirement is an
 * interactive stdout — a piped or redirected one has no terminal to report
 * to. `DSH_TUI_PROGRAM_STATUS` disables it with any falsy spelling
 * (`0`, `false`, `no`, `off`).
 *
 * @param stdoutIsTTY - whether stdout is an interactive terminal.
 * @param env - the environment to read the opt-out from.
 * @returns true when reports should be emitted.
 */
export declare function supportsProgramStatus(stdoutIsTTY?: boolean, env?: NodeJS.ProcessEnv): boolean;
//# sourceMappingURL=osc7501.d.ts.map
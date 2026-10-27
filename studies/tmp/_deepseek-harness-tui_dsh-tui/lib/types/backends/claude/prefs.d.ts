/** The permission modes the persisted choice may hold (the SDK's whole
 *  vocabulary). A stored `bypassPermissions` is never started in; the next
 *  start says so and clears it (options.ts, backend.ts). Anything else
 *  reads as no choice. */
export declare const CLAUDE_PERMISSION_MODES: readonly string[];
/** What persists. */
export interface ClaudePrefsData {
    readonly model?: string;
    readonly effort?: string;
    /** The remembered `/permission` pick a later session starts in. */
    readonly permissionMode?: string;
    /** The session a bare `dsh-tui --backend claude --resume` opens (the
     *  launcher reads this field directly; DSH's `resume.txt` never holds a
     *  Claude id). */
    readonly lastSession?: string;
    /** This install's last use of each session (epoch ms): the session
     *  browser's MRU note, like DSH's `last-used.json`. */
    readonly lastUsed?: Readonly<Record<string, number>>;
    /** The `/color` accent of each session (TUI-side: the CLI keeps none),
     *  with when it was set — the newest {@link COLOR_LIMIT} are kept. */
    readonly colors?: Readonly<Record<string, {
        readonly color: string;
        readonly at: number;
    }>>;
}
/** A patch: a value sets the field, `null` clears it. */
export interface ClaudePrefsPatch {
    readonly model?: string | null;
    readonly effort?: string | null;
    readonly permissionMode?: string | null;
    readonly lastSession?: string | null;
}
/** Read / patch access (injectable: tests use an in-memory store). */
export interface ClaudePrefs {
    read(): ClaudePrefsData;
    /** Patch fields; `null` clears one. */
    write(patch: ClaudePrefsPatch): void;
    /** Note that a session was just used (MRU). */
    touch(sessionId: string): void;
    /** Forget a deleted session (its MRU note and the launcher marker). */
    forget(sessionId: string): void;
    /** A session's accent ('' = none). */
    color(sessionId: string): string;
    /** Set (or with '' clear) a session's accent. */
    setColor(sessionId: string, color: string): void;
}
/** Session colours kept (the oldest set first is dropped). */
export declare const COLOR_LIMIT = 200;
/** The file-backed prefs under `<dir>` (the host's `dataDir` for this
 *  backend). The directory is required: a backend never picks a location of
 *  its own under the host's data directory (D2, B-3). */
export declare function fileClaudePrefs(dir: string, debug?: (message: string) => void): ClaudePrefs;
/** An in-memory store (tests, embedders without a home directory). */
export declare function memoryClaudePrefs(initial?: ClaudePrefsData): ClaudePrefs & {
    readonly data: ClaudePrefsData;
};
//# sourceMappingURL=prefs.d.ts.map
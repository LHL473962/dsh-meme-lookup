/**
 * Debug logger for the renderer. Writes to stderr only when
 * `DSH_TUI_DEBUG` is set, so normal runs stay quiet.
 * @param message - The message to log.
 * @param fields - Optional JSON-serialized fields appended to the line.
 */
export declare function logForDebugging(message: string, fields?: Record<string, unknown>): void;
/**
 * Mouse-chain diagnostics: appends to `~/.dsh-tui/mouse-debug.log` when
 * `DSH_TUI_DEBUG_MOUSE` is set. Unlike logForDebugging (stderr), a file
 * keeps the fullscreen alt screen unpolluted and survives the session for
 * post-mortem reading. Every append is try/catch-guarded — diagnostics
 * must never take the UI down.
 * @param message - Stage name (e.g. 'mouse arrive', 'dispatchClick').
 * @param fields - Optional JSON-serialized fields appended to the line.
 */
export declare function logMouseDebug(message: string, fields?: Record<string, unknown>): void;
//# sourceMappingURL=debug.d.ts.map
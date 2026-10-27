/**
 * Pinned sessions for the `/resume` browser, kept at
 * `~/.dsh-tui/session-pins.json` (a JSON array of session ids) so the pins
 * survive restarts.
 *
 * The pin key is the DSH session id (`SessionSummary.id`, from the session
 * header): stable across log revisions. Missing sessions are tolerated — the
 * browser filters pins against the live listing instead of rewriting them.
 */
/**
 * Where one backend's pins live: DSH's at the data directory root (unchanged),
 * any other backend's under `backends/<id>/` — a Claude session id pinned in
 * the Claude browser never reorders the DSH one.
 * @param backendId - The browser's backend (`dsh` when absent).
 */
export declare function sessionPinsDir(backendId: string | undefined, dir?: string): string;
/**
 * The persisted pin set, or empty when unset or unreadable.
 * @param dir - Prefs directory (injectable for tests).
 */
export declare function readSessionPins(dir?: string): ReadonlySet<string>;
/**
 * Persist a complete pin set with a private, atomic replacement.
 * @param ids - Every pinned session id, in any order.
 * @param dir - Prefs directory (injectable for tests).
 * @returns True when the file was replaced, false when locking/writing failed.
 */
export declare function writeSessionPins(ids: Iterable<string>, dir?: string): boolean;
export type SessionPinMutationResult = {
    readonly ok: boolean;
    readonly pins: ReadonlySet<string>;
};
/**
 * Update one pin under a cross-process lock. The file is re-read only after
 * the lock is held, so two live TUI instances do not overwrite each other's
 * unrelated pin changes. Malformed input is preserved and reported as failure
 * instead of being silently replaced with an empty set.
 */
export declare function setSessionPinned(id: string, pinned: boolean, dir?: string): SessionPinMutationResult;
//# sourceMappingURL=sessionPins.d.ts.map
/** One persisted input-history entry. */
export type HistoryEntry = {
    text: string;
    /** Unix ms timestamp. */
    ts: number;
    /**
     * Normalized workspace cwd the input was submitted in. Absent on entries
     * written before history became project-scoped; those legacy entries stay
     * visible in every project until that project's own entries push them out
     * of the `HISTORY_LIMIT` window.
     */
    project?: string;
};
/**
 * Per-project entry cap. `↑`/`↓` and the Ctrl+R overlay read the same file,
 * so both depths come from this one number.
 */
export declare const HISTORY_LIMIT = 200;
/**
 * Project key for a workspace cwd: absolute, forward slashes, no trailing
 * slash, case-folded on Windows (whose filesystem is case-insensitive).
 * @param cwd - Workspace cwd; blank means unscoped.
 * @returns The normalized key, or `undefined` when unscoped.
 */
export declare function historyProjectKey(cwd: string | undefined): string | undefined;
/**
 * Append an input to the persisted history, deduping the project's
 * immediately previous entry and capping each project at `HISTORY_LIMIT`.
 * @param text - Input to persist; blank inputs are ignored.
 * @param cwd - Workspace cwd the input belongs to; omitted = unscoped.
 * @returns Resolves once this entry is persisted; callers on the input path
 * intentionally discard it because persistence is best-effort.
 */
export declare function appendHistory(text: string, cwd?: string): Promise<void>;
/**
 * Read the persisted history, newest first.
 * @param cwd - Workspace cwd to scope to; omitted = every project.
 * @returns The persisted entries in reverse-chronological order.
 */
export declare function loadHistory(cwd?: string): HistoryEntry[];
/**
 * Read the persisted history in the order the composer walks it: oldest
 * first, so `↑` reaches the newest entry first (the list tail) exactly as it
 * does for the entries this process pushed itself.
 * @param cwd - Workspace cwd to scope to; omitted = every project.
 * @returns The persisted entries in chronological order.
 */
export declare function loadHistoryOldestFirst(cwd?: string): HistoryEntry[];
/**
 * Stable id for a history entry (keeps React keys distinct across identical texts).
 * @param entry - The history entry to hash.
 * @param index - Position in the currently rendered result list.
 * @returns A 12-char hex id derived from the entry text, timestamp, and index.
 */
export declare function historyEntryId(entry: HistoryEntry, index?: number): string;
//# sourceMappingURL=history.d.ts.map
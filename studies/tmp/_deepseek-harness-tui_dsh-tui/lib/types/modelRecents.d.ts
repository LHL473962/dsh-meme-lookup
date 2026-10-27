/**
 * Persisted recently-used models (`/model` picker's 最近使用 group), kept at
 * `~/.dsh-tui/model-recents.json` so the list survives restarts — same
 * best-effort pattern as agent-preset.json: a missing/corrupt file simply
 * reads as empty, and a failed write never blocks the switch that caused it.
 * Entries are `{ provider, id }` refs, most-recent-first, deduped, capped at
 * {@link MODEL_RECENTS_LIMIT}.
 *
 * The list is per backend: a DSH session keeps `model-recents.json` exactly
 * as before, any other backend `backends/<id>/model-recents.json` — its
 * model ids are not DSH routes, and sharing one capped list would let one
 * backend's picks evict the other's.
 *
 * @module dsh-tui/modelRecents
 */
/** How many recent entries the file and the picker group keep. */
export declare const MODEL_RECENTS_LIMIT = 10;
/** One persisted recent-model reference. */
export interface ModelRecentsRef {
    readonly provider: string;
    readonly id: string;
}
/** The recents file of one backend, relative to the prefs directory. */
export declare function modelRecentsFile(backendId?: string): string;
/**
 * Parse a persisted `{ models: [...] }` document; invalid shapes yield an
 * empty list (the file is rewritten on the next record).
 * @param text - Raw file contents.
 * @returns Valid refs in file order, deduped, capped.
 */
export declare function parseModelRecents(text: string): readonly ModelRecentsRef[];
/**
 * The persisted recent-model refs, most-recent-first.
 * @param dir - Prefs directory (injectable for tests).
 */
export declare function readModelRecents(dir?: string, backendId?: string): readonly ModelRecentsRef[];
/**
 * Record one use: move-to-front dedupe, cap at {@link MODEL_RECENTS_LIMIT},
 * best-effort persist. Never throws — a failed write must not block the
 * model switch that caused it.
 * @param ref - The provider/model just switched to.
 * @param dir - Prefs directory (injectable for tests).
 * @param backendId - The session's backend (absent / `dsh` = the DSH list).
 * @returns The new list (also what a subsequent read returns on success).
 */
export declare function recordModelUse(ref: ModelRecentsRef, dir?: string, backendId?: string): readonly ModelRecentsRef[];
//# sourceMappingURL=modelRecents.d.ts.map
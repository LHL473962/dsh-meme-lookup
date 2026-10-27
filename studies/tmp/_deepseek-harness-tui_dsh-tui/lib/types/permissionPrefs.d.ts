/**
 * Persisted DSH permission-preset preference (`~/.dsh-tui/permission.json`,
 * `{ "permission": "danger-full-access" }`): the last permission preset the
 * user switched to through `/permission` (picker or typed) or the Shift+Tab
 * mode cycle, so the next session STARTS where the last one ended instead of
 * the composition default. The Claude and Codex backends keep the same
 * memory inside their own `~/.dsh-tui/backends/<id>/prefs.json`; this file
 * is the DSH twin, consumed on the channel's first bind per session.
 *
 * Only the identity is stored — never sandbox/approval atoms — and it is
 * re-applied exclusively through the official `/permission` switch path
 * (mode-permission.ts), so the durable session log remains the source of
 * truth. A value the running preset roster no longer offers is skipped, and
 * an explicit `DSH_PERMISSION_MODE` deployment pin outranks the file.
 *
 * Best effort like the other ~/.dsh-tui preferences: a missing or corrupt
 * file reads as no preference; a failed write is silent (debug log).
 */
/**
 * The persisted permission-preset identity, or undefined when unset or
 * invalid. Only safe command tokens survive (the value is re-driven through
 * the official `/permission <preset>` path, which requires one).
 * @param dir - Prefs directory (injectable for tests).
 * @returns The persisted preset id, if any.
 */
export declare function readPermissionPref(dir?: string): string | undefined;
/**
 * Persist the chosen permission-preset identity (best effort).
 * @param permission - Preset id to persist (already validated by the caller).
 * @param dir - Prefs directory (injectable for tests).
 * @returns True when the file was written, false on failure.
 */
export declare function writePermissionPref(permission: string, dir?: string): boolean;
//# sourceMappingURL=permissionPrefs.d.ts.map
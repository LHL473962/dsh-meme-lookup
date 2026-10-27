/**
 * Persisted agent-preset preference (`/preset` picker choice), kept at
 * `~/.dsh-tui/agent-preset.json` (`preset` key) so the choice survives
 * restarts — same pattern as working-activity.json. The file is best-effort:
 * a missing/corrupt file or an id the roster no longer supplies simply falls
 * back to the roster default (`standard`). The persisted choice is the
 * standing user default and outranks a static `preset` key in cordis.yml
 * (the deployment default); only the `DSH_TUI_PRESET` launch instruction of
 * the current run leads it (see {@link presetOverrideFromEnv}).
 */
/**
 * The `DSH_TUI_PRESET` launch instruction of THIS run, when set: the
 * composition folds the variable into its `preset` config (both cordis.yml and
 * the bundle patch read it), and an explicit per-invocation instruction
 * outranks the persisted choice exactly like the other `DSH_TUI_*`/permission
 * environment pins. The value is NOT validated against PRESET_ID here, so an
 * unknown id surfaces through preset composition (a warning, and the session
 * composes without a preset) instead of silently falling back to the
 * remembered preset.
 * @param env - Environment to read (injectable for tests).
 * @returns The requested preset id, if any.
 */
export declare function presetOverrideFromEnv(env?: NodeJS.ProcessEnv): string | undefined;
/** Parse the value exactly as stored. Preset aliases are roster-dependent:
 * legacy rc.2 ships `code`, while the 0.1.2 line ships `ptc`, so this file
 * cannot safely canonicalize either name before the active roster has been queried. */
export declare function parsePresetPref(text: string): string | undefined;
/**
 * The persisted preset id, or undefined when unset or invalid.
 * @param dir - Prefs directory (injectable for tests).
 * @returns The persisted preset id, if any.
 */
export declare function readPresetPref(dir?: string): string | undefined;
/**
 * Persist the chosen preset id (best effort).
 * @param preset - Preset id to persist.
 * @param dir - Prefs directory (injectable for tests).
 * @returns True when the file was written, false on failure.
 */
export declare function writePresetPref(preset: string, dir?: string): boolean;
/** Rewrite a stored alias only after the active roster resolved its concrete
 * id. No-op for an exact match, an absent preference, or rosterless startup. */
export declare function migratePresetPref(requested: string | undefined, resolved: string | undefined, dir?: string): boolean;
//# sourceMappingURL=presetPrefs.d.ts.map
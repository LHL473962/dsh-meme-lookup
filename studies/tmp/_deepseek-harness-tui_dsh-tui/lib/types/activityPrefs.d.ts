/**
 * Persisted working-activity indicator preference, mirroring the pi
 * working-activity extension's `~/.pi/agent/working-activity.json`
 * (`frames` key). dsh-tui keeps its own copy at
 * `~/.dsh-tui/working-activity.json` so the `/activity` choice survives
 * restarts. The file is best-effort: a missing or corrupt file (or an
 * unknown preset left behind by an older version) just falls back to the
 * default preset.
 */
import { type WorkingActivityConfig } from 'dsh-working-activity/config';
import type { Config as MountedActivityConfig } from 'dsh-working-activity';
/**
 * Parse a persisted `{ frames }` value; anything else yields undefined.
 * @param text - Raw file contents.
 * @returns The preset name when valid, else undefined.
 */
export declare function parseActivityFrames(text: string): string | undefined;
/**
 * The persisted indicator preset name, or undefined when unset or invalid.
 * @param dir - Prefs directory (injectable for tests).
 * @returns The persisted preset name, if any.
 */
export declare function readActivityFrames(dir?: string): string | undefined;
/**
 * Read the full pi-style working-activity config (frames / mode / features /
 * customPhrases / customActions / narrate / thresholds) from the same JSON
 * file the `/activity` command writes, parsed by the wa package. Best-effort:
 * a missing or corrupt file yields undefined (callers use their defaults).
 * @param dir - Prefs directory (injectable for tests).
 * @returns The parsed config, or undefined when unreadable.
 */
export declare function readActivityConfig(dir?: string): WorkingActivityConfig | undefined;
/**
 * Fold the parsed user file into the mounted working-activity plugin config.
 *
 * The line's semantics moved into the plugin, but the file this app's own UI
 * writes (`/activity`, the settings panel) is still where a user's feature
 * switches live — without this fold they were parsed and silently dropped.
 * Precedence keeps the old contract: an explicit row value wins over the
 * file, the file fills everything the row leaves at its schema default. The
 * flags come through `featureOn`, so the file's `mode: minimal` turns them
 * off exactly as it did when the deleted channel sidecar built its tracker.
 * (The sidecar also hardcoded `detailLimit: 40`, which is the plugin's own
 * schema default — nothing to fold.)
 *
 * The plugin schema materializes its defaults before `apply` sees the config,
 * so "equal to the default" is the honest reading of "the row did not set
 * this key"; a row value explicitly set to the default is indistinguishable
 * from an unset one and the file wins there. None of these keys are set by
 * the shipped rows.
 * @param config - Schema-resolved row config for the mounted plugin.
 * @param file - Parsed user preferences (undefined when unreadable/absent).
 * @returns the config to mount the plugin with.
 */
export declare function mergeActivityPreferences(config: MountedActivityConfig, file: WorkingActivityConfig | undefined): MountedActivityConfig;
/**
 * Persist the chosen indicator preset (best effort).
 * @param name - Preset name to persist.
 * @param dir - Prefs directory (injectable for tests).
 * @returns True when the file was written, false on failure.
 */
export declare function writeActivityFrames(name: string, dir?: string): boolean;
//# sourceMappingURL=activityPrefs.d.ts.map
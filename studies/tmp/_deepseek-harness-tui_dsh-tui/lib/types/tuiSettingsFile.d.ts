export interface TuiSettingsDocument {
    readonly version: 1;
    /** The sparse user layer: only what the user set. */
    readonly values: Readonly<Record<string, unknown>>;
    /** The one-time import from the DSH profile patch (absent = never ran). */
    readonly imported?: {
        readonly from: string;
        readonly at: number;
    };
}
export declare const TUI_SETTINGS_FILE: string;
/** The document, or undefined when there is none yet. A broken file reads as
 *  an empty layer (and is not re-imported over). Never throws. */
export declare function readTuiSettings(file?: string): TuiSettingsDocument | undefined;
/**
 * Before the first write over a document `readTuiSettings` could not parse,
 * keep its original bytes beside it as `<file>.corrupt-<timestamp>` (mode
 * 0600). Returns the backup path; throws when the bytes cannot be preserved
 * — the caller must then not replace the file.
 */
export declare function backupUnreadableTuiSettings(file?: string): string;
/** Write the document atomically; throws when it cannot be written. */
export declare function writeTuiSettings(document: TuiSettingsDocument, file?: string): void;
/**
 * Write the document only when there is none yet; false when another process
 * created it first. The complete file appears at once (a hard link of the
 * temporary, which fails on an existing name); a filesystem without hard links
 * falls back to an exclusive create, which never replaces a document either.
 * Throws when it cannot be written.
 */
export declare function createTuiSettings(document: TuiSettingsDocument, file?: string): boolean;
/** The DSH profile's own patch layer, where DSH persisted the `/settings` layer. */
export declare function profilePatchPath(profile: string): string;
/**
 * The `dsh-tui` row's `config` in a DSH profile patch, restricted to `keys`
 * (the editable fields; deployment fields such as the provider route stay in
 * the profile). Undefined when the file or the row is missing or unreadable.
 * `!!js` expressions are not evaluated: such a field is skipped (a top-level
 * one's source is recorded in `expressions`, when given).
 */
export declare function readProfileTuiSettings(path: string, keys: readonly string[], expressions?: Map<string, string>): Record<string, unknown> | undefined;
/**
 * The `ns` section of the `/settings` user layer older DSH hosts kept in
 * `<DSH home>/settings.yaml` (dsh-settings-file), restricted to `keys`. A DSH
 * that has since moved the document into the profile patch leaves it as
 * `settings.yaml.imported`; `pending` tells the two apart (a pending document
 * still overrides the patch, an imported one is already beneath it).
 */
export declare function readLegacyTuiSettings(ns: string, keys: readonly string[]): {
    readonly from: string;
    readonly pending: boolean;
    readonly values: Record<string, unknown>;
} | undefined;
/** `over` laid on `under`: nested records merge, anything else replaces. */
export declare function mergeSettingsLayers(under: Readonly<Record<string, unknown>>, over: Readonly<Record<string, unknown>>): Record<string, unknown>;
//# sourceMappingURL=tuiSettingsFile.d.ts.map
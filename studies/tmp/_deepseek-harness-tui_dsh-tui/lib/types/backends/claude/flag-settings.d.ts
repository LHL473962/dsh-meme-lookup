export interface FlagSettingsFile {
    /** What to pass as the SDK `settings` option. */
    readonly path: string;
    /** Remove the file (idempotent). */
    dispose(): void;
}
/** Write one run's flag settings; throws when the file cannot be written
 *  (the caller must not fall back to the inline form). */
export declare function writeFlagSettingsFile(settings: {
    readonly env: Readonly<Record<string, string>>;
}): FlagSettingsFile;
//# sourceMappingURL=flag-settings.d.ts.map
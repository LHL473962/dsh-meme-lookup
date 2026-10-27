/** Observable installation state for the bundled AI 小说作家 preset. */
export type PresetInstallStatus = {
    readonly status: 'not-installed' | 'installed' | 'conflict';
};
/** Result of an explicit preset installation attempt. */
export interface PresetInstallResult {
    readonly status: 'installed' | 'conflict';
    readonly changed: boolean;
}
/** Installs one immutable package preset into a configured user preset root. */
export interface PresetInstaller {
    /**
     * Inspect whether the target is absent, byte-identical, or conflicting.
     *
     * @param signal Optional cancellation signal.
     * @returns Current installation state.
     * @throws {AbortError} When signal is aborted.
     * @throws {Error} When a filesystem error prevents inspection.
     */
    status(signal?: AbortSignal): Promise<PresetInstallStatus>;
    /**
     * Atomically install the preset directory when it is absent.
     *
     * @param signal Optional cancellation signal honored before directory publication.
     * @returns Whether the preset is installed and whether this call changed disk state.
     * @throws {AbortError} When signal is aborted before publication.
     * @throws {Error} When installation cannot be completed.
     */
    install(signal?: AbortSignal): Promise<PresetInstallResult>;
}
/**
 * Create the package preset installer for one configured user preset root.
 *
 * @param templateRoot Absolute directory containing the immutable package preset.
 * @param presetRoot Absolute user preset root selected by Host configuration.
 * @returns An installer that never overwrites an existing target.
 * @throws {TypeError} When either root is not absolute.
 */
export declare function createPresetInstaller(templateRoot: string, presetRoot: string): PresetInstaller;

/**
 * The light profile for non-DSH kernels: this package's layers plus the
 * profile's third-party bundles, composed into the entry's root without
 * `dsh-base`. One root, since a second root's rows stay pending unless every
 * entry service is copied over. Also the entry's rebuilt `dsh-tui` row config
 * (every kernel). Rows guarded by scripts/verify-lite-profile-rows.mjs.
 * Pure data and functions: no `@deepseek-ai/*` import, no I/O.
 */
/** `dsh-base` carries DSH's agent, llm, tools and workspace core rows. */
export declare const LITE_PROFILE_EXCLUDED_BUNDLES: readonly string[];
/**
 * Loader entry ids (`cordis.patch.yml` `insert` ids) trimmed out of a light
 * composition: each injects a service only the excluded bundles provide, so it
 * would sit pending forever and turn "N entries did not activate" into a
 * permanent state instead of a fault. Missing services noted per row.
 */
export declare const LITE_PROFILE_ROW_DISABLES: readonly string[];
/**
 * The static config of `cordis.patch.yml`'s `dsh-tui` row, which the entry
 * rebuilds instead of reading the patch (the env-backed fields are mapped
 * there). Guarded by scripts/verify-lite-profile-rows.mjs.
 */
export declare const ENTRY_ROW_DEFAULTS: {
    readonly provider: "deepseek-official";
    readonly fullscreen: true;
    readonly terminalImages: true;
    readonly effort: "max";
};
/** What a composition needs to mount a light profile. */
export interface LiteProfilePlan<Layer extends {
    readonly packageName: string;
}> {
    readonly layers: readonly Layer[];
    /** The excluded bundles that were present and therefore left out. */
    readonly excluded: readonly string[];
    /** `cordis.patch.yml` disable entries, appended after the profile's own patch layers; always holds `dsh-tui`. */
    readonly disableRows: readonly {
        readonly id: string;
        readonly disabled: true;
    }[];
    /** Whether a loaded layer was left out; false lets the caller reuse the full composition. */
    readonly trimmed: boolean;
}
/** The light composition plan for a loaded profile: which layers stay, which rows are disabled. */
export declare function liteProfilePlan<Layer extends {
    readonly packageName: string;
}>(profile: {
    readonly layers: readonly Layer[];
}): LiteProfilePlan<Layer>;
//# sourceMappingURL=lite-profile.d.ts.map
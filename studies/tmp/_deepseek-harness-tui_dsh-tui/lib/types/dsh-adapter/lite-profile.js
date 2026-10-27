/**
 * The light profile for non-DSH kernels: this package's layers plus the
 * profile's third-party bundles, composed into the entry's root without
 * `dsh-base`. One root, since a second root's rows stay pending unless every
 * entry service is copied over. Also the entry's rebuilt `dsh-tui` row config
 * (every kernel). Rows guarded by scripts/verify-lite-profile-rows.mjs.
 * Pure data and functions: no `@deepseek-ai/*` import, no I/O.
 */
/** `dsh-base` carries DSH's agent, llm, tools and workspace core rows. */
export const LITE_PROFILE_EXCLUDED_BUNDLES = ['@deepseek-ai/dsh-base'];
/**
 * Loader entry ids (`cordis.patch.yml` `insert` ids) trimmed out of a light
 * composition: each injects a service only the excluded bundles provide, so it
 * would sit pending forever and turn "N entries did not activate" into a
 * permanent state instead of a fault. Missing services noted per row.
 */
export const LITE_PROFILE_ROW_DISABLES = [
    'dsh-tui-workspace', // sessionPersistence
    'dsh-tui-agent-preset-registry', // sessionProjections
    'dsh-tui-cordis-host-runner', // tools
    'dsh-tui-auth', // llm, commands
    'dsh-tui', // agents, workspaceRegistry: the DSH front door, which the entry itself replaces
];
/**
 * The static config of `cordis.patch.yml`'s `dsh-tui` row, which the entry
 * rebuilds instead of reading the patch (the env-backed fields are mapped
 * there). Guarded by scripts/verify-lite-profile-rows.mjs.
 */
export const ENTRY_ROW_DEFAULTS = {
    provider: 'deepseek-official',
    fullscreen: true,
    terminalImages: true,
    effort: 'max',
};
/** The light composition plan for a loaded profile: which layers stay, which rows are disabled. */
export function liteProfilePlan(profile) {
    const excluded = new Set(LITE_PROFILE_EXCLUDED_BUNDLES);
    const layers = profile.layers.filter(layer => !excluded.has(layer.packageName));
    const dropped = profile.layers.filter(layer => excluded.has(layer.packageName));
    const trimmed = dropped.length > 0;
    return {
        layers,
        excluded: dropped.map(layer => layer.packageName),
        // With every layer still there, the services exist and the rows work,
        // except the front door: the entry already runs this package's runtime.
        disableRows: (trimmed ? LITE_PROFILE_ROW_DISABLES : ['dsh-tui']).map(id => ({ id, disabled: true })),
        trimmed,
    };
}

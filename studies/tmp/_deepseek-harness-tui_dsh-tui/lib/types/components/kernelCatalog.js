/**
 * Project registry entries into the picker's data (P0: the UI renders the list
 * the host hands it — `listBackends()` in the composition root, fixtures in the
 * regressions — and never imports the registry itself).
 */
export function kernelEntriesOf(backends) {
    return backends.map(entry => ({
        id: entry.id,
        label: entry.manifest.label,
        shortLabel: entry.manifest.shortLabel,
        alwaysAvailable: entry.manifest.alwaysAvailable === true,
        ...(entry.manifest.product === undefined ? {} : { product: entry.manifest.product }),
        installable: entry.installable,
    }));
}
/** Product-qualified version; an entry without a product keeps the raw version. */
export function kernelVersionLabel(product, version) {
    if (version === undefined || version === '')
        return undefined;
    return product === undefined ? version : product + ' v' + version;
}
/** Entries stay in registry order (= declaration order, the picker's order).
 *  Only dsh is always available; optional backends stay disabled until
 *  detection completes. */
export function buildKernelCatalog(input) {
    return input.entries.map(entry => {
        const status = input.statuses?.[entry.id];
        // Installation is the only gate. A missing credential does NOT dim the
        // row: credentials legitimately live where detection cannot look (the
        // Claude settings' `env`, `apiKeyHelper`, a relay channel's token), so
        // an auth miss is not proof the kernel is unusable — the CLI applies its
        // own settings, and an in-session `/login` remains available.
        const selectable = entry.alwaysAvailable || (status !== undefined && status.installed);
        const signInLater = selectable && status?.auth === 'missing' && status.loginInSession === true;
        // `!selectable` already implies `!entry.alwaysAvailable` (that row is always
        // selectable), so an unselectable, undetected row is an install miss.
        const installable = !selectable && status !== undefined && !status.installed && input.canInstallSdk === true && entry.installable;
        const reasonKey = status === undefined
            ? 'kernel-probing'
            : installable
                ? 'kernel-not-installed-installable'
                // Not installed, and detection itself flagged the install as stale
                // (a version it found is below the backend's floor).
                : status.stale === true
                    ? 'kernel-unavailable-too-old'
                    : 'kernel-unavailable-not-installed';
        const version = kernelVersionLabel(entry.product, entry.alwaysAvailable ? input.dshVersion : status?.version);
        return {
            id: entry.id,
            label: entry.label,
            shortLabel: entry.shortLabel,
            current: input.current === entry.id,
            selectable,
            ...(selectable ? {} : { reasonKey }),
            ...(selectable || status?.hint === undefined || status.hint === '' ? {} : { hint: status.hint }),
            ...(selectable && signInLater ? { noteKey: 'kernel-login-in-session' } : {}),
            ...(installable ? { installable } : {}),
            ...(version === undefined ? {} : { version }),
        };
    });
}
/** Join the available version and unavailability reason without an empty subtitle. */
export function kernelSubtitle(option, reason) {
    const parts = [];
    if (option.version !== undefined && option.version !== '')
        parts.push(option.version);
    if (option.reasonKey !== undefined)
        parts.push(reason(option.reasonKey));
    if (option.noteKey !== undefined)
        parts.push(reason(option.noteKey));
    return parts.length === 0 ? undefined : parts.join(' \u00b7 ');
}

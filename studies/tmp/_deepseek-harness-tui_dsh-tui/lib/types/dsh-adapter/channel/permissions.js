import { t } from '../../i18n.js';
import { PERMISSION_PRESET_AUTO } from '../../permissionPresetLabels.js';
import { cleanRenderText } from '../sanitize.js';
export const PERMISSION_PRESET_CUSTOM = 'custom';
export const PERMISSION_PRESET_NAME_CELLS = 120;
export const PERMISSION_PRESET_DESCRIPTION_CELLS = 400;
export function isRecord(value) {
    return value !== null && typeof value === 'object';
}
/** Narrow a raw service read to the structural registry surface. */
export function permissionPresetRuntime(service) {
    return isRecord(service) ? service : undefined;
}
/** Keep a permission roster read-only after it crosses the adapter boundary.
 *  The registry may reuse and mutate its option objects between reads; callers
 *  must observe one stable snapshot instead of a live view into that service. */
export function freezePermissionPresetSnapshot(snapshot) {
    const options = Object.freeze(snapshot.options.map(option => Object.freeze({ ...option })));
    const current = snapshot.current === undefined ? undefined : Object.freeze({ ...snapshot.current });
    return Object.freeze({
        availability: snapshot.availability,
        options,
        ...(current === undefined ? {} : { current }),
    });
}
export function legacyPermissionPresetOptions() {
    return [
        {
            value: 'read-only',
            name: t('permission-preset-readonly'),
            description: t('permission-preset-readonly-desc'),
        },
        {
            value: 'workspace-write',
            name: t('permission-preset-workspace-write'),
            description: t('permission-preset-workspace-write-desc'),
        },
        {
            value: 'danger-full-access',
            name: t('permission-preset-full-access'),
            description: t('permission-preset-full-access-desc'),
        },
    ];
}
export function legacyPermissionPresetSnapshot(sandbox) {
    const options = legacyPermissionPresetOptions();
    const currentOption = sandbox === undefined ? undefined : options.find(option => option.value === sandbox);
    return freezePermissionPresetSnapshot({
        availability: 'legacy',
        options,
        ...(currentOption === undefined
            ? {}
            : { current: { ...currentOption, kind: 'preset' } }),
    });
}
export function unavailablePermissionPresetSnapshot() {
    return freezePermissionPresetSnapshot({ availability: 'unavailable', options: [] });
}
export function normalizePermissionPresetOption(value) {
    if (!isRecord(value) || typeof value.value !== 'string' || typeof value.name !== 'string')
        return undefined;
    const name = cleanRenderText(value.name, PERMISSION_PRESET_NAME_CELLS);
    if (name === '')
        return undefined;
    if (value.description !== undefined && typeof value.description !== 'string')
        return undefined;
    const description = value.description === undefined
        ? undefined
        : cleanRenderText(value.description, PERMISSION_PRESET_DESCRIPTION_CELLS);
    if (value.description !== undefined && description === '')
        return undefined;
    return {
        value: value.value,
        name,
        ...(description === undefined || description === '' ? {} : { description }),
    };
}
/** Atom bundles the deployment's preset table resolves (value →
 *  sandbox/approval). Empty when the service is absent or exposes no
 *  `resolve` seam — canonical resolution then falls back to the stock
 *  bundles (see `canonicalPresetFor`). */
export function permissionBundlesFromService(service) {
    const runtime = permissionPresetRuntime(service);
    if (runtime === undefined || typeof runtime.resolve !== 'function')
        return [];
    const names = Array.isArray(runtime.names) ? runtime.names : [];
    const bundles = [];
    for (const name of names) {
        // The session-only `auto` preset never stands in for a static mode's
        // atoms: canonicalizing into it would skip its risk confirmation.
        if (typeof name !== 'string' || name === PERMISSION_PRESET_AUTO)
            continue;
        try {
            // The registry resolves atoms on instance state; never detach `resolve`.
            const spec = runtime.resolve(name);
            if (!isRecord(spec))
                continue;
            const sandbox = spec.sandbox;
            const approval = spec.approval;
            if ((sandbox === 'read-only' || sandbox === 'workspace-write' || sandbox === 'danger-full-access')
                && (approval === 'ask' || approval === 'never')) {
                bundles.push({ value: name, sandbox, approval });
            }
        }
        catch {
            // Optional resolution; a broken entry just does not extend the table.
        }
    }
    return bundles;
}
/** The registry's current readback for one subject. Real harness registries
 *  resolve `current(session)` through their session-projections seam; earlier
 *  contract versions folded a raw event log. Try the subject as given, then
 *  the event-log shape it may carry. */
export function permissionPresetSnapshotFromService(service, subject) {
    const runtime = permissionPresetRuntime(service);
    if (runtime === undefined)
        return unavailablePermissionPresetSnapshot();
    try {
        const capturedNames = Array.isArray(runtime.names) ? runtime.names : [];
        if (capturedNames.length === 0)
            return unavailablePermissionPresetSnapshot();
        if (typeof runtime.current !== 'function' || typeof runtime.optionOf !== 'function') {
            return unavailablePermissionPresetSnapshot();
        }
        // Readback lives on the registry instance; bind so the calls below keep
        // reaching it through the same object instead of a detached reference.
        const current = runtime.current.bind(runtime);
        const optionOf = runtime.optionOf.bind(runtime);
        const names = [];
        for (const name of capturedNames) {
            if (typeof name !== 'string' || name.trim() === '' || name === PERMISSION_PRESET_CUSTOM || names.includes(name)) {
                return unavailablePermissionPresetSnapshot();
            }
            names.push(name);
        }
        const seen = new Set(names);
        const options = [];
        for (const name of names) {
            const option = normalizePermissionPresetOption(optionOf(name));
            if (option === undefined || option.value !== name)
                return unavailablePermissionPresetSnapshot();
            options.push({ ...option });
        }
        let currentValue;
        try {
            currentValue = current(subject);
        }
        catch {
            currentValue = undefined;
        }
        if (typeof currentValue !== 'string') {
            // Second chance for the other contract shape: a subject that carries an
            // event log, or a raw log handed in directly.
            const fallback = subject?.events ?? subject;
            try {
                currentValue = current(fallback);
            }
            catch {
                if (typeof currentValue !== 'string')
                    return unavailablePermissionPresetSnapshot();
            }
        }
        if (typeof currentValue !== 'string' || (currentValue !== PERMISSION_PRESET_CUSTOM && !seen.has(currentValue))) {
            return unavailablePermissionPresetSnapshot();
        }
        const currentOption = normalizePermissionPresetOption(optionOf(currentValue));
        if (currentOption === undefined || currentOption.value !== currentValue)
            return unavailablePermissionPresetSnapshot();
        if (currentValue !== PERMISSION_PRESET_CUSTOM) {
            const rosterOption = options.find(option => option.value === currentValue);
            if (rosterOption === undefined
                || rosterOption.name !== currentOption.name
                || rosterOption.description !== currentOption.description) {
                return unavailablePermissionPresetSnapshot();
            }
        }
        return freezePermissionPresetSnapshot({
            availability: 'runtime',
            options,
            current: {
                ...currentOption,
                kind: currentValue === PERMISSION_PRESET_CUSTOM ? 'custom' : 'preset',
            },
        });
    }
    catch {
        return unavailablePermissionPresetSnapshot();
    }
}

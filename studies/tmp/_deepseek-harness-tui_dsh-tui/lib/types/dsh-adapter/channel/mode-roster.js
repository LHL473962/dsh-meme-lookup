import { isCommandCompletionToken } from '../../commands.js';
import { canonicalPresetFor, permissionCycleEntry, permissionModeSpec, stablePermissionRosterOrder, } from '../../sessionModes.js';
import { permissionBundlesFromService, permissionPresetSnapshotFromService, } from './permissions.js';
/** Durable identities the configured modes already own; a runtime preset with
 *  one of them is the same switch by another route and never duplicated. */
export function configuredPermissionIds(modes) {
    return new Set(modes.flatMap(spec => spec.permission === undefined ? [] : [spec.permission]));
}
/** Canonical targets of the STATIC modes. On a stock table that is the three
 *  built-in names; on renamed tables the deployment's own names for the same
 *  bundles. They are never dynamic entries: the indicator would otherwise
 *  snap to a dynamic look-alike instead of the static mode. */
export function staticCanonicalTargets(modes, bundles) {
    const targets = new Set();
    for (const spec of modes) {
        if (spec.permission !== undefined || spec.sandbox === undefined || spec.approval === undefined)
            continue;
        const canonical = canonicalPresetFor(spec.sandbox, spec.approval, bundles);
        if (canonical !== undefined)
            targets.add(canonical);
    }
    return targets;
}
/** The mounted `permissionPresets` registry as a runtime snapshot, or
 *  undefined when no runtime table is mounted (legacy/unavailable tables are
 *  not a roster). Reads are fail-closed: a throwing registry is no roster. */
export function readRuntimePermissionSnapshot(ctx, target) {
    let service;
    try {
        service = ctx.get('permissionPresets');
    }
    catch {
        return undefined;
    }
    if (service === undefined)
        return undefined;
    const snapshot = permissionPresetSnapshotFromService(service, target.session);
    return snapshot.availability === 'runtime' ? snapshot : undefined;
}
/** Warn at most once per (agent, identity, reason) — a registry that keeps
 *  re-listing an unusable preset must not flood the log on every rebuild. */
export function warnOnceForPermissionEntry(warned, warn, target, value, reason) {
    const key = `${String(target.id)}:${value}:${reason}`;
    if (warned.has(key))
        return;
    if (warned.size >= 200)
        warned.clear();
    warned.add(key);
    warn(`dsh-tui: permission preset "${value}" skipped from Shift+Tab (${reason})`);
}
/**
 * Dynamic session-mode roster (main's `sessionModes` / `rebuildSessionModes`).
 *
 * Runtime permission presets are appended AFTER the configured/default modes
 * whenever the SERVICE snapshot is usable — no dependency on the external
 * `/permission` command reaching this agent's registry, because switching
 * falls back to the service's own write path when the command row is absent.
 * Registry order is authoritative on first observation; later rebuilds
 * preserve the relative order of identities already seen so unrelated
 * command-registry churn cannot reshuffle Shift+Tab. Removed identities drop
 * out and a later re-add is treated as new.
 */
export function createPermissionModeRoster(ctx, deps) {
    const warn = deps.warn ?? ((message) => ctx.logger.warn(message));
    const configuredIds = configuredPermissionIds(deps.configuredModes);
    const warned = new Set();
    const order = new WeakMap();
    // Mutated in place: a consumer that captured this array keeps observing the
    // live roster across rebuilds (see the interface contract).
    const modes = [...deps.configuredModes];
    const bundlesOf = () => {
        let service;
        try {
            service = ctx.get('permissionPresets');
        }
        catch {
            return [];
        }
        return service === undefined ? [] : permissionBundlesFromService(service);
    };
    const canonicalFor = (sandbox, approval) => canonicalPresetFor(sandbox, approval, bundlesOf());
    const rebuild = (target) => {
        const snapshot = readRuntimePermissionSnapshot(ctx, target);
        const excluded = staticCanonicalTargets(deps.configuredModes, bundlesOf());
        const candidates = new Map();
        if (snapshot !== undefined) {
            for (const option of snapshot.options) {
                if (excluded.has(option.value)) {
                    warnOnceForPermissionEntry(warned, warn, target, option.value, 'canonical target');
                    continue;
                }
                if (!isCommandCompletionToken(option.value)) {
                    warnOnceForPermissionEntry(warned, warn, target, option.value, 'unsafe command token');
                    continue;
                }
                const decision = permissionCycleEntry(option, configuredIds);
                if (!decision.accepted) {
                    warnOnceForPermissionEntry(warned, warn, target, option.value, decision.reason);
                    continue;
                }
                candidates.set(option.value, option);
            }
        }
        const next = stablePermissionRosterOrder(order.get(target.session) ?? [], [...candidates.keys()]);
        order.set(target.session, next);
        const dynamic = [];
        for (const value of next) {
            const option = candidates.get(value);
            if (option !== undefined)
                dynamic.push(permissionModeSpec(option));
        }
        modes.length = 0;
        for (const spec of [...deps.configuredModes, ...dynamic])
            modes.push(spec);
    };
    // Main rebuilds once at construction, before the roster is first read.
    rebuild(deps.agent());
    return { modes, rebuild, readSnapshot: target => readRuntimePermissionSnapshot(ctx, target), canonicalFor };
}

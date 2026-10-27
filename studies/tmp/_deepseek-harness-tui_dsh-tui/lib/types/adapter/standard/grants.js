/** Live, scoped plugin grant evaluation. */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { normalizePermissionScope, permissionScopeCovers } from './permission-scope.js';
import { loadSpecData } from './registry.js';
import { assertCapabilityShadowPolicy, defaultAdapterRuntime, } from '../kernel/runtime.js';
import { DATA_DIR } from '../../utils/paths.js';
export const EXTENSION_GRANTS_FILE = 'extension-grants.json';
function parseRule(value) {
    if (typeof value === 'string')
        return { permission: value, legacy: true };
    if (value === null || typeof value !== 'object' || Array.isArray(value))
        return undefined;
    const record = value;
    if (Object.keys(record).some(key => !['name', 'scope', 'activationId'].includes(key)))
        return undefined;
    if (typeof record.name !== 'string' || typeof record.scope !== 'string')
        return undefined;
    if (record.activationId !== undefined && typeof record.activationId !== 'string')
        return undefined;
    return {
        permission: record.name,
        scope: record.scope,
        ...(record.activationId === undefined ? {} : { activationId: record.activationId }),
        legacy: false,
    };
}
function parseTable(text) {
    const grants = new Map();
    const denies = new Map();
    let parsed;
    try {
        parsed = JSON.parse(text);
    }
    catch {
        return { grants, denies, corrupt: true };
    }
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return { grants, denies, corrupt: true };
    }
    const root = parsed;
    if (Object.keys(root).some(key => key !== 'grants' && key !== 'denies')) {
        return { grants, denies, corrupt: true };
    }
    const readSection = (key, target) => {
        const section = root[key];
        if (section === undefined)
            return true;
        if (section === null || typeof section !== 'object' || Array.isArray(section))
            return false;
        for (const [componentId, values] of Object.entries(section)) {
            if (componentId === '' || !Array.isArray(values))
                return false;
            const rules = values.map(parseRule);
            if (rules.some(rule => rule === undefined))
                return false;
            target.set(componentId, rules);
        }
        return true;
    };
    if (!readSection('grants', grants) || !readSection('denies', denies)) {
        return { grants: new Map(), denies: new Map(), corrupt: true };
    }
    return { grants, denies, corrupt: false };
}
function resolveRegistry(registry) {
    return registry ?? loadSpecData()?.permissions;
}
function principalParts(principal) {
    return typeof principal === 'string' ? { componentId: principal } : principal;
}
function ruleMatches(rule, principal, permission, scope, mode = 'grant') {
    if (rule.permission !== permission)
        return false;
    if (rule.activationId !== undefined && rule.activationId !== principal.activationId)
        return false;
    const actual = normalizePermissionScope(permission, scope, principal.componentId);
    if (actual === undefined)
        return false;
    // A legacy string row carries no resource/session/command scope. Treating a
    // legacy GRANT as a wildcard would silently enlarge a grant during the v0.15
    // migration, so it never authorizes. A legacy DENY is safe to apply
    // conservatively to every enforceable scope: it can reduce availability but
    // cannot widen access or make revocation ineffective.
    if (rule.legacy)
        return mode === 'deny';
    const declared = normalizePermissionScope(permission, rule.scope ?? '', principal.componentId);
    return declared !== undefined && permissionScopeCovers(permission, declared, actual);
}
/** An unbound/diagnostic principal cannot safely inherit a default or an
 * unscoped rule when an activation-specific rule could apply. Returning deny
 * here is conservative: callers must admit a real activation before using a
 * grant whose lifetime is activation-scoped. */
function hasUnknownActivationRule(rules, principal, permission, scope) {
    if (principal.activationId !== undefined)
        return false;
    const actual = normalizePermissionScope(permission, scope, principal.componentId);
    if (actual === undefined)
        return false;
    return rules.some(rule => {
        if (rule.legacy || rule.permission !== permission || rule.activationId === undefined)
            return false;
        const declared = normalizePermissionScope(permission, rule.scope ?? '', principal.componentId);
        return declared !== undefined && permissionScopeCovers(permission, declared, actual);
    });
}
function storeFrom(table, registry, onChange, runtime = defaultAdapterRuntime()) {
    const known = new Map((registry?.permissions ?? []).map(entry => [entry.name, entry.default]));
    // The store is a capability, not a mutable configuration object.  Keep the
    // live table in the closure and freeze the facade so a traceable Cordis
    // proxy (or an accidentally retained reference) cannot replace `allows`
    // and turn an authorization check into an unconditional allow.
    return Object.freeze({
        get corrupt() {
            return table().corrupt;
        },
        allows(principalValue, permission, scope) {
            assertCapabilityShadowPolicy('host.grants.evaluate', runtime.mode, runtime.slices);
            const current = table();
            if (current.corrupt || known.get(permission) === undefined)
                return false;
            const principal = principalParts(principalValue);
            if (normalizePermissionScope(permission, scope, principal.componentId) === undefined)
                return false;
            const denies = current.denies.get(principal.componentId) ?? [];
            const grants = current.grants.get(principal.componentId) ?? [];
            if (hasUnknownActivationRule(denies, principal, permission, scope)
                || hasUnknownActivationRule(grants, principal, permission, scope))
                return false;
            if (denies.some(rule => ruleMatches(rule, principal, permission, scope, 'deny')))
                return false;
            if (grants.some(rule => ruleMatches(rule, principal, permission, scope, 'grant')))
                return true;
            return known.get(permission) === 'allow';
        },
        defaultOf: permission => known.get(permission) ?? 'deny',
        knownPermissions: () => [...known.keys()],
        onChange,
    });
}
/** Parse a fixed snapshot, primarily for deterministic tests. */
export function parseGrantStore(text, registry, runtime = defaultAdapterRuntime()) {
    const parsed = text === ''
        ? { grants: new Map(), denies: new Map(), corrupt: false }
        : parseTable(text);
    return storeFrom(() => parsed, resolveRegistry(registry), () => () => undefined, runtime);
}
/**
 * Read grants on every decision. File changes therefore affect the next
 * operation without a restart. onChange uses a non-persistent watcher so
 * grant-owned subscriptions can be released even when no event is flowing.
 *
 * When called from a Cordis composition, pass the same immutable
 * `adapterRuntimeFor(ctx)` snapshot so grant evaluation uses the same shadow
 * policy as every other service in that composition root.
 */
export function readGrantStore(dir = DATA_DIR, registry, runtime = defaultAdapterRuntime()) {
    const file = join(dir, EXTENSION_GRANTS_FILE);
    const readCurrent = () => {
        let text;
        let missing = false;
        try {
            text = readFileSync(file, 'utf8');
        }
        catch (error) {
            missing = error.code === 'ENOENT';
            text = missing ? '' : '{unreadable';
        }
        return {
            // An existing zero-byte file is corruption, not the same state as an
            // absent grants file. Only ENOENT receives the registry defaults.
            table: missing
                ? { grants: new Map(), denies: new Map(), corrupt: false }
                : parseTable(text),
            signature: text,
        };
    };
    const listeners = new Set();
    let watching = false;
    let watchTimer;
    let signature = readCurrent().signature;
    const changed = () => {
        const next = readCurrent().signature;
        if (next === signature)
            return;
        signature = next;
        for (const listener of [...listeners]) {
            try {
                listener();
            }
            catch {
                // A lifecycle observer is advisory; one faulty cleanup callback must
                // not prevent the remaining subscriptions from seeing revocation.
            }
        }
    };
    const onChange = (listener) => {
        listeners.add(listener);
        if (!watching) {
            watching = true;
            // A small unref'ed poll is deterministic across filesystems and
            // timestamp granularities. The synchronous read on every operation
            // remains the authorization source of truth; this loop only releases
            // grant-owned subscriptions promptly after a revocation.
            watchTimer = setInterval(changed, 50);
            watchTimer.unref?.();
        }
        return () => {
            listeners.delete(listener);
            if (watching && listeners.size === 0) {
                watching = false;
                if (watchTimer !== undefined)
                    clearInterval(watchTimer);
                watchTimer = undefined;
            }
        };
    };
    return storeFrom(() => readCurrent().table, resolveRegistry(registry), onChange, runtime);
}

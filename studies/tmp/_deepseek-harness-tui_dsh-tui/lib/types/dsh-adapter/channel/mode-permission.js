import { isCommandCompletionToken } from '../../commands.js';
import { snapshotLiveSessionEvents } from '../compat/liveSession.js';
import { t } from '../../i18n.js';
import { modeDisplayName } from '../../sessionModes.js';
import { PERMISSION_PRESET_CUSTOM, permissionPresetRuntime } from './permissions.js';
/** Last durable permission preset identity (`permission/preset`), if any.
 *  Registered by the harness permission preset service, never manufactured
 *  by the TUI. */
export function foldPermissionPreset(events) {
    let preset;
    for (const event of events) {
        if (event.type === 'permission/preset') {
            const value = event.data.preset;
            if (typeof value === 'string')
                preset = value;
        }
    }
    return preset;
}
/** Effective sandbox of a mode target: its explicit atom, else the folded
 *  session value, else the sandbox-policy service default. Unknown means the
 *  bundle is not safely mappable. */
export function effectiveSandboxForMode(ctx, spec, events) {
    if (spec.sandbox !== undefined)
        return spec.sandbox;
    let folded;
    for (const event of events) {
        if (event.type === 'sandbox/mode') {
            folded = event.data.mode;
        }
    }
    if (folded === 'read-only' || folded === 'workspace-write' || folded === 'danger-full-access')
        return folded;
    try {
        const sandbox = ctx.get('sandboxPolicy');
        const value = sandbox?.defaultMode;
        if (value === 'read-only' || value === 'workspace-write' || value === 'danger-full-access')
            return value;
    }
    catch {
        // Optional service; an unknown default means the target is not safely
        // mappable.
    }
    return undefined;
}
/** Effective approval policy of a mode target: its explicit atom, else the
 *  folded session value, else the approval service configuration. */
export function effectiveApprovalForMode(ctx, spec, session) {
    if (spec.approval !== undefined)
        return spec.approval;
    let folded;
    for (const event of snapshotLiveSessionEvents(session)) {
        if (event.type === 'approval/policy') {
            folded = event.data.policy;
        }
    }
    if (folded === 'ask' || folded === 'never')
        return folded;
    try {
        const approval = ctx.get('approval');
        const value = approval?.effectivePolicy?.(session) ?? approval?.config?.policy;
        if (value === 'ask' || value === 'never')
            return value;
    }
    catch {
        // Optional service; an unknown default means the target is not safely
        // mappable.
    }
    return undefined;
}
/**
 * Durable `permission/preset` identity: readback, canonical mapping, the
 * official switch path, and the pre-plan identity memory. Construction is
 * inert — it acquires nothing and subscribes to nothing.
 */
export function createPermissionIdentity(ctx, deps) {
    /** Durable preset identity captured when plan mode starts; an implicit plan
     *  exit prefers returning to it over the canonical bundle of the restored
     *  atoms, so the user lands back on their own preset (e.g. a third-party
     *  `auto`), not on a look-alike static mode. */
    const prePlanIdentity = new WeakMap();
    const fold = (session) => foldPermissionPreset(snapshotLiveSessionEvents(session));
    const canonicalForMode = (spec, session) => {
        const sandbox = effectiveSandboxForMode(ctx, spec, snapshotLiveSessionEvents(session));
        const approval = effectiveApprovalForMode(ctx, spec, session);
        if (sandbox === undefined || approval === undefined)
            return undefined;
        return deps.roster.canonicalFor(sandbox, approval);
    };
    const targetConfirmed = (target, session) => {
        if (fold(session) === target)
            return true;
        try {
            const snapshot = deps.roster.readSnapshot(deps.agent());
            if (snapshot !== undefined
                && snapshot.current?.kind === 'preset'
                && snapshot.current.value === target) {
                return true;
            }
        }
        catch {
            // The registry may be unmounted mid-switch; the fold check above
            // remains authoritative for the durable identity.
        }
        return false;
    };
    const confirmTarget = async (target, session, timeoutMs) => {
        const deadline = Date.now() + timeoutMs;
        while (Date.now() < deadline) {
            if (session !== deps.agent().session)
                return false;
            if (targetConfirmed(target, session))
                return true;
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        ctx.logger.warn(`dsh-tui: permission mode "${target}" was not confirmed by permissionPresets.current()/permission/preset`);
        deps.notify(t('mode-permission-unconfirmed'), { color: 'warning' });
        return false;
    };
    const apply = async (target) => {
        if (!isCommandCompletionToken(target)) {
            ctx.logger.warn(`dsh-tui: permission mode "${target}" skipped because its identity is not a safe command token`);
            return false;
        }
        const agent = deps.agent();
        const session = agent.session;
        if (targetConfirmed(target, session))
            return true;
        let registered = false;
        try {
            registered = deps.commandService?.find(agent, 'permission') !== undefined;
        }
        catch {
            registered = false;
        }
        if (!registered) {
            // The same handler the official command drives; the TUI never appends
            // a permission event itself.
            let service;
            try {
                service = ctx.get('permissionPresets');
            }
            catch {
                service = undefined;
            }
            const runtime = permissionPresetRuntime(service);
            if (runtime !== undefined && typeof runtime.set === 'function') {
                try {
                    runtime.set(session, target);
                }
                catch (error) {
                    ctx.logger.warn(`dsh-tui: permission mode "${target}" could not be applied by the permissionPresets service: ${error instanceof Error ? error.message : String(error)}`);
                    deps.notify(t('mode-permission-invoke-failed'), { color: 'warning' });
                    return false;
                }
                return await confirmTarget(target, session, 2000);
            }
            ctx.logger.warn(`dsh-tui: permission mode "${target}" skipped because /permission is not registered`);
            deps.notify(t('mode-permission-unregistered'), { color: 'warning' });
            return false;
        }
        const result = await deps.executeRegistryCommand('permission', ` ${target}`);
        if (session !== deps.agent().session)
            return false;
        if (result === undefined) {
            ctx.logger.warn(`dsh-tui: permission mode "${target}" could not invoke /permission`);
            deps.notify(t('mode-permission-invoke-failed'), { color: 'warning' });
            return false;
        }
        let availability = 'unavailable';
        try {
            availability = deps.roster.readSnapshot(deps.agent()) === undefined ? 'unavailable' : 'runtime';
        }
        catch {
            // keep the default (fail-closed short grace)
        }
        return await confirmTarget(target, session, availability === 'runtime' ? 2000 : 300);
    };
    const canonicalizeForMode = async (spec, session) => {
        // Static modes own a canonical permission identity. Leaving any OTHER
        // durable identity behind (third-party preset OR a stale canonical, e.g.
        // plan left `read-only` while atoms were restored to workspace-write)
        // would make a static mode appear selected only because its
        // sandbox/approval bundle happens to match, and would let the durable
        // identity lie about the real policy.
        const current = fold(session);
        if (current === undefined || current === PERMISSION_PRESET_CUSTOM)
            return true;
        const canonical = canonicalForMode(spec, session);
        if (canonical === undefined) {
            ctx.logger.warn(`dsh-tui: static mode "${spec.id}" cannot safely clear permission identity "${current}"`);
            deps.notify(t('mode-permission-no-canonical', { name: modeDisplayName(spec) }), { color: 'warning' });
            return false;
        }
        if (canonical === current)
            return true;
        return apply(canonical);
    };
    const rememberPrePlanIdentity = (session) => {
        // The runtime registry must still recognize the identity as current: a
        // drifted knob combination reads back as custom and must fall back to the
        // canonical bundle of the restored atoms.
        const identity = fold(session);
        if (identity === undefined || identity === PERMISSION_PRESET_CUSTOM) {
            prePlanIdentity.delete(session);
            return;
        }
        try {
            const snapshot = deps.roster.readSnapshot(deps.agent());
            if (snapshot === undefined) {
                prePlanIdentity.delete(session);
                return;
            }
            if (snapshot.current?.kind !== 'preset' || snapshot.current.value !== identity) {
                prePlanIdentity.delete(session);
                return;
            }
            if (!snapshot.options.some(option => option.value === identity)) {
                prePlanIdentity.delete(session);
                return;
            }
            prePlanIdentity.set(session, identity);
        }
        catch {
            prePlanIdentity.delete(session);
        }
    };
    return {
        foldPermissionPreset: fold,
        canonicalPermissionForMode: canonicalForMode,
        permissionTargetConfirmed: (target, session) => targetConfirmed(target, session),
        confirmPermissionTarget: (target, session, timeoutMs) => confirmTarget(target, session, timeoutMs),
        applyPermissionIdentity: apply,
        canonicalizeForMode,
        rememberPrePlanIdentity,
        prePlanPermissionIdentity: session => prePlanIdentity.get(session),
        forgetPrePlanIdentity: session => { prePlanIdentity.delete(session); },
        runPermissionPreset: name => apply(name.trim()),
    };
}

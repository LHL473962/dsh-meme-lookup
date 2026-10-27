/** Provider-neutral full-screen scene registry for terminal front doors. */
import { Service } from '@deepseek-ai/cordis';
import { activationFiber, bindCallerEffect, compositionRoot, concreteService, requirePluginCaller } from './host-access.js';
import { componentIdentityOf } from './component-identity.js';
import { assertCapabilityShadowPolicy, } from '../adapter/kernel/runtime.js';
import { adapterRuntimeFor } from '../adapter/kernel/runtime-context.js';
export const name = 'dsh-tui-scenes';
/**
 * Small host-only registry; command execution remains owned by dsh-commands.
 *
 * A plugin registers a scene once (`ctx.tuiScenes.register(...)`, keep the
 * dispose) and opens it from anywhere host-side — typically its own
 * dsh-commands handler: `ctx.tuiScenes.open('my-scene')` plus a silent
 * `success` result, so the conversation stays untouched while the scene
 * takes the whole terminal the way the trajectory scene does.
 */
export class TuiSceneRuntime extends Service {
    constructor(ctx) {
        super(ctx, 'tuiScenes');
        compositionRoot(ctx);
        const runtime = this;
        const state = {
            scenes: new Map(),
            owners: new Map(),
            listeners: new Set(),
            current: undefined,
            host: undefined,
            logger: ctx.logger,
            runtime: adapterRuntimeFor(ctx),
        };
        state.host = Object.freeze({
            get active() {
                return sceneStateFor(runtime).current;
            },
            register(descriptor) {
                const state = sceneStateFor(runtime);
                const id = descriptor.id.trim().toLowerCase();
                if (!/^[a-z][a-z0-9_-]*$/u.test(id))
                    throw new TypeError(`invalid TUI scene id: ${descriptor.id}`);
                if (state.scenes.has(id))
                    throw new Error(`TUI scene "${id}" is already registered`);
                const normalized = Object.freeze({ ...descriptor, id });
                state.scenes.set(id, normalized);
                return () => {
                    if (state.scenes.get(id) !== normalized)
                        return;
                    state.scenes.delete(id);
                    state.owners.delete(id);
                    if (state.current === normalized) {
                        state.current = undefined;
                        notifyScenes(state);
                    }
                };
            },
            list() {
                return [...sceneStateFor(runtime).scenes.values()];
            },
            open(id) {
                return openScene(runtime, id);
            },
            close() {
                closeScene(runtime);
            },
            subscribe(listener) {
                return subscribeScenes(runtime, listener);
            },
        });
        sceneStates.set(this, state);
    }
    /**
     * Register a full-screen scene; returns the dispose function (caller
     * scopes it with `ctx.effect`). The optional trailing `identity` (the
     * plugin's own ctx) only feeds the effect ledger's pluginId — omitting it
     * records `undeclared` (C-060).
     */
    register(descriptor, identity) {
        assertCapabilityShadowPolicy('host.scenes.register', sceneStateFor(this).runtime.mode, sceneStateFor(this).runtime.slices);
        const state = sceneStateFor(this);
        const caller = requirePluginCaller(this.ctx, 'tuiScenes.register', this);
        const activationOwner = activationFiber(caller);
        if (activationOwner === undefined)
            throw new Error('dsh-tui: tuiScenes.register requires a live activation');
        const callerIdentity = componentIdentityOf(caller);
        const suppliedIdentity = identity === undefined ? callerIdentity : componentIdentityOf(identity);
        if (identity !== undefined && callerIdentity !== undefined && suppliedIdentity !== callerIdentity) {
            throw new Error('dsh-tui: tuiScenes.register identity belongs to another activation');
        }
        const id = descriptor.id.trim().toLowerCase();
        if (!/^[a-z][a-z0-9_-]*$/u.test(id))
            throw new TypeError(`invalid TUI scene id: ${descriptor.id}`);
        if (state.scenes.has(id)) {
            caller.get('tuiEffectLedger')?.record({
                operation: 'create',
                resource: { kind: 'scene', id },
                result: 'failed',
                errorCode: 'DUPLICATE_CONTRIBUTION_ID',
            }, identity);
            throw new Error(`TUI scene "${id}" is already registered`);
        }
        const normalized = Object.freeze({ ...descriptor, id });
        state.scenes.set(id, normalized);
        state.owners.set(id, activationOwner);
        caller.get('tuiEffectLedger')?.record({ operation: 'create', resource: { kind: 'scene', id }, result: 'applied' }, identity);
        const dispose = () => {
            if (state.scenes.get(id) !== normalized)
                return;
            state.scenes.delete(id);
            state.owners.delete(id);
            caller.get('tuiEffectLedger')?.record({ operation: 'release', resource: { kind: 'scene', id }, result: 'applied' }, identity);
            // Disposing the open scene must not strand the user on a dead screen.
            if (state.current === normalized) {
                state.current = undefined;
                notifyScenes(state, activationOwner);
            }
        };
        bindCallerEffect(caller, dispose);
        return dispose;
    }
    /**
     * Swap the conversation for the named scene. Returns false (and warns)
     * when no plugin registered that id — a mistyped id must fail visibly in
     * the log, not silently do nothing in the UI.
     */
    open(id) {
        assertCapabilityShadowPolicy('host.scenes.open', sceneStateFor(this).runtime.mode, sceneStateFor(this).runtime.slices);
        const caller = requirePluginCaller(this.ctx, 'tuiScenes.open', this);
        const owner = activationFiber(caller);
        return owner === undefined ? false : openScene(this, id, caller, owner);
    }
    close() {
        assertCapabilityShadowPolicy('host.scenes.close', sceneStateFor(this).runtime.mode, sceneStateFor(this).runtime.slices);
        const caller = requirePluginCaller(this.ctx, 'tuiScenes.close', this);
        const owner = activationFiber(caller);
        if (owner !== undefined)
            closeScene(this, caller, owner);
    }
    /** The scene currently replacing the conversation, if any. */
    get active() {
        assertCapabilityShadowPolicy('host.scenes.active', sceneStateFor(this).runtime.mode, sceneStateFor(this).runtime.slices);
        const caller = requirePluginCaller(this.ctx, 'tuiScenes.active', this);
        const owner = activationFiber(caller);
        const state = sceneStateFor(this);
        return owner !== undefined && state.current !== undefined && state.owners.get(state.current.id) === owner
            ? state.current
            : undefined;
    }
    /** UI-side change feed: fired after every open/close/dispose transition. */
    subscribe(listener) {
        assertCapabilityShadowPolicy('host.scenes.subscribe', sceneStateFor(this).runtime.mode, sceneStateFor(this).runtime.slices);
        const caller = requirePluginCaller(this.ctx, 'tuiScenes.subscribe', this);
        const owner = activationFiber(caller);
        if (owner === undefined)
            return () => { };
        const dispose = subscribeScenes(this, listener, owner);
        bindCallerEffect(caller, dispose);
        return dispose;
    }
}
const sceneStates = new WeakMap();
function sceneStateFor(runtime) {
    const state = sceneStates.get(concreteService(runtime));
    if (state === undefined)
        throw new Error('tuiScenes host state is unavailable');
    return state;
}
function openScene(runtime, id, caller, owner) {
    const state = sceneStateFor(runtime);
    const scene = state.scenes.get(id.trim().toLowerCase());
    if (scene === undefined) {
        ;
        (caller?.logger ?? state.logger).warn(`dsh-tui: no TUI scene registered as "${id}"`);
        return false;
    }
    if (owner !== undefined && state.owners.get(scene.id) !== owner) {
        caller?.logger.warn(`dsh-tui: scene "${scene.id}" belongs to another activation`);
        return false;
    }
    if (scene === state.current)
        return true;
    const previousOwner = state.current === undefined ? undefined : state.owners.get(state.current.id);
    state.current = scene;
    notifyScenes(state, previousOwner);
    return true;
}
function closeScene(runtime, caller, owner) {
    const state = sceneStateFor(runtime);
    if (state.current === undefined)
        return;
    if (owner !== undefined && state.owners.get(state.current.id) !== owner) {
        caller?.logger.warn(`dsh-tui: scene "${state.current.id}" belongs to another activation`);
        return;
    }
    const previousOwner = state.owners.get(state.current.id);
    state.current = undefined;
    notifyScenes(state, previousOwner);
}
function subscribeScenes(runtime, listener, owner) {
    const state = sceneStateFor(runtime);
    const entry = { owner, listener };
    state.listeners.add(entry);
    return () => {
        state.listeners.delete(entry);
    };
}
function notifyScenes(state, previousOwner) {
    const currentOwner = state.current === undefined ? undefined : state.owners.get(state.current.id);
    for (const entry of state.listeners) {
        if (entry.owner !== undefined && entry.owner !== currentOwner && entry.owner !== previousOwner)
            continue;
        entry.listener();
    }
}
export function getHostSceneRuntime(runtime) {
    if (runtime === undefined)
        return undefined;
    try {
        return sceneStateFor(runtime).host ?? undefined;
    }
    catch {
        return undefined;
    }
}
export default TuiSceneRuntime;

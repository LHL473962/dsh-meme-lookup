import { AsyncLocalStorage } from 'node:async_hooks';
import { Context, Fiber } from '@deepseek-ai/cordis';
import { logForDebugging } from '../utils/debug.js';
/**
 * Recover the concrete Cordis service for host-only adapters.
 *
 * `ctx.get()` returns a traceable proxy even to the root context. Public
 * services deliberately do not expose their host controls on that proxy, so
 * the host accessor functions keep their state in WeakMaps keyed by the
 * concrete service instance and unwrap only here.
 */
const CORDIS_ORIGINAL = Symbol.for('cordis.original');
const compositionRoots = new WeakMap();
const trackedRoots = new WeakSet();
const trustedFibers = new WeakSet();
const canonicalContexts = new WeakMap();
const rootFibers = new WeakMap();
const fiberRoots = new WeakMap();
const fiberEffects = new WeakMap();
const contextFibers = new WeakMap();
const restartingFibers = new WeakSet();
const restartPendingFibers = new WeakSet();
const executingFibers = new WeakSet();
const wrappedRunners = new WeakSet();
const wrappedRestarts = new WeakSet();
const canonicalRunners = new WeakMap();
const activationGenerations = new WeakMap();
const activationTokens = new WeakMap();
const activationStorage = new AsyncLocalStorage();
const hostCapabilityStorage = new AsyncLocalStorage();
const guardedRootFibers = new WeakSet();
const guardedRootRegistries = new WeakSet();
const guardedRootEvents = new WeakSet();
const guardedRootReflects = new WeakSet();
installGlobalFiberInstrumentation();
/**
 * Cordis contexts are prototype-scoped objects. A plugin can therefore make
 * `ctx.extend({ fiber: fake })`, which passes a shape-only check while making
 * cleanup land on an attacker-controlled effect object. Track the fibers
 * Cordis actually publishes from the composition root and require callers to
 * use one of those identities. The root listener is global so child context
 * filters cannot hide lifecycle notifications from this guard.
 */
function rememberFiber(value, root) {
    if (typeof value !== 'object' || value === null)
        return;
    try {
        const fiber = value;
        const owner = fiber.ctx;
        if (!Context.is(owner))
            return;
        // The internal/plugin event carries Cordis's wrapper Fiber, while the
        // context exposes the underlying instance. Normalize both to that stable
        // instance before recording trust and lifecycle state.
        const actual = owner.fiber;
        if (typeof actual !== 'object' || actual === null || actual.ctx !== owner)
            return;
        if (root !== undefined && !fiberBelongsToComposition(actual, root))
            return;
        const canonical = canonicalContexts.get(actual);
        if (canonical !== undefined && canonical !== owner)
            return;
        const knownRoot = fiberRoots.get(actual);
        if (knownRoot !== undefined && root !== undefined && knownRoot !== root)
            return;
        if (canonical !== undefined && canonical.fiber !== actual)
            return;
        canonicalContexts.set(actual, canonical ?? owner);
        contextFibers.set(owner, actual);
        trustedFibers.add(actual);
        if (root !== undefined)
            fiberRoots.set(actual, root);
        activationGenerations.set(actual, activationGenerations.get(actual) ?? 0);
        const runner = actual._runner;
        const knownRunner = canonicalRunners.get(actual);
        if (knownRunner !== undefined && knownRunner !== runner)
            return;
        if (runner !== undefined)
            canonicalRunners.set(actual, runner);
        if (!fiberEffects.has(actual)) {
            const effect = actual.effect;
            if (typeof effect === 'function') {
                fiberEffects.set(actual, (execute) => Reflect.apply(effect, actual, [execute]));
            }
        }
        // Cordis reuses the same activation context across a restart and emits
        // LOADING before its private runner executes the new callback. Keep the
        // old activation rejected through that window, but allow synchronous
        // registrations made by the callback currently being executed.
        if (runner !== undefined && typeof runner.execute === 'function' && !wrappedRunners.has(runner)) {
            const execute = runner.execute;
            wrappedRunners.add(runner);
            Object.defineProperty(runner, 'execute', {
                configurable: false,
                writable: false,
                value: function (...args) {
                    return runActivation(actual, execute, this, args);
                },
            });
        }
        const restart = actual.restart;
        if (typeof restart === 'function' && !wrappedRestarts.has(actual)) {
            wrappedRestarts.add(actual);
            Object.defineProperty(actual, 'restart', {
                configurable: false,
                writable: false,
                value: function (...args) {
                    const root = fiberRoots.get(actual);
                    if (root !== undefined && rootFibers.get(root) === actual) {
                        rejectRootCapability(root, 'root.fiber.restart');
                    }
                    invalidateActivation(actual);
                    restartPendingFibers.add(actual);
                    restartingFibers.add(actual);
                    const clear = () => {
                        restartPendingFibers.delete(actual);
                        restartingFibers.delete(actual);
                    };
                    try {
                        const result = Reflect.apply(restart, this, args);
                        if (result !== null && typeof result === 'object' && 'then' in result) {
                            return Promise.resolve(result).finally(clear);
                        }
                        clear();
                        return result;
                    }
                    catch (error) {
                        clear();
                        throw error;
                    }
                },
            });
        }
        return actual;
    }
    catch {
        // Untrusted values are simply not admitted to the identity set.
    }
}
function trackCompositionRoot(root) {
    let rootFiber;
    try {
        const value = root.fiber;
        if (typeof value === 'object' && value !== null) {
            rootFiber = value;
            rootFibers.set(root, value);
            fiberRoots.set(value, root);
        }
    }
    catch {
        // Fall through to the event-listener attempt below.
    }
    rememberFiber(rootFiber, root);
    if (trackedRoots.has(root))
        return;
    trackedRoots.add(root);
    try {
        root.on('internal/plugin', (fiber) => rememberFiber(fiber, root), { global: true });
        root.on('internal/status', (fiber) => {
            const actual = rememberFiber(fiber, root);
            if (actual === undefined)
                return;
            const state = actual.state;
            // Cordis uses 5 for UNLOADING. The wrapper returned by ctx.plugin()
            // reports this transition while the underlying context fiber may still
            // expose ACTIVE, so track the transition explicitly. Keep the marker
            // through LOADING: Cordis awaits a microtask before invoking the new
            // callback, leaving a stale-context window otherwise. The runner wrapper
            // above temporarily admits synchronous calls from that new callback.
            if (state === 5 || state === 3 || state === 4)
                restartingFibers.add(actual);
            else if (state === 2 && !restartPendingFibers.has(actual))
                restartingFibers.delete(actual);
        }, { global: true });
    }
    catch {
        // Minimal embedders may expose Context without an event helper. The
        // shape/lifecycle checks below remain as a conservative fallback.
    }
    if (!deferredGuardRoots.has(root))
        guardRootCapabilities(root);
}
/** Roots whose capability guard waits for their composition (below). */
const deferredGuardRoots = new WeakSet();
/**
 * Hold the root-capability guard back on `root` until the returned release
 * runs. The entry mounts the TUI before composing the profile into the same
 * root, and DSH's plugins use root capabilities while they activate, which
 * the guard would refuse. Fiber tracking starts at once either way.
 */
export function deferRootCapabilityGuard(root) {
    // Too late: a root seen undeferred already carries the guard for good.
    if (trackedRoots.has(root))
        logForDebugging('dsh-tui: the root-capability guard was deferred after the composition root was resolved; it is already installed');
    deferredGuardRoots.add(root);
    return () => releaseDeferredGuard(root);
}
function releaseDeferredGuard(root) {
    armedGuardRoots.delete(root);
    if (!deferredGuardRoots.delete(root))
        return;
    if (trackedRoots.has(root))
        guardRootCapabilities(root);
}
/** Deferred roots whose guard the first TUI row activation installs (below). */
const armedGuardRoots = new WeakSet();
/**
 * The composition of a deferred root starts: the guard now arrives with the
 * first TUI row's activation, as on the `dsh --profile` path, so every row
 * after it (third-party ones included) is guarded. The release still installs
 * it once the composition settles if no TUI row activated.
 */
export function armRootCapabilityGuard(root) {
    if (deferredGuardRoots.has(root))
        armedGuardRoots.add(root);
}
/** A plugin activation of `root` (not the root's own, not host code) is
 * resolving its composition through the TUI's host code: a TUI row. */
function noteTuiRowActivation(root) {
    if (!armedGuardRoots.has(root))
        return;
    if (hostCapabilityStorage.getStore() === true)
        return;
    const token = activationStorage.getStore();
    const rootFiber = rootFibers.get(root);
    if (token === undefined || token.root !== root || rootFiber === token.fiber)
        return;
    releaseDeferredGuard(root);
}
function invalidateActivation(fiber) {
    activationGenerations.set(fiber, (activationGenerations.get(fiber) ?? 0) + 1);
    activationTokens.delete(fiber);
}
/** Carry an activation token through every async continuation created by a
 * Cordis plugin callback. The fallback context/root walk covers compositions
 * that do not mount a dsh-tui service and therefore have not been admitted to
 * the host's canonical Fiber maps yet. */
function runActivation(fiber, execute, receiver, args) {
    const context = canonicalContexts.get(fiber) ?? fiber.ctx;
    const root = fiberRoots.get(fiber) ?? findFiberRoot(fiber);
    if (!Context.is(context) || !Context.is(root)) {
        return Reflect.apply(execute, receiver, args);
    }
    const generation = (activationGenerations.get(fiber) ?? 0) + 1;
    activationGenerations.set(fiber, generation);
    const token = { fiber, context, root, generation };
    activationTokens.set(fiber, token);
    // Once the new callback starts, the old generation is already invalidated.
    // Keep the restart marker until the public restart promise settles;
    // assertLiveContext admits only this current token while it is held.
    executingFibers.add(fiber);
    return activationStorage.run(token, () => {
        try {
            return Reflect.apply(execute, receiver, args);
        }
        finally {
            executingFibers.delete(fiber);
        }
    });
}
function findFiberRoot(value) {
    let fiber = value;
    const seen = new Set();
    for (let depth = 0; depth < 64; depth += 1) {
        if (typeof fiber !== 'object' || fiber === null || seen.has(fiber))
            return undefined;
        seen.add(fiber);
        try {
            if (fiber.runtime === null) {
                return Context.is(fiber.ctx) ? fiber.ctx : undefined;
            }
            const parent = fiber.parent;
            if (!Context.is(parent))
                return undefined;
            fiber = parent.fiber;
        }
        catch {
            return undefined;
        }
    }
    return undefined;
}
/** Patch Cordis once so plugin callbacks in compositions outside the TUI
 * host still carry an ALS token when they call a guarded root object. */
function installGlobalFiberInstrumentation() {
    const prototype = Fiber.prototype;
    const original = prototype._execute;
    if (typeof original !== 'function')
        return;
    Object.defineProperty(prototype, '_execute', {
        configurable: true,
        writable: true,
        value: function (runner) {
            if (runner === this._runner && runner !== null && typeof runner === 'object'
                && typeof runner.execute === 'function' && !wrappedRunners.has(runner)) {
                const execute = runner.execute;
                const fiber = this;
                wrappedRunners.add(runner);
                Object.defineProperty(runner, 'execute', {
                    configurable: false,
                    writable: false,
                    value: function (...args) {
                        return runActivation(fiber, execute, this, args);
                    },
                });
            }
            return Reflect.apply(original, this, [runner]);
        },
    });
}
/** The event bus is public and can emit `internal/plugin` manually. Admit a
 * Fiber only when Cordis has already placed that exact identity in this
 * composition's runtime registry (or it is the composition root itself). */
function fiberBelongsToComposition(fiber, root) {
    if (rootFibers.get(root) === fiber)
        return true;
    try {
        const registry = concreteService(root.registry);
        const internal = registry._internal;
        if (!(internal instanceof Map))
            return false;
        for (const runtime of internal.values()) {
            const fibers = runtime.fibers;
            if (fibers === null || fibers === undefined || typeof fibers[Symbol.iterator] !== 'function')
                continue;
            for (const candidate of fibers) {
                if (candidate === fiber)
                    return true;
            }
        }
    }
    catch {
        // A minimal embedder may not expose registry internals. Fail closed.
    }
    return false;
}
function currentActivationIsPlugin(root) {
    if (hostCapabilityStorage.getStore() === true)
        return false;
    const token = activationStorage.getStore();
    if (token === undefined)
        return false;
    if (rootFibers.get(token.root) === token.fiber)
        return false;
    // Both active and stale plugin chains are denied. Stale chains will also be
    // rejected by the mediated APIs through their generation check.
    return true;
}
/** Host-only escape hatch for process teardown paths that intentionally act on
 * the composition root while running from a host plugin callback. This module
 * is internal and is not part of the public plugin package surface. */
export function withHostRootCapability(callback) {
    return hostCapabilityStorage.run(true, callback);
}
function rejectRootCapability(root, capability) {
    if (currentActivationIsPlugin(root)) {
        throw new Error(`dsh-tui: ${capability} is unavailable from a plugin activation`);
    }
}
function callContextOf(receiver) {
    try {
        const context = receiver.ctx;
        return Context.is(context) ? context : undefined;
    }
    catch {
        return undefined;
    }
}
function guardRootCapabilities(root) {
    const rootFiber = rootFibers.get(root);
    if (rootFiber !== undefined && !guardedRootFibers.has(rootFiber)) {
        guardedRootFibers.add(rootFiber);
        guardFiberMethod(rootFiber, 'effect', root, 'root.effect');
        guardFiberMethod(rootFiber, 'restart', root, 'root.fiber.restart');
        guardFiberMethod(rootFiber, 'dispose', root, 'root.fiber.dispose');
        guardFiberMethod(rootFiber, 'update', root, 'root.fiber.update');
    }
    try {
        const registry = concreteService(root.registry);
        if (!guardedRootRegistries.has(registry)) {
            guardedRootRegistries.add(registry);
            guardServiceMethod(registry, 'inject', root, 'root.inject', true);
            guardServiceMethod(registry, 'plugin', root, 'root.plugin', true);
            guardServiceMethod(registry, 'delete', root, 'root.registry.delete', true);
            for (const method of ['resolve', 'get', 'has', 'keys', 'values', 'entries', 'forEach']) {
                guardServiceMethod(registry, method, root, `root.registry.${method}`, true);
            }
        }
    }
    catch {
        // A minimal embedder may not expose the registry service object.
    }
    try {
        const events = concreteService(root.events);
        if (!guardedRootEvents.has(events)) {
            guardedRootEvents.add(events);
            for (const method of ['on', 'once', 'emit', 'parallel', 'serial', 'bail', 'waterfall', 'register', 'unregister', 'dispatch']) {
                guardServiceMethod(events, method, root, `root.events.${method}`, true);
            }
        }
    }
    catch {
        // Event guards are supplemental; Fiber admission remains fail-closed.
    }
    try {
        const reflect = concreteService(root.reflect);
        if (!guardedRootReflects.has(reflect)) {
            guardedRootReflects.add(reflect);
            guardServiceMethod(reflect, 'set', root, 'root.reflect.set', true);
        }
    }
    catch {
        // Fall through when a minimal embedder omits reflection internals.
    }
    admitRootProjectionRegistrations(root);
}
const projectionRegistryRoots = new WeakSet();
const guardedProjectionRegistries = new WeakSet();
/**
 * `sessionProjections.register` hangs its disposer on the receiver's context
 * (the registry's documented ownership: the calling fiber). DSH's agent-team
 * service reaches it through `ctx.root`, which lands that effect on the root
 * fiber and the guard above refuses it. Admit that one call with host
 * capability, so the registration sits where it would without the guard and
 * the caller's disposer releases it in the caller's own order; the plugin's
 * unload releases one it leaves behind ({@link releaseAfterUnload}). The
 * root stays closed to everything else.
 */
function admitRootProjectionRegistrations(root) {
    if (projectionRegistryRoots.has(root))
        return;
    projectionRegistryRoots.add(root);
    const wrap = () => withHostRootCapability(() => {
        let registry;
        try {
            const service = root.sessionProjections;
            if (typeof service !== 'object' || service === null)
                return;
            registry = concreteService(service);
        }
        catch {
            return;
        }
        if (guardedProjectionRegistries.has(registry))
            return;
        const original = Reflect.get(registry, 'register');
        if (typeof original !== 'function')
            return;
        guardedProjectionRegistries.add(registry);
        // Configurable: Cordis's traceable proxy rebinds methods, which a frozen
        // property would forbid. Replacing it only restores the refused path.
        Object.defineProperty(registry, 'register', {
            configurable: true,
            writable: false,
            value: function (...args) {
                // Through `ctx.root` the receiver is a root-derived context on the
                // root fiber: that is the effect the guard would refuse.
                if (callContextOf(this)?.fiber !== rootFibers.get(root) || !currentActivationIsPlugin(root)) {
                    return Reflect.apply(original, this, args);
                }
                const token = activationStorage.getStore();
                assertLiveContext(token.context, 'sessionProjections.register');
                // On the root fiber, as without the guard: the caller orders the
                // disposer itself (DSH's TeamService unregisters after its async
                // runtime teardown, which still reads the key). On the caller's fiber
                // it would be a sibling effect, and Cordis unloads siblings at once.
                const dispose = withHostRootCapability(() => Reflect.apply(original, this, args));
                return releaseAfterUnload(root, token.fiber, dispose);
            },
        });
    });
    wrap();
    try {
        // The registry may mount after the guard (the profile composes later).
        withHostRootCapability(() => root.on('internal/service', ((name) => {
            if (name === 'sessionProjections')
                wrap();
        }), { global: true }));
    }
    catch {
        // A minimal embedder without the event helper keeps the plain guard.
    }
}
/**
 * A root registration a plugin made through {@link admitRootProjectionRegistrations}
 * still dies with that plugin: if the plugin never disposes it, it goes once
 * the plugin's fiber has finished unloading (every effect settled, async
 * teardown included), whether the fiber reloads or not.
 * @returns the disposer handed to the plugin; calling it also drops the watch.
 */
function releaseAfterUnload(root, fiber, dispose) {
    let unwatch;
    const release = () => {
        unwatch?.();
        unwatch = undefined;
        dispose();
    };
    try {
        unwatch = withHostRootCapability(() => root.on('internal/status', (changed, oldState) => {
            // Cordis uses 5 for UNLOADING (see rememberFiber). The event carries
            // either the activation's fiber or the wrapper normalized to it.
            if (oldState === 5 && (changed === fiber || rememberFiber(changed, root) === fiber))
                release();
        }, { global: true }));
    }
    catch {
        // Without the event helper only the plugin's own disposer releases it.
    }
    return release;
}
function guardFiberMethod(target, method, root, capability) {
    const descriptor = Reflect.getOwnPropertyDescriptor(target, method);
    if (descriptor?.configurable === false)
        return;
    const original = Reflect.get(target, method);
    if (typeof original !== 'function')
        return;
    Object.defineProperty(target, method, {
        configurable: false,
        writable: false,
        value: function (...args) {
            rejectRootCapability(root, capability);
            return Reflect.apply(original, this, args);
        },
    });
}
function guardServiceMethod(target, method, root, capability, rootOnly) {
    const original = Reflect.get(target, method);
    if (typeof original !== 'function')
        return;
    Object.defineProperty(target, method, {
        configurable: false,
        writable: false,
        value: function (...args) {
            const callContext = callContextOf(this);
            if (!rootOnly || callContext === root)
                rejectRootCapability(root, capability);
            return Reflect.apply(original, this, args);
        },
    });
}
export function concreteService(service) {
    let current = service;
    const seen = new WeakSet();
    while (!seen.has(current)) {
        seen.add(current);
        let original;
        try {
            original = Reflect.get(current, CORDIS_ORIGINAL);
        }
        catch {
            break;
        }
        if (original === null || typeof original !== 'object' || original === current)
            break;
        current = original;
    }
    return current;
}
/** Bind a host-side disposer to the caller's authenticated Cordis activation.
 * A failed registration immediately rolls back the owned contribution. */
export function bindCallerEffect(ctx, disposer, onRegistered) {
    let effect;
    try {
        const fiber = assertLiveContext(ctx, 'effect');
        effect = fiberEffects.get(fiber);
    }
    catch {
        // An untrusted or inactive caller cannot use a compatibility fallback to
        // attach cleanup to a writable context shadow.
        disposer();
        return false;
    }
    if (effect === undefined) {
        disposer();
        return false;
    }
    try {
        const cleanup = effect(() => disposer);
        if (typeof cleanup === 'function') {
            onRegistered?.(cleanup);
        }
        return true;
    }
    catch {
        // Registration and the mutation it owns must be atomic. If the fiber has
        // entered teardown, immediately undo the caller's contribution.
        disposer();
        return false;
    }
}
/** Return the stable, authenticated Fiber identity for an activation. */
export function activationFiber(ctx) {
    try {
        return assertLiveContext(ctx, 'activation');
    }
    catch {
        return undefined;
    }
}
/** Return Cordis's canonical activation context, never a writable context
 * shadow. Explicit owner arguments use this before resolving host services. */
export function activationContext(ctx) {
    const fiber = activationFiber(ctx);
    if (fiber === undefined)
        return undefined;
    return canonicalContexts.get(fiber);
}
/** Resolve a service's composition root once.  Service methods are invoked
 * through caller-bound Cordis proxies; keeping this root in host state avoids
 * resolving sibling services through an attacker-provided caller shadow.
 * Also the first TUI row's activation signal for an armed deferred guard. */
export function compositionRoot(ctx) {
    const root = resolveCompositionRoot(ctx);
    noteTuiRowActivation(root);
    return root;
}
function resolveCompositionRoot(ctx) {
    try {
        const knownFiber = contextFibers.get(ctx);
        const trustedRoot = knownFiber === undefined ? undefined : fiberRoots.get(knownFiber);
        if (trustedRoot !== undefined) {
            compositionRoots.set(ctx, trustedRoot);
            return trustedRoot;
        }
        const directFiber = ctx.fiber;
        const directRoot = typeof directFiber === 'object' && directFiber !== null
            ? fiberRoots.get(directFiber)
            : undefined;
        if (directRoot !== undefined) {
            contextFibers.set(ctx, directFiber);
            compositionRoots.set(ctx, directRoot);
            return directRoot;
        }
        const cached = compositionRoots.get(ctx);
        if (cached !== undefined) {
            trackCompositionRoot(cached);
            return cached;
        }
    }
    catch {
        // Fall through to the fiber walk for degraded contexts.
    }
    try {
        let current = ctx;
        const seen = new Set();
        for (let depth = 0; depth < 64; depth += 1) {
            const currentFiber = current.fiber;
            if (typeof currentFiber !== 'object' || currentFiber === null || seen.has(currentFiber))
                break;
            seen.add(currentFiber);
            const cached = compositionRoots.get(current);
            if (cached !== undefined) {
                compositionRoots.set(ctx, cached);
                trackCompositionRoot(cached);
                return cached;
            }
            if (currentFiber.runtime === null) {
                const root = Context.is(currentFiber.ctx) ? currentFiber.ctx : current;
                compositionRoots.set(current, root);
                compositionRoots.set(ctx, root);
                compositionRoots.set(root, root);
                trackCompositionRoot(root);
                return root;
            }
            const parent = currentFiber.parent;
            if (!Context.is(parent))
                break;
            current = parent;
        }
    }
    catch {
        // Fall through to the conservative self-root fallback below.
    }
    compositionRoots.set(ctx, ctx);
    trackCompositionRoot(ctx);
    return ctx;
}
function assertLiveContext(ctx, capability) {
    try {
        const known = contextFibers.get(ctx);
        const directFiber = ctx.fiber;
        if (known !== undefined && directFiber !== known)
            throw new Error('mutated context fiber');
        const fiber = (known ?? directFiber);
        if (fiber.uid === null)
            throw new Error('disposed');
        // @deepseek-ai/cordis exposes FiberState as a const enum, so it is not a
        // runtime export. LOADING=1 and ACTIVE=2 are the only states in which a
        // caller can still be executing/owning effects; all other states reject.
        if (fiber.state !== 1 && fiber.state !== 2) {
            throw new Error('inactive');
        }
        // `Fiber.restart()` invalidates the runner epoch before Cordis updates
        // the public state. Read the runtime-private marker as well so a retained
        // context cannot register an effect during that unload/reload window.
        const runner = fiber._runner;
        if (canonicalRunners.get(fiber) !== runner)
            throw new Error('mutated runner');
        if (runner?.epoch === '__INACTIVE__') {
            throw new Error('inactive');
        }
        if (!trustedFibers.has(fiber))
            throw new Error('unregistered');
        const owner = canonicalContexts.get(fiber);
        if (owner === undefined)
            throw new Error('unowned');
        if (fiber.ctx !== owner || owner.fiber !== fiber)
            throw new Error('mutated');
        let current = ctx;
        let matched = false;
        for (let depth = 0; depth < 64 && current !== null; depth += 1) {
            if (current === owner) {
                matched = true;
                break;
            }
            current = Object.getPrototypeOf(current);
        }
        const token = activationStorage.getStore();
        const tokenIsCurrent = token !== undefined
            && token.fiber === fiber
            && token.context === owner
            && token.root === fiberRoots.get(fiber)
            && token.generation === activationGenerations.get(fiber)
            && activationTokens.get(fiber) === token;
        if (token !== undefined && !tokenIsCurrent) {
            throw new Error('stale activation');
        }
        if (!matched || (restartingFibers.has(fiber) && !tokenIsCurrent && !executingFibers.has(fiber)))
            throw new Error('inactive');
        contextFibers.set(ctx, fiber);
        return fiber;
    }
    catch {
        // Fall through to the stable public error below.
    }
    throw new Error(`dsh-tui: ${capability} requires a live Cordis activation context`);
}
/** Recover the composition root that owns a traceable service. Cordis stores
 * the provider context on the concrete Service instance; callers may reach
 * that instance through a proxy from another composition, so this must be
 * resolved from the unwrapped service rather than from the call context. */
export function serviceCompositionRoot(service) {
    try {
        const owner = concreteService(service).ctx;
        return Context.is(owner) ? compositionRoot(owner) : undefined;
    }
    catch {
        return undefined;
    }
}
/** Explicit context arguments on mediated APIs may be supplied by host code
 * running from the composition root, or may be the activation making the
 * service call.  A non-root plugin cannot nominate a different activation's
 * context and thereby borrow its verified identity/lifecycle. */
export function assertCallerContext(caller, target, capability, service) {
    if (!Context.is(caller) || !Context.is(target)) {
        throw new Error(`dsh-tui: ${capability} requires a Cordis activation context`);
    }
    const callerFiber = assertLiveContext(caller, capability);
    const targetFiber = assertLiveContext(target, capability);
    const ownerRoot = service === undefined ? undefined : serviceCompositionRoot(service);
    if (ownerRoot !== undefined
        && (compositionRoot(caller) !== ownerRoot || compositionRoot(target) !== ownerRoot)) {
        throw new Error(`dsh-tui: ${capability} context belongs to a different composition`);
    }
    if (caller === target || callerFiber === targetFiber)
        return;
    const root = compositionRoot(caller);
    if (caller === root || callerFiber === rootFibers.get(root))
        return;
    throw new Error(`dsh-tui: ${capability} context must be the calling activation`);
}
/**
 * Resolve the caller for a plugin-owned effect. A plugin can read
 * `ctx.root`, but using its root-bound service proxy would attach cleanup to
 * the host fiber and leave the effect alive after the plugin unloads. Host
 * code must use the module-local host accessor for controls it owns; the
 * public service surface only accepts a live non-root activation.
 */
export function requirePluginCaller(caller, capability, service) {
    if (!Context.is(caller)) {
        throw new Error(`dsh-tui: ${capability} requires a Cordis activation context`);
    }
    try {
        const callerFiber = assertLiveContext(caller, capability);
        const root = compositionRoot(caller);
        if (caller === root || callerFiber === rootFibers.get(root)) {
            throw new Error(`dsh-tui: ${capability} requires a non-root calling activation`);
        }
        const ownerRoot = service === undefined ? undefined : serviceCompositionRoot(service);
        if (ownerRoot !== undefined && compositionRoot(caller) !== ownerRoot) {
            throw new Error(`dsh-tui: ${capability} context belongs to a different composition`);
        }
        return caller;
    }
    catch (error) {
        if (error instanceof Error && error.message.startsWith('dsh-tui:'))
            throw error;
        throw new Error(`dsh-tui: ${capability} requires a live non-root calling activation`);
    }
}

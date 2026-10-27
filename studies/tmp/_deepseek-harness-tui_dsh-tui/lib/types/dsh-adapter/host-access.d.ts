import { Context } from '@deepseek-ai/cordis';
/**
 * Hold the root-capability guard back on `root` until the returned release
 * runs. The entry mounts the TUI before composing the profile into the same
 * root, and DSH's plugins use root capabilities while they activate, which
 * the guard would refuse. Fiber tracking starts at once either way.
 */
export declare function deferRootCapabilityGuard(root: Context): () => void;
/**
 * The composition of a deferred root starts: the guard now arrives with the
 * first TUI row's activation, as on the `dsh --profile` path, so every row
 * after it (third-party ones included) is guarded. The release still installs
 * it once the composition settles if no TUI row activated.
 */
export declare function armRootCapabilityGuard(root: Context): void;
/** Host-only escape hatch for process teardown paths that intentionally act on
 * the composition root while running from a host plugin callback. This module
 * is internal and is not part of the public plugin package surface. */
export declare function withHostRootCapability<T>(callback: () => T): T;
export declare function concreteService<T extends object>(service: T): T;
/** Bind a host-side disposer to the caller's authenticated Cordis activation.
 * A failed registration immediately rolls back the owned contribution. */
export declare function bindCallerEffect(ctx: Context, disposer: () => unknown, onRegistered?: (cleanup: () => unknown) => void): boolean;
/** Return the stable, authenticated Fiber identity for an activation. */
export declare function activationFiber(ctx: Context): object | undefined;
/** Return Cordis's canonical activation context, never a writable context
 * shadow. Explicit owner arguments use this before resolving host services. */
export declare function activationContext(ctx: Context): Context | undefined;
/** Resolve a service's composition root once.  Service methods are invoked
 * through caller-bound Cordis proxies; keeping this root in host state avoids
 * resolving sibling services through an attacker-provided caller shadow.
 * Also the first TUI row's activation signal for an armed deferred guard. */
export declare function compositionRoot(ctx: Context): Context;
/** Recover the composition root that owns a traceable service. Cordis stores
 * the provider context on the concrete Service instance; callers may reach
 * that instance through a proxy from another composition, so this must be
 * resolved from the unwrapped service rather than from the call context. */
export declare function serviceCompositionRoot(service: object): Context | undefined;
/** Explicit context arguments on mediated APIs may be supplied by host code
 * running from the composition root, or may be the activation making the
 * service call.  A non-root plugin cannot nominate a different activation's
 * context and thereby borrow its verified identity/lifecycle. */
export declare function assertCallerContext(caller: Context, target: Context, capability: string, service?: object): void;
/**
 * Resolve the caller for a plugin-owned effect. A plugin can read
 * `ctx.root`, but using its root-bound service proxy would attach cleanup to
 * the host fiber and leave the effect alive after the plugin unloads. Host
 * code must use the module-local host accessor for controls it owns; the
 * public service surface only accepts a live non-root activation.
 */
export declare function requirePluginCaller(caller: Context, capability: string, service?: object): Context;
//# sourceMappingURL=host-access.d.ts.map
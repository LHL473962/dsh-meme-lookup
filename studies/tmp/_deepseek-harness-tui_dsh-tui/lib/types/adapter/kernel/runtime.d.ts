/**
 * Adapter runtime / shadow-mode switch and effect-class enforcement.
 *
 * This is the Kernel's incremental-migration control surface. It does not load
 * drivers or perform business translation; it selects and records shadow
 * policy per capability, and provides the unified assertion every
 * effect-producing Port/slice entry must call.
 */
import type { HostEffectClass } from '../ports/owner.js';
export type AdapterMode = 'legacy' | 'passive-shadow' | 'replay-shadow' | 'new';
export type AdapterSliceName = string;
export interface AdapterRuntimeOptions {
    readonly mode: AdapterMode;
    readonly slices: readonly AdapterSliceName[];
}
export declare const DEFAULT_ADAPTER_MODE: AdapterMode;
/**
 * Effect classification per adapter capability.
 *
 * Every capability that can produce an effect must be registered here so the
 * runtime can enforce shadow policy uniformly instead of relying on ad-hoc
 * call-site checks.
 */
export declare const ADAPTER_CAPABILITY_EFFECT_CLASSES: Readonly<Record<string, HostEffectClass>>;
/** Map a capability to its incremental migration slice. */
export declare const ADAPTER_CAPABILITY_SLICES: Readonly<Record<string, string>>;
export declare function sliceForCapability(capability: string): string | undefined;
export declare function effectClassFor(capability: string): HostEffectClass | undefined;
export declare function parseAdapterMode(value: string | undefined): AdapterMode;
export declare const ADAPTER_SLICE_ALIASES: Readonly<Record<string, string>>;
/**
 * Normalize an explicit adapter-slice allowlist.
 *
 * Slice ids are case-insensitive and surrounding whitespace is ignored.
 * Known aliases are mapped to their canonical slice id. Unknown ids are
 * rejected loudly (fail-closed) instead of being silently ignored: a typo in
 * `DSH_TUI_ADAPTER_SLICES` must never accidentally broaden or narrow the
 * governed adapter surface without the operator noticing.
 */
export declare function normalizeAdapterSliceList(slices: readonly string[]): readonly string[];
export declare function parseAdapterRuntime(env?: NodeJS.ProcessEnv): AdapterRuntimeOptions;
/**
 * Immutable fallback snapshot factory for objects that are not bound to a
 * Cordis composition (standalone stores, in-package local registries, unbound
 * grant stores). Each object captures the process environment at construction
 * time; once captured, that object never re-reads mutable process state.
 * Production composition-bound services must use `adapterRuntimeFor(ctx)`
 * instead so each composition root gets its own stable snapshot.
 */
export declare function defaultAdapterRuntime(): AdapterRuntimeOptions;
/**
 * Effect classification determines which shadow modes are allowed:
 * - read-only may run as passive shadow and replay shadow;
 * - subscribe/register require replay or direct switch;
 * - mutate only runs in legacy/new (it must never pretend to be a shadow).
 */
export declare function isPassiveShadowAllowed(effectClass: HostEffectClass): boolean;
export declare function shadowPolicyAllowed(effectClass: HostEffectClass, mode: AdapterMode): boolean;
export declare function assertShadowPolicy(effectClass: HostEffectClass, mode: AdapterMode): void;
/**
 * Hard guard-position invariant for adapter capability methods:
 * every mediated/effectful entry MUST call this guard (or the
 * `assertAdapterCapability` convenience) as its FIRST side-effect-free
 * preflight step, BEFORE creating subscriptions, registrations, file watches,
 * writes, mounts or any other observable side effect. This is also enforced
 * by `verify:adapter-shadow` for service methods and returned handles.
 */
export declare function assertCapabilityShadowPolicy(capability: string, mode: AdapterMode, slices?: readonly string[]): void;
export declare function assertAdapterCapability(capability: string): void;
//# sourceMappingURL=runtime.d.ts.map
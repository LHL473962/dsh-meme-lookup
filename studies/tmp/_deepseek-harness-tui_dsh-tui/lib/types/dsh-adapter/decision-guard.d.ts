/**
 * RFC 0005 D-7 enforcement: subscribing to an intercept-class (decision)
 * event requires an explicit host-side grant — default deny.
 *
 * Interception is strictly more powerful than observation: a plugin that can
 * veto user input or a session switch can change what the user's intent
 * actually does. So `tui/input`, `tui/rewind-prompt`, `tui/session-switch`
 * and `tui/compact` are NOT free-for-all `ctx.on` targets: the subscribing
 * plugin (identified by its verified Component identity) must hold the
 * matching `domain.resource.intercept` grant. Grant answers
 * come from the unified 8-permission GrantStore in
 * `../adapter/standard/grants.js` (registry-driven defaults,
 * `grants`/`denies` sections, corrupt fail-closed) — this module is only the
 * subscribe-time CHECKPOINT: which event needs which permission, and the
 * cordis bail hook that enforces it.
 *
 * A denied subscription never enters the dispatch chain — it is "as if
 * unregistered" (D-7) and the caller gets a no-op disposer plus a logger
 * warning naming the plugin, the event, and the missing grant.
 *
 * Re-check semantics (D-7: subscription, revocation, scope change): every
 * operation reads the live GrantStore and grant-owned registrations are
 * released when its change watcher observes a revocation.
 *
 * Mechanism: cordis bails `internal/listener` on EVERY `ctx.on` before
 * registering, with `this` bound to the subscribing context; a truthy bail
 * result skips the registration and becomes the caller's disposer. That is
 * the whole hook — no patching of the events service.
 */
import type { Context } from '@deepseek-ai/cordis';
import { EXTENSION_GRANTS_FILE, type GrantStore } from '../adapter/standard/grants.js';
import { type VerifiedComponentIdentity } from './component-identity.js';
import { DECISION_EVENT_PERMISSIONS } from '../adapter/spec/protocol-constants.js';
import { type AdapterRuntimeOptions } from '../adapter/kernel/runtime.js';
/** The intercept permission each decision event requires. The map is
 * derived in src/adapter/spec/protocol-constants.ts and re-exported here for
 * compatibility; product code must not declare a second copy. */
export { DECISION_EVENT_PERMISSIONS };
export { EXTENSION_GRANTS_FILE };
/** @deprecated Use GrantStore from `../adapter/standard/grants.js` (same shape, plus more).
 * Long-term compatibility alias; owner: dsh-tui adapter. */
export type ExtensionGrants = GrantStore;
/** @deprecated Use parseGrantStore from `../adapter/standard/grants.js`.
 * Long-term compatibility alias; owner: dsh-tui adapter. */
export declare const parseExtensionGrants: (text: string) => GrantStore;
/** @deprecated Use readGrantStore from `../adapter/standard/grants.js`.
 * Long-term compatibility alias; owner: dsh-tui adapter. */
export declare const readExtensionGrants: (dir?: string) => GrantStore;
export interface DecisionHandlerMetadata {
    componentId: string;
    activationId: string;
    event: string;
    order: string;
}
/** A host-mediated DecisionEvents registration.  The registry is deliberately
 * separate from Cordis' private `_hooks`: admission and dispatch must not
 * depend on plugin load order or on an implementation detail of the event
 * service. */
export interface DecisionRegistrationOptions {
    /** Scope covered by this handler. When omitted it is derived from the
     * manifest declaration; an unsafe concrete-session declaration is refused. */
    scope?: string;
    /** Deterministic order key. Handlers with the same activation/event must use
     * distinct keys; registration order is never used as a policy. */
    order?: string;
}
export interface RegisteredDecisionHandler {
    readonly event: string;
    readonly scope: string;
    readonly componentId: string;
    readonly activationId: string;
    readonly order: string;
    readonly identity: VerifiedComponentIdentity;
    readonly ownerContext: Context;
    readonly listener: (payload: Record<string, unknown>) => unknown;
}
export interface DecisionRegistry {
    runtime: AdapterRuntimeOptions;
    grants: GrantStore;
    handlers: Map<string, Map<string, RegisteredDecisionHandler>>;
}
export declare function decisionRegistryOf(ctx: Context): DecisionRegistry;
/** Return a stable snapshot of handlers for one event and payload scope. */
export declare function decisionHandlersOf(ctx: Context, event: string, payloadScope?: string): readonly RegisteredDecisionHandler[];
/** Host-only registration used by TuiPluginHostRuntime. */
export declare function registerDecisionHandler(pluginCtx: Context, identity: VerifiedComponentIdentity, event: string, listener: (payload: Record<string, unknown>) => unknown, options?: DecisionRegistrationOptions, onRelease?: () => void): () => boolean;
/** Liveness re-check for a handler snapshot taken before an `await`.
 *
 * Decision dispatch awaits plugin handlers, and both grant revocation and
 * deactivation release their registration while that await is pending. A
 * snapshot captured at loop start therefore cannot authorize a *late* return
 * value: a revoked or unloaded component must not be able to veto or rewrite a
 * user flow with an answer that arrives after its authority ended.
 *
 * Liveness is the conjunction of two facts, both cheap and both read live:
 *
 * - a row for this activation/event/order is still installed (deactivation and
 *   grant revocation both release the registration, so a released row is gone);
 * - the grant still allows this principal at the effective scope (covers a
 *   store change whose change-watcher has not run yet, or a store with no
 *   watcher at all).
 *
 * The installed check compares the row's own identity rather than the map's
 * internal key: the registry is host-owned storage, and whether a handler is
 * still live must not depend on how a row happens to be keyed inside it. In
 * production `registerDecisionHandler` is the only writer and keys rows by
 * `activation\0event\0order`; keeping the check identity-based leaves that as
 * an implementation detail instead of a behavioural requirement.
 */
export declare function isDecisionHandlerLive(ctx: Context, handler: RegisteredDecisionHandler, payloadScope?: string): boolean;
/** Execute ctx.on for one host-mediated decision registration. */
export declare function withDecisionRegistration<T>(ctx: Context, callback: () => T): T;
export declare function decisionHandlerMetadataOf(listener: Function): DecisionHandlerMetadata | undefined;
/** Return the event names for which a real dispatch topology is recorded in
 * this composition. Empty means only a guard (or nothing) is mounted. */
export declare function decisionDispatchEventNames(ctx: Context): readonly string[];
/** True when this composition has at least one real DecisionEvents dispatch
 * source (today: the live channel). Used by host descriptor/admission views. */
export declare function hasDecisionDispatchTopology(ctx: Context): boolean;
/**
 * Record that this composition contains a real DecisionEvents dispatch
 * source for the supplied event names. Called by the channel after it mounts
 * the dispatch path; never called by guard installation alone.
 *
 * Returns a disposer that decrements this source's contribution. Multiple
 * dispatch sources in the same composition are reference-counted per event,
 * so unloading one channel does not erase another live channel's topology.
 *
 * Lifecycle assumption: in the current TUI the channel is mounted by a
 * Cordis plugin/context and `createChannel()` registers this disposer in that
 * context's effect cleanup, so unloading the owning context unmarks the
 * topology. If an embedder intentionally treats the channel as a
 * process-level singleton and never disposes the owning context, the marker
 * persists for the process lifetime — matching the singleton assumption and
 * not leaking across unloaded channels. Tests can always call the disposer or
 * `unmarkDecisionDispatchTopology()` explicitly to prove post-unload
 * behavior.
 */
export declare function markDecisionDispatchTopology(ctx: Context, events?: readonly string[]): () => void;
/**
 * Remove this composition's DecisionEvents dispatch topology registration for
 * the supplied events (defaults to all known events). Also available as the
 * disposer returned by `markDecisionDispatchTopology()`; `createChannel()`
 * calls it when the channel's Cordis effect/context is unloaded.
 */
export declare function unmarkDecisionDispatchTopology(ctx: Context, events?: readonly string[]): void;
/** Read-only DecisionEvents feature probe: reports only event names that have
 * BOTH a guard and a real channel/dispatch topology in this composition. It
 * creates no subscription and is used by the live-driver evidence path. */
export declare function probeDecisionEventFeatures(ctx: Context): readonly string[];
export declare function installDecisionGuard(ctx: Context, grants: GrantStore): void;
//# sourceMappingURL=decision-guard.d.ts.map
/**
 * The dsh-tui-plugin-host row: the plugin-interop anchor every later
 * contract surface hangs off (storage.local, messages.observe, effect
 * ledger — each lands as a sibling service mounted by THIS row's apply, so
 * the patch surface changed exactly once for the whole v0.15 alignment).
 *
 * What it provides on `ctx.tuiPluginHost`:
 *
 * - `generationId` — the runtime generation id (C-050), a fresh UUID per
 *   row activation; ledger records and the Host Descriptor stamp it so
 *   effects from different process generations can never be confused.
 * - `grants` — the unified 8-permission live GrantStore
 *   (`../adapter/standard/grants.js`).
 * - `hostDescriptor()` — the C-010 Host Descriptor
 *   (`../adapter/standard/descriptor.js`), built lazily and cached; drifted
 *   contracts are dropped fail-closed.
 * - `selfCheck()` — vendored registry + contract-profile violations
 *   (definition/profile drift, ten-point incompleteness, parity mismatches).
 * - `registerCommand(pluginCtx, definition)` — the MEDIATED command
 *   registration surface (C-041 attribution): stamps each command with the
 *   verified Component identity so the invoke checkpoint can enforce per-owner
 *   denies (./command-attribution.js). Direct `ctx.get('commands')`
 *   registrations stay unattributed — the documented C-070 boundary.
 *
 * Discipline notes:
 *
 * - #183: consumers NEVER get this service via inject — always
 *   `ctx.get('tuiPluginHost', false)` soft probing, with the skew warning in
 *   plugin.ts covering profile launches on a stale patch.
 * - The D-7 decision gate does NOT depend on this row: the extensions row
 *   and the channel each install it with their own GrantStore read, so a
 *   missing plugin-host row never relaxes interception gating.
 * - Boot-time self-check failures are logged once here (fail closed happens
 *   per-contract at descriptor build time; boot must not die on drifted
 *   vendored data).
 */
import { Context, Service } from '@deepseek-ai/cordis';
import type { CommandDefinition } from '@deepseek-ai/dsh-commands';
import type { HostDescriptor } from '../adapter/standard/types.js';
import { type HostDescriptorBuild } from '../adapter/standard/descriptor.js';
import { type DecisionRegistrationOptions } from './decision-guard.js';
import { type VerifiedComponentIdentity } from './component-identity.js';
import { type BackendAdmissionProbe } from './backend-registry.js';
/** Caller-safe grant facade exposed through `ctx.tuiPluginHost.grants`.
 * Unlike the internal full-parameter GrantStore, this facade derives the
 * principal from the calling activation and never accepts a caller-supplied
 * component/activation identity. The legacy `.corrupt` boolean is
 * deliberately not exposed here; use `selfCheck()` / `/doctor` or host-side
 * diagnostics for grant-file health. */
export interface HostGrantFacade {
    /** Evaluate a grant for the calling activation, not an arbitrary principal. */
    allows(pluginCtx: Context, permission: string, scope: string): boolean;
    defaultOf(permission: string): 'allow' | 'deny';
    knownPermissions(): readonly string[];
    /**
     * File-change watch, used by grant-owned effects to release promptly.
     *
     * This is a subscribe-class adapter capability. The caller activation is
     * required both for shadow-policy enforcement and for lifecycle binding:
     * the returned watcher (and the underlying file poller's registration) is
     * owned by the calling Cordis activation, so unloading that activation
     * cannot leave the listener or the poller behind.
     */
    onChange(pluginCtx: Context, listener: () => void): (() => void) | undefined;
}
/** Public, mediated plugin-host capability. Loader-only admission remains
 * behind getHostAdmission(), which is deliberately omitted from the package
 * export surface. */
export interface TuiPluginHost {
    readonly generationId: string;
    readonly grants: HostGrantFacade;
    hostDescriptor(): HostDescriptor;
    describe(): HostDescriptorBuild;
    subscribeDecision(pluginCtx: Context, event: string, listener: (payload: Record<string, unknown>) => unknown, options?: {
        scope?: string;
        order?: string;
    }): () => boolean;
    registerCommand(pluginCtx: Context, definition: CommandDefinition): () => void;
    registerCommand(pluginCtx: Context, contributionId: string, definition: CommandDefinition): () => void;
    selfCheck(): string[];
    /** Read-only DecisionEvents feature probe (host/driver diagnostics). */
    probeDecisionEvents(): readonly string[];
    /** Read-only backend admission probe (host/driver diagnostics): whether the
     *  `Backend` contribution family's admission machine is mounted and answers
     *  for a third-party declaration. This is the evidence the host descriptor
     *  publishes `tui.dsh/v1alpha1#Backend` on (W-2). */
    probeBackendAdmission(): BackendAdmissionProbe;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        tuiPluginHost: TuiPluginHost;
    }
}
/** `ctx.tuiPluginHost` — plugin-interop anchor (generation, grants, descriptor). */
export declare class TuiPluginHostRuntime extends Service implements TuiPluginHost {
    #private;
    /** Runtime generation id (C-050): fresh per activation of this row. */
    get generationId(): string;
    /** Caller-safe grant facade; the internal full-parameter store stays
     * host-only (see getHostGrantStore in ./host-grants.js). */
    get grants(): HostGrantFacade;
    /** Read-only DecisionEvents feature probe. Returns only the event names
     * whose guard is installed in this composition. */
    probeDecisionEvents(): readonly string[];
    /** Read-only backend admission probe. Read-only and side-effect free: it
     * exercises the family validator and the host's admission facts on a
     * synthetic declaration and reports the verdict, so the descriptor never
     * claims the `Backend` coordinate off a mere mounted service row. */
    probeBackendAdmission(): BackendAdmissionProbe;
    constructor(ctx: Context);
    /** @internal Start the Kernel after the whole plugin-host row (including
     * sibling storage/observer services) is mounted. Triggered only by the
     * constructor's deferred effect. */
    startKernelRuntime(): void;
    private assertEffect;
    /**
     * The C-010 Host Descriptor, built lazily and cached while the
     * runtime-dependent commands capability remains unchanged.
     */
    hostDescriptor(): HostDescriptor;
    /** The full build result (descriptor + dropped coordinates + warnings). */
    describe(): HostDescriptorBuild;
    private build;
    private buildUnsafe;
    /**
     * Parse, project, validate, negotiate, and bind one activation's Component
     * identity before any mediated runtime capability can be used.
     */
    admit(pluginCtx: Context, source: string, options?: {
        source?: string;
    }): VerifiedComponentIdentity;
    /** @internal Host loader entry; the unexported production token prevents
     * proxy calls. The test token is only reachable from the test-only adapter
     * helper, never from the package's production admission accessor. */
    admitInternal(pluginCtx: Context, source: string, options?: {
        source?: string;
        activationId?: string;
    }, token?: symbol): VerifiedComponentIdentity;
    /**
     * Host-mediated DecisionEvents activation surface.  A plugin cannot use a
     * raw `ctx.on` for these points: the verified Component identity, static
     * requirement, scope and current grant are all checked before insertion in
     * the registry.  The returned disposer is idempotent and is also owned by
     * the activation so deactivation cannot leave an effect behind.
     */
    subscribeDecision(pluginCtx: Context, event: string, listener: (payload: Record<string, unknown>) => unknown, options?: DecisionRegistrationOptions): () => boolean;
    /**
     * Mediated command registration (C-041 attribution): registers through
     * the commands service and, on success, stamps the command's owner as
     * the verified Component identity — so the channel's invoke checkpoint
     * can enforce per-owner `commands.invoke` denies on the host-mediated
     * path. Mirrors the honest-identity pattern of storage.open /
     * messages.observe subscribe: there is no parameter to impersonate
     * another plugin. The returned disposer unregisters AND lifts the stamp
     * (idempotent). Duplicates throw the mapped DUPLICATE_CONTRIBUTION_ID
     * error; a missing commands service fails loud (the descriptor's
     * Command contract is excluded in that situation anyway).
    */
    registerCommand(pluginCtx: Context, definition: CommandDefinition): () => void;
    registerCommand(pluginCtx: Context, contributionId: string, definition: CommandDefinition): () => void;
    /**
     * Vendored registry + contract-profile self-check (C-020 definition/profile
     * pins, C-040 ten-point completeness, coordinate/permission parity). Empty =
     * clean; violations are strings, never thrown.
     */
    selfCheck(): string[];
}
/** Initial host-owned Kernel refresh outcome. This is adapter-test-only
 * readiness evidence, not a plugin capability or a Kernel control surface. */
export interface InitialKernelRefreshResult {
    readonly status: 'pending' | 'completed' | 'failed' | 'skipped';
    readonly error?: string;
}
/**
 * Loader-only admission capability.  It is intentionally omitted from the
 * package `plugin-host` export; tests and the in-process loader can obtain it
 * from this adapter module, while a plugin calling the public service proxy
 * receives a deterministic denial instead of being able to impersonate a
 * different manifest identity.
 */
export interface HostAdmission {
    admit(pluginCtx: Context, source: string, options?: {
        source?: string;
    }): VerifiedComponentIdentity;
}
/** Test-only admission accessor. Kept separate from the production
 * `getHostAdmission` so the test-utils injection of a deterministic
 * activationId can never be reached by production host loaders. */
export interface HostAdmissionForTest extends HostAdmission {
    admit(pluginCtx: Context, source: string, options?: {
        source?: string;
        activationId?: string;
    }): VerifiedComponentIdentity;
}
/** Adapter-test-only readiness accessor. It exposes only the host-owned
 * initial refresh promise/result; callers cannot inspect or control KernelRuntime. */
export interface HostInitialKernelRefreshForTest {
    result(): InitialKernelRefreshResult | undefined;
    awaitResult(): Promise<InitialKernelRefreshResult>;
}
export declare function getHostInitialKernelRefreshForTest(runtime: TuiPluginHost | TuiPluginHostRuntime | undefined): HostInitialKernelRefreshForTest | undefined;
export declare function getHostAdmissionForTest(runtime: TuiPluginHost | TuiPluginHostRuntime | undefined): HostAdmissionForTest | undefined;
export declare function getHostAdmission(runtime: TuiPluginHost | TuiPluginHostRuntime | undefined): HostAdmission | undefined;
/**
 * Host-only accessor for the new Kernel HostFacade. Deliberately omitted from
 * the public plugin-host export: HostFacade is an internal composition entry,
 * not an external plugin API.
 *
 * @internal P2: the facade is now backed by the KernelRuntime's unified
 * evidence snapshot (driver detect + live verification), not by a legacy
 * describe() wrapper. It remains read-only and shadow-guarded.
 */
export declare function getHostFacade(runtime: TuiPluginHost | TuiPluginHostRuntime | undefined): import("../adapter/index.js").HostFacade | undefined;
export declare const name = "dsh-tui-plugin-host";
export declare function apply(ctx: Context): void;
//# sourceMappingURL=plugin-host.d.ts.map
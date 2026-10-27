/**
 * The runtime backend registry (roadmap Stage A / P0).
 *
 * Before this module, "which backends exist" was a hand-written closed set
 * spread over `kernelPrefs.ts`, this adapter, the launcher copy and the boundary
 * gate: every new backend had to be copied into all of them (codex did exactly
 * that, #1352). Now the set is the built-in seed plus whatever the build-time
 * index found under `src/backends/*​/manifest.ts` — adding a backend is a new
 * directory, nothing else.
 *
 * Three properties this file must keep (they are what a fourth backend would
 * otherwise break):
 *
 *  - **Lazy**: an entry that is never loaded is never imported. `probeKernels`
 *    is the only path that loads everything, and it is opt-in.
 *  - **Booked pooling** (D4): `unloadExport` is remembered when — and only when —
 *    the entry's module was actually imported, so a DSH-only boot does not pay a
 *    module import (let alone a child process) just to close a pool it never
 *    opened. The one exit funnel (`plugin.ts`'s `disposeRootAndThen`) calls
 *    {@link unloadBackends} after the fiber is disposed and stays otherwise
 *    untouched.
 *  - **Membership is the second half of the parse** (D1): a syntactically valid
 *    but unregistered id must behave exactly like an unknown value everywhere
 *    (dsh + a warning, never a crashed boot). See {@link parseBackendChoice}.
 */
import type { AgentBackend } from '../agent/backend.js';
import { isBackendIdSyntax, type BackendEntry, type BackendManifest } from '../agent/backend-manifest.js';
import { type KernelBackendId } from '../kernelPrefs.js';
import { type BackendAdmission } from './backend-admission.js';
export { isBackendIdSyntax };
/**
 * One registered backend: the manifest, its id as a validated {@link KernelBackendId}
 * (the cast below is reached only after the syntax gate), the lazy loader, and the
 * one fact the registry derives from the manifest.
 *
 * `installable` is derived, not declared: the old `installable` field was a
 * boolean that the registration gate forced to equal "declares install data", so
 * it carried no information of its own — and the half that *is* a runtime
 * question (`does this host run that executor?`) could not be written in a
 * manifest at all. Picker rows read it from here, and `installSurfaceFor(id)`
 * answers the same question with the actions attached.
 */
export interface RegisteredBackend {
    readonly id: KernelBackendId;
    readonly manifest: BackendManifest;
    readonly installable: boolean;
    /**
     * What the admission decided about this entry (B-2). `compatible_degraded`
     * carries the names the host does not implement, `waiting_authorization` the
     * permissions nobody granted; `rejected` and `unknown` never become an entry
     * (registration throws on them). Every in-tree backend is `compatible` today.
     */
    readonly admission: BackendAdmission;
    readonly load?: () => Promise<Record<string, unknown>>;
}
/**
 * Add one entry. The built-in seeds register themselves below; the plugin
 * discovery of Stage C is the intended second caller, which is why the checks
 * are loud rather than lenient: a bad manifest must fail at registration, not
 * paint a wrong row.
 */
export declare function registerBackend(entry: BackendEntry): void;
/** Every registered backend, in declaration order (= picker order). */
export declare function listBackends(): readonly RegisteredBackend[];
/**
 * The entries a picker may offer (B-2). A `waiting_authorization` entry is
 * registered — its id exists, the boot's two-stage parse must find it, and its
 * session refs must resolve — but it is not offered: nothing has granted what it
 * declares, so selecting it would open a backend the host cannot describe. Today
 * no entry is in that state (every in-tree manifest declares `grants: []`); the
 * shape exists so the C stage's grant flow has somewhere to land.
 */
export declare function listOfferedBackends(): readonly RegisteredBackend[];
/**
 * What the backend admission machine reports when asked whether it is mounted
 * and can admit a *contribution* (W-2).
 */
export interface BackendAdmissionProbe {
    /** Entries the registry holds: the built-in seed plus every registration. */
    readonly registered: number;
    /** How many of them a picker may offer (not `waiting_authorization`). */
    readonly offered: number;
    /** What a synthetic third-party declaration was admitted as. A machine that
     *  could not answer `compatible` would refuse every contribution, so this is
     *  the one verdict the probe accepts. */
    readonly verdict: 'compatible';
}
/**
 * Read-only probe behind the host descriptor's `Backend` contract (W-2): is the
 * backend admission machine mounted, and does it answer for a *contribution*?
 *
 * The descriptor publishes `tui.dsh/v1alpha1#Backend` only on real probe evidence
 * (`hasVerificationEvidence`, descriptor publication barrier), and "a service row
 * exists" is deliberately not evidence. So this probe walks the same path a
 * third-party declaration takes — build a declaration no host owns, run it
 * through the family validator, then through the host's admission facts — and
 * reports what came back. It registers nothing, imports nothing and writes
 * nothing: an entry that was never loaded is still never loaded.
 */
export declare function probeBackendAdmission(): BackendAdmissionProbe;
/** One backend, or undefined when no such backend is registered. */
export declare function getBackend(id: string): RegisteredBackend | undefined;
/** Whether an untrusted value names a backend this process can actually run.
 *  This is the second half of the parse (D1) and the only way to obtain a
 *  {@link KernelBackendId} outside `kernelPrefs`' own syntax gate. */
export declare function isRegisteredBackend(value: unknown): value is KernelBackendId;
/**
 * The backend a configured / remembered value names: trimmed, lowercased, and
 * **registered**. Anything else is undefined, which every caller already treats
 * as "no choice made" (dsh + a warning) — the semantics an unknown value had
 * before the set was open (D1).
 */
export declare function parseBackendChoice(value: unknown): KernelBackendId | undefined;
/** The display name of a backend id: its manifest's short brand name, else the
 *  id itself (a session from an uninstalled plugin must still render as
 *  something). */
export declare function backendLabel(id: string): string;
/**
 * Import one registered backend's implementation and book its pool hook.
 *
 * The two failure messages stay distinct (D1): "not registered" means the id was
 * never a choice, "has no loader" means the id names the host's own kernel.
 */
export declare function loadBackend(id: KernelBackendId): Promise<AgentBackend>;
/**
 * Close the pooled, process-wide resources of every backend this process
 * actually loaded, in load order, then forget them (idempotent).
 *
 * Called once from the exit funnel *after* `ctx.root.fiber.dispose()`: closing a
 * pool first would break the in-flight sessions whose calls still hold it
 * (D4-P3). A failing or hanging hook must not block the exit — failures only
 * reach the debug log, and a stuck one is caught by the funnel's existing 5s
 * bound (P4).
 */
export declare function unloadBackends(): Promise<void>;
//# sourceMappingURL=backend-registry.d.ts.map
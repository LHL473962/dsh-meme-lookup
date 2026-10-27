/**
 * Admission of one backend declaration (B-2, W-1): what the *host* knows about a
 * `BackendSpec`, decided before anything runs.
 *
 * `validateBackendSpec()` (tui-profile) answers "is this shape well formed?".
 * This answers the other half: "can this host honor it?" — a capability name in a
 * vocabulary the host does not implement, a permission name with no grant, an id
 * the host owns. The two are deliberately separate layers: the shape validator
 * lives with the protocol (it must reject the same thing in every host that
 * implements the family), while these verdicts depend on host state.
 *
 * The five-state vocabulary is reused verbatim from the plugin admission
 * (`NegotiationDecision`, `NEGOTIATION_ERROR_CODES`), not invented here:
 * a contribution family speaks the same admission language as every other
 * plugin surface, and `negotiate.ts` stays untouched (it has no backend concept
 * and does not need one).
 *
 * **Scope.** This decides; it does not wire the family into the registry /
 * descriptor chain by itself. Since W-2 (stage C) that chain *is* wired —
 * `Backend` is a host-published contract, the profile pins this family's contract
 * profile by digest and the descriptor publishes the coordinate only on real
 * probe evidence ({@link probeBackendAdmission}) — and since D-1 the step that
 * reads a mounted bundle's declaration into {@link registerBackend} is the
 * boot-time assembly (`backend-assembly.ts`), not the install chain's work.
 *
 * **Published codes.** The contract profile
 * (`tui-profile/registry/contracts/backend-v1alpha1.json`) publishes exactly the
 * codes this file can produce: `BACKEND_ID_RESERVED` and `PERMISSION_NOT_GRANTED`.
 * A code with no producer is a phantom its readers would write error handling for,
 * so a future one waits until the stage that gives it a producer
 * (`scripts/verify-backend-contribution.ts` pins the pair).
 */
import type { BackendSpec } from '../adapter/spec/tui-contributions.js';
import type { NegotiationDecision } from '../adapter/standard/types.js';
/** The host facts the verdict depends on; passed in, so the function is pure. */
export interface BackendAdmissionHost {
    /** Ids this host owns (`BUILTIN_BACKEND_IDS`); a contribution may not wear one. */
    readonly reservedIds: ReadonlySet<string>;
    /** Names this host's session model implements (`BACKEND_CAPABILITY_NAMES`). */
    readonly capabilityNames: ReadonlySet<string>;
    /** The host's permission vocabulary (`EXPECTED_PERMISSIONS`). */
    readonly permissionNames: ReadonlySet<string>;
    /** Permissions actually granted to this entry; empty until a grant flow (C). */
    readonly granted: ReadonlySet<string>;
}
/** The verdicts a registered entry can carry: the two that admit, and the one
 *  that registers without being offered. `rejected`/`unknown` never reach the
 *  registry — the caller throws on them (a build-time error for an in-tree
 *  manifest must be loud). `reasonCode` stays a `string` because the vocabulary
 *  is `NegotiationDecision`'s, shared with every other plugin surface; among
 *  these three verdicts the only `reasonCode` produced is
 *  `PERMISSION_NOT_GRANTED` (`rejected` carries `BACKEND_ID_RESERVED`). */
export type BackendAdmission = {
    readonly decision: 'compatible';
} | {
    readonly decision: 'compatible_degraded';
    readonly missingOptional: readonly string[];
} | {
    readonly decision: 'waiting_authorization';
    readonly reasonCode: string;
    readonly deniedPermissions: readonly string[];
};
export declare function backendAdmission(spec: BackendSpec, host: BackendAdmissionHost): NegotiationDecision;
//# sourceMappingURL=backend-admission.d.ts.map
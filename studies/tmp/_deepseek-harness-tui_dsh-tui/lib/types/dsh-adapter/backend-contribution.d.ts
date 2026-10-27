/**
 * The in-tree side of the `Backend` contribution family (B-2): one projection
 * from this package's own manifest shape to the public declaration shape.
 *
 * A built-in manifest is a **superset** of `BackendSpec`: it carries in-tree
 * facts (`inTree`, `alwaysAvailable`, `nativeKey`, `vendorPackages`,
 * `backendExport`, and a `label` that may name a host i18n key) that no
 * contribution may declare. Dogfooding therefore means proving the projection:
 * `backendContributionOf()` strips those, expands the label into the literal
 * text the spec requires, and the result must satisfy `validateBackendSpec()` for
 * every built-in. A manifest that grows a field the spec cannot express reds here
 * instead of drifting (scripts/verify-backend-contribution.ts).
 *
 * `backendExport` stays in-tree on purpose: it is the build-time index's
 * mechanism (the registry reads an export name out of a module namespace), not a
 * contribution field. A contribution hands its handler object over at
 * registration, like `assertSceneHandler`'s scene handlers.
 *
 * D-1 added the other direction ({@link backendManifestOf}): the runtime form of
 * a **third-party** declaration, so that an installed bundle can be registered
 * through the same registry as the seed. The two directions are inverses on the
 * intersection of the two shapes; the in-tree-only fields are what the pair
 * proves (a third-party entry can never grow one).
 */
import type { BackendManifest } from '../agent/backend-manifest.js';
import type { BackendSpec } from '../adapter/spec/tui-contributions.js';
/**
 * Project one manifest onto the public declaration. Pure: the same manifest
 * projects to a deep-equal value every time (no timestamps, no host state), which
 * is what lets the gate compare two projections and diff keys.
 */
export declare function backendContributionOf(manifest: BackendManifest): Record<string, unknown>;
/**
 * The registry entry a **third-party** declaration becomes (D-1): the inverse of
 * {@link backendContributionOf} on the fields both shapes carry.
 *
 * A contribution declares less than an in-tree manifest, and everything it cannot
 * declare is fixed here rather than defaulted by the caller:
 *
 *  - `inTree: false` — the one fact that flips the registry's rules (reserved ids,
 *    host label keys, `alwaysAvailable`, `nativeKey`, label sanitization). A
 *    contribution is exactly the non-in-tree case, so the projection says so
 *    instead of leaving a boolean for a caller to get wrong.
 *  - `label` is already the literal the spec requires; `label.kind === 'key'` is
 *    unreachable here (the spec has no such field, and `validateBackendSpec()`
 *    refuses it as an unknown field), so a declaration can never borrow this
 *    host's own vocabulary.
 *  - `alwaysAvailable` / `nativeKey` / `vendorPackages` / `backendExport` are
 *    **not** writable from a declaration and are therefore absent from the
 *    result: `registerBackend()` rejects an explicit `alwaysAvailable` /
 *    `nativeKey`, and the `backendExport` default (`'backend'`) is the registry's
 *    documented read of the module namespace, not a field to invent here.
 *  - `confirmation` stays behind: it is a request to the *install / enable* chain
 *    (`BACKEND_CONFIRMATION_POLICIES`), which reads the declaration, not the
 *    manifest. Dropping it here is what keeps one reading of it.
 *
 * Pure, like its counterpart: the same declaration projects to a deep-equal
 * manifest every time, and the result is the value `registerBackend()` validates,
 * admits and registers.
 */
export declare function backendManifestOf(spec: BackendSpec): BackendManifest;
//# sourceMappingURL=backend-contribution.d.ts.map
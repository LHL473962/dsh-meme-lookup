import { t } from '../i18n.js';
/** The label text a contribution would declare, or a refusal.
 *
 *  Only an in-tree manifest may carry a host i18n key, and the projection is what
 *  turns one into the literal text the spec requires — so it is also where the rule
 *  has to hold when the projection is called directly: expanding a *plugin's* key
 *  would launder it into the literal `t()` happens to return, i.e. let a contribution
 *  paint itself with this host's own name. `registerBackend` refuses that combination
 *  before projecting; this refuses it again, so the exported projection cannot be used
 *  to do what registration forbids. */
function labelTextOf(manifest) {
    if (manifest.label.kind === 'literal')
        return manifest.label.text;
    if (!manifest.inTree) {
        throw new Error(`dsh-tui: backend "${manifest.id}" is not in-tree and may not project a host label key`);
    }
    return t(manifest.label.key);
}
/**
 * Project one manifest onto the public declaration. Pure: the same manifest
 * projects to a deep-equal value every time (no timestamps, no host state), which
 * is what lets the gate compare two projections and diff keys.
 */
export function backendContributionOf(manifest) {
    return {
        id: manifest.id,
        label: { text: labelTextOf(manifest) },
        shortLabel: manifest.shortLabel,
        ...(manifest.product === undefined ? {} : { product: manifest.product }),
        // Absent declarations project to the empty list: the spec requires both
        // fields, so "I declare nothing" must be sayable and must mean "nothing".
        capabilities: [...(manifest.capabilities ?? [])],
        grants: [...(manifest.grants ?? [])],
        ...(manifest.install === undefined ? {} : { install: { ...manifest.install } }),
        ...(manifest.unloadExport === undefined ? {} : { unloadExport: manifest.unloadExport }),
    };
}
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
export function backendManifestOf(spec) {
    return {
        id: spec.id,
        label: { kind: 'literal', text: spec.label.text },
        shortLabel: spec.shortLabel,
        ...(spec.product === undefined ? {} : { product: spec.product }),
        capabilities: [...spec.capabilities],
        grants: [...spec.grants],
        ...(spec.install === undefined ? {} : { install: { ...spec.install } }),
        ...(spec.unloadExport === undefined ? {} : { unloadExport: spec.unloadExport }),
        inTree: false,
    };
}

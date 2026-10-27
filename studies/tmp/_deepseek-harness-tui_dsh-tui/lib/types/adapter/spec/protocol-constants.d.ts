/**
 * tui-profile derived protocol constants.
 *
 * This is the explicit derivation layer required by the adapter boundary.
 *
 * Sources (all are committed tui-profile assets, not local patches):
 * - `registry/permissions-0.1.json` is the machine-readable permission policy
 *   table; `EXPECTED_PERMISSIONS` and the intercept permission names are
 *   derived directly from it.
 * - `registry/registry-0.15.json` defines the host contract set used by the
 *   descriptor driver.
 * - The TUI decision event point names are not present as a standalone
 *   machine-readable JSON array in the committed spec revision. They are
 *   therefore authored ONCE here (the TUI spec-boundary derivation file) and
 *   validated by `verify:protocol-single-source` against the committed
 *   `adapters/dsh-tui-v0.15.md` + `rfc/0005-decision-events.md`/registry
 *   vocabulary. Product/standard code must never declare a second copy.
 */
interface PermissionRow {
    readonly name: string;
    readonly default: 'allow' | 'deny';
    readonly revocable: boolean;
    readonly scope: string;
}
/** The permission registry is policy, pinned in the vendored spec. */
export declare const EXPECTED_PERMISSIONS: readonly PermissionRow[];
/**
 * TUI decision event point names.
 *
 * These are the RFC 0005 decision points run through the D-7 gate. The
 * committed spec revision does not yet export them as a machine-readable
 * array, so this is the single TUI-side derivation/validation site.
 */
export declare const TUI_DECISION_EVENT_NAMES: readonly string[];
/**
 * TUI intercept permission names. Derived from the committed permission
 * registry rather than authored in product code.
 */
export declare const TUI_EXTENSION_PERMISSION_NAMES: readonly string[];
/** All intercept permissions exported by tui-profile. */
export declare const INTERCEPT_PERMISSIONS: ReadonlySet<string>;
/** Decision event point names (subscribe/notification vocabulary). */
export declare const TUI_EVENT_SCOPE_NAMES: ReadonlySet<string>;
/**
 * Single spec-layer derivation of the decision-point -> intercept permission
 * map. Product code must import from here instead of declaring a second copy.
 */
export declare const DECISION_EVENT_PERMISSIONS: Readonly<Record<string, string>>;
/** Inverse view, also spec-layer derived. */
export declare const INTERCEPT_EVENT_SCOPE_BY_PERMISSION: Readonly<Record<string, string>>;
/** Host-supported contract coordinates, derived from the vendored registry's
 * machine-readable entries selected by the TUI driver set. This is the single
 * source used by the upstream descriptor driver; product code must not keep a
 * second handwritten list. */
export declare const HOST_SUPPORTED_CONTRACTS: readonly {
    apiVersion: string;
    kind: string;
}[];
export {};
//# sourceMappingURL=protocol-constants.d.ts.map
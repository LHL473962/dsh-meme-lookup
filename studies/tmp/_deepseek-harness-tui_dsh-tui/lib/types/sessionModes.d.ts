import type { SessionModeSpec } from './adapter/ports/channel-display.js';
export type { SessionModeSpec } from './adapter/ports/channel-display.js';
/** The shipped cycle when cordis.yml pins no `modes` — array order IS the
 *  Shift+Tab cycle order; index 0 is the unmarked base mode. */
export declare const DEFAULT_SESSION_MODES: readonly SessionModeSpec[];
/** Preset names the TUI treats as the canonical built-ins. They are covered
 *  by the static modes of the default cycle, so they never enter the cycle as
 *  dynamic entries; `/permission` targets them whenever the deployment's
 *  preset table keeps the stock names. */
export declare const CANONICAL_PERMISSION_PRESETS: ReadonlySet<string>;
/** The stock bundle each canonical preset name stands for. */
export declare const CANONICAL_PERMISSION_BUNDLES: readonly {
    value: string;
    sandbox: 'read-only' | 'workspace-write' | 'danger-full-access';
    approval: 'ask' | 'never';
}[];
/** One runtime roster entry the deployment exposes (`optionOf` shape). */
export interface PermissionRosterOptionLike {
    readonly value: string;
    readonly name: string;
    readonly description?: string;
}
/** Reserved identity names never treated as switchable presets. */
export declare const RESERVED_PERMISSION_PRESETS: ReadonlySet<string>;
/**
 * Resolve the canonical preset for an effective sandbox/approval bundle.
 * When the deployment's preset table is atom-resolving (`extras` non-empty)
 * the FIRST matching table entry wins — stock names behave exactly as
 * before, while renamed/extended tables stay table-driven instead of
 * hard-coding names. Without a resolving table the stock canonical bundles
 * are the fallback (identical behavior on harnesses whose service does not
 * expose preset atoms). Undefined means no visible preset matches.
 */
export declare function canonicalPresetFor(sandbox: 'read-only' | 'workspace-write' | 'danger-full-access', approval: 'ask' | 'never', extras?: readonly {
    value: string;
    sandbox?: 'read-only' | 'workspace-write' | 'danger-full-access';
    approval?: 'ask' | 'never';
}[]): string | undefined;
/**
 * Keep a runtime permission roster stable across refreshes without overriding
 * the registry's order on first observation. Existing identities retain their
 * relative order; newly observed identities follow the latest official order.
 * Removed identities are omitted, so a later re-add is treated as new.
 */
export declare function stablePermissionRosterOrder(previous: readonly string[], current: readonly string[]): readonly string[];
/**
 * Decide whether one runtime roster option may enter the Shift+Tab cycle.
 * Third-party presets are appended after configured/default modes; reserved
 * sentinels, canonical stock presets (they already ARE the static modes),
 * duplicate identities and unsafe command tokens are excluded with a reason.
 */
export declare function permissionCycleEntry(option: PermissionRosterOptionLike, configuredPermissions: ReadonlySet<string>): {
    accepted: true;
    option: PermissionRosterOptionLike;
} | {
    accepted: false;
    reason: string;
};
/** Config → cycle list: undefined/empty → DEFAULT_SESSION_MODES; entries
 *  declaring no plan/sandbox/approval/permission atom are dropped (their ids
 *  are returned for the caller to warn about). A `permission` atom may be
 *  paired with `plan`, but is mutually exclusive with `sandbox`/`approval`;
 *  conflicting entries are excluded without being reported as dropped (the
 *  caller warns about them separately). If nothing survives,
 *  DEFAULT_SESSION_MODES. Atom vocabularies are already enforced by the
 *  plugin Schema at load, so no value validation happens here. */
export declare function resolveSessionModes(raw: readonly SessionModeSpec[] | undefined): {
    modes: readonly SessionModeSpec[];
    dropped: readonly string[];
};
/** Display name: a dynamic runtime preset's label (localized at render time
 *  for presets the TUI owns, so `/lang` applies without a roster rebuild) >
 *  explicit `label` > built-in i18n (`mode-default`/`mode-plan`/`mode-full`
 *  for those ids) > the raw id. */
export declare function modeDisplayName(spec: SessionModeSpec): string;
/**
 * One dynamic Shift+Tab entry for a runtime permission preset. The id is
 * namespaced so it can never collide with a configured mode id, the label
 * carries the registry's display name (see modeDisplayName), and the entry declares NO atoms: a
 * dynamic preset is selected through its durable `permission/preset`
 * identity only, never by an atom wildcard match (which would steal the
 * indicator on sessions that never held that identity).
 */
export declare function permissionModeSpec(option: PermissionRosterOptionLike): SessionModeSpec;
//# sourceMappingURL=sessionModes.d.ts.map
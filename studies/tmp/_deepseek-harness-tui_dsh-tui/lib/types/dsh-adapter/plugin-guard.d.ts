/**
 * The host layer this application's composition is stacked on: it provides the
 * services the TUI cannot start without, and it carries the manager row that
 * owns every patch write. Removing or disabling it is the indirect form of
 * self-destruction.
 */
export declare const HOST_BUNDLE = "@deepseek-ai/dsh-base";
/**
 * The bundles gate 2 refuses to `remove` / `disable`: the one providing this
 * application, then the host layer it runs on — display order.
 *
 * The first entry is imported rather than spelled again, so the package this
 * application is cannot drift from its own name. The list stays short on
 * purpose: it is the *core*, and every host layer row stays a legitimate thing
 * for a person to switch off (`/plugin disable tool-web` is a supported form).
 * `verify-plugin-guard.ts` pins the exact length, so widening the core is a
 * deliberate change somebody has to explain.
 */
export declare const CORE_BUNDLES: readonly ["@deepseek-harness-tui/dsh-tui", "@deepseek-ai/dsh-base"];
/**
 * The module-name prefix of the rows this application itself provides. A row
 * whose module is this package, or a subpath of it, is what draws the UI a
 * person is looking at; disabling it from that UI is the row-level suicide.
 *
 * This is half of the row rule, and the smaller half. Measured on a real
 * profile (2026-10-14, `dsh --profile dsh-tui --dump-config`): this bundle's
 * patch inserts **17** rows, and **8** of them load a first-party
 * `@deepseek-ai/*` module — the composition's own storage, workspace,
 * code-runtime, agent-presets, cordis-host-runner and webserver seams. Only one
 * of those eight (`@deepseek-ai/dsh-host-webserver`) is on the host's own
 * protected list, and it is the only reason the host reports this bundle as
 * locked at all. The other seven rows are reported as perfectly addressable, so
 * a module-name rule cannot see them: {@link PluginGuardTarget} carries
 * `ownRow` for those, read from the same snapshot as everything else.
 */
export declare const CORE_ROW_PREFIX = "@deepseek-harness-tui/dsh-tui";
/** The three lifecycle actions a person can ask for. */
export type PluginGuardAction = 'remove' | 'enable' | 'disable';
/**
 * One target, reduced to what the decision reads. Both shapes are structural:
 * the caller passes what the host reported (a `BundleInfo` / `PluginInfo`),
 * and a regression can pass a literal.
 */
export type PluginGuardTarget = {
    readonly kind: 'bundle';
    readonly name: string;
    readonly removable: boolean;
    /**
     * The host already locked this bundle (`management-required` /
     * unaddressable). Present means the host refuses both directions, so this
     * predicate refuses without naming a rule of its own.
     */
    readonly readOnlyReason?: string | undefined;
} | {
    readonly kind: 'row';
    readonly entryId: string;
    readonly moduleName: string;
    /** The patch row this entry is addressable as; absent means unaddressable. */
    readonly patchId?: string | undefined;
    /**
     * Whether this application's own patch inserts the row: `patchId` is one of
     * the rows {@link CORE_BUNDLES}[0] reports. The caller reads it off the same
     * snapshot it resolved the target from, because a row of ours may load a
     * first-party module and so carry no name this predicate could recognize —
     * see {@link CORE_ROW_PREFIX}. Absent means "not known to be ours", which
     * leaves the module-name rule as the only one that applies.
     */
    readonly ownRow?: boolean | undefined;
    /** As on a bundle: the host's own lock, reported rather than re-derived. */
    readonly readOnlyReason?: string | undefined;
};
/**
 * Why gate 2 refused. Every value is a statement about *this* application, so
 * the caller can turn it into a reason line and a repair hint.
 */
export type PluginGuardRefusal = 
/** The host locked the target; neither direction is ours to take. */
'service-locked'
/** The target bundle provides this application. */
 | 'app-bundle'
/** The target bundle is the host layer this application is stacked on. */
 | 'host-bundle'
/** The host reports the bundle as not removable (installed by the launcher). */
 | 'not-removable'
/** A single row is never removed on its own; it goes with its bundle. */
 | 'row-not-removable'
/**
 * The row is this application's own: either its module is this package's, or
 * this application's patch inserts it. Disabling it takes part of the
 * interface down with it.
 */
 | 'app-row';
export type PluginGuardVerdict = {
    readonly kind: 'refused';
    readonly reason: PluginGuardRefusal;
} | {
    readonly kind: 'allowed';
};
/**
 * Decide one action against one target. Refusals are checked before anything
 * else can allow: the first matching rule wins, and the shape of the function
 * is fail-closed throughout — an unrecognized target is a bundle only when it
 * says so, and every branch that is not an explicit refusal is not an
 * authorization either.
 *
 * `enable` is deliberately absent from the core rules. Gate 2 stops a person
 * from killing the application they are using; switching a composition layer
 * or a row back on is the *repair* for having killed it — refusing that would
 * seal off the only in-UI way back from a profile somebody edited by hand.
 * The host's own lock is the exception that proves the rule: it refuses both
 * directions there, and this predicate reports that as `service-locked`
 * instead of pretending it could go either way.
 */
export declare function pluginGuardVerdict(target: PluginGuardTarget, action: PluginGuardAction): PluginGuardVerdict;
//# sourceMappingURL=plugin-guard.d.ts.map
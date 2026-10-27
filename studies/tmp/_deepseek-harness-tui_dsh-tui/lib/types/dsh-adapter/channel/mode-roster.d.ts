import type { Context } from '@deepseek-ai/cordis';
import type { Agent } from '@deepseek-ai/dsh-agent';
import { type SessionModeSpec } from '../../sessionModes.js';
import { type PermissionPresetBundle } from './permissions.js';
import type { PermissionPresetSnapshot } from './types.js';
/** Durable identities the configured modes already own; a runtime preset with
 *  one of them is the same switch by another route and never duplicated. */
export declare function configuredPermissionIds(modes: readonly SessionModeSpec[]): ReadonlySet<string>;
/** Canonical targets of the STATIC modes. On a stock table that is the three
 *  built-in names; on renamed tables the deployment's own names for the same
 *  bundles. They are never dynamic entries: the indicator would otherwise
 *  snap to a dynamic look-alike instead of the static mode. */
export declare function staticCanonicalTargets(modes: readonly SessionModeSpec[], bundles: readonly PermissionPresetBundle[]): ReadonlySet<string>;
/** The mounted `permissionPresets` registry as a runtime snapshot, or
 *  undefined when no runtime table is mounted (legacy/unavailable tables are
 *  not a roster). Reads are fail-closed: a throwing registry is no roster. */
export declare function readRuntimePermissionSnapshot(ctx: Context, target: Agent): PermissionPresetSnapshot | undefined;
/** Warn at most once per (agent, identity, reason) — a registry that keeps
 *  re-listing an unusable preset must not flood the log on every rebuild. */
export declare function warnOnceForPermissionEntry(warned: Set<string>, warn: (message: string) => void, target: Agent, value: string, reason: string): void;
/** The Shift+Tab roster: configured modes first, runtime presets appended. */
export interface PermissionModeRoster {
    /** LIVE roster. The array identity is stable and mutated in place, so a
     *  consumer that captured it at construction always sees the latest
     *  roster after {@link PermissionModeRoster.rebuild}. */
    readonly modes: readonly SessionModeSpec[];
    /** Re-read the runtime preset registry for `target` and re-derive. */
    rebuild(target: Agent): void;
    /** Runtime snapshot for `target`, undefined when no runtime table is mounted. */
    readSnapshot(target: Agent): PermissionPresetSnapshot | undefined;
    /** Canonical preset name for one effective sandbox/approval bundle. */
    canonicalFor(sandbox: NonNullable<SessionModeSpec['sandbox']>, approval: NonNullable<SessionModeSpec['approval']>): string | undefined;
}
/**
 * Dynamic session-mode roster (main's `sessionModes` / `rebuildSessionModes`).
 *
 * Runtime permission presets are appended AFTER the configured/default modes
 * whenever the SERVICE snapshot is usable — no dependency on the external
 * `/permission` command reaching this agent's registry, because switching
 * falls back to the service's own write path when the command row is absent.
 * Registry order is authoritative on first observation; later rebuilds
 * preserve the relative order of identities already seen so unrelated
 * command-registry churn cannot reshuffle Shift+Tab. Removed identities drop
 * out and a later re-add is treated as new.
 */
export declare function createPermissionModeRoster(ctx: Context, deps: {
    configuredModes: readonly SessionModeSpec[];
    agent: () => Agent;
    warn?: (message: string) => void;
}): PermissionModeRoster;
//# sourceMappingURL=mode-roster.d.ts.map
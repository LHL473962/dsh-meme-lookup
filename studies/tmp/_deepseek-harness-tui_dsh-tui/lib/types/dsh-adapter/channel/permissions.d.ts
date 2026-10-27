import { type SessionModeSpec } from '../../sessionModes.js';
import type { PermissionPresetOption, PermissionPresetService, PermissionPresetSnapshot } from './types.js';
export declare const PERMISSION_PRESET_CUSTOM = "custom";
export declare const PERMISSION_PRESET_NAME_CELLS = 120;
export declare const PERMISSION_PRESET_DESCRIPTION_CELLS = 400;
/** The mounted registry may expose seams this package's declared contract
 *  does not name yet: `resolve` (atom bundles) and `set` (the write path the
 *  official `/permission` command drives). Read structurally, never assumed. */
export interface PermissionPresetRuntime extends PermissionPresetService {
    resolve?: (name: string) => unknown;
    set?: (subject: unknown, name: string) => unknown;
}
/** One runtime preset's resolved atom bundle. */
export interface PermissionPresetBundle {
    readonly value: string;
    readonly sandbox?: SessionModeSpec['sandbox'];
    readonly approval?: SessionModeSpec['approval'];
}
export declare function isRecord(value: unknown): value is Record<string, unknown>;
/** Narrow a raw service read to the structural registry surface. */
export declare function permissionPresetRuntime(service: unknown): PermissionPresetRuntime | undefined;
/** Keep a permission roster read-only after it crosses the adapter boundary.
 *  The registry may reuse and mutate its option objects between reads; callers
 *  must observe one stable snapshot instead of a live view into that service. */
export declare function freezePermissionPresetSnapshot(snapshot: PermissionPresetSnapshot): PermissionPresetSnapshot;
export declare function legacyPermissionPresetOptions(): readonly PermissionPresetOption[];
export declare function legacyPermissionPresetSnapshot(sandbox: SessionModeSpec['sandbox']): PermissionPresetSnapshot;
export declare function unavailablePermissionPresetSnapshot(): PermissionPresetSnapshot;
export declare function normalizePermissionPresetOption(value: unknown): PermissionPresetOption | undefined;
/** Atom bundles the deployment's preset table resolves (value →
 *  sandbox/approval). Empty when the service is absent or exposes no
 *  `resolve` seam — canonical resolution then falls back to the stock
 *  bundles (see `canonicalPresetFor`). */
export declare function permissionBundlesFromService(service: unknown): readonly PermissionPresetBundle[];
/** The registry's current readback for one subject. Real harness registries
 *  resolve `current(session)` through their session-projections seam; earlier
 *  contract versions folded a raw event log. Try the subject as given, then
 *  the event-log shape it may carry. */
export declare function permissionPresetSnapshotFromService(service: unknown, subject: unknown): PermissionPresetSnapshot;
//# sourceMappingURL=permissions.d.ts.map
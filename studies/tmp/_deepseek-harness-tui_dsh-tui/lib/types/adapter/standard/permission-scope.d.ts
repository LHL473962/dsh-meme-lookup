/** Permission scope normalization shared by admission and runtime checks. */
import { INTERCEPT_PERMISSIONS, INTERCEPT_EVENT_SCOPE_BY_PERMISSION, TUI_EVENT_SCOPE_NAMES } from '../spec/protocol-constants.js';
export { INTERCEPT_PERMISSIONS, INTERCEPT_EVENT_SCOPE_BY_PERMISSION, TUI_EVENT_SCOPE_NAMES };
/** Storage permission names are derived from the same vendored registry. */
export declare const STORAGE_PERMISSIONS: Set<string>;
/** A session scope is carried through the message envelope and may also be
 * used by an intercept grant. Keep the canonical bound here so admission,
 * grant evaluation, and runtime delivery cannot disagree about whether a
 * scope is executable. */
export declare const SESSION_SCOPE_MAX_CHARS = 256;
export type ScopeKind = 'component' | 'command' | 'session' | 'event';
export interface NormalizedPermissionScope {
    kind: ScopeKind;
    value: string;
}
/** Return undefined when this adapter cannot enforce the supplied scope. */
export declare function normalizePermissionScope(permission: string, scope: string, componentId: string): NormalizedPermissionScope | undefined;
export declare function scopeCovers(declared: NormalizedPermissionScope, actual: NormalizedPermissionScope): boolean;
/**
 * Permission-aware containment.  An event-point grant is the parent scope of
 * the sessions delivered through that point, while a session grant can never
 * be promoted into an event-point grant.  This relation is also used for
 * denies, so a narrow `session:<id>` deny wins over a broad event grant.
 */
export declare function permissionScopeCovers(permission: string, declared: NormalizedPermissionScope, actual: NormalizedPermissionScope): boolean;
export declare function rawScopeCovers(permission: string, declared: string, actual: string, componentId: string): boolean;
//# sourceMappingURL=permission-scope.d.ts.map
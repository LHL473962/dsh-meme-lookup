/** Live, scoped plugin grant evaluation. */
import type { PermissionRegistry } from './types.js';
import { type AdapterRuntimeOptions } from '../kernel/runtime.js';
export declare const EXTENSION_GRANTS_FILE = "extension-grants.json";
export interface GrantPrincipal {
    componentId: string;
    activationId?: string;
}
export interface GrantStore {
    /** Evaluate one concrete operation scope. Missing/unsupported scopes deny. */
    allows(principal: GrantPrincipal | string, permission: string, scope: string): boolean;
    defaultOf(permission: string): 'allow' | 'deny';
    knownPermissions(): readonly string[];
    /** Subscribe to file changes. Used to actively release grant-owned effects. */
    onChange?(listener: () => void): () => void;
    readonly corrupt: boolean;
}
/** Parse a fixed snapshot, primarily for deterministic tests. */
export declare function parseGrantStore(text: string, registry?: PermissionRegistry, runtime?: AdapterRuntimeOptions): GrantStore;
/**
 * Read grants on every decision. File changes therefore affect the next
 * operation without a restart. onChange uses a non-persistent watcher so
 * grant-owned subscriptions can be released even when no event is flowing.
 *
 * When called from a Cordis composition, pass the same immutable
 * `adapterRuntimeFor(ctx)` snapshot so grant evaluation uses the same shadow
 * policy as every other service in that composition root.
 */
export declare function readGrantStore(dir?: string, registry?: PermissionRegistry, runtime?: AdapterRuntimeOptions): GrantStore;
//# sourceMappingURL=grants.d.ts.map
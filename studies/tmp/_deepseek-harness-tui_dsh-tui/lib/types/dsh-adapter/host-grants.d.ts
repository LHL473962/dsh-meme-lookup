/**
 * Internal host-only GrantStore access.
 *
 * The public `ctx.tuiPluginHost.grants` is a caller-safe facade that derives
 * the principal from the calling activation. The full-parameter GrantStore
 * (which accepts an explicit principal) is intentionally kept out of the
 * public plugin-host surface; internal adapter services that need to evaluate
 * permissions for an already-verified activation or run grant-file change
 * watches use this module instead.
 */
import type { GrantStore } from '../adapter/standard/grants.js';
/** Register the raw grant store for one host runtime instance. */
export declare function bindHostGrantStore(host: object, store: GrantStore): void;
/** Resolve the raw host grant store; returns undefined for bare/degraded mounts.
 *
 *  The WeakMap is the production path (`bindHostGrantStore` runs in the
 *  plugin-host constructor). The public `host.grants` facade is the
 *  documented shape for bare/degraded mounts and harness fixtures that wire
 *  `ctx.tuiPluginHost` by hand; when the WeakMap has no entry, accept a
 *  facade-shaped store so a host-mounted grant decision is never silently
 *  replaced by the process-wide grants file. */
export declare function getHostGrantStore(host: unknown): GrantStore | undefined;
//# sourceMappingURL=host-grants.d.ts.map
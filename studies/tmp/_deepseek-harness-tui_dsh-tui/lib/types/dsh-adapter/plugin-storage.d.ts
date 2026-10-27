/**
 * storage.local contract surface (C-040, `storage.dsh/v1alpha1#LocalStorage`):
 * per-plugin private persistence, mounted by the dsh-tui-plugin-host row as
 * `ctx.tuiPluginStorage`.
 *
 * The plugin-facing API is `open(ctx)` → `{ get, set, delete }`:
 *
 * - VERIFIED IDENTITY: the namespace is derived from the admitted Component
 *   identity bound to the PASSED activation — there is no parameter to name
 *   another plugin, so cross-plugin access is rejected by construction.
 * - GRANTS AT CALL TIME: `get` requires `storage.local.read`, `set`/`delete`
 *   require `storage.local.write` — checked per call against the live grant
 *   store (a revoked grant blocks the very next operation without restart).
 * - Backend: `~/.dsh-tui/plugin-storage/<namespace>.json`, one flat JSON
 *   object per namespace. Writes go through dsh-atomic-write (`withFileLock`
 *   for the read-modify-write cycle + `writeFileAtomic` for the commit), and
 *   an in-process per-namespace promise chain serializes operations in
 *   invocation order (contract concurrency rule — the lock alone does not
 *   order contenders).
 * - QUOTA (host-defined): 256 keys AND 256 KiB of serialized content per
 *   namespace; a `set` that would cross either fails with QUOTA_EXCEEDED and
 *   changes nothing.
 * - Keys stay ordinary data even when they collide with Object.prototype
 *   names ("__proto__", "toString", "constructor"): namespace tables are
 *   null-prototype and membership is decided with Object.hasOwn. Values
 *   must be EXACT JSON values — inputs JSON.stringify would silently
 *   mutate (undefined, NaN/±Infinity, functions, class instances, sparse
 *   arrays, cycles) are rejected instead of round-tripping a lie.
 * - A corrupt namespace file is NEVER overwritten silently: every operation
 *   fails with STORAGE_UNAVAILABLE and the bytes stay on disk for manual
 *   recovery. Closing a handle (plugin unload) retains data (contract
 *   cleanup rule); later calls on a closed handle fail STORAGE_UNAVAILABLE.
 * - privacyClass: sensitive — keys AND values are never logged.
 */
import { Context, Service } from '@deepseek-ai/cordis';
import { type GrantStore } from '../adapter/standard/grants.js';
import type { TuiEffectLedgerRuntime } from './effect-ledger.js';
/** Quota: max distinct keys per namespace. */
export declare const STORAGE_MAX_KEYS = 256;
/** Quota: max serialized file size per namespace (bytes). */
export declare const STORAGE_MAX_BYTES: number;
/** Max key length (characters). */
export declare const STORAGE_KEY_MAX_LENGTH = 128;
export type PluginStorageErrorCode = 'PERMISSION_NOT_GRANTED' | 'INVALID_KEY' | 'INVALID_VALUE' | 'QUOTA_EXCEEDED' | 'STORAGE_UNAVAILABLE';
/** Storage failure with the contract's error code on `.code`. */
export declare class PluginStorageError extends Error {
    readonly code: PluginStorageErrorCode;
    constructor(code: PluginStorageErrorCode, message: string);
}
/** The per-namespace handle returned by {@link TuiPluginStorageRuntime.open}. */
export interface TuiPluginStorage {
    get(input: {
        key: string;
    }): Promise<{
        value: unknown | null;
    }>;
    set(input: {
        key: string;
        value: unknown;
    }): Promise<{
        stored: true;
    }>;
    delete(input: {
        key: string;
    }): Promise<{
        deleted: boolean;
    }>;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        tuiPluginStorage: TuiPluginStorageRuntime;
    }
}
/** Namespace directory under the data dir. */
export declare const PLUGIN_STORAGE_DIR = "plugin-storage";
/**
 * Plugin name → safe, collision-free file name. encodeURIComponent keeps
 * alphanumerics and `- _ . ! ~ * ' ( )`, so scoped names like `@foo/bar`
 * encode reversibly; pathological results ('', '.', '..') map to '_'.
 */
export declare function storageFileName(plugin: string): string;
/**
 * `ctx.tuiPluginStorage` — storage.local contract surface. Mounted by the
 * dsh-tui-plugin-host row; grants come from that row's store when present
 * (normal path) or a private read otherwise (bare mounts in tests).
 */
export declare class TuiPluginStorageRuntime extends Service {
    #private;
    constructor(ctx: Context, options?: {
        dir?: string;
        grants?: GrantStore;
        ledger?: TuiEffectLedgerRuntime;
    });
    /** Grants: the plugin-host row's store when mounted, else a private read.
     *  Resolved PER CALL — sibling services mounted later by the same apply()
     *  are not visible to constructors (cordis), so a constructor-time probe
     *  would silently stick to the fallback. */
    private grants;
    /** Optional observability; a bare mount (tests) simply records nothing. */
    private ledger;
    /**
     * Host-internal read-only diagnostic probe. Never opens a namespace, never
     * writes to disk; it only confirms the mounted storage runtime is reachable.
     */
    probeDiagnostic(): {
        service: 'tuiPluginStorage';
        ok: true;
        dir: string;
    };
    /**
     * Open the caller's private namespace. Identity = the PASSED context's
     * verified Component identity (no way to name another plugin). The handle
     * closes automatically when the caller's context unloads (idempotent
     * disposer); data is retained (contract cleanup rule).
     */
    open(pluginCtx: Context): TuiPluginStorage;
}
//# sourceMappingURL=plugin-storage.d.ts.map
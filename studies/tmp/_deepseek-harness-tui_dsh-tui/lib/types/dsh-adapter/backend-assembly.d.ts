import type { Context } from '@deepseek-ai/cordis';
/** One bundle whose `Backend` declaration did not become a registry entry. */
export interface BackendAssemblyRefusal {
    readonly bundle: string;
    readonly reason: string;
}
/** What one assembly pass did. Returned rather than only logged, so the
 *  regression can assert the pass without reading the logs. */
export interface BackendAssembly {
    /** The profile manifest the pass read, when this boot has one. */
    readonly profile: string | undefined;
    /** Bundle layers the pass looked at (composition-owned packages excluded). */
    readonly scanned: readonly string[];
    /** Backend ids registered by this pass, in scan order. The built-in seed is
     *  registered before it and is not part of the report. */
    readonly registered: readonly string[];
    /** Bundles that announced a backend this host could not assemble. */
    readonly refused: readonly BackendAssemblyRefusal[];
}
/**
 * Register every backend an installed bundle declares.
 *
 * Synchronous by contract (see the module comment): the caller runs this before
 * the boot parses a backend choice. A second pass over the same composition is a
 * no-op for the entries the first pass registered (see {@link assemblyStateOf}) —
 * two callers exist on purpose: the entry decides which kernel to boot *before*
 * `apply` runs, and both questions ("is this bundle a layer" for the route, "which
 * backend is this id" for the session) are answered by the same registry.
 */
export declare function assembleBackendsFromProfile(ctx: Context): BackendAssembly;
//# sourceMappingURL=backend-assembly.d.ts.map
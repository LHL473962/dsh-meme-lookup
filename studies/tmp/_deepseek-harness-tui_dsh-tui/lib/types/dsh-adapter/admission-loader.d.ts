/**
 * Admits third-party plugin activations via their package-root
 * `dsh-plugin.json` (`getHostAdmission()`), binding the identity to the
 * plugin's own fiber. A refused activation keeps running (an
 * unload would rewrite the user's profile) but stays outside every mediated
 * capability. Listeners and the retry timer ride the caller's `ctx.effect`.
 */
import { Context } from '@deepseek-ai/cordis';
import { type TuiPluginHost } from './plugin-host.js';
/**
 * The Loader's own ESM resolver (`cordis-plugin-loader`'s Node-internals
 * adapter, or `undefined` when this runtime exposes no internals). Admission
 * must resolve the entry through it: the Loader's active export conditions and
 * custom hooks decide which module actually executes, and that module's
 * manifest owns the identity and permissions.
 *
 * `import` is the same door `EntryTree.import()` uses — the module the Loader
 * would execute for that specifier, out of the Loader's own cache. It is
 * optional because the shape is classified by `resolveSync` alone; a
 * resolution that cannot be executed is still a resolution, and the D-1
 * assembly falls back to importing the URL the resolver returned.
 */
export type ActiveResolver = {
    readonly version: 'v1';
    resolveSync(specifier: string, parentURL: string, attributes: object): {
        readonly url: string;
    };
    import?(specifier: string, parentURL: string, attributes: object): Promise<unknown>;
} | {
    readonly version: 'v2';
    resolveSync(parentURL: string, request: {
        specifier: string;
        attributes: object;
    }): {
        readonly url: string;
    };
    import?(specifier: string, parentURL: string, attributes: object): Promise<unknown>;
};
/** The Cordis loader entry that owns a fiber (`cordis-plugin-loader`). */
interface LoaderEntryLike {
    readonly options?: {
        readonly name?: string;
    };
    readonly ctx?: {
        readonly baseUrl?: string;
    };
    readonly fiber?: {
        readonly state?: number;
    } | null;
}
/** The part of the Loader's surface this package reads. Exported (D-1) because
 *  the backend assembly resolves a bundle's entry through the same resolver. */
export interface LoaderLike {
    readonly internal?: ActiveResolver;
    locate?(fiber?: object): string | undefined;
    resolve?(id: string): LoaderEntryLike | undefined;
    entries?(): Iterable<LoaderEntryLike>;
}
/**
 * Watch `ctx`'s composition and admit every third-party activation that
 * carries a package-root `dsh-plugin.json`. The listeners and the retry
 * timer are bound to `ctx`'s own teardown.
 */
export declare function armAdmissionLoader(ctx: Context, options?: {
    host?: () => TuiPluginHost | undefined;
    /** @internal retry bound for the regression; production uses RETRY_ATTEMPTS. */
    retryAttempts?: number;
}): void;
/** The Loader of `ctx`'s composition, when there is one. One accessor for both
 *  readers of it (the admission loader and the D-1 backend assembly), so
 *  "which Loader" cannot drift between them. */
export declare function compositionLoader(ctx: Context): LoaderLike | undefined;
/**
 * The **URL** an entry `name` resolves to, through the exact resolver owned by
 * the Loader that would execute it: its active conditions and hooks must select
 * the same code and authority.
 *
 * `undefined` is a refusal to guess, not a "not found": a `cordis:` builtin has
 * no module of its own, and a Loader without Node internals leaves the question
 * open (one debug line, then out). Exported for the D-1 backend assembly, which
 * resolves a *package* the same way rather than growing a second path resolver.
 */
export declare function resolveEntryUrl(loader: LoaderLike, name: string, baseUrl: string | undefined): string | undefined;
/**
 * Import a module through the Loader's own door (`EntryTree.import`), so the
 * namespace handed back is the one the Loader executed — conditions, hooks and
 * module cache included. Falls back to importing the URL the resolver already
 * returned (still the Loader's answer; no second resolver) for a loader shape
 * that can resolve but not import.
 */
export declare function loadThroughLoader(loader: LoaderLike, name: string, url: string, baseUrl: string | undefined): Promise<Record<string, unknown>>;
/** Walk up from the entry module to its package root. A manifest counts only
 *  beside the `package.json` that establishes that root: a stray copy deeper
 *  in the tree (a build output directory, say) must not claim an outer
 *  package's code for its own identity. The walk stops at the first
 *  `package.json`, so DSH's own rows (a `package.json` one level up from
 *  their entry) cost one lookup instead of a climb to the filesystem root.
 *  Exported for the D-1 backend assembly, which reads a bundle's declaration
 *  through this same rule. */
export declare function findManifest(from: string): string | undefined;
export {};
//# sourceMappingURL=admission-loader.d.ts.map
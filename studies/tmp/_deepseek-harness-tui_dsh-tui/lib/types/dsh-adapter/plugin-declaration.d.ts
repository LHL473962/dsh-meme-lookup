import type { Context } from '@deepseek-ai/cordis';
import { type BackendSpec } from '../adapter/spec/tui-contributions.js';
/** One package's declaration: the file it lives in and its exact bytes. */
export interface PluginDeclaration {
    readonly path: string;
    readonly source: string;
}
/**
 * The package-root `dsh-plugin.json` of `packageName`, or `undefined` when the
 * package is not resolvable from this composition or ships no declaration.
 * Tolerant by design: a broken install answers "no declaration", never a throw.
 */
export declare function pluginDeclarationOf(ctx: Context, packageName: string): PluginDeclaration | undefined;
/**
 * One `Backend` contribution a package declaration carries, as this host's own
 * `Backend` definition reads it (D-1).
 */
export interface DeclaredBackend {
    /** The declaration's own `name` (the contribution's local name, distinct from
     *  the backend id its `spec` carries). */
    readonly name: string;
    /** The public declaration, already validated: `validateBackendSpec()`'s result. */
    readonly spec: BackendSpec;
}
/** What one declaration contributes, and what could not be read out of it. */
export interface DeclaredBackends {
    readonly backends: readonly DeclaredBackend[];
    /** Entries that announced themselves as `Backend` contributions but are not
     *  one this host can read; each names the entry and why. Empty is the normal
     *  answer for a package that contributes no backend. */
    readonly problems: readonly string[];
}
/**
 * The `Backend` contributions of one `dsh-plugin.json` record.
 *
 * One reader for every consumer — the C-5 residue watch (`plugin-manage.ts`) and
 * the D-1 assembly both ask this — so the two cannot disagree about which entries
 * are backend contributions. It applies the same gates the admission path
 * applies, in the same order: the definition's own coordinate (`apiVersion` +
 * `kind`), the contribution's outer `id`, the definition's metadata rule
 * (`name`), then the family validator. An entry that fails any of them is
 * reported in `problems` rather than dropped in silence; a `null`/non-object
 * record simply contributes nothing. Below that, silence means absence only: a
 * `contributes` that is not an object, and an `x-dsh-tui` point that is not an
 * array, are malformed declarations, reported like any other gate (the canonical
 * validator refuses both shapes).
 *
 * `projectManifest` drops contributions without a string outer `id`; this
 * reader must not register one either. That contribution id may differ from
 * the backend id in `spec.id`.
 *
 * Identity is deliberately not this function's business: it reads a record the
 * caller already obtained, and says nothing about which package that record
 * belongs to (#1568 — a manifest counts only beside the package root that
 * establishes it).
 * A claimed backend also requires a valid canonical manifest projection; in
 * particular, duplicate contribution identities must not bypass admission.
 */
export declare function declaredBackendsOf(record: unknown): DeclaredBackends;
/**
 * {@link declaredBackendsOf} over a declaration's raw bytes. A declaration that
 * does not parse is a problem, not an empty answer: the file is there and says
 * something this host cannot read.
 */
export declare function declaredBackendsIn(source: string): DeclaredBackends;
/** This application's own package: the composition, never a plugin of it. */
export declare const COMPOSITION_PACKAGE = "@deepseek-harness-tui/dsh-tui";
/**
 * What a listed bundle belongs to the composition itself rather than to the
 * plugins a person installs. Gate 1 is a statement about *plugins* ("this
 * package declares no TUI contribution"), so applying it to the host's own
 * rows — or to this application — would report the composition as a missing
 * declaration. Everything else is judged by its declaration alone.
 */
export declare function isCompositionOwned(packageName: string): boolean;
/**
 * The package-root declaration of a directory that is not installed yet: a
 * `/plugin install <path>` spec names its directory, so the pre-install notice
 * can read the same file the admission path will read after the install.
 * Tolerant like {@link pluginDeclarationOf}: a missing or unreadable file
 * answers "no declaration", never a throw. A spec that names a tarball, a git
 * URL or a registry package has no directory here — the caller reports the
 * notice as unjudged rather than guessing.
 */
export declare function pluginDeclarationIn(directory: string): PluginDeclaration | undefined;
/**
 * Gate 1's pre-install statement about a package, as data (Stage C-4).
 *
 * `unjudged` is the honest answer for anything whose declaration is not on
 * this machine yet — a registry spec has no package-root file to read before
 * the install runs. The notice therefore never claims "this package supports
 * dsh-tui"; it says either what it read, or that the answer arrives with the
 * install (the standing tag in `/plugin` is what really reports it, C-3).
 */
export type PluginInstallNotice = 
/** A declaration was read and this profile accepts it. */
{
    readonly kind: 'declared';
}
/** Read, and the package ships no package-root `dsh-plugin.json`. */
 | {
    readonly kind: 'undeclared';
}
/**
 * Read, and this profile cannot accept it: it does not parse, does not
 * project, or fails the admission catalog's validation. The five-state
 * negotiation is deliberately not part of this answer — it is a statement
 * about a *running* host, and the standing tag in `/plugin` reports it after
 * the install.
 */
 | {
    readonly kind: 'invalid';
    readonly error: string;
}
/** Nothing on disk to read yet: the answer arrives with the install. */
 | {
    readonly kind: 'unjudged';
};
//# sourceMappingURL=plugin-declaration.d.ts.map
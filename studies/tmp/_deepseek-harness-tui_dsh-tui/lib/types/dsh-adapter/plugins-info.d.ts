/**
 * /plugin diagnostics surface (C-070 trust disclosure + C-030 negotiation
 * diagnostics): assembles the lines behind the `/plugin` command.
 *
 * Sections (overview):
 *
 * 1. TRUST BANNER — always the first line (C-070): plugins run in-process;
 *    grants are behavioral constraints, not a security boundary; passing
 *    validation is not proof of safety.
 * 2. HOST DESCRIPTOR summary — what the running host actually advertises
 *    (coordinates + generation), including drift-dropped contracts.
 * 3. GRANT MATRIX — plugins × the registered permissions. The plugin set is
 *    the union of FOOTPRINTS ONLY: keys of the grants file, pluginIds seen
 *    in the effect ledger, and storage namespaces on disk. The header says so
 *    honestly. (The profile's own bundles and rows are a different question
 *    and come from the host plugin service, below — this matrix stays the
 *    footprint view it has always been.)
 * 4. LEDGER TAIL — the last 5 effect-ledger records.
 * 5. BUNDLES AND ROWS — what the profile composes, from `ctx.pluginManager`
 *    (`./plugin-manager.ts`): official installation-supplied bundles first,
 *    then the profile's own, each with gate 1's tag from its declaration
 *    (`./plugin-declaration.ts`), plus the loader entries no patch row can
 *    address. Absent service → every line above is unchanged and one line
 *    says why the half is missing.
 *
 * `/plugin check <path>` uses the parser and projection from the pinned
 * @dsh-std/manifest revision, then evaluates every public/private protocol
 * through one ProtocolCatalog. Manifests and on-disk files are UNTRUSTED input:
 * every derived line passes cleanScalarText before it reaches the
 * transcript, and any credential they quote — a URL field, the spec a person
 * typed, text the service hands back — is redacted first (`redactUrl`/
 * `redactText`).
 */
import type { GrantStore } from '../adapter/standard/grants.js';
import type { HostDescriptorBuild } from '../adapter/standard/descriptor.js';
import { type PluginDeclaration, type PluginInstallNotice } from './plugin-declaration.js';
import { type PluginManagerView } from './plugin-manager.js';
/** How many plugins the matrix shows before an overflow note. */
export declare const PLUGINS_MATRIX_MAX_ROWS = 20;
/** How many ledger records the tail section shows. */
export declare const PLUGINS_LEDGER_TAIL = 5;
export interface PluginsInfoDeps {
    /** Effective grant answers (the plugin-host row's store when mounted). */
    grants: GrantStore;
    /** The plugin-host row's descriptor build; undefined → row not mounted. */
    host?: HostDescriptorBuild;
    /** A package's declaration, resolved from the running composition. */
    declaration?: (packageName: string) => PluginDeclaration | undefined;
    /** Test overrides; default under DATA_DIR. */
    dataDir?: string;
    ledgerFile?: string;
    storageDir?: string;
}
/**
 * One report cell: credentials redacted first, then sanitized, then capped —
 * truncation comes last, or a cut URL keeps the head of its own secret.
 *
 * Exported for the install flow (C-4): pnpm's output and the service's error
 * text are foreign input reaching the same transcript, and one renderer means
 * the two surfaces cannot disagree about what a cell is.
 */
export declare const cell: (value: unknown) => string;
/** Where the three footprint sources live. */
export interface PluginFootprintPaths {
    readonly dataDir: string;
    readonly ledgerFile: string;
    readonly storageDir: string;
}
/** Test overrides for {@link pluginFootprintPaths}; the report's own deps satisfy it. */
export interface PluginFootprintOverrides {
    readonly dataDir?: string | undefined;
    readonly ledgerFile?: string | undefined;
    readonly storageDir?: string | undefined;
}
/** The plugin set for the matrix: grants-file keys ∪ ledger pluginIds ∪
 *  storage namespaces ('host'/'undeclared' ledger identities are not
 *  plugins and are excluded). */
export declare function pluginFootprints(paths: PluginFootprintPaths): string[];
/**
 * The three footprint sources, resolved the way the diagnostics resolve them
 * (test overrides first, else the packaged locations under `~/.dsh-tui`).
 */
export declare function pluginFootprintPaths(overrides?: PluginFootprintOverrides): PluginFootprintPaths;
/**
 * Whether one plugin id still has a footprint in this profile: a grants-file
 * key, an effect-ledger record, or a storage namespace. The same three sources
 * the matrix unions — a removal that left something behind is read here rather
 * than by a second reader that could disagree with the report (C-5).
 */
export declare function pluginFootprintContains(pluginId: string, overrides?: PluginFootprintOverrides): boolean;
/** Which form of the command the raw argument text asks for. */
export type PluginArgs = {
    readonly kind: 'overview';
} | {
    readonly kind: 'list';
} | {
    readonly kind: 'check';
    readonly path: string;
} | {
    readonly kind: 'info';
    readonly spec: string;
} | {
    readonly kind: 'registries';
}
/** `/plugin install <spec>`: the write path (C-4), which the UI drives. */
 | {
    readonly kind: 'install';
    readonly spec: string;
}
/**
 * The three lifecycle forms (C-5), which the UI drives through
 * `dsh-adapter/plugin-manage.ts`. `target` is the raw argument: a bundle name
 * or a row identity, resolved by the flow against the profile it reads rather
 * than by a grammar here.
 */
 | {
    readonly kind: 'remove';
    readonly target: string;
} | {
    readonly kind: 'enable';
    readonly target: string;
} | {
    readonly kind: 'disable';
    readonly target: string;
} | {
    readonly kind: 'unknown';
    readonly sub: string;
};
/** Route `/plugin`'s argument text: one parser, so both halves of the report agree. */
export declare function parsePluginArgs(args: string): PluginArgs;
/** The `/plugin` overview lines (banner always first). */
export declare function pluginsInfoLines(args: string, deps: PluginsInfoDeps): string[];
/**
 * Gate 1's pre-install statement about an install target (C-4), as data.
 *
 * It runs the same parse/project/validate pipeline `check <path>` and the list
 * tags run — one implementation, so the surfaces cannot disagree — over the
 * declaration of the target directory the caller resolved. It deliberately stops
 * before `negotiate`: admission's five states are a statement about a *running*
 * host, and the standing tag in `/plugin` is where they are reported after the
 * install. What a person needs before installing is narrower and decidable: is
 * there a declaration at all, and does this profile's catalog accept it.
 *
 * The evidence is the target directory and nothing else. A declaration resolved
 * by package name would be the profile's already-installed copy of that name —
 * a different artifact from the one being installed (another version, or a local
 * directory), which is how a stale same-name package used to answer for a new
 * target.
 *
 * The two empty answers are not the same thing, and that is the point:
 *
 * - a directory the caller resolved (`install <path>` specs) either carries a
 *   package-root `dsh-plugin.json` or does not, so no file is `undeclared`;
 * - a target with no directory to read (a registry name, a tarball, a git spec)
 *   ships no file this machine can read, so an empty answer there is `unjudged`
 *   — the flow cannot honestly claim a package it has never seen fails gate 1.
 */
export declare function declarationNoticeFor(target: {
    readonly directory?: string | undefined;
}): PluginInstallNotice;
/** The service-backed half of the report (empty for a form that needs no service). */
export declare function pluginServiceLines(args: string, deps: PluginsInfoDeps, manager: PluginManagerView | undefined): Promise<string[]>;
/** `/plugin`: the diagnostics half plus the profile's own bundles and rows. */
export declare function pluginReport(args: string, deps: PluginsInfoDeps, manager: PluginManagerView | undefined): Promise<string[]>;
//# sourceMappingURL=plugins-info.d.ts.map
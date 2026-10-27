/**
 * Skill collection: filesystem scanning (primary) plus registry supplement.
 *
 * The web profile mounts the skill-filesystem provider only at the agent
 * preset scope layer, so the host plane cannot read project/user skills from
 * ctx.skills — the list route scans the official root conventions itself and
 * merges registry entries (bundled / runtime) by name. Because that scan is
 * what supplies an editable path, the custom roots the provider was actually
 * configured with are read back off the live loader rows
 * (customSkillDirsFromLoader) and scanned alongside this plugin's own
 * customSkillDirs; otherwise the registry's custom-source entries would be
 * listed with no path and no way to manage them.
 */
import type { ProviderSkillIdentity } from './provider-toggles.ts';
/** Display order and copy for each source level. */
export interface SourceGroup {
    key: string;
    title: string;
    hint: string;
}
/** Source levels produced by filesystem scanning (registry sources map to the same set). */
export declare const SOURCE_GROUPS: SourceGroup[];
/** Registry source -> display level mapping (unlisted sources fall into "other"). */
export declare const REGISTRY_SOURCE_LEVEL: ReadonlyMap<string, string>;
/**
 * Whether a string is a skill name the official registry accepts.
 * @param name - candidate skill name.
 * @returns whether it matches the official skill-name grammar.
 */
export declare function isSkillName(name: string): boolean;
/**
 * Official precedence rank per source (lower wins): the values
 * @deepseek-ai/dsh-skill-filesystem assigns its roots plus the registry's
 * runtime rank. A duplicate name resolves by this rank across every source the
 * panel shows, so the entry it displays is the one the model receives. Note
 * runtime (250) sits between the project roots and the custom root, not last.
 */
export declare const SKILL_SOURCE_RANK: ReadonlyMap<string, number>;
/**
 * Precedence rank of a display level (see SKILL_SOURCE_RANK).
 * @param level - a source level key or an other:<source> bucket.
 * @returns the rank; unknown levels rank last.
 */
export declare function rankOf(level: string): number;
/**
 * How the panel classifies what backs a skill locally.
 *
 * - `editable`: a filesystem scan resolved the SKILL.md, so the entry carries
 *   the `path` the write routes accept.
 * - `provider-file`: the official registry reports a real instruction file
 *   (`SkillSummary.path`) that this panel's scan did not resolve. The file
 *   exists — saying otherwise is issue #1842 — but it is not a path the write
 *   routes trust, so no row control may be offered for it.
 * - `virtual`: the registry reports no instruction file at all; "no local
 *   file" is the accurate statement.
 */
export type SkillFileState = 'editable' | 'provider-file' | 'virtual';
/** One skill entry as served to the panel. */
export interface SkillEntry {
    name: string;
    description: string;
    whenToUse?: string;
    provider?: string;
    level: string;
    path?: string;
    /** What backs this skill locally (see SkillFileState). */
    fileState: SkillFileState;
    /** True when the skill was discovered through a symlink entry (deletion is not allowed). */
    linked?: boolean;
    modelInvocable: boolean;
    userInvocable: boolean;
    /** Project workspace root path this skill belongs to. */
    workspaceRoot?: string;
    /** Display name of the workspace directory. */
    workspaceName?: string;
    /** True when the skill belongs to the primary active session workspace. */
    isActiveWorkspace?: boolean;
}
/** Registry snapshot entry shape (subset of ctx.skills entries). */
export interface RegistrySkill {
    name: string;
    description: string;
    whenToUse?: string;
    provider?: string;
    source: string;
    /**
     * Absolute instruction file path the provider reports
     * (`SkillSummary.path` in @deepseek-ai/dsh-skill: "Absolute instruction file
     * path when supplied by the provider; absent for virtual skills"). This is
     * the field that distinguishes a provider-backed skill with a real SKILL.md
     * from a virtual one — NOT `resourceBase`, which names a directory of
     * relative resources rather than an instruction file.
     */
    path?: string;
    resourceBase?: {
        kind: string;
        path?: string;
    };
    invocation?: {
        modelInvocable?: boolean;
        userInvocable?: boolean;
    };
}
/** Options for collectSkills. */
export interface CollectOptions {
    /** Registry snapshot workspace base. */
    cwd: string;
    /** Project roots to scan (each scans .dsh/skills and .agents/skills). */
    projectRoots?: string[];
    /** Extra custom skill roots (the plugin's own config plus every live provider row). */
    customSkillDirs?: string[];
    /** User dsh config root (~/.dsh). */
    dshHome: string;
    /** User agents config root (~/.agents). */
    agentsHome: string;
    /** ctx.skills registry (snapshot). */
    registry: {
        snapshot(options: {
            cwd: string;
        }): Promise<{
            skills: RegistrySkill[];
            complete: boolean;
        }>;
    };
    /**
     * Plugin-provided skills the panel has switched off (see
     * provider-toggles.ts). Honored for `provider-file` rows only; absent means
     * no switch was ever used.
     */
    providerDisabledSkills?: readonly ProviderSkillIdentity[];
}
/** Result of a collection pass. */
export interface CollectResult {
    skills: SkillEntry[];
    complete: boolean;
}
/** Group payload served by the list route. */
export interface GroupPayload {
    key: string;
    title: string;
    hint: string;
    skills: SkillEntry[];
}
/** Workspace descriptor for multi-workspace isolation. */
export interface WorkspaceItem {
    root: string;
    name: string;
    active: boolean;
}
/** List payload served by the list route. */
export interface ListPayload {
    cwd: string;
    projectRoots: string[];
    complete: boolean;
    groups: GroupPayload[];
    workspaces?: WorkspaceItem[];
}
/** Find the nearest ancestor directory containing .git (cwd itself when none). */
export declare function findProjectRoot(cwd: string): string;
/**
 * Normalize a custom-root list: drop blanks, resolve each entry to an absolute
 * path, and de-duplicate.
 *
 * Two sources can name the same root — the plugin's own `customSkillDirs` and
 * the live `skill-filesystem` row config — and the official provider resolves
 * every configured root with `resolve()` before scanning it. Matching that
 * here keeps the scanned identity equal to the path the write routes later
 * re-resolve, so a toggle or delete addresses the file the panel displayed.
 * @param dirs - configured custom skill roots (possibly empty or duplicated).
 * @returns absolute, de-duplicated, non-empty roots in first-seen order.
 */
export declare function normalizeSkillRoots(dirs: readonly string[]): string[];
/** One live loader entry as the composition enumerates it. */
export interface LoaderEntryLike {
    options?: {
        id?: unknown;
        name?: unknown;
        config?: unknown;
    };
    fiber?: {
        config?: unknown;
    };
}
/**
 * Collect the custom skill roots every live `skill-filesystem` loader row
 * declares.
 *
 * The official documentation mounts the provider as a profile row and puts
 * `customSkillDirs` on that row, not on this plugin. Without reading those
 * rows the panel shows the row's skills in the "Custom directories" group
 * (the registry reports their `source` as `custom`) while owning no scanned
 * path for them, so every row-level control answers 404. Both the row's raw
 * `options.config` and the resolved `fiber.config` are read: the loader
 * interpolates `!!js` expressions into the latter, and the shipped preset
 * row uses one for its bundled skills directory.
 * @param entries - live loader entries (any iterable).
 * @returns the declared custom roots, unnormalized.
 */
export declare function customSkillDirsFromLoader(entries: Iterable<LoaderEntryLike> | undefined): string[];
/**
 * Apply the panel's provider-skill switches to a finished collection.
 *
 * Only a `provider-file` row can carry such a switch: an `editable` row's
 * switch rewrites the SKILL.md frontmatter (and is therefore already reflected
 * by the scan), and a `virtual` row has no file at all, so both are left
 * exactly as the scan and registry reported them. Like the frontmatter field
 * the local switch rewrites, this clears `modelInvocable` only — the provider's
 * own `userInvocable` policy is not the model's automatic-call decision and
 * stays as registered.
 *
 * It is deliberately the LAST step of the collection: the registry merge can
 * replace a scanned entry with the registry's own (pathless) one, so applying
 * the store earlier would let merge order decide whether a row is switchable.
 * @param skills - collected entries, mutated in place as the merge does.
 * @param disabled - identities the panel switched off.
 */
export declare function applyProviderToggles(skills: Iterable<SkillEntry>, disabled: readonly ProviderSkillIdentity[]): void;
/** Group by level, ordered by SOURCE_GROUPS then leftovers, sorted by name inside each group. */
export declare function buildPayload(skills: SkillEntry[], complete: boolean, cwd: string, projectRoots: string[]): ListPayload;
/**
 * Collect grouped skills: filesystem scanning plus registry supplement.
 *
 * Both halves apply the official acceptance rules: a scanned file must declare
 * name and description and the name must be a valid skill name (see
 * scanSkillRoot), and a duplicate name resolves by the official source rank
 * across the scan and the registry, so the entry shown is the one the model
 * receives. The registry additionally contributes bundled and runtime entries
 * of its own, and fills whenToUse / invocation flags on a same-rank peer.
 * @param options - collection options.
 * @returns skills and whether the registry snapshot was complete.
 */
export declare function collectSkills(options: CollectOptions): Promise<CollectResult>;
/** Build the new skill file content (create route). */
export declare function buildSkillContent(name: string, description: string, whenToUse: string | undefined, content: string, disabled: boolean): string;
/** Create a skill file (mkdir -p + write). Returns the absolute target path. */
export declare function writeSkillFile(baseDir: string, name: string, description: string, whenToUse: string | undefined, content: string): Promise<string>;
/**
 * Overwrite an existing skill file in place (edit route). The caller has
 * already resolved the path through a fresh scan, and the enabled state is
 * carried over so an edit never silently re-enables a disabled skill.
 */
export declare function overwriteSkillFile(path: string, name: string, description: string, whenToUse: string | undefined, content: string, disabled: boolean): Promise<string>;
/** Move a skill file into its .trash sibling directory (recoverable delete). */
export declare function trashSkillFile(path: string): Promise<string>;
/** User skill root convention. */
export declare function userSkillRoot(dshHome: string): string;
/** Project skill root convention (project root + .dsh/skills). */
export declare function projectSkillRoot(projectRoot: string): string;

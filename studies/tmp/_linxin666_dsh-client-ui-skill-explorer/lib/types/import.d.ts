/**
 * Skill import: batch-create SKILL.md files from a local directory or a .zip
 * archive.
 *
 * Import is a *creation* surface, not a write-to-a-path one. The existing
 * write routes stay exactly as they were — every one of them still only
 * mutates a path a fresh scan resolved for the name the panel displayed — so
 * the security model they implement is unchanged. This module's own boundary
 * is narrower than it first looks:
 *
 * - the only files it ever reads are `<dir>/<name>/SKILL.md`,
 *   `<dir>/<name>.md` (one level, the same convention the panel's scan uses)
 *   or the archive the browser posted;
 * - the only files it ever writes are `<skill root>/<name>/SKILL.md` under the
 *   documented user/project root, and only when that file does not exist yet;
 * - symbolic links in the source are skipped rather than followed, so an
 *   import cannot be pointed at content through a planted link;
 * - a candidate the official provider would not load (no name/description
 *   frontmatter, a name outside the official grammar) is skipped, so the
 *   panel never creates a skill the model cannot receive.
 *
 * Collisions resolve by the official source rank (the same table the list
 * route uses): importing into a root that is *weaker* than an existing
 * same-name skill would produce a file the model never receives, so that
 * candidate is reported as shadowed instead of written.
 */
import { type SkillEntry } from './collect.ts';
/** Hard bounds on one import, so a hostile archive cannot exhaust the host. */
export declare const IMPORT_LIMITS: {
    /** Largest archive the route accepts (a base64 body is larger on the wire). */
    readonly archiveBytes: number;
    /** Most entries one archive may carry. */
    readonly entries: 512;
    /** Largest one imported SKILL.md (the same cap the create/edit routes use). */
    readonly skillBytes: number;
    /** Largest total uncompressed skill text one import may produce. */
    readonly totalBytes: number;
};
/**
 * A failure caused by what the request supplied (a malformed archive, an
 * unreadable source directory), never by the host. The route maps it to 400 so
 * the user reads an actionable message instead of a generic server error.
 */
export declare class ImportRequestError extends Error {
}
/** One source file found at an import source, before validation. */
export interface RawCandidate {
    /** Archive entry path or absolute file path, reported back to the user. */
    origin: string;
    /** The SKILL.md text, verbatim. */
    content: string;
}
/** Why a candidate was not imported. */
export type ImportSkipReason = 'invalid-frontmatter' | 'invalid-name' | 'too-large' | 'duplicate' | 'exists' | 'shadowed';
/** The result for one candidate. */
export interface ImportOutcome {
    /** The skill name, or the origin when no valid name was found. */
    name: string;
    /** Where the candidate was read from. */
    origin: string;
    status: 'imported' | 'skipped';
    /** Why it was skipped (absent when imported). */
    reason?: ImportSkipReason;
    /** The written SKILL.md path (imported only). */
    path?: string;
}
/** A validated candidate ready to be written. */
export interface ImportCandidate {
    name: string;
    content: string;
    origin: string;
}
/** One candidate's fate before any file is written. */
export interface ImportPlanItem {
    candidate: ImportCandidate;
    decision: 'import' | 'skip';
    reason?: ImportSkipReason;
}
/** The import result the route returns. */
export interface ImportReport {
    /** The source level the files were written into. */
    level: string;
    /** Per-candidate outcomes, in source order. */
    outcomes: ImportOutcome[];
    /** How many files were created. */
    imported: number;
    /** How many candidates were skipped. */
    skipped: number;
}
/** The source of an import: a host directory, or an archive the browser sent. */
export type ImportSource = {
    kind: 'directory';
    path: string;
} | {
    kind: 'archive';
    data: Buffer;
};
/** One decoded archive entry. */
export interface ArchiveEntry {
    path: string;
    data: Buffer;
}
/**
 * Decode a zip archive into its file entries (stored and deflate methods).
 *
 * Only what a skills archive uses is supported; zip64, encrypted entries and
 * unknown compression methods are rejected with a message naming the problem,
 * so an unsupported archive fails loudly instead of importing half of itself.
 * @param archive - the raw archive bytes.
 * @returns every file entry, directories excluded.
 * @throws when the archive is malformed or uses an unsupported feature.
 */
export declare function readZipEntries(archive: Buffer): ArchiveEntry[];
/**
 * Pull the SKILL.md candidates out of decoded archive entries. Nested layouts
 * (`<skill>/SKILL.md` at any depth, so a zipped folder of skills works) are
 * accepted; every other file in the archive is ignored rather than reported,
 * because an archive routinely carries READMEs and assets beside the skills.
 * @param entries - decoded archive entries.
 * @returns one candidate per SKILL.md, in archive order.
 */
export declare function candidatesFromArchive(entries: readonly ArchiveEntry[]): RawCandidate[];
/**
 * Read the candidates of one host directory, one level deep: a skill
 * directory (`<name>/SKILL.md`) or a flattened `<name>.md`, the same two
 * shapes the panel's own scan accepts. Dot entries and symbolic links are
 * skipped — a link would let an import copy content the user did not point at,
 * and the panel's linked-skill rules have no meaning for a copy.
 * @param dir - absolute source directory.
 * @returns the candidates found, in directory order.
 * @throws when the path is not a readable directory.
 */
export declare function candidatesFromDirectory(dir: string): Promise<RawCandidate[]>;
/**
 * Validate one raw candidate the way the official provider accepts a skill:
 * the frontmatter must declare a non-empty description and a name inside the
 * official grammar. The skill's identity is the *frontmatter* name — that is
 * the name the registry loads and the model receives, so the imported
 * directory is named after it rather than after the source folder.
 * @param raw - the candidate text and where it came from.
 * @returns the validated candidate, or the reason it cannot be imported.
 */
export declare function parseCandidate(raw: RawCandidate): {
    candidate?: ImportCandidate;
    name: string;
    reason?: ImportSkipReason;
};
/**
 * Decide every candidate's fate before writing anything, so a conflict or a
 * duplicate cannot leave a half-applied import behind.
 *
 * Conflicts use the official source rank: a same-name skill at a *stronger*
 * source outranks the target root and the imported file would never be the
 * one the model receives (skipped as shadowed); a same-name skill at the
 * *same* source means the name is already taken in that root (skipped as
 * existing); a weaker source is shadowed by the import, so it is written.
 * @param candidates - validated candidates in source order.
 * @param existing - the skills a fresh collection just found.
 * @param targetLevel - the source level the import writes into.
 * @returns one plan item per candidate, in source order.
 */
export declare function planImport(candidates: readonly ImportCandidate[], existing: readonly SkillEntry[], targetLevel: string): ImportPlanItem[];
/**
 * Write the planned candidates into one skill root. Every write is a new file:
 * an existing SKILL.md is never overwritten, and a failure after the first
 * file leaves the earlier imports in place (each one is individually valid and
 * the panel simply lists them — the report says which succeeded).
 * @param plan - the plan from planImport.
 * @param baseDir - the target skill root.
 * @returns one outcome per plan item, in plan order.
 */
export declare function executeImport(plan: readonly ImportPlanItem[], baseDir: string): Promise<ImportOutcome[]>;
/** Arguments for one import run. */
export interface ImportRequest {
    /** Target skill root (already resolved from the root choice by the route). */
    baseDir: string;
    /** Source level the root writes into ('user-dsh' or 'project-dsh'). */
    targetLevel: string;
    /** Where the candidates come from. */
    source: ImportSource;
    /** The skills a fresh collection found, for the conflict rule. */
    existing: readonly SkillEntry[];
}
/**
 * Run one import: extract, validate, plan, then write.
 * @param request - the resolved target root, source and current catalog.
 * @returns per-candidate outcomes plus the counts.
 */
export declare function importSkills(request: ImportRequest): Promise<ImportReport>;

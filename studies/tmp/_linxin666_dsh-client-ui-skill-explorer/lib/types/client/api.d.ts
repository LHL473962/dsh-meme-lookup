/**
 * Skill center API client (browser half). Talks to the host route family over
 * same-origin fetch; the host enforces the trust fence on its side.
 */
/**
 * What backs a skill locally (host-classified).
 *
 * - `editable`: a filesystem scan resolved the SKILL.md; `path` is writable.
 * - `provider-file`: a plugin provider reports a real instruction file the
 *   panel's scan did not resolve. The file exists, but the write routes do not
 *   trust this path, so the row offers no file controls — it does carry the
 *   enable switch, which the host records in the panel's own store (#1854).
 * - `virtual`: no instruction file exists; "no local file" is accurate.
 */
export type SkillFileState = 'editable' | 'provider-file' | 'virtual';
/** One skill entry as served by the host. */
export interface SkillEntry {
    name: string;
    description: string;
    whenToUse?: string;
    provider?: string;
    level: string;
    path?: string;
    /** What backs this skill locally (see SkillFileState). */
    fileState: SkillFileState;
    /** True for skills discovered through a symlink entry (deletion not allowed). */
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
/** Group payload served by the host. */
export interface GroupPayload {
    key: string;
    title: string;
    hint: string;
    skills: SkillEntry[];
}
/** Workspace item descriptor. */
export interface WorkspaceItem {
    root: string;
    name: string;
    active: boolean;
}
/** List payload served by the host. */
export interface ListPayload {
    cwd: string;
    projectRoots: string[];
    complete: boolean;
    groups: GroupPayload[];
    workspaces?: WorkspaceItem[];
}
/** Why a candidate the import read was not created. */
export type ImportSkipReason = 'invalid-frontmatter' | 'invalid-name' | 'too-large' | 'duplicate' | 'exists' | 'shadowed';
/** One candidate's result from an import run. */
export interface ImportOutcome {
    /** The skill name, or the origin when no valid name was found. */
    name: string;
    /** The archive entry or file path it was read from. */
    origin: string;
    status: 'imported' | 'skipped';
    /** Why it was skipped (absent when imported). */
    reason?: ImportSkipReason;
    /** The written SKILL.md path (imported only). */
    path?: string;
}
/** The report an import run returns. */
export interface ImportReport {
    ok: true;
    /** The source level the files were written into. */
    level: string;
    /** One outcome per candidate, in source order. */
    outcomes: ImportOutcome[];
    imported: number;
    skipped: number;
}
/** Where the skills to import come from. */
export type ImportSourceRequest = {
    kind: 'directory';
    path: string;
} | {
    kind: 'archive';
    data: string;
};
/** One thrown API error with the host-provided message. */
export declare class ApiError extends Error {
}
/** Skill center API client. */
export declare class SkillApi {
    /** Fetch the grouped skill list. */
    list(cwd?: string): Promise<ListPayload>;
    /** Enable or disable a skill (rewrites disable-model-invocation). */
    setEnabled(name: string, path: string, enabled: boolean): Promise<{
        name: string;
        enabled: boolean;
        modelInvocable: boolean;
        path?: string;
    }>;
    /**
     * Switch a plugin-provided skill off/on in this panel.
     *
     * There is no path to certify: the row's file belongs to the provider and
     * sits outside the roots this panel scans, so the host records the
     * (provider, name) pair in the panel's own store instead of rewriting a
     * SKILL.md the panel does not own. The host answers with the stored state;
     * the invocable view itself comes from the next list call.
     */
    setProviderEnabled(name: string, provider: string | undefined, enabled: boolean): Promise<{
        ok: true;
        name: string;
        provider: string;
        disabled: boolean;
    }>;
    /** Create a skill file under the user or project root. */
    create(payload: {
        root: 'user' | 'project';
        name: string;
        description: string;
        whenToUse?: string;
        content: string;
        cwd: string;
    }): Promise<{
        ok: true;
        name: string;
        path: string;
    }>;
    /** One skill's editable fields and body, resolved from the panel's path. */
    read(name: string, path: string): Promise<{
        name: string;
        path: string;
        description: string;
        whenToUse?: string;
        content: string;
    }>;
    /** Rewrite an existing skill file in place (name and location unchanged). */
    update(payload: {
        name: string;
        path: string;
        description: string;
        whenToUse?: string;
        content: string;
    }): Promise<{
        ok: true;
        name: string;
        path: string;
        disabled: boolean;
    }>;
    /**
     * Batch-create skills from a host directory or a .zip archive.
     *
     * The directory form names a path on the host (the route is loopback-only,
     * so the browser and the host are the same machine by construction); the
     * archive form carries the bytes the browser read, base64-encoded, so the
     * user can pick a file through the ordinary file dialog. Both only ever
     * create new files under the chosen root; a name that already resolves at
     * the same or a stronger source comes back skipped with its reason.
     */
    importSkills(payload: {
        root: 'user' | 'project';
        cwd: string;
        source: ImportSourceRequest;
    }): Promise<ImportReport>;
    /** Delete a skill (moves it into .trash). */
    remove(name: string, path: string): Promise<{
        ok: true;
        name: string;
        moved: string;
    }>;
    private request;
}

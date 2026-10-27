/** Host entry and public domain exports for the AI novel bundle. */
import type { Context } from '@deepseek-ai/cordis';
import type { ConnectionRpcHandler } from '@deepseek-ai/dsh-client-connection';
import { WorkspaceId, type Workspace } from '@deepseek-ai/dsh-workspace';
import z from '@deepseek-ai/schemastery';
import { createPresetInstaller } from './preset-installer.ts';
export { openNovelProject } from './novel-project.ts';
export type { NovelProjectOptions } from './novel-project.ts';
export { NovelProjectError } from './types.ts';
export type { AssetRef, CommitReceipt, CreativeStrategy, NovelApplyRequest, NovelAssetReadResult, NovelInitializeRequest, NovelProject, NovelProjectErrorCode, NovelProjectId, NovelQueryMatch, NovelQueryResult, NovelReadRequest, NovelReadResult, NovelReplaceRequest, NovelWorkingSetResult, Revision, } from './types.ts';
export { createPresetInstaller } from './preset-installer.ts';
export type { PresetInstaller, PresetInstallResult, PresetInstallStatus } from './preset-installer.ts';
/** Stable Host plugin name used by Cordis diagnostics. */
export declare const name = "dsh-ai-novel-writer";
/** Required Host services. */
export declare const inject: string[];
/** Host configuration for the explicit preset setup surface. */
export interface Config {
    /** Absolute user preset root receiving the package's immutable preset directory. */
    readonly presetRoot?: string;
}
/** Host configuration schema. */
export declare const Config: z<Config>;
/** Minimal read face consumed from the Host Workspace registry. */
export interface NovelWorkspaceRegistry {
    /**
     * @param workspaceId Opaque Workspace identity received from the browser.
     * @returns The registered canonical directory, or undefined for an unknown id.
     */
    get(workspaceId: WorkspaceId): Pick<Workspace, 'path'> | undefined;
}
/**
 * Create the loopback preset setup RPC handler.
 *
 * @param installer Preset installer owned by the Host plugin instance.
 * @param reportFailure Host-only diagnostic sink for underlying errors.
 * @returns A handler for the two closed setup endpoints.
 */
export declare function createPresetSetupRpcHandler(installer: ReturnType<typeof createPresetInstaller>, reportFailure?: (error: unknown) => void): ConnectionRpcHandler;
/**
 * Create the complete loopback RPC handler for setup and read-only project context.
 *
 * @param installer Preset installer owned by the Host plugin instance.
 * @param workspaces Authoritative Workspace registry read face.
 * @param reportFailure Host-only diagnostic sink for underlying errors.
 * @returns A handler whose read endpoints accept only opaque Workspace identity and recognized selectors.
 */
export declare function createAiNovelRpcHandler(installer: ReturnType<typeof createPresetInstaller>, workspaces: NovelWorkspaceRegistry, reportFailure?: (error: unknown) => void): ConnectionRpcHandler;
/**
 * Register the loopback-only preset setup channel.
 *
 * @param ctx Host Cordis context with Connection available.
 * @param config Resolved user preset root.
 * @returns Nothing.
 */
export declare function apply(ctx: Context, config: Config): void;

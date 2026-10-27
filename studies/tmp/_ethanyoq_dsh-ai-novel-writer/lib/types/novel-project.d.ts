import type { AssetRef, NovelInitializeRequest, NovelProject } from './types.ts';
/** Deployment-varying bounds for one filesystem-backed project. */
export interface NovelProjectOptions {
    readonly assetBytes?: number;
    readonly workingSetBytes?: number;
    readonly queryMatches?: number;
}
/**
 * Validate and render one replacement exactly as it would be stored.
 *
 * @param target Project-owned asset identity.
 * @param text Proposed UTF-8 text.
 * @returns Canonical LF text with schema-ordered JSON for structured assets.
 * @throws {@link NovelProjectError} when the proposed content is invalid.
 */
export declare function canonicalNovelAssetText(target: AssetRef, text: string): string;
/**
 * Validate and render an initialization request exactly as it will be stored.
 *
 * @param request Complete manifest identity and writing settings approved by the user.
 * @returns Canonical project-manifest bytes.
 * @throws {@link NovelProjectError} when any manifest field is invalid.
 */
export declare function canonicalNovelInitialization(request: NovelInitializeRequest): string;
/**
 * Return the fixed project-relative path for one discriminated asset reference.
 *
 * @param target Project-owned asset identity.
 * @returns A normalized project-relative path that never contains caller-provided path segments.
 */
export declare function novelAssetSource(target: AssetRef): string;
/**
 * Open the filesystem-backed implementation for a Harness workspace.
 *
 * @param root Absolute workspace directory; the project may be initialized after opening.
 * @param options Validated read, write, working-set, and query limits.
 * @returns A project implementation that performs bounded reads and atomic single-asset writes.
 * @throws {@link NovelProjectError} when the root or a configured limit is invalid.
 */
export declare function openNovelProject(root: string, options?: NovelProjectOptions): NovelProject;

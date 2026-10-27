/** Host-side projection for the read-only novel context window. */
import type { NovelAssetReadWireResult, NovelContextReadResult } from './context-types.ts';
import type { AssetRef } from './types.ts';
/**
 * Read one exact project-owned asset without exposing its filesystem source.
 *
 * @param root Canonical Workspace directory resolved by the Host registry.
 * @param target Recognized asset identity with no caller-provided path segment.
 * @param signal Cancellation signal propagated to the domain read.
 * @returns Normalized text, revision, byte count, and the recognized target.
 * @throws {@link NovelProjectError} when the project or asset is invalid, unsafe, over budget, or cancelled.
 */
export declare function readNovelAsset(root: string, target: AssetRef, signal: AbortSignal): Promise<NovelAssetReadWireResult>;
/**
 * Read one Workspace's bounded, non-mutating novel context projection.
 *
 * @param root Canonical Workspace directory resolved by the Host registry.
 * @param chapter Selected one-based chapter number.
 * @param signal Cancellation signal propagated through every project read.
 * @returns An initialized projection or an explicit not-initialized result.
 * @throws {@link NovelProjectError} when the project is invalid, unsafe, over budget, cancelled, or the chapter is outside the plan.
 */
export declare function readNovelContext(root: string, chapter: number, signal: AbortSignal): Promise<NovelContextReadResult>;

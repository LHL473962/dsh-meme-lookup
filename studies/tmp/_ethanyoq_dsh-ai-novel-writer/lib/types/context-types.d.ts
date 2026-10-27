/** Browser-safe read model for the read-only novel context window. */
import type { AssetRef, CreativeStrategy, NovelProjectId, Revision } from './types.ts';
/** Exact path-free asset bytes returned to the browser editor. */
export interface NovelAssetReadWireResult {
    readonly target: AssetRef;
    readonly revision: Revision;
    readonly text: string;
    readonly bytes: number;
}
/** Project identity and writing settings shown by the context window. */
export interface NovelContextProject {
    readonly projectId: NovelProjectId;
    readonly title: string;
    readonly language: string;
    readonly genre: string;
    readonly plannedChapters: number;
    readonly targetWordsPerChapter: number;
    readonly creativeStrategy: CreativeStrategy;
    readonly updatedAt: string;
}
/** One character summary suitable for the bounded context window. */
export interface NovelContextCharacter {
    readonly id: string;
    readonly name: string;
    readonly role: string;
    readonly summary: string;
}
/** Story blueprint fields shown without an editing surface. */
export interface NovelContextStoryBlueprint {
    readonly premise: string;
    readonly themes: readonly string[];
    readonly world: string;
    readonly mainPlot: string;
    readonly endingGoal: string;
}
/** Selected chapter blueprint fields shown without an editing surface. */
export interface NovelContextChapterBlueprint {
    readonly chapter: number;
    readonly title: string;
    readonly purpose: string;
    readonly beats: readonly string[];
    readonly characterIds: readonly string[];
    readonly continuityNotes: readonly string[];
    readonly status: 'planned' | 'drafting' | 'drafted' | 'revised' | 'final';
}
/** Bounded selected-chapter prose preview. */
export interface NovelContextDraft {
    readonly revision: Revision;
    readonly preview: string;
    readonly bytes: number;
    readonly truncated: boolean;
}
/** Complete initialized-project response from the loopback Host endpoint. */
export interface NovelContextReady {
    readonly status: 'ready';
    readonly project: NovelContextProject;
    readonly progress: {
        readonly selectedChapter: number;
        readonly plannedChapters: number;
        readonly status: NovelContextChapterBlueprint['status'] | 'unplanned';
        readonly draftPresent: boolean;
        readonly draftBytes: number;
    };
    readonly characters: readonly NovelContextCharacter[];
    readonly storyBlueprint: NovelContextStoryBlueprint | null;
    readonly chapterBlueprint: NovelContextChapterBlueprint | null;
    readonly draft: NovelContextDraft | null;
    readonly omittedSources: readonly string[];
}
/** Host response when the selected Workspace has no Harness novel project. */
export interface NovelContextNotInitialized {
    readonly status: 'not-initialized';
}
/** Every successful context-read response. */
export type NovelContextReadResult = NovelContextReady | NovelContextNotInitialized;
/**
 * Validate one untrusted discriminated asset reference at a wire boundary.
 *
 * @param value Unknown target received from Host RPC or browser transport.
 * @returns One recognized project-owned asset reference with no path fields.
 * @throws {Error} When the discriminant, chapter, or exact property set is invalid.
 */
export declare function parseNovelAssetRef(value: unknown): AssetRef;
/**
 * Validate one path-free exact asset response before it enters editable browser state.
 *
 * @param value Unknown response value from the generic Connection RPC client.
 * @returns Exact normalized text, revision, byte count, and recognized target.
 * @throws {Error} When any field or exact property set is invalid.
 */
export declare function parseNovelAssetReadResult(value: unknown): NovelAssetReadWireResult;
/**
 * Validate one untrusted loopback RPC value before it enters browser state.
 *
 * @param value Unknown response value from the generic Connection RPC client.
 * @returns A strict read-only novel context result with no path-bearing fields.
 * @throws {Error} When any required field, value, or exact property set is invalid.
 */
export declare function parseNovelContextReadResult(value: unknown): NovelContextReadResult;

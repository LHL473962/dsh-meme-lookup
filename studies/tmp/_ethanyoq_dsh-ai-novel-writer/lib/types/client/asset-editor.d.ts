/** Pure canonical asset codecs and editor models for the compact browser workbench. */
import type { AssetRef, CreativeStrategy, NovelProjectId, Revision } from '../types.ts';
/** Asset kinds editable in the current revision-aware workbench slice. */
export type NovelWorkbenchEditableTarget = Extract<AssetRef, {
    readonly kind: 'project' | 'characters' | 'story-blueprint' | 'chapter-blueprint' | 'chapter-draft';
}>;
/** User-editable project settings; durable identity and timestamps remain controller-owned. */
export interface NovelProjectSettingsDraft {
    readonly title: string;
    readonly language: string;
    readonly genre: string;
    readonly plannedChapters: string;
    readonly targetWordsPerChapter: string;
    readonly creativeStrategy: CreativeStrategy;
}
/** User-editable projection of one canonical character record. */
export interface NovelCharacterDraft {
    readonly id: string;
    readonly name: string;
    readonly role: string;
    readonly summary: string;
    readonly goal: string;
    readonly relationshipsText: string;
    readonly notes: string;
}
/** User-editable story blueprint projection with one theme per line. */
export interface NovelStoryBlueprintDraft {
    readonly premise: string;
    readonly themesText: string;
    readonly world: string;
    readonly mainPlot: string;
    readonly endingGoal: string;
}
/** Supported durable chapter planning state. */
export type NovelChapterStatus = 'planned' | 'drafting' | 'drafted' | 'revised' | 'final';
/** User-editable chapter blueprint projection with list fields one item per line. */
export interface NovelChapterBlueprintDraft {
    readonly title: string;
    readonly purpose: string;
    readonly beatsText: string;
    readonly characterIdsText: string;
    readonly continuityNotesText: string;
    readonly status: NovelChapterStatus;
}
/** Revision-aware editor phase shown without implying a disk write. */
export type NovelAssetEditorPhase = 'clean' | 'editing' | 'preview' | 'submitting' | 'submitted' | 'stale' | 'error';
/** Session admission state for model-generated one-asset proposals. */
export type NovelAssetGenerationPhase = 'editing' | 'submitting' | 'submitted' | 'reconciling' | 'applied' | 'error';
/** User brief and visible outcome for model generation that never writes from the browser. */
export interface NovelAssetGenerationState {
    readonly brief: string;
    readonly phase: NovelAssetGenerationPhase;
    readonly message?: string;
    /** CommitReceipt revision that identifies the approved canonical Host bytes. */
    readonly expectedRevision?: Revision;
    readonly expectedReplacement?: string;
}
/** Exact single-asset proposal generated before Session admission. */
export interface NovelAssetChangePreview {
    readonly prompt: string;
    readonly replacement: string;
}
interface NovelAssetEditorBase {
    readonly phase: NovelAssetEditorPhase;
    readonly dirty: boolean;
    readonly baseRevision: Revision;
    readonly originalText: string;
    readonly summary: string;
    readonly replacement?: string;
    readonly preview?: NovelAssetChangePreview;
    readonly latestRevision?: Revision;
    readonly message?: string;
    readonly generation?: NovelAssetGenerationState;
}
/** Project settings editor state backed by one exact manifest revision. */
export interface NovelProjectEditorScreen extends NovelAssetEditorBase {
    readonly kind: 'project';
    readonly draft: NovelProjectSettingsDraft;
}
/** Complete characters asset editor state backed by one exact revision. */
export interface NovelCharactersEditorScreen extends NovelAssetEditorBase {
    readonly kind: 'characters';
    readonly characters: readonly NovelCharacterDraft[];
    readonly selectedId: string | undefined;
    readonly search: string;
    readonly visibleCharacterIds: readonly string[];
}
/** Complete story-blueprint editor state backed by one exact revision. */
export interface NovelStoryBlueprintEditorScreen extends NovelAssetEditorBase {
    readonly kind: 'story-blueprint';
    readonly draft: NovelStoryBlueprintDraft;
}
/** One chapter-blueprint editor backed by its exact chapter and revision. */
export interface NovelChapterBlueprintEditorScreen extends NovelAssetEditorBase {
    readonly kind: 'chapter-blueprint';
    readonly chapter: number;
    readonly draft: NovelChapterBlueprintDraft;
}
/** Markdown chapter editor backed by its exact chapter and revision. */
export interface NovelChapterDraftEditorScreen extends NovelAssetEditorBase {
    readonly kind: 'chapter-draft';
    readonly chapter: number;
    readonly text: string;
}
/** Any open revision-aware single-asset editor. */
export type NovelAssetEditorScreen = NovelProjectEditorScreen | NovelCharactersEditorScreen | NovelStoryBlueprintEditorScreen | NovelChapterBlueprintEditorScreen | NovelChapterDraftEditorScreen;
/** Current compact drawer screen; it never represents a second application shell. */
export type NovelWorkbenchScreen = {
    readonly kind: 'root';
} | {
    readonly kind: 'asset-loading';
    readonly target: NovelWorkbenchEditableTarget;
} | {
    readonly kind: 'asset-error';
    readonly target: NovelWorkbenchEditableTarget;
    readonly message: string;
} | NovelAssetEditorScreen;
/** Parsed immutable manifest fields retained across a project-settings proposal. */
export interface ProjectManifestEditorSource extends NovelProjectSettingsDraft {
    readonly formatVersion: 1;
    readonly kind: 'harness-novel-project';
    readonly projectId: NovelProjectId;
    readonly plannedChapters: string;
    readonly targetWordsPerChapter: string;
    readonly createdAt: string;
    readonly updatedAt: string;
}
/**
 * Parse one authoritative manifest into immutable identity plus editable settings.
 *
 * @param text Canonical JSON bytes returned by the Host exact-read endpoint.
 * @returns Strict manifest fields used to preserve identity during replacement.
 * @throws {Error} When durable JSON, exact fields, ids, settings, or timestamps are invalid.
 */
export declare function parseProjectManifest(text: string): ProjectManifestEditorSource;
/** @param source Parsed manifest source. @returns Its user-editable settings projection. */
export declare function projectDraft(source: ProjectManifestEditorSource): NovelProjectSettingsDraft;
/**
 * Render project settings as the exact canonical replacement while preserving identity.
 *
 * @param source Parsed immutable manifest source.
 * @param draft User-edited settings.
 * @param updatedAt Canonical timestamp generated when the proposal is previewed.
 * @returns Strict two-space JSON with one trailing LF.
 * @throws {Error} When edited settings or the timestamp are invalid.
 */
export declare function serializeProject(source: ProjectManifestEditorSource, draft: NovelProjectSettingsDraft, updatedAt: string): string;
/**
 * Parse the authoritative complete characters asset into editable records.
 *
 * @param text Canonical JSON, or empty text for an absent asset.
 * @param revision Authoritative exact-read revision.
 * @returns Ordered character drafts with relationships represented one per line.
 * @throws {Error} When durable content violates the strict character schema.
 */
export declare function parseCharacters(text: string, revision: Revision): NovelCharacterDraft[];
/**
 * Render every character draft as the canonical complete asset.
 *
 * @param characters Ordered character drafts.
 * @returns Strict two-space JSON with one trailing LF.
 * @throws {Error} When ids, required fields, or relationship lines are invalid.
 */
export declare function serializeCharacters(characters: readonly NovelCharacterDraft[]): string;
/**
 * Parse one authoritative story blueprint, including the explicit absent asset.
 *
 * @param text Canonical JSON, or empty text for an absent asset.
 * @param revision Authoritative exact-read revision.
 * @returns Editable blueprint fields with one theme per line.
 * @throws {Error} When durable content violates the strict story schema.
 */
export declare function parseStoryBlueprint(text: string, revision: Revision): NovelStoryBlueprintDraft;
/**
 * Render a story blueprint as the canonical complete asset.
 *
 * @param draft Edited story fields.
 * @returns Strict two-space JSON with one trailing LF.
 * @throws {Error} When required fields are empty.
 */
export declare function serializeStoryBlueprint(draft: NovelStoryBlueprintDraft): string;
/**
 * Parse one authoritative chapter blueprint, including the explicit absent asset.
 *
 * @param text Canonical JSON, or empty text for an absent asset.
 * @param revision Authoritative exact-read revision.
 * @param chapter Chapter number encoded by the asset reference.
 * @returns Editable chapter fields with arrays represented one item per line.
 * @throws {Error} When durable content violates the strict chapter schema.
 */
export declare function parseChapterBlueprint(text: string, revision: Revision, chapter: number): NovelChapterBlueprintDraft;
/**
 * Render one chapter blueprint as the canonical complete asset.
 *
 * @param chapter Chapter number fixed by the asset reference.
 * @param draft Edited planning fields.
 * @returns Strict two-space JSON with one trailing LF.
 * @throws {Error} When the chapter or required fields are invalid.
 */
export declare function serializeChapterBlueprint(chapter: number, draft: NovelChapterBlueprintDraft): string;
/** @param text Edited Markdown. @returns Markdown with canonical LF newlines. */
export declare function serializeChapterDraft(text: string): string;
/**
 * Serialize the exact shallow Agent tool arguments for one replacement proposal.
 *
 * @param target Recognized editable asset.
 * @param baseRevision Revision read before editing.
 * @param replacement Exact canonical replacement text.
 * @param summary User-visible modification summary.
 * @returns Deterministic model prompt using the Agent tool's `targetKind` field.
 * @throws {Error} When the summary is empty.
 */
export declare function assetProposalPrompt(target: NovelWorkbenchEditableTarget, baseRevision: Revision, replacement: string, summary: string): string;
/** @param left First complete character draft list. @param right Second list. @returns Whether ordered fields match exactly. */
export declare function sameCharacters(left: readonly NovelCharacterDraft[], right: readonly NovelCharacterDraft[]): boolean;
/**
 * Filter character ids for the compact list without changing the complete asset.
 *
 * @param characters Complete ordered drafts.
 * @param search Case-insensitive id, name, role, summary, or goal query.
 * @returns Matching ids in durable order.
 */
export declare function visibleCharacterIds(characters: readonly NovelCharacterDraft[], search: string): string[];
export {};

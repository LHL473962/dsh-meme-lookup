/** Pure React bodies for the compact workbench and its Plugin Configuration evidence card. */
import type { ReactNode } from 'react';
import type { PresetSetupState } from './setup-store.ts';
import type { NovelCharacterDraft, NovelChapterBlueprintDraft, NovelProjectSettingsDraft, NovelStoryBlueprintDraft, NovelWorkbenchEditableTarget } from './asset-editor.ts';
import type { NovelInitializationDraft, NovelWorkbenchState } from './workbench-store.ts';
/** Props for the one-column workbench content. */
export interface NovelWorkbenchBodyProps {
    readonly state: NovelWorkbenchState;
    readonly backIcon?: ReactNode;
    readonly refresh: () => void;
    readonly selectChapter: (chapter: number) => void;
    readonly updateInitialization: (patch: Partial<NovelInitializationDraft>) => void;
    readonly updateInitializationGenerationBrief: (brief: string) => void;
    readonly generateInitialization: () => void;
    readonly previewInitialization: () => void;
    readonly submitInitialization: () => void;
    readonly openAsset: (target: NovelWorkbenchEditableTarget) => void;
    readonly backToAssets: () => void;
    readonly updateProjectSettings: (patch: Partial<NovelProjectSettingsDraft>) => void;
    readonly updateStoryBlueprint: (patch: Partial<NovelStoryBlueprintDraft>) => void;
    readonly updateChapterBlueprint: (patch: Partial<NovelChapterBlueprintDraft>) => void;
    readonly updateChapterDraft: (text: string) => void;
    readonly updateAssetSummary: (summary: string) => void;
    readonly updateAssetGenerationBrief: (brief: string) => void;
    readonly generateAsset: () => void;
    readonly previewAssetChange: () => void;
    readonly submitAssetChange: () => void;
    readonly discardAssetChanges: () => void;
    readonly reloadStaleAsset: () => void;
    readonly setCharacterSearch: (search: string) => void;
    readonly selectCharacter: (id: string) => void;
    readonly createCharacter: () => void;
    readonly updateCharacter: (patch: Partial<Omit<NovelCharacterDraft, 'id'>>) => void;
    readonly deleteCharacter: () => void;
}
/**
 * Render the initialization tracer bullet and the existing bounded project summary.
 *
 * @param props Workbench state and user actions.
 * @returns Accessible one-column drawer content.
 */
export declare function NovelWorkbenchBody({ state, backIcon, refresh, selectChapter, updateInitialization, updateInitializationGenerationBrief, generateInitialization, previewInitialization, submitInitialization, openAsset, backToAssets, updateProjectSettings, updateStoryBlueprint, updateChapterBlueprint, updateChapterDraft, updateAssetSummary, updateAssetGenerationBrief, generateAsset, previewAssetChange, submitAssetChange, discardAssetChanges, reloadStaleAsset, setCharacterSearch, selectCharacter, createCharacter, updateCharacter, deleteCharacter, }: NovelWorkbenchBodyProps): import("react").JSX.Element;
/** Props for the Plugin Configuration evidence card. */
export interface NovelPluginCardBodyProps {
    readonly setupState: PresetSetupState;
    readonly workbenchState: NovelWorkbenchState;
    readonly openWorkbench: (returnFocus: HTMLButtonElement) => void;
    readonly refresh: () => void;
}
/**
 * Render visible evidence that the browser plugin and its Host/Preset/project integrations are active.
 *
 * @param props Current setup and workbench state plus explicit actions.
 * @returns One Plugin Configuration list item.
 */
export declare function NovelPluginCardBody({ setupState, workbenchState, openWorkbench, refresh, }: NovelPluginCardBodyProps): import("react").JSX.Element;

/** Framework-independent state and orchestration for the compact novel workbench. */
import type { SessionId, WorkspaceId } from '@deepseek-ai/dsh-client-runtime/client';
import type { NovelAssetReadWireResult, NovelContextReadResult, NovelContextReady } from '../context-types.ts';
import type { CreativeStrategy, NovelProjectId, Revision } from '../types.ts';
import { type NovelCharacterDraft, type NovelChapterBlueprintDraft, type NovelProjectSettingsDraft, type NovelStoryBlueprintDraft, type NovelWorkbenchEditableTarget, type NovelWorkbenchScreen } from './asset-editor.ts';
export type { NovelAssetChangePreview, NovelAssetEditorPhase, NovelCharacterDraft, NovelChapterBlueprintDraft, NovelChapterBlueprintEditorScreen, NovelChapterDraftEditorScreen, NovelCharactersEditorScreen, NovelAssetEditorScreen, NovelAssetGenerationState, NovelProjectEditorScreen, NovelProjectSettingsDraft, NovelStoryBlueprintDraft, NovelStoryBlueprintEditorScreen, NovelWorkbenchEditableTarget, NovelWorkbenchScreen, } from './asset-editor.ts';
/** Dedicated Preset id expected on a Session that receives novel proposals. */
export declare const AI_NOVEL_PRESET_ID = "ai-novel-writer";
/** Identity values included verbatim in an initialization proposal. */
export interface NovelInitializationIdentity {
    readonly projectId: NovelProjectId;
    readonly createdAt: string;
    readonly updatedAt: string;
}
/** User-editable initialization fields before numeric validation and proposal generation. */
export interface NovelInitializationDraft {
    readonly title: string;
    readonly language: string;
    readonly genre: string;
    readonly plannedChapters: string;
    readonly targetWordsPerChapter: string;
    readonly creativeStrategy: CreativeStrategy;
}
/** Known native-approval availability for the selected Session. */
export type NovelApprovalAvailability = 'ask' | 'never' | 'unknown';
/** Minimal durable tool outcome needed to distinguish approval rejection from a committed change. */
export interface NovelApplyOutcome {
    readonly isError: boolean;
    readonly code: string | undefined;
    /** Successful CommitReceipt revision parsed from the durable tool result. */
    readonly newRevision?: Revision;
    readonly attribution: {
        readonly kind: 'initialize';
        readonly requestJson: string;
    } | {
        readonly kind: 'replace';
        readonly targetKind: string;
        readonly chapter?: number;
        readonly baseRevision: string;
        readonly replacement: string;
    } | undefined;
}
/** Error emitted when the browser has no live Host connection. */
export declare class NovelWorkbenchDisconnectedError extends Error {
    /** @param cause Optional transport failure. */
    constructor(cause?: unknown);
}
/** Current Workspace and Session selected in the Harness shell. */
export interface NovelWorkbenchTarget {
    readonly workspaceId: WorkspaceId;
    readonly sessionId: SessionId;
    readonly agentPreset: string | undefined;
    readonly approval: NovelApprovalAvailability;
}
/** Result returned by the current Session prompt operation. */
export type NovelPromptResult = {
    readonly ok: true;
    readonly value: {
        readonly accepted: true;
    };
} | {
    readonly ok: false;
    readonly error: {
        readonly code: string;
        readonly message: string;
    };
};
/** Closed browser operations required by the workbench controller. */
export interface NovelWorkbenchPort {
    /**
     * @param workspaceId Opaque Workspace registry identity, never a local path.
     * @param chapter Selected one-based chapter number.
     * @param signal Cancellation signal for the Host transport and filesystem reads.
     * @returns Bounded context or an explicit uninitialized result.
     * @throws When transport, response validation, project reading, or cancellation fails.
     */
    read(workspaceId: WorkspaceId, chapter: number, signal: AbortSignal): Promise<NovelContextReadResult>;
    /**
     * @param workspaceId Opaque Workspace registry identity, never a local path.
     * @param target Recognized project-owned asset without a filesystem path.
     * @param signal Cancellation signal for the Host transport and filesystem read.
     * @returns Exact normalized asset text and its authoritative revision.
     * @throws When transport, response validation, project reading, or cancellation fails.
     */
    readAsset(workspaceId: WorkspaceId, target: NovelWorkbenchEditableTarget, signal: AbortSignal): Promise<NovelAssetReadWireResult>;
    /**
     * @param sessionId Current dedicated Session identity.
     * @param text Proposal prompt with a deterministic body and unique correlation marker, submitted as an ordinary queued turn.
     * @returns Host admission result; a successful result does not imply approval or persistence.
     */
    prompt(sessionId: SessionId, text: string): Promise<NovelPromptResult>;
}
/** Initialization submission phase retained with the editable draft. */
export type NovelInitializationPhase = 'editing' | 'preview' | 'submitting' | 'submitted' | 'error';
/** Exact deterministic values shown before an initialization prompt may be submitted. */
export interface NovelInitializationPreview {
    readonly json: string;
    readonly prompt: string;
}
/** Complete initialization editor state. */
export interface NovelInitializationState {
    readonly draft: NovelInitializationDraft;
    readonly phase: NovelInitializationPhase;
    readonly preview?: NovelInitializationPreview;
    readonly blocker?: string;
    readonly message?: string;
    readonly generation?: NovelInitializationGenerationState;
}
/** Model-generation state for an uninitialized project. */
export interface NovelInitializationGenerationState {
    readonly brief: string;
    readonly phase: 'editing' | 'submitting' | 'submitted' | 'reconciling' | 'error';
    readonly message?: string;
    readonly identity?: NovelInitializationIdentity;
    readonly expectedRevision?: Revision;
}
/** Last user-visible read operation outcome. */
export interface NovelReadFeedback {
    readonly kind: 'loading' | 'success' | 'error' | 'disconnected';
    readonly message: string;
}
interface NovelWorkbenchStateBase {
    readonly open: boolean;
    readonly readFeedback?: NovelReadFeedback;
}
/** Complete render state for the compact workbench. */
export type NovelWorkbenchState = ({
    readonly status: 'idle' | 'empty' | 'loading' | 'disconnected';
} & NovelWorkbenchStateBase) | ({
    readonly status: 'not-initialized';
    readonly initialization: NovelInitializationState;
} & NovelWorkbenchStateBase) | (NovelContextReady & NovelWorkbenchStateBase & {
    readonly screen: NovelWorkbenchScreen;
    readonly submissionBlocker?: string;
}) | ({
    readonly status: 'error';
    readonly message: string;
} & NovelWorkbenchStateBase);
/**
 * Serialize one initialization proposal into the exact model-visible prompt.
 *
 * @param identity Stable project identity and timestamps generated for this proposal.
 * @param draft Validated user fields.
 * @returns Deterministic Chinese instructions containing one shallow JSON object.
 */
export declare function initializationProposalPrompt(identity: NovelInitializationIdentity, draft: NovelInitializationDraft): string;
/** Workbench controller with abort-on-supersede reads and prompt-to-quiescence disposal. */
export declare class NovelWorkbenchController {
    #private;
    /**
     * @param port Closed context-read and Session-prompt operations.
     * @param reportListenerError Error sink for isolated render subscriber failures.
     * @param createIdentity Identity factory invoked only after local form validation succeeds.
     * @param now Canonical timestamp factory used only when previewing a project-settings replacement.
     */
    constructor(port: NovelWorkbenchPort, reportListenerError: (error: unknown) => void, createIdentity?: () => NovelInitializationIdentity, now?: () => string);
    /** @returns Current immutable workbench state. */
    getSnapshot(): NovelWorkbenchState;
    /**
     * @param listener Callback invoked after each state transition.
     * @returns A disposer that removes the subscription.
     */
    subscribe(listener: () => void): () => void;
    /**
     * @param target Current Workspace, Session, Preset, and known approval availability.
     * @returns Nothing; use {@link whenIdle} to await a triggered read.
     */
    setTarget(target: NovelWorkbenchTarget | undefined): void;
    /** @returns Completion after the initial context read settles. */
    open(): Promise<void>;
    /**
     * Read project evidence without opening the drawer, for Plugin Configuration and diagnostics.
     *
     * @returns Completion after the Host read settles.
     */
    inspect(): Promise<void>;
    /** @returns Nothing. */
    close(): void;
    /**
     * Replace initialization draft fields and clear a prior submission result.
     *
     * @param patch Fields changed by the user.
     * @returns Nothing; edits are ignored while prompt admission is pending or the proposal awaits approval.
     * @throws When the project is not in the initialization state.
     */
    updateInitialization(patch: Partial<NovelInitializationDraft>): void;
    /** Update the optional model brief for generating the first project settings proposal. @param brief User intent, or empty text to use the current form and defaults. @returns Nothing. */
    updateInitializationGenerationBrief(brief: string): void;
    /** Ask the selected Session to generate exactly one approval-gated initialization using the current form as guidance. @returns Session admission completion. */
    generateInitialization(): Promise<void>;
    /**
     * Validate the current draft and expose the exact values that a later Session prompt will carry.
     *
     * @returns Nothing; validation failures are published in initialization state and pending submissions are unchanged.
     */
    previewInitialization(): void;
    /**
     * Read one recognized editable asset and drill into its compact editor.
     *
     * @param target One recognized editable asset; chapter assets include their fixed chapter number.
     * @returns Completion after the exact revision read settles.
     */
    openAsset(target: NovelWorkbenchEditableTarget): Promise<void>;
    /** Return a clean editor to the asset list; unsaved or pending state stays visible until explicitly resolved. @returns Nothing. */
    backToAssets(): void;
    /**
     * Update project settings while immutable manifest fields remain controller-owned.
     *
     * @param patch Editable fields changed by the user.
     * @returns Nothing; changes are ignored while prompt admission is pending or approval is awaited.
     */
    updateProjectSettings(patch: Partial<NovelProjectSettingsDraft>): void;
    /**
     * Update the complete story-blueprint draft.
     *
     * @param patch Story fields changed by the user.
     * @returns Nothing; edits are ignored while prompt admission or approval is pending.
     */
    updateStoryBlueprint(patch: Partial<NovelStoryBlueprintDraft>): void;
    /**
     * Update the selected chapter-blueprint draft.
     *
     * @param patch Planning fields changed by the user.
     * @returns Nothing; edits are ignored while prompt admission or approval is pending.
     */
    updateChapterBlueprint(patch: Partial<NovelChapterBlueprintDraft>): void;
    /**
     * Replace the selected chapter's complete Markdown draft.
     *
     * @param text Complete edited Markdown.
     * @returns Nothing; edits are ignored while prompt admission or approval is pending.
     */
    updateChapterDraft(text: string): void;
    /**
     * Replace the human-readable summary attached to the eventual single-asset proposal.
     *
     * @param summary Short explanation shown in the model request and approval card.
     * @returns Nothing; changes are ignored while prompt admission is pending or approval is awaited.
     */
    updateAssetSummary(summary: string): void;
    /** Update the selected model's optional generation brief without changing any asset draft. @param brief User intent, or empty text to rely on current context. @returns Nothing. */
    updateAssetGenerationBrief(brief: string): void;
    /** Ask the selected Session model for one read-then-approval-gated asset proposal, including a dirty form as unsaved guidance. @returns Session admission completion. */
    generateAsset(): Promise<void>;
    /**
     * Filter the in-memory characters list without changing durable content.
     *
     * @param search Case-insensitive id, name, role, summary, or goal query.
     * @returns Nothing.
     */
    setCharacterSearch(search: string): void;
    /**
     * Select one existing character record.
     *
     * @param id Stable character id in the current complete asset.
     * @returns Nothing.
     * @throws {Error} When the id is not present.
     */
    selectCharacter(id: string): void;
    /**
     * Add and select one empty character draft.
     *
     * @returns Nothing; the stable internal id is generated automatically and submitted editors are unchanged.
     */
    createCharacter(): void;
    /**
     * Update the selected character record.
     *
     * @param patch Editable character fields.
     * @returns Nothing; changes are ignored without a selection or during prompt admission.
     */
    updateCharacter(patch: Partial<Omit<NovelCharacterDraft, 'id'>>): void;
    /** Remove the selected character from the proposed complete asset. @returns Nothing. */
    deleteCharacter(): void;
    /** Validate and expose the exact single-asset replacement prompt. @returns Nothing; errors remain visible in editor state. */
    previewAssetChange(): void;
    /**
     * Submit the exact preview through the selected Session without writing from the browser.
     *
     * @returns Completion after Session admission; duplicate and stale submissions return immediately.
     */
    submitAssetChange(): Promise<void>;
    /**
     * Publish one completed `novel_apply_change` outcome before its authoritative asset reread.
     *
     * @param outcome Durable tool error identity; successful values remain filesystem-authoritative.
     * @returns Nothing; rejected edits stay dirty and no result is interpreted as a browser write.
     */
    novelApplySettled(outcome: NovelApplyOutcome): void;
    /** Mark the admitted generation turn complete and require an authoritative reread before another generation. @returns Nothing. */
    generationTurnSettled(): void;
    /** @returns Correlation marker for the unresolved model-generation prompt, if any. */
    currentGenerationCorrelationMarker(): string | undefined;
    /** Fail an unresolved generation whose admitted queue row vanished before durable execution. @returns Nothing. */
    generationPromptLost(): void;
    /** Replace a stale dirty editor with the latest authoritative asset. @returns Nothing. */
    reloadStaleAsset(): void;
    /** Restore the exact base asset and discard unsent local edits. @returns Nothing. */
    discardAssetChanges(): void;
    /**
     * Select and read one planned chapter while the workbench is open.
     *
     * @param chapter One-based chapter number within the loaded project plan.
     * @returns Completion after the read settles; invalid selections publish recoverable feedback without reading.
     */
    selectChapter(chapter: number): Promise<void>;
    /**
     * Validate and submit the current initialization proposal through the selected Session.
     *
     * @returns Completion after the Session accepts or rejects the queued prompt; duplicates return immediately.
     */
    submitInitialization(): Promise<void>;
    /** @returns Completion after an explicit reread settles, or immediately while closed. */
    refresh(): Promise<void>;
    /** Abort the active read and expose disconnected state without waiting for settlement. @returns Nothing. */
    disconnected(): void;
    /** @returns Completion after the latest triggered read and prompt settle. */
    whenIdle(): Promise<void>;
    /** Abort reads, await the non-cancellable Session prompt, and stop publishing state. @returns Quiescent completion. */
    dispose(): Promise<void>;
}

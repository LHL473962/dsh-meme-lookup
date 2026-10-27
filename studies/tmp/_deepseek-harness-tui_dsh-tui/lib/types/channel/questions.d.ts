/**
 * Ask-user-question store, the UI-side half of every structured ask: the
 * DSH user-interaction seam (`ctx.userQuestions`, the model-facing
 * `ask_user_question` tool), local wizards (`/provider`, `/login`) and a
 * non-DSH session's `question.request` events (Claude `AskUserQuestion`,
 * `ExitPlanMode`) all park here. The store surfaces one question at a time to
 * the TUI questionnaire and settles the asker's promise when the user
 * answers, cancels, or the asker's abort signal fires.
 *
 * Queue semantics mirror the official dsh-tui chat/questions machine: asks
 * arrive one at a time in practice (the tool blocks until answered), but
 * concurrent asks from subagents are drained FIFO.
 *
 * This store owns the interaction only. The answered-questionnaire transcript
 * record belongs to the projection: it is folded from the persisted tool result
 * (`channel/question-record.ts`, issue #1009), never pushed from here, so it
 * survives `/resume`, rewind and replay.
 *
 * Backend-neutral (`verify:boundary`): the request/answer shapes are the
 * store's own (structurally the DSH protocol's, so `src/dsh-adapter/` passes
 * its official types straight through), and the interruption error is
 * injected: the DSH store rejects with the protocol's `UserQuestionError`
 * (`src/dsh-adapter/questions.ts`), which dsh-plan-mode keys on.
 */
import { type AdapterRuntimeOptions } from '../adapter/kernel/runtime.js';
import type { PlanReviewIntentView } from '../agent/events.js';
/** One option of a question. */
export interface QuestionOption {
    readonly label: string;
    readonly description?: string;
}
/** One question as the panel renders it. */
export interface QuestionItem {
    readonly id: string;
    readonly question: string;
    /** Explicit authentication purpose; absent means an ordinary question. */
    readonly purpose?: 'auth';
    readonly detail?: string;
    readonly header?: string;
    readonly options?: readonly QuestionOption[];
    readonly multiSelect?: boolean;
    /** Presentation intent: `plan-review` switches to the decision card. */
    readonly intent?: PlanReviewIntentView & {
        readonly callId?: string;
    };
    /** Hide the trailing free-text row for pure option questions (wizards). */
    readonly hideCustomInput?: boolean;
    /** Pre-checked option labels / default-focused option. */
    readonly defaultSelected?: readonly string[];
    /** A URL the question is about: shown under it as a link (OSC 8 where
     *  the terminal supports hyperlinks). */
    readonly link?: string;
    /** A secret answer: the free-text row is masked with `•` while typed
     *  (the answer itself is submitted unchanged). */
    readonly secret?: boolean;
}
/** One ask: a batch of questions plus its cancellation lifetime. */
export interface QuestionRequest {
    readonly questions: readonly QuestionItem[];
    readonly signal?: AbortSignal;
}
/** One committed answer. */
export interface QuestionAnswerItem {
    id: string;
    selected: string[];
    custom?: string;
}
/** The answers of one ask, one per question. */
export interface QuestionAnswer {
    answers: QuestionAnswerItem[];
}
/** One answered question as the panel submits it: selected option labels
 *  plus optional free-text (the protocol's "Other" answer). */
export interface QuestionSelection {
    readonly selected: string[];
    readonly custom?: string;
}
/**
 * In-progress answer state kept while navigating between questions. Drafts
 * are deliberately separate from committed answers: leaving a question
 * should preserve what the user typed without making it count as answered.
 */
export type QuestionDraft = QuestionSelection;
/** Why an ask rejected: the user dismissed it, or it was interrupted. */
export type QuestionInterruption = 'ASK_CANCELLED' | 'ASK_ABORTED';
/** The default interruption error (a host may inject its protocol's own). */
export declare class QuestionInterruptedError extends Error {
    readonly code: QuestionInterruption;
    constructor(message: string, code: QuestionInterruption);
}
/** Whether `error` is an ask rejected by the user or by an abort (either
 *  store's interruption error carries the code). */
export declare function isQuestionInterruption(error: unknown): boolean;
/** The ask surface the channel and wizards drive. */
export interface QuestionStoreLike {
    ask(request: QuestionRequest, options?: {
        redact?: boolean;
    }): Promise<QuestionAnswer>;
}
/** What the TUI renders while a question is pending. */
export interface QuestionSnapshot {
    /** Stable key so the panel remounts (fresh selection state) per question. */
    readonly key: string;
    readonly question: QuestionItem;
    /** 1-based position within the batch. */
    readonly position: number;
    /** Total questions in the batch. */
    readonly total: number;
    /** Questions answered before the current one. */
    readonly answered: number;
    /** Previously saved answer or draft for the current question. */
    readonly draft?: QuestionDraft;
    /** Whether Esc / ← should navigate to the previous question. */
    readonly canGoBack: boolean;
    /** Whether → should navigate to the next question without submitting. */
    readonly canGoForward: boolean;
}
/** Constructor options of {@link QuestionStore}. */
export interface QuestionStoreOptions {
    readonly runtime?: AdapterRuntimeOptions;
    /** The error an interrupted ask rejects with (default {@link QuestionInterruptedError}). */
    readonly interruption?: (message: string, code: QuestionInterruption) => Error;
}
/**
 * Ask-user-question store: parks asks, surfaces one question at a time to
 * the TUI, and settles each ask when the user answers or the batch is
 * interrupted. The TUI subscribes for re-renders and answers via
 * {@link QuestionStore.answerCurrent}.
 */
export declare class QuestionStore implements QuestionStoreLike {
    /** The adapter runtime the shadow-policy guard is evaluated against. */
    protected readonly runtime: AdapterRuntimeOptions;
    private readonly interruption;
    constructor(options?: QuestionStoreOptions);
    private readonly queue;
    private active;
    private readonly listeners;
    private batchSeq;
    /**
     * Cached snapshot: useSyncExternalStore requires a stable reference while
     * nothing changed (a fresh object per call would loop re-renders).
     */
    private snapshotCache;
    /**
     * Subscribe to store changes (useSyncExternalStore contract).
     * @param listener - Called after every mutation that changes the snapshot.
     * @returns An unsubscribe function removing the listener.
     */
    subscribe(listener: () => void): () => void;
    /**
     * The question the TUI should render now, or null when idle.
     * @returns The cached snapshot; the reference is stable between mutations.
     */
    getSnapshot(): QuestionSnapshot | null;
    /**
     * Whether a panel callback still belongs to the question it was rendered
     * for. One stdin batch can deliver → and then Enter to the panel that
     * was mounted for the first key, after the store has already moved.
     */
    stillCurrent(key: string): boolean;
    private emit;
    /** Rebuild the cached snapshot after any mutation of active/index. */
    private rebuildSnapshot;
    /**
     * Asker entry point for the DSH `ask_user_question` provider, local wizards
     * (e.g. `/provider`) and the channel's backend question bridge.
     * @param request - The ask request: questions plus optional abort signal.
     * @param options - `redact` hides answer text from the answered-questionnaire
     *   transcript record (use for batches that collect secrets such as API keys).
     * @returns A promise settling with the collected answers when the user
     *   submits the batch, or rejecting when the ask is interrupted.
     */
    ask(request: QuestionRequest, options?: {
        redact?: boolean;
    }): Promise<QuestionAnswer>;
    /** Advance to the next queued ask, if any. */
    private startNext;
    /**
     * The user submitted an answer for the current question; replaces any
     * previous answer at that position, advances to the next unanswered
     * question, and settles the batch once every question is answered.
     * @param selection - Selected option labels plus optional custom text.
     */
    answerCurrent(selection: QuestionSelection): void;
    /**
     * Navigate to the next question without committing the current one. The
     * caller supplies the panel's draft so a peek forward does not discard
     * in-progress text. No-op on the last question — Enter still owns submit.
     */
    forwardCurrent(draft?: QuestionDraft): void;
    /**
     * Navigate to the previous question without cancelling the batch. The
     * caller supplies the panel's current draft so partially typed text can be
     * restored when the user returns.
     */
    backCurrent(draft?: QuestionDraft): void;
    /** The user interrupted the questionnaire (Esc / Ctrl+C). */
    cancelCurrent(): void;
    /** Reject the active and all queued asks (plugin teardown). */
    rejectAll(): void;
    /** User-initiated cancel — the asker learns the user wants to speak. */
    private cancel;
    /** Asker-side interruption: abort signal fired or plugin teardown. */
    private fail;
}
//# sourceMappingURL=questions.d.ts.map
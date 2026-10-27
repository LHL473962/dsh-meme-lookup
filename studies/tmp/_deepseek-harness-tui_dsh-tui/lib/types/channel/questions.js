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
import { assertCapabilityShadowPolicy, defaultAdapterRuntime, } from '../adapter/kernel/runtime.js';
/** The default interruption error (a host may inject its protocol's own). */
export class QuestionInterruptedError extends Error {
    code;
    constructor(message, code) {
        super(message);
        this.name = 'QuestionInterruptedError';
        this.code = code;
    }
}
/** Whether `error` is an ask rejected by the user or by an abort (either
 *  store's interruption error carries the code). */
export function isQuestionInterruption(error) {
    const code = typeof error === 'object' && error !== null ? error.code : undefined;
    return code === 'ASK_CANCELLED' || code === 'ASK_ABORTED';
}
function isDefined(value) {
    return value !== undefined;
}
function copyDraft(draft) {
    return {
        selected: [...draft.selected],
        ...(draft.custom !== undefined ? { custom: draft.custom } : {}),
    };
}
function selectionFromAnswer(answer) {
    return copyDraft(answer);
}
/**
 * Ask-user-question store: parks asks, surfaces one question at a time to
 * the TUI, and settles each ask when the user answers or the batch is
 * interrupted. The TUI subscribes for re-renders and answers via
 * {@link QuestionStore.answerCurrent}.
 */
export class QuestionStore {
    /** The adapter runtime the shadow-policy guard is evaluated against. */
    runtime;
    interruption;
    constructor(options = {}) {
        this.runtime = options.runtime ?? defaultAdapterRuntime();
        this.interruption = options.interruption ?? ((message, code) => new QuestionInterruptedError(message, code));
    }
    queue = [];
    active;
    listeners = new Set();
    batchSeq = 0;
    /**
     * Cached snapshot: useSyncExternalStore requires a stable reference while
     * nothing changed (a fresh object per call would loop re-renders).
     */
    snapshotCache = null;
    /**
     * Subscribe to store changes (useSyncExternalStore contract).
     * @param listener - Called after every mutation that changes the snapshot.
     * @returns An unsubscribe function removing the listener.
     */
    subscribe(listener) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }
    /**
     * The question the TUI should render now, or null when idle.
     * @returns The cached snapshot; the reference is stable between mutations.
     */
    getSnapshot() {
        return this.snapshotCache;
    }
    /**
     * Whether a panel callback still belongs to the question it was rendered
     * for. One stdin batch can deliver → and then Enter to the panel that
     * was mounted for the first key, after the store has already moved.
     */
    stillCurrent(key) {
        return this.snapshotCache?.key === key;
    }
    emit() {
        for (const listener of this.listeners)
            listener();
    }
    /** Rebuild the cached snapshot after any mutation of active/index. */
    rebuildSnapshot() {
        const pending = this.active;
        if (pending === undefined) {
            this.snapshotCache = null;
            return;
        }
        const question = pending.request.questions[pending.index];
        const savedDraft = pending.drafts[pending.index];
        const savedAnswer = pending.answers[pending.index];
        this.snapshotCache = question === undefined ? null : {
            key: `${pending.batchId}-${pending.index}`,
            question,
            position: pending.index + 1,
            total: pending.request.questions.length,
            answered: pending.index,
            ...(savedDraft !== undefined
                ? { draft: savedDraft }
                : savedAnswer !== undefined
                    ? { draft: selectionFromAnswer(savedAnswer) }
                    : {}),
            canGoBack: pending.index > 0,
            canGoForward: pending.index + 1 < pending.request.questions.length,
        };
    }
    /**
     * Asker entry point for the DSH `ask_user_question` provider, local wizards
     * (e.g. `/provider`) and the channel's backend question bridge.
     * @param request - The ask request: questions plus optional abort signal.
     * @param options - `redact` hides answer text from the answered-questionnaire
     *   transcript record (use for batches that collect secrets such as API keys).
     * @returns A promise settling with the collected answers when the user
     *   submits the batch, or rejecting when the ask is interrupted.
     */
    ask(request, options) {
        assertCapabilityShadowPolicy('host.presentation.ask', this.runtime.mode, this.runtime.slices);
        return new Promise((resolve, reject) => {
            const pending = {
                request,
                batchId: ++this.batchSeq,
                index: 0,
                answers: new Array(request.questions.length),
                drafts: new Array(request.questions.length),
                ...(options?.redact ? { redact: true } : {}),
                resolve,
                reject,
                onAbort: () => {
                    if (this.active === pending) {
                        this.active = undefined;
                        this.rebuildSnapshot();
                        this.fail(pending);
                        this.startNext();
                        this.emit();
                        return;
                    }
                    const at = this.queue.indexOf(pending);
                    if (at >= 0)
                        this.queue.splice(at, 1);
                    this.fail(pending);
                },
            };
            request.signal?.addEventListener('abort', pending.onAbort, { once: true });
            this.queue.push(pending);
            this.startNext();
        });
    }
    /** Advance to the next queued ask, if any. */
    startNext() {
        if (this.active !== undefined || this.queue.length === 0)
            return;
        this.active = this.queue.shift();
        this.rebuildSnapshot();
        this.emit();
    }
    /**
     * The user submitted an answer for the current question; replaces any
     * previous answer at that position, advances to the next unanswered
     * question, and settles the batch once every question is answered.
     * @param selection - Selected option labels plus optional custom text.
     */
    answerCurrent(selection) {
        const pending = this.active;
        const question = pending?.request.questions[pending.index];
        if (pending === undefined || question === undefined)
            return;
        const answer = {
            id: question.id,
            selected: [...selection.selected],
            ...(selection.custom !== undefined && selection.custom !== ''
                ? { custom: selection.custom }
                : {}),
        };
        pending.answers[pending.index] = answer;
        pending.drafts[pending.index] = copyDraft(selection);
        // The answers array is sparse until each question is committed. `every`
        // skips holes, so a peek-ahead answer would look complete and settle
        // early. Read every index explicitly.
        const complete = pending.request.questions.every((_, index) => pending.answers[index] !== undefined);
        if (complete) {
            // Batch complete: settle the asker's promise and drain the next queued
            // ask if any. Filling the last gap after a → peek counts — the user
            // should not have to walk onto an already-answered tail just to submit.
            // The transcript record is NOT written here — it is projected from the
            // persisted tool result (issue #1009), so it survives `/resume`,
            // rewind and every replay.
            const answers = pending.answers.filter(isDefined);
            this.active = undefined;
            pending.resolve({ answers });
            this.startNext();
        }
        else {
            const after = pending.request.questions.findIndex((_, index) => index > pending.index && pending.answers[index] === undefined);
            const firstGap = pending.request.questions.findIndex((_, index) => pending.answers[index] === undefined);
            pending.index = after >= 0 ? after : firstGap;
        }
        this.rebuildSnapshot();
        this.emit();
    }
    /**
     * Navigate to the next question without committing the current one. The
     * caller supplies the panel's draft so a peek forward does not discard
     * in-progress text. No-op on the last question — Enter still owns submit.
     */
    forwardCurrent(draft) {
        const pending = this.active;
        if (pending === undefined || pending.index + 1 >= pending.request.questions.length)
            return;
        if (draft !== undefined) {
            pending.drafts[pending.index] = copyDraft(draft);
        }
        pending.index += 1;
        this.rebuildSnapshot();
        this.emit();
    }
    /**
     * Navigate to the previous question without cancelling the batch. The
     * caller supplies the panel's current draft so partially typed text can be
     * restored when the user returns.
     */
    backCurrent(draft) {
        const pending = this.active;
        if (pending === undefined || pending.index <= 0)
            return;
        if (draft !== undefined) {
            pending.drafts[pending.index] = copyDraft(draft);
        }
        pending.index -= 1;
        this.rebuildSnapshot();
        this.emit();
    }
    /** The user interrupted the questionnaire (Esc / Ctrl+C). */
    cancelCurrent() {
        const pending = this.active;
        if (pending === undefined)
            return;
        this.active = undefined;
        this.rebuildSnapshot();
        this.cancel(pending);
        this.startNext();
        this.emit();
    }
    /** Reject the active and all queued asks (plugin teardown). */
    rejectAll() {
        const active = this.active;
        this.active = undefined;
        this.rebuildSnapshot();
        if (active !== undefined)
            this.fail(active);
        for (const pending of this.queue.splice(0))
            this.fail(pending);
        this.emit();
    }
    /** User-initiated cancel — the asker learns the user wants to speak. */
    cancel(pending) {
        pending.reject(this.interruption('the user cancelled ask_user_question', 'ASK_CANCELLED'));
    }
    /** Asker-side interruption: abort signal fired or plugin teardown. */
    fail(pending) {
        pending.reject(this.interruption('ask_user_question was interrupted before the user answered', 'ASK_ABORTED'));
    }
}

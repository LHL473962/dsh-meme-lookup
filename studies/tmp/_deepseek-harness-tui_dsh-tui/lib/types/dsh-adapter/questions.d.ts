/**
 * The DSH binding of the shared ask-user-question store
 * (`src/channel/questions.ts`): the UI-side half of the DSH
 * user-interaction seam (`ctx.userQuestions`). The harness's model-facing
 * `ask_user_question` tool calls `UserQuestionService.ask()`, which forwards
 * to the provider registered here; the store parks the request, surfaces one
 * question at a time to the TUI questionnaire, and settles the harness
 * promise when the user answers, cancels, or the owning tool's abort signal
 * fires.
 *
 * The store itself is backend-neutral and lives in the channel layer; this
 * module keeps the DSH protocol facts: interruptions reject with the
 * protocol's `UserQuestionError` (dsh-plan-mode keys on its `ASK_CANCELLED`
 * code to tell "the user dismissed the review to speak instead" from a
 * harness abort), asks and answers carry the official types, and the store
 * is bound to the composition root for the presentation Port bridge.
 * Existing importers keep this path (compatibility re-exports below).
 */
import { compositionRoot } from './host-access.js';
import { type AdapterRuntimeOptions } from '../adapter/kernel/runtime.js';
import { type AskUserQuestionAnswer, type AskUserQuestionRequest } from '@deepseek-ai/dsh-user-questions';
import { QuestionStore as SharedQuestionStore } from '../channel/questions.js';
export type { QuestionDraft, QuestionSelection, QuestionSnapshot } from '../channel/questions.js';
/** The shared store, rejecting interruptions with the DSH protocol error. */
export declare class QuestionStore extends SharedQuestionStore {
    constructor(runtime?: AdapterRuntimeOptions);
    /**
     * The DSH `host.presentation.ask` entry point, typed for the protocol (its
     * requests and answers are the store's shapes). The shadow-policy guard is
     * asserted here directly, since this module is the presentation
     * capability's audited entry (`verify:adapter-shadow`), and again,
     * idempotently, by the shared store every asker goes through.
     */
    ask(request: AskUserQuestionRequest, options?: {
        redact?: boolean;
    }): Promise<AskUserQuestionAnswer>;
}
/** Host-only registration used by the TUI plugin bootstrap. */
export declare function bindQuestionStore(ctx: Parameters<typeof compositionRoot>[0], store: QuestionStore): void;
/** Host-only lookup used by the presentation Port bridge. */
export declare function getQuestionStore(ctx: Parameters<typeof compositionRoot>[0]): QuestionStore | undefined;
//# sourceMappingURL=questions.d.ts.map
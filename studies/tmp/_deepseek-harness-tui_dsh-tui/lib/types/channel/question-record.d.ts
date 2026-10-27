/**
 * Answered-questionnaire transcript record: a pure fold of the durable
 * session log (issue #1009).
 *
 * `ask_user_question` renders as the interactive panel, not as a tool card,
 * so its `tool/result` has no card to land in. The record is derived from
 * the same log every other transcript row comes from, so `/resume`, rewind,
 * `loadOlder` and replay all rebuild it, including for an ask whose panel
 * was never seen closing: the `tool/call` arguments carry the questions, the
 * `tool/result` payload carries the answers. Both are parsed at the caller's
 * edge here, so this module stays pure (no store, no i18n state, no
 * projection imports) and is directly testable.
 */
/**
 * The parts of a question this fold needs. Structurally compatible with the
 * harness's `AskUserQuestionItem`, so `src/dsh-adapter/` callers pass the
 * official type straight through while this module keeps its own shape.
 */
export interface QuestionRecordQuestion {
    readonly question: string;
    /** A secret question (`QuestionItemView.secret`): its answer is masked. */
    readonly secret?: boolean;
}
/**
 * One answer as the harness persists it (a subset of
 * `AskUserQuestionAnswerItem`: the fold matches answers to questions BY ORDER,
 * mirroring how the panel collects one answer per question).
 */
export interface QuestionRecordAnswer {
    readonly selected: readonly string[];
    readonly custom?: string;
}
/** One answered questionnaire as the transcript renders it. */
export interface QuestionRecord {
    /** Local-row title (dictionary text, never hand-written here). */
    readonly title: string;
    /** One `· question → answer` line per answered question. */
    readonly lines: readonly string[];
}
/** The record of a secret question's answer (`QuestionRecordQuestion.secret`). */
export declare const SECRET_ANSWER = "\u2022\u2022\u2022\u2022";
/**
 * Fold one answered questionnaire into its transcript record.
 *
 * Tolerant by contract: the projection calls this on durable replay data it
 * does not control (truncated logs, older hosts, a wizard-shaped caller), and
 * a throw inside `renderEvent` would abort the whole transcript fold. So a
 * missing/garbled question list or answer item degrades to a shorter line
 * instead of raising.
 *
 * @param questions - The ask's questions, in the order they were answered.
 * @param answers - The answers the log recorded for that same ask.
 * @param options - `redact` masks answer text (local wizards collecting
 *   secrets such as API keys must never leak into the transcript or an
 *   `/export` dump); the model-side ask never sets it.
 * @returns The title line plus its `· question → choice` body lines.
 */
export declare function buildQuestionRecord(questions: readonly (QuestionRecordQuestion | undefined)[] | undefined, answers: readonly (QuestionRecordAnswer | undefined)[] | undefined, options?: {
    redact?: boolean;
}): QuestionRecord;
/**
 * Parse the questions out of a persisted `ask_user_question` `tool/call`
 * arguments string. Returns `undefined` when the payload is not the
 * `{ questions: [...] }` object the tool declares, so the caller can fall
 * back to a title-only record.
 */
export declare function parseQuestionRecordQuestions(rawArguments: string | undefined): QuestionRecordQuestion[] | undefined;
/**
 * Parse the answers out of a `tool/result` text payload. `dsh-tool-ask-user`
 * renders its output as one JSON text block — the same bytes the model reads
 * back — so the durable log is a sufficient source. A failed ask (or any
 * non-JSON body) yields `undefined`: the caller then renders the log's own
 * error text instead of fabricating an answer.
 */
export declare function parseQuestionRecordAnswers(rawResult: string): QuestionRecordAnswer[] | undefined;
//# sourceMappingURL=question-record.d.ts.map
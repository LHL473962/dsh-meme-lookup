/** Decode SDK content, usage and user-text sentinels. */
import type { UsageDelta } from '../../../agent/events.js';
/** User texts the CLI injects that are not human bubbles. */
export declare const INTERRUPT_ECHO = "[Request interrupted by user";
export declare const LOCAL_COMMAND_TAG: RegExp;
export declare const COMMAND_TAG: RegExp;
/** Command output sent as a prompt (`!!` / the CLI's bash mode). */
export declare const BASH_OUTPUT: RegExp;
/** Usage of one API response, in the domain's shape. */
export declare function usageOf(value: unknown): UsageDelta | undefined;
/** Joined text of a tool_result `content` (string or block array). */
export declare function toolResultText(content: unknown): string;
/**
 * The leading ⏵ self-narration line of a streaming reply, when there is
 * one (the narrate contract puts exactly one at the very top; only a complete
 * first line counts, so a narration still streaming shows nothing yet). The
 * line is flattened and capped — it is model output destined for a status
 * line, never for re-parsing.
 */
export declare function narrationOf(text: string | undefined): string | undefined;
/** First text of a user `message.content` (string or block array). */
export declare function userText(content: unknown): string | undefined;
/**
 * The result text of an answered `AskUserQuestion`, in the shape the shared
 * projector folds into the answered-questionnaire record (the `{answers:
 * [{selected}]}` JSON the DSH `ask_user_question` tool persists, matched to
 * the questions by order). The answers come from the structured result
 * (`answers: {question: text}`) or, failing that, the CLI's
 * `"question"="answer"` sentence; anything unreadable keeps the raw text (a
 * title-only record).
 */
export declare function questionRecordText(input: unknown, structured: unknown, raw: string): string;
//# sourceMappingURL=content.d.ts.map
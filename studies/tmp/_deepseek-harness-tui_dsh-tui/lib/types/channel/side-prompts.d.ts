/**
 * The backend-neutral prompt contracts of the TUI's side calls (`/btw`,
 * `/recap`): what one tool-less, single-answer auxiliary call is asked, and
 * how a recap answer is read back. Every backend's side call uses the same
 * words: DSH sends them over its own derived history (`dsh-adapter/
 * sideQuestion.ts`, `recap.ts`), Claude over a throwaway fork of the
 * conversation (`backends/claude/side-query.ts`).
 *
 * Pure text: no I/O, no vendor types.
 */
/**
 * Describe the auxiliary call's scope: one answer from existing context,
 * with no tools, follow-up actions, or interruption of the main session.
 * `running` names the main task's in-flight work, one line each (the
 * caller formats them), when the context the call sees ends mid-step.
 */
export declare function sideQuestionPrompt(question: string, running?: readonly string[]): string;
/**
 * One earlier Q/A pair of a `/btw` side thread, as the thread store hands
 * it to the next ask (answers already clipped to the per-answer budget).
 */
export interface SideThreadPriorTurn {
    readonly question: string;
    readonly answer: string;
}
/**
 * Carry the recent turns of a side thread into the next single-turn ask:
 * the pairs travel as explicit quoted context inside the question payload,
 * so every backend's one-shot side call keeps its own contract unchanged
 * (the wrapper still sees "one question, one answer, no tools"). The result
 * is what the caller passes to `sideQuery.ask` as the question, not a
 * second conversation: nothing here writes a session record anywhere.
 *
 * `omittedOlder` is the count of completed pairs the budget dropped from
 * the front of the thread (turn-window or character budget); the note lets
 * the model know earlier turns existed instead of silently forgetting.
 */
export declare function sideThreadQuestion(question: string, prior?: readonly SideThreadPriorTurn[], omittedOlder?: number): string;
/**
 * Wrap a recent-activity excerpt with the single-response, JSON-only recap
 * contract (a call that does not see the conversation itself).
 */
export declare function wrapRecapPrompt(activity: string): string;
/**
 * The recap request for a call that runs over the conversation itself (a
 * fork of it): the same contract, about the conversation so far, with an
 * emphasis on its recent part.
 */
export declare function conversationRecapPrompt(): string;
/**
 * Parse the model's recap response: extract the JSON object (tolerating
 * stray prose around it); on failure the whole text becomes the summary
 * and no title is proposed.
 */
export declare function parseRecapResponse(raw: string): {
    summary: string;
    title?: string;
};
//# sourceMappingURL=side-prompts.d.ts.map
/**
 * The Claude SendMessage tool as a backend-neutral observation: the
 * model-authored relay to another agent is the only child-directed send
 * Claude exposes, and its tool call/result on the parent
 * lane is the observable fact. Pure parsing/projection only — the hooks in
 * translate.ts decide where an observation belongs (main lane = the parent
 * itself sent it; a subagent lane = that subagent sent it, keyed by the
 * delegating call).
 *
 * Delivery rules:
 *  - a call alone proves nothing beyond `issued` (a successful tool call is
 *    not a delivery);
 *  - only a structured result field naming a state (`delivery`/`status` in
 *    {delivered, held, refused, expired}) or an explicit error marks more;
 *  - any other shape — including a bare success — is `unknown`, the legal
 *    terminal. Nothing is ever inferred from the tool having succeeded.
 */
import type { AgentMessageState, AgentMessageView } from '../../agent/index.js';
/** The SendMessage tool input as this module recognizes it: the addressed
 *  agent (`to`) and the body (`message`, falling back to `text`). An input
 *  without both is not an observable fact — no view is fabricated for it. */
export interface SendMessageInput {
    readonly to: string;
    readonly text: string;
}
/** Parse one SendMessage tool call's input; undefined when unrecognizable. */
export declare function parseSendMessageInput(input: unknown): SendMessageInput | undefined;
/** The observation of one call: state `issued`. `lane`
 *  names the sending subagent's delegating call id; on the main lane the
 *  sender is the parent itself (rendered from the absent `from`). */
export declare function sendMessageCallView(input: {
    readonly callId: string;
    readonly lane?: string;
    readonly observedAt: number;
    readonly input: SendMessageInput;
}): AgentMessageView;
/**
 * The settled state of one SendMessage result: an explicit error is a
 * refusal fact; a structured `delivery`/`status` field naming a state
 * marks exactly that; any other shape — including a bare success — is
 * `unknown` (never a guessed delivery).
 */
export declare function sendMessageResultState(result: {
    readonly isError: boolean;
    readonly structured: unknown;
}): AgentMessageState;
/** The settlement observation of one call: the same durable identity (the
 *  parent tool call id); the fold advances the state and nothing else. */
export declare function sendMessageResultView(input: {
    readonly callId: string;
    readonly observedAt: number;
    readonly state: AgentMessageState;
}): AgentMessageView;
//# sourceMappingURL=send-message.d.ts.map
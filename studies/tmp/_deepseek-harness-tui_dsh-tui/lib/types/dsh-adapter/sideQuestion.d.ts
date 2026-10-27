/**
 * Side Question (`/btw`): a single-turn call without tools, replaying the
 * live session's derived history (prompt-cache reuse, compaction-style
 * auxiliary call) plus one wrapped user message. The answer never enters
 * the session log — it is pure UI state in the Chat screen.
 *
 * @module
 */
import type { Agent } from '@deepseek-ai/dsh-agent';
import { type ContentBlock, type Message, type StreamChunk } from '@deepseek-ai/dsh-llm';
import type { SessionEvent } from '@deepseek-ai/dsh-session';
type ToolCall = Extract<ContentBlock, {
    type: 'tool-call';
}>;
/**
 * Describe the auxiliary call's scope: one answer from existing context,
 * with no tools, follow-up actions, or interruption of the main session.
 * `pending` names the main task's in-flight calls, which
 * {@link splitUnresolvedToolCalls} removed from the replayed history.
 */
export declare function wrapSideQuestion(question: string, pending?: readonly ToolCall[]): string;
/**
 * Split assistant `tool-call` blocks whose result never entered the derived
 * history out of it. The composer runs `/btw` immediately while the main turn
 * streams, so the derived tail can end on a tool request still executing
 * (a running command, a job read). Providers reject that transcript ("An
 * assistant message with 'tool_calls' must be followed by tool messages
 * responding to each 'tool_call_id'"): pi-ai routes pad such calls with
 * synthetic results, but the native DeepSeek adapter (dsh-llm-deepseek, 0.1.5
 * hosts) serializes history verbatim and gets a 400. Every unanswered call is
 * removed — with any message left without content — but only those in
 * `running` (see {@link openStepToolCallIds}) come back as `pending` for the
 * wrapper to name: a closed step can keep a call without a result (a failed
 * tool scheduler still appends `step/end`), and that call is not executing.
 * A history whose calls are all answered is returned unchanged.
 *
 * 0.1.7 answers a call with a tool-role message carrying `toolCallId`; older
 * logs wrap the result in a `tool-result` block inside a user message; both
 * shapes count as answered via `answeredToolCallIds` (compat/messages.ts).
 */
export declare function splitUnresolvedToolCalls(messages: readonly Message[], running: ReadonlySet<string>): {
    messages: readonly Message[];
    pending: ToolCall[];
};
/**
 * Tool-call ids of the open step still waiting for their result: the calls
 * the main task is executing right now. Mirrors dsh-session's crash-tail
 * scan — a turn or step boundary closes every earlier call, answered or not.
 * Ids come from `assistant/message`, not `tool/call`: upstream appends
 * `tool/call` only when execution starts, so queued calls would go unnamed.
 * `source.callId` is required on every supported line and read unguarded upstream.
 */
export declare function openStepToolCallIds(events: readonly SessionEvent[]): Set<string>;
/** Outcome of one side question: the visible text answer, or an error. */
export interface SideQuestionOutcome {
    answer: string | null;
    error?: string;
}
/**
 * Run one side-question call: stream the assembled options, fold chunks
 * through the shared BlockAssembler, and surface the assembled text
 * blocks as the answer. `onText` receives visible text deltas only
 * (reasoning deltas are ignored — a side question wants the quick answer).
 */
export declare function runSideQuestion(params: {
    /** `ctx.llm.stream` (bound); the options below pass through verbatim. */
    stream: (options: object) => AsyncIterable<StreamChunk>;
    /** Assembled GenerateOptions — no `tools` field, ever. */
    options: object;
    /** Streaming display hook (text deltas only). */
    onText?: (delta: string) => void;
    /** Cancellation: aborting yields `{answer: null}` with no error text. */
    signal?: AbortSignal;
}): Promise<SideQuestionOutcome>;
/** The `agents` service as {@link runAsSideBranch} needs it. */
export interface InitiatorScope {
    withInitiator<T>(agent: Agent, operation: () => T): T;
}
/**
 * Run a side question with a seeded fork of `agent` as its initiator. The
 * call replays the session's history without entering it, which DSH models as
 * a fork (`parentSession` + `isSeeded` on the child header). Initiator-keyed
 * consumers then see a branch of the conversation rather than an agentless
 * call: a compressing proxy (billion-context) adopts the parent's state for
 * the branch instead of sending the raw replay, which overflows long sessions.
 * Without the service, or once its scope is closing, the call runs as before.
 *
 * The view is no stored Session: `session.id` carries the branch identity
 * while `header.id` deliberately keeps the parent's (a stored fork's header id
 * mirrors its own session). The verified consumer path reads `session.id`;
 * aligning `header.id` changes what a parent-resolving consumer sees and needs
 * the same real-host recheck. scripts/verify-preset-patch.ts pins this shape.
 */
export declare function runAsSideBranch<T>(agents: Partial<InitiatorScope> | undefined, agent: Agent, operation: () => Promise<T>): Promise<T>;
export {};
//# sourceMappingURL=sideQuestion.d.ts.map
/**
 * Claude Agent SDK → Agent Domain translator: one pure state machine per
 * session that turns the SDK message stream (including the frames the SDK
 * types do not declare — `command_lifecycle`, `session_state_changed`,
 * `thinking_tokens` estimates) into `AgentEvent`s for the
 * shared projector. No I/O: the session feeds it messages and the inputs it
 * pushed; fixtures feed it recorded JSON.
 *
 * State: the open turn and its step counter, the open attempt (keyed by the
 * API `message.id`; the CLI sends one `assistant` message per content block,
 * all sharing that id), the open tool calls (their presenters need the
 * input), the inputs this session pushed (their text becomes the user row
 * when the CLI confirms them) and the last `system/init` (re-sent every turn;
 * only changes are emitted).
 *
 * Every field is narrowed from `unknown`; an unknown message type or subtype
 * is ignored (debug-logged), never fatal.
 */
import type { AgentEvent, ImageRef } from '../../../agent/events.js';
import type { ClaudeActivityState, ClaudeTranslatorOptions, ClaudeUserRows, RegisteredInput } from './types.js';
/** Create one translator; it serves exactly one session's stream. */
export declare function createClaudeTranslator(options: ClaudeTranslatorOptions): {
    translate: (raw: unknown) => readonly AgentEvent[];
    forceCloseTurn: (reason: import("../../../agent/events.js").TurnEndReason) => AgentEvent[];
    /** A pushed input: its text becomes the user row once the CLI confirms
     *  it; a queued placement is a pending preview until then. */
    registerInput(uuid: string, text: string, placement: RegisteredInput["placement"], images?: readonly ImageRef[]): void;
    /** Forget an input the session failed to push. */
    unregisterInput(uuid: string): void;
    /** Pushed inputs the CLI has not started yet, in push order (a
     *  reconnect re-delivers them to the new CLI). */
    unstartedInputs(): readonly string[];
    /** Queued-input previews the channel still shows (pending uuids, push
     *  order): what an interrupt covered but has not confirmed deleted —
     *  an answerless or failed interrupt reports them as still queued. */
    pendingInputs(): readonly string[];
    /** Give up on inputs that can no longer be delivered: their previews
     *  are retired as discarded. */
    dropInputs(uuids: readonly string[]): AgentEvent[];
    /** Switch the user-row source once the CLI's capabilities are known. */
    setUserRows(mode: ClaudeUserRows): void;
    clearInterruptedCalls(): void;
    /** The model as last confirmed ('' before the first init). */
    readonly model: string;
    /** The permission mode as last confirmed. */
    readonly mode: string | undefined;
    /** A model the session switched to by control request: tracked, and
     *  reported once (a later identical init/message_start stays quiet). */
    noteModel(model: string): AgentEvent[];
    /** A permission mode the session set by control request (or started in). */
    noteMode(mode: string): AgentEvent[];
    readonly turnOpen: boolean;
    /** The task id a subagent / job id names: a task id itself, or the
     *  delegating call of a subagent `task_started` already named. */
    taskIdOf(id: string): string | undefined;
    /** The output file the CLI reported for a task. */
    outputFileOf(taskId: string): string | undefined;
    /** The working-activity fold's inputs (see ClaudeActivityState): the
     *  translator's own view of the stream, nothing re-parsed. */
    activityState(): ClaudeActivityState;
    /** The last turn number used (a resumed session continues after it). */
    readonly turnNumber: number;
    /** The last event sequence number used. */
    readonly seqNumber: number;
    /** The tracked tasks as serializable resume seeds (replay.ts hands these
     *  to the live translator of the resumed session). */
    taskSeeds: () => readonly import("./types.js").ClaudeTaskSeed[];
    /**
     * Open the CLI's own turn that follows a task notification (replay: the
     * transcript records it as a `task-notification` prompt; live, the
     * `task_notification` frame arms the same turn). Closes nothing.
     */
    openNotificationTurn(): AgentEvent[];
};
export type ClaudeTranslator = ReturnType<typeof createClaudeTranslator>;
//# sourceMappingURL=core.d.ts.map
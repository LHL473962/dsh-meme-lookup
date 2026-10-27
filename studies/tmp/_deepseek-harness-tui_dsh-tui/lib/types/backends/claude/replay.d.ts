/**
 * Claude session transcript → Agent Domain replay: the durable history a
 * resumed session
 * paints before it follows live events.
 *
 * Input is what the SDK's read API returns — `getSessionMessages(id,
 * {includeSystemMessages:true})`, the model-visible chain (after a
 * compaction: the boundary, the summary, the preserved tail and what came
 * later) — plus each subagent's `getSubagentMessages`. Output is the same
 * vocabulary the live translator emits, produced by the same translator
 * (`translate.ts`): assistant blocks, tool calls and results, plan / todo /
 * question tools and the compaction rows map exactly as they do live. Only
 * the turn segmentation is replay's own, because the transcript has no
 * lifecycle frames and no `result`s:
 *
 * - a real user prompt closes the open turn and opens a user turn (its row
 *   anchored at the message uuid — the `uuid` the session pushed, which the
 *   CLI keeps, so live and replayed rows rewind the same way);
 * - a queued prompt (`isQueuedCommand`, a steer folded into a running turn)
 *   joins the open turn, as its `started` frame does live;
 * - `[Request interrupted by user]` closes the turn as aborted (the live
 *   interrupt row); a `task-notification` prompt opens the notification
 *   turn; local-command echoes (`<command-name>`, `<local-command-*>`), meta
 *   and synthetic texts never become bubbles — a user-typed slash command
 *   shows as the `/name args` it was typed as (`/compact` excepted, as
 *   live); command output sent on to the model (`<bash-stdout>`, dsh-tui's
 *   `!!`) is a prompt of its own: it closes the open turn and opens the
 *   turn the model answers it in, shown as its output row (as live);
 * - a compact summary (`isCompactSummary`) closes the open turn and renders
 *   the compaction rows (`compaction.end` + the summary).
 *
 * Thinking: the CLI records thinking blocks with empty text (the API only
 * returns signatures unless summaries are enabled). A step whose API message
 * reports `output_tokens_details.thinking_tokens` replays the same one-line
 * count row the live `thinking_tokens` estimate produces; an empty block
 * without a count is not shown (as live: nothing to show).
 *
 * Subagents: the parent `Agent` call pre-creates its subagent (as live);
 * when the session kept the subagent's transcript, a `subagent.start` with
 * the subagent's own id completes it, followed by its messages as child-lane
 * events (`parentCallId` = the call) — its card and panels, never the main
 * transcript. Its `subagent.end` comes from what the main chain recorded:
 * the call's result for a foreground subagent (the hand-back report, an
 * error, an interruption), the `<task-notification>` naming it for a
 * background one (whose result only acknowledges the launch); with neither,
 * its state is `unknown` (the CLI that ran it is gone). A subagent's own
 * delegations (nested `Agent` calls in its transcript) are tracked the same
 * way: ended by the result in that transcript, else `unknown` at the end of
 * the replay.
 *
 * Not restored from the transcript: the context window (the read API has no
 * field for it; the first live `result` reports it) and the session cost (the
 * resumed CLI's first `result` reports it, as for any session).
 *
 * Pure: no I/O, no clock (event times come from the message timestamps).
 */
import type { AgentEvent } from '../../agent/events.js';
import { type ClaudeTaskSeed } from './translate.js';
/** One subagent transcript, keyed by the `Agent` tool call that launched
 *  it (and, for healing, by the child's own agent id). */
export interface ClaudeSubagentTranscript {
    readonly agentId: string;
    readonly messages: readonly unknown[];
    /** `parent_agent_id` of the child's messages, when recorded. */
    readonly parentAgentId?: string;
}
export interface ClaudeReplayOptions {
    readonly cwd: string;
    /** Subagent transcripts by parent `tool_use_id`. */
    readonly subagents?: ReadonlyMap<string, ClaudeSubagentTranscript>;
    /** The session's title (custom or generated), when the catalog has one. */
    readonly title?: string;
    readonly debug?: (message: string) => void;
}
export interface ClaudeReplay {
    readonly events: readonly AgentEvent[];
    /** The counters (and model) the live translator of the resumed session
     *  continues from. */
    readonly start: {
        readonly turn: number;
        readonly seq: number;
        readonly model?: string;
    };
    /** The replayed conversation's task table (the Task* family), handed to
     *  the live translator so a resumed update finds the ids the replay
     *  tracked. Absent when the history tracked none. */
    readonly tasks?: readonly ClaudeTaskSeed[];
    /**
     * The chain began at a compaction (its boundary's uuid, or the summary's
     * when no boundary entry led it): older history exists on disk.
     */
    readonly compactedFrom?: string;
}
/** Replay one transcript chain. */
export declare function replayClaudeTranscript(messages: readonly unknown[], options: ClaudeReplayOptions): ClaudeReplay;
/** A subagent's own transcript replayed as its child lane: every
 *  user/assistant message goes through the translator the live lane uses,
 *  with `parent_tool_use_id` forced to the child's own agent id (a message
 *  whose metadata lacks the delegating call id must not land on the main
 *  lane). Thinking the API only signed or counted (empty text) becomes a
 *  `reasoning-tokens` block with the count, or a `reasoning-signature`
 *  block when even that is unknown; the view says the body is
 *  unavailable. The child's initial prompt stays hidden. Pure: no I/O, no
 *  clock (times come from the message timestamps). */
export interface ClaudeSubagentLane {
    readonly events: readonly AgentEvent[];
    /** `parent_agent_id` across the child's messages; null = depth-1 or
     *  old-format metadata. */
    readonly parentAgentId: string | null;
    readonly uuids: readonly string[];
}
export declare function replayClaudeSubagentLane(agentId: string, messages: readonly unknown[], options: {
    readonly cwd: string;
    readonly debug?: (message: string) => void;
}): ClaudeSubagentLane;
/**
 * The uuid of the chain entry right before `anchor` — where a conversation
 * rewind cuts (`forkSession({upToMessageId})` keeps it, inclusive). Undefined
 * when `anchor` is not in the chain or is its first entry (nothing precedes
 * it: there is no conversation to rewind to).
 */
export declare function rewindCutPoint(messages: readonly unknown[], anchor: string): string | undefined;
/** The trailing exchanges of a chain, for the browser's preview (newest last). */
export declare function previewEntries(messages: readonly unknown[], limit: number): {
    role: 'user' | 'assistant';
    text: string;
    at: number | undefined;
}[];
//# sourceMappingURL=replay.d.ts.map
import { type SessionEvent } from '@deepseek-ai/dsh-session';
import type { ChatRow, ToolResultView, ToolViewPresenter } from './types.js';
import { ARGS_PREVIEW_LIMIT, LOCAL_OUTPUT_LIMIT, MAX_ROWS, preview, RESULT_PREVIEW_LIMIT } from '../../channel/transcript.js';
export { ARGS_PREVIEW_LIMIT, LOCAL_OUTPUT_LIMIT, MAX_ROWS, preview, RESULT_PREVIEW_LIMIT };
/**
 * Fold the oldest rows beyond the transcript window cap: drop each row's
 * full-text fields (assistant/reasoning text, tool args/results) and keep
 * only its preview text, kind, id, and seq. Bounds the TUI's retained text
 * without touching the session log (the source of truth for /export and
 * loadOlder). Small local/notice/interrupt rows are left intact (they hold
 * terminal-local text the log cannot restore). Restored rows are exempt so
 * a loadOlder() restore is not instantly undone. Returns the number of rows
 * folded.
 */
export declare function foldRows(rows: ChatRow[], cap: number, cursor?: {
    rows: unknown;
    index: number;
    head?: unknown;
}, 
/** Rows the backend can restore (default: every foldable kind); any
 *  other row keeps its full text. */
restorable?: (row: ChatRow) => boolean): number;
/**
 * Restore folded rows from the session log, newest folded batch first.
 * Rebuilds each folded row's full text from its source events and clears
 * the folded mark, keeping row ids, scroll anchors, and selection stable.
 * `views` re-derives the tool presentation views foldRows dropped (the
 * presenters live on the host plane, so the channel passes them in).
 * Returns the number of rows restored.
 */
export declare function foldBack(rows: ChatRow[], events: readonly SessionEvent[], views?: ToolViewPresenter): number;
/** Rebuild a folded row's full text from its source session event. */
export declare function restoreRowFromEvent(row: ChatRow, event: SessionEvent): void;
/** Render the durable tool-result payload, including provider error details. */
export declare function toolResultText(event: SessionEvent<'tool/result'>): string;
/** Phase badge for the harness goal card — mirrors the panel's PhaseBadge. */
export declare const GOAL_RESULT_BADGE: Record<string, string>;
/**
 * Summary cards for the harness's goal/todo tools. Their results are machine
 * JSON (`{"goal":{…}}` / `{"todos":[…]}`) that would otherwise dump under the
 * tool card as a raw `⎿ {"goal":…}` line. Matched by tool-name substring AND
 * payload shape, so unrelated tools and plain-text results pass through to
 * the registry/raw-text path untouched. Runs on the live stream and replay.
 */
export declare function harnessToolResultView(name: string, data: SessionEvent<'tool/result'>['data']): ToolResultView | undefined;
export declare function toolErrorText(event: SessionEvent<'tool/result'>): string;
/** One structured tool failure (`tool/result.error`) as display text: its
 *  `name: code` identity plus the result detail. An auto-review denial reads
 *  as a localized "denied, not executed" plus the reviewer's `reason`, never
 *  its English detail (that only restates the denial); other failures' `reason`
 *  repeats their detail and stays out. Shared by the transcript and the
 *  subagent cards. */
export declare function toolFailureText(failure: unknown, detail: string): string;
/** Restore a folded tool row's result text from its tool/result event. */
export declare function restoreToolResult(row: ChatRow, event: SessionEvent<'tool/result'>): void;
/**
 * Prepare durable events for REPLAY (resume / rewind / fork):
 * drop settled `assistant/chunk` stream deltas — the sealed
 * `assistant/message` events carry the full text and reasoning blocks, so
 * per-token chunks add nothing to the replayed transcript while costing a
 * per-chunk renderEvent pass (a real 4.5MB session logs ~19k chunks against
 * ~30 messages). The trailing chunk run AFTER the last message belongs to an
 * unfinished step (crash-orphaned turn) and is kept, so a resumed session
 * still shows its partial content. Storage-level packed rows
 * (`text-chunks`/`reasoning-chunks`/`tool-call-chunks`) are dropped the
 * same way — defensive: the jsonl reader expands them, but a future
 * direct-pass path must not resurrect them. Replay-side tps sampling is
 * lost with the chunks (a live metric; lastUsage comes from the message's
 * own usage). Live events never go through this.
 */
export declare function prepareReplayEvents(events: readonly SessionEvent[]): SessionEvent[];
//# sourceMappingURL=transcript.d.ts.map
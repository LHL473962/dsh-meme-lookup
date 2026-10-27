/**
 * The backend-neutral trajectory source: an incremental fold of the shared
 * AgentEvent vocabulary into the raw-event envelope the trajectory
 * projection already consumes.
 *
 * `/trace` and the trajectory panel fold {@link RawTrajEvent}s, the DSH
 * session log's vocabulary. A session without that log (Claude) still
 * streams the same AgentEvents every backend translator emits, so this
 * module translates them for any composition that has no raw log. The
 * channel reports 'empty' until the first mapped event and 'supported'
 * from then on; 'unsupported' is left for a composition with no source.
 *
 * ## The mapping table
 *
 * | AgentEvent | Raw event | Notes |
 * |---|---|---|
 * | `turn.start`/`turn.end` | `turn/start`/`turn/end` | turn-level usage rides the close, backfilled by the fold only when no message of the turn carried usage (no double counting). |
 * | `step.start`/`step.end` | `step/start`/`step/end` | no timestamps in the vocabulary → trace clock, marked `observed`. |
 * | attempt supersede / `api-retry` notice | `llm/retry` (+ `llm/retry-started` on the next attempt) | one row per retry attempt; backoff delay is unknown to the vocabulary → 0. |
 * | `assistant.delta` (text/reasoning/tool-args) | `assistant/chunk` | first/last-chunk timing for TTFT and decode. |
 * | `assistant.delta` (`reasoning-tokens`) | — (estimate) | accumulated per attempt; surfaces as a thinking row when the settled message carries no reasoning text. |
 * | `assistant.message` | `assistant/message` | message-level usage (the authoritative token count) attaches to the first row exactly once. |
 * | `tool.call`/`tool.result` | `tool/call`/`tool/result` | paired by `callId`; args/result stay references (the inspector re-reads lazily). |
 * | `tool.progress` | — | consumed; a running row's spinner is already live, an elapsed echo would add a row per poll. |
 * | `tool.output` | — | consumed; live output is display-only, the settled result carries the record. |
 * | `permission.request`/`settled` | `approval/asked`/`approval/decided` | paired by `requestId`; the asked payload also records the wait-detail fields (source identity, offered options). |
 * | `question.request`/`settled` | `approval/asked`/`approval/decided` | the questionnaire as an approval-shaped bracket; the asked payload carries a bounded question snapshot. |
 * | `compaction.start`/`end` | `compaction/start`/`compaction/end` | `removed` derived from pre/post tokens when both are known. |
 * | `subagent.start` | `subagent/descriptor` | the child lane's presence row (carrying `agentId` as the drilldown anchor); the child's own assistant/tool traffic is folded into a SEPARATE per-agent lane log (below), never into the main ledger — the delegating tool bracket already spans it there — and subagent usage never enters the parent's token totals. |
 * | `user.message` | `user/message` | human prompts as user rows, injected/goal/compaction output as context rows. |
 * | `todo.write` | `todo/write` | parity with the DSH row. |
 *
 * ## Lanes (cross-agent drilldown)
 *
 * The vocabulary marks child-lane traffic ONLY through `parentCallId` (the
 * delegating tool call). `subagent.start` registers that call id against the
 * child's `agentId`; afterwards every parentCallId-carrying event folds
 * into that agent's own raw-event log instead of the main one. The main
 * lane's output is therefore byte-identical to the pre-lane fold — child
 * traffic was already skipped there — while `lanes()` / `laneEvents()` /
 * `descendantEvents()` expose the child logs the trajectory's scope filter
 * (当前 Agent / 父回合 / 全部后代) refolds on demand. A second
 * `subagent.start` for the same anchor call (a backend that learns the
 * child's own id late) re-keys the lane and keeps the earlier events: they
 * are adopted by the new id, in seq order.
 *
 * ## Clocks, identity, immutability
 *
 * Events without a timestamp take the trace clock (`Date.now` at receipt)
 * and carry `data.observed = true` so the inspector can mark the row's time
 * as an observation rather than a backend fact. `seq` is this source's own
 * monotonic counter: durable `seq`s the vocabulary carries are used ONLY for
 * deduplication (a reconnect may replay a durable chunk), never as envelope
 * identity — the envelope stays monotonic in emission order for the
 * inspector's binary search. Emitted events and payloads are frozen. The
 * current attempt's tail chunk may be replaced in a new snapshot; older
 * snapshots remain unchanged. Merged descendants rebuild when a lane changes.
 */
import type { AgentEvent } from '../../agent/events.js';
import type { RawTrajEvent } from './guards.js';
import type { TrajectoryLane } from './types.js';
/** The neutral source a backend-neutral composition mounts. */
export interface AgentTrajectorySource {
    /** Fold one stream event (live or replayed) into the raw-event log. */
    observe(event: AgentEvent, replaying: boolean): void;
    /** Forget everything: a session swap or an in-place conversation reset. */
    reset(): void;
    /** The raw-event snapshot (`traceEvents()`'s return). */
    events(): readonly RawTrajEvent[];
    /** Every registered child lane, in registration order (drilldown roster). */
    lanes(): readonly TrajectoryLane[];
    /** One lane's raw-event snapshot. */
    laneEvents(agentId: string): readonly RawTrajEvent[];
    /** The agent's subtree merged in emission order (agent + all descendants). */
    descendantEvents(agentId: string): readonly RawTrajEvent[];
}
/**
 * Create the source. `clock` is injectable so regressions can pin the
 * observation timestamps; it defaults to `Date.now`.
 */
export declare function createAgentTrajectorySource(options?: {
    readonly clock?: () => number;
}): AgentTrajectorySource;
//# sourceMappingURL=agent-source.d.ts.map
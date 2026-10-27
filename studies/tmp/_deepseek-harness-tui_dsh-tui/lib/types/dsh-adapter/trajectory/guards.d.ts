/**
 * Structural guards for the session events the trajectory projection reads.
 *
 * ## Why guards instead of the declared types
 *
 * `SessionEventMap` declares a dozen-odd core event types. Everything else in
 * the `KNOWN_SESSION_EVENT_TYPES` vocabulary arrives through *module
 * augmentation* from the plugin that owns it — `llm/retry` from the LLM
 * layer, `hook/*` from the hook runner, `tool/code-dispatch*` (pre-0.1.5) /
 * `tool/ptc-dispatch*` (0.1.5) from the code/PTC runtime. Those declaration
 * packages are not all in this bundle's dependency
 * graph, so `event.type === 'llm/retry'` does not even type-check here: the
 * literal is not a member of the union TypeScript can see.
 *
 * The answer is the one the adapter boundary already prescribes for upstream
 * coupling — widen once, at a single auditable point ({@link asRawEvents}),
 * then validate shapes at runtime. Every guard below is a *total function*:
 * a payload that does not match returns `undefined` and the fold skips that
 * event. An upstream release that renames a field degrades the trajectory by
 * one row kind; it never throws inside a render.
 *
 * ## Why these exact shapes
 *
 * Each guard was written against payloads decoded out of real session logs
 * (39 sessions, 96,836 events) rather than from documentation, and the
 * corresponding fixture in `verify-trace-projection.mjs` reproduces the same
 * shape. Where a field was absent from every observed sample it is optional
 * here, so a future harness that starts emitting it is picked up for free.
 */
import type { TimedStreamChunk } from '@deepseek-ai/dsh-llm';
import type { RawTrajEvent } from '../../adapter/ports/channel-view.js';
export type { RawTrajEvent } from '../../adapter/ports/channel-view.js';
/**
 * A session event reduced to the envelope the projection relies on. Only
 * `type`, `seq` and `time` are contractual across every event; `data` is
 * deliberately `unknown` so nothing downstream can read it without a guard.
 */
/**
 * The single widening point for the whole trajectory feature.
 *
 * `SessionEvent`'s `type` is a union of the *locally declared* event names;
 * the projection must also reason about augmented names it cannot see in the
 * type graph. Widening the array element to {@link RawTrajEvent} keeps every
 * field the projection reads (envelope) while forcing `data` through the
 * guards below. The cast is structural-only — no property is added, removed,
 * or reinterpreted — and it is the one place a reviewer must check.
 *
 * @param events - The session's immutable event snapshot.
 * @returns The same array, typed for guard-mediated access.
 */
export declare function asRawEvents(events: readonly RawTrajEvent[]): readonly RawTrajEvent[];
/**
 * An `llm/retry` payload.
 *
 * Observed shape: `{ retryId, turn, step, provider, mode, policyKey, retry,
 * maxRetries, delayMs, failure: { message, code } }`. `retryId` pairs the
 * event with the `llm/retry-started` that follows; `failure.code` is the
 * classifier (`RATE_LIMIT` / `SERVER` / `TIMEOUT` / `TRANSPORT` /
 * `EMPTY_RESPONSE`) shown as the row's error identity.
 */
export interface RetryPayload {
    readonly retryId: string;
    readonly turn?: number;
    readonly step?: number;
    /** Provider whose request failed — shown as an inspector fact. */
    readonly provider?: string;
    readonly retry: number;
    readonly maxRetries?: number;
    readonly delayMs: number;
    readonly code?: string;
    readonly message?: string;
}
/** Narrow an `llm/retry` payload; `undefined` when the shape does not match. */
export declare function readRetry(data: unknown): RetryPayload | undefined;
/** The `retryId` of an `llm/retry-started`, used to close the retry bracket. */
export declare function readRetryStarted(data: unknown): string | undefined;
/**
 * A `tool/code-dispatch*` / `tool/ptc-dispatch*` payload — the code runner's
 * nested tool calls, and the only source of SUBTOOL rows.
 *
 * The dispatch bracket was renamed with the runtime: pre-0.1.5 logs carry
 * `tool/code-dispatch-start` ↔ `tool/code-dispatch`, 0.1.5 logs carry
 * `tool/ptc-dispatch-start` ↔ `tool/ptc-dispatch`, paired by `subCallId` in
 * both generations; `rootCallId`/`parentCallId` give the enclosing
 * model-issued call. The payload shape is identical across the rename, so
 * this one guard serves both. `subCallId` is treated as an OPAQUE pairing
 * key: the fold never parses the `<parent>:code:<n>` / `<parent>:ptc:<n>`
 * infix, so a renamed (or future) id scheme cannot break pairing.
 * `arguments` is a structured value here (unlike `tool/call`, whose
 * `arguments` is the model's raw JSON string), so it is stringified for the
 * preview at guard time — the payload object is small and already
 * materialized by the log reader.
 */
export interface DispatchPayload {
    readonly subCallId: string;
    readonly rootCallId?: string;
    readonly parentCallId?: string;
    readonly name: string;
    readonly args?: string;
    readonly isError?: boolean;
}
/** Narrow a `tool/code-dispatch*` / `tool/ptc-dispatch*` payload. */
export declare function readDispatch(data: unknown): DispatchPayload | undefined;
/**
 * Expand the compact `stream` of a V3 `assistant/message` / `assistant/attempt`
 * into timed chunks, or `undefined` when the event carries no usable stream.
 *
 * V3 logs replace per-token `assistant/chunk` events with one compact
 * `AssistantStreamRecord[]` embedded in the settlement event. Upstream's
 * `expandAssistantStream` is the validating read path for that record list —
 * and it landed with the record type itself (0.1.5), so the binding is
 * feature-detected through the namespace rather than named-imported: a
 * pre-0.1.5 host lacks the export, and a named import would fail the whole
 * module at link time instead of degrading this one read. The same
 * never-throw contract as every guard here applies on both axes: a missing
 * expander or a malformed record (the expander throws `TypeError`) yields
 * `undefined`, and the fold simply contributes no stream timing.
 */
export declare function readAssistantStream(data: unknown): readonly TimedStreamChunk[] | undefined;
/**
 * A `request/header` payload, reduced to the route facts the trajectory
 * shows: which model actually served this request, at which effort. The full
 * header (system prompt, tool catalog) stays in the log for the inspector.
 */
export interface RequestHeaderPayload {
    readonly provider?: string;
    readonly model?: string;
    readonly effort?: string;
    readonly reason?: string;
}
/** Narrow a `request/header` payload. */
export declare function readRequestHeader(data: unknown): RequestHeaderPayload | undefined;
/** A `subagent/descriptor` payload: what kind of child this session is. */
export interface SubagentPayload {
    readonly label?: string;
    readonly model?: string;
    readonly mode?: string;
    /** The child's agent id — the trajectory drilldown's anchor. */
    readonly agentId?: string;
}
/** Narrow a `subagent/descriptor` payload. */
export declare function readSubagent(data: unknown): SubagentPayload | undefined;
/**
 * An `approval/asked` payload. `id` pairs it with the `approval/decided`.
 *
 * The wait-detail fields are optional ask-time presentation: the settled
 * event carries only the outcome, so the
 * source that still knows the choices and the asker must record them here or
 * they are lost. DSH logs predate the fields — the guard reads them
 * tolerantly and DSH rows simply render without them.
 */
export interface ApprovalAskedPayload {
    readonly id: string;
    readonly toolName?: string;
    readonly callId?: string;
    readonly reason?: string;
    /** Which kind of wait segment this is (permission prompt or questionnaire). */
    readonly ask?: 'permission' | 'question';
    /** The subagent whose call triggered the ask, when it ran inside one. */
    readonly agentId?: string;
    /** Full prompt sentence the backend rendered for the ask. */
    readonly title?: string;
    /** One-line rendering of the gated action (command, file, URL). */
    readonly command?: string;
    /** The path outside the allowed directories that triggered the ask. */
    readonly blockedPath?: string;
    /** Option identities offered at ask time (bounded by the source). */
    readonly options?: readonly string[];
    /** The questionnaire's structure (bounded by the source), for `ask: 'question'`. */
    readonly questions?: readonly ApprovalQuestionSummary[];
}
/** One ask-time questionnaire entry (bounded by the emitting source). */
export interface ApprovalQuestionSummary {
    readonly header?: string;
    readonly question: string;
    readonly options: readonly string[];
}
/** Narrow an `approval/asked` payload. */
export declare function readApprovalAsked(data: unknown): ApprovalAskedPayload | undefined;
/**
 * An `approval/decided` payload. `outcome` is a union upstream; it is read as
 * a plain string here and only compared against the denial spellings, so a
 * new outcome name degrades to "not a denial" rather than to a crash.
 */
export interface ApprovalDecidedPayload {
    readonly id: string;
    readonly outcome: string;
}
/** Narrow an `approval/decided` payload. */
export declare function readApprovalDecided(data: unknown): ApprovalDecidedPayload | undefined;
/** True when an approval outcome should render as an error. */
export declare function isApprovalDenied(outcome: string): boolean;
/** A `hook/invoked` payload. */
export interface HookPayload {
    readonly id?: string;
    readonly name: string;
    readonly event?: string;
}
/**
 * Narrow a `hook/invoked` / `hook/result` payload. No sample appeared in the
 * surveyed logs (no hooks were configured), so the accepted key spellings are
 * deliberately broad: any of `name`/`hook`/`hookName` identifies the hook.
 */
export declare function readHook(data: unknown): HookPayload | undefined;
/** A `sandbox/mode`, `plan/mode`, `approval/policy` or `permission/preset` value. */
export declare function readModeValue(data: unknown): string | undefined;
/** A `command/run` payload — the slash command the user dispatched. */
export declare function readCommandRun(data: unknown): {
    name: string;
    args?: string;
} | undefined;
/** A `compaction/*` payload; every field is optional across the bracket. */
export interface CompactionPayload {
    readonly id?: string;
    readonly reason?: string;
    readonly removed?: number;
}
/** Narrow a `compaction/start` or `compaction/end` payload. */
export declare function readCompaction(data: unknown): CompactionPayload;
/** A `todo/write` payload, reduced to the progress counters. */
export declare function readTodos(data: unknown): {
    done: number;
    total: number;
    current?: string;
} | undefined;
//# sourceMappingURL=guards.d.ts.map
import type { TuiRewindMode } from '../adapter/ports/channel-session.js';
export type { TuiRewindMode } from '../adapter/ports/channel-session.js';
/**
 * Decision-point events the TUI fires on the cordis bus so plugins can
 * intercept, cancel, or customize interactive flows — the `session_before_*`
 * style seam (pi's `session_before_fork` / `input` events) expressed in
 * cordis dispatch semantics.
 *
 * All of these are FIRED BY THE CHANNEL and answered by admitted Components
 * through the host-mediated DecisionEvents registry. No extra service row is
 * involved: an absent handler simply means "no opinion", and the built-in
 * flow proceeds unchanged. Dispatch is SERIAL in the registry's stable order
 * with the first VALID decision winning — see {@link dispatchTuiDecision} for
 * why this is not raw `ctx.serial`: per-handler crash isolation, deadlines and
 * return-value normalization mean a broken or malformed handler can never
 * skip a later (possibly safety) veto.
 *
 * Synchronous-only rule: handlers may be async, but while a decision is
 * awaited the originating UI flow is parked (the submit is not delivered,
 * the rewind confirm has not happened). Handlers that need user input should
 * use the managed dialogs (`ctx.tuiDialogs`) or open a scene, then resolve.
 */
import type { Context } from '@deepseek-ai/cordis';
/** Explicit budgets from the DecisionEvents profile.  A timed-out handler is
 * treated as no-opinion and the chain continues; once the total budget is
 * exhausted the remaining handlers are skipped with the same policy. */
export declare const DECISION_HANDLER_TIMEOUT_MS = 1000;
export declare const DECISION_TOTAL_TIMEOUT_MS = 5000;
/**
 * Dispatch a decision event listener-by-listener in the host's stable order.
 *
 * Deliberately NOT `ctx.serial`: cordis bails at ANY non-null/false/undefined
 * return, so a malformed-but-object decision (a blank `{ text }` rewrite, a
 * junk primitive) would cut the chain before a later veto listener runs —
 * and one throwing listener rejects the whole dispatch, skipping every later
 * listener. Here:
 *
 * - a throwing listener is logged and the chain CONTINUES;
 * - each return value passes through `normalize` (per-event validation)
 *   INSIDE the same isolation boundary — a Proxy/throwing-getter return is
 *   logged and skipped like any other invalid shape;
 * - "no opinion" (undefined/null/false) and invalid shapes are logged and
 *   the chain CONTINUES;
 * - the first listener whose NORMALIZED decision is non-undefined wins;
 * - a decision that arrives after the handler was released (grant revoked,
 *   activation unloaded) is DISCARDED and the chain continues, because a
 *   handler is awaited: authority can end while its answer is still pending.
 *
 * Handlers come from the host-mediated DecisionEvents registry.  Raw Cordis
 * `ctx.on` listeners are intentionally absent from this path.
 */
export declare function dispatchTuiDecision<T>(ctx: Context, name: string, payload: Record<string, unknown>, normalize: (result: unknown, warn: (what: string) => void) => T | undefined): Promise<T | undefined>;
/** Fire a non-veto DecisionEvents point with the same bounded, isolated
 * semantics.  Notifications deliberately ignore every return value. */
export declare function dispatchTuiNotification(ctx: Context, name: string, payload: Record<string, unknown>): Promise<void>;
/** Shared normalizer for the veto-only decisions (session-switch, compact):
 *  `{ cancel: true, reason? }` or no opinion; everything else is ignored.
 *  The reason is toast-bound plugin text — sanitized (a veto must not
 *  smuggle control sequences onto the screen). */
export declare function normalizeCancelDecision(result: unknown, warn: (what: string) => void): {
    cancel: true;
    reason?: string;
} | undefined;
/** Shared context every decision event carries. */
export interface TuiDecisionContext {
    /** The live session (agent) id the flow belongs to. */
    sessionId: string;
    /** Working directory of the session. */
    cwd: string;
}
/**
 * Fired before user-typed text is delivered to the model (`submit` and
 * `steer`; local `!`/`!!` shell lines never fire it — they are not model
 * input). The message is NOT yet in the session log; nothing is observable
 * from the transcript at this point.
 */
export interface TuiInputEvent extends TuiDecisionContext {
    /** The trimmed text as typed. */
    text: string;
    /** Where the text would go: a new turn (`followup`) or the running one. */
    delivery: 'followup' | 'steer';
}
export type TuiInputDecision = 
/** Replace the text; the substitute is delivered instead. */
{
    text: string;
}
/** The plugin consumed the input itself; nothing is delivered. An optional
 *  notice is toasted so the user is not left wondering where the line went. */
 | {
    handled: true;
    notice?: string;
}
/** Drop the input; an optional reason is toasted as a warning. */
 | {
    cancel: true;
    reason?: string;
}
/** No opinion — delivery proceeds unchanged. */
 | undefined;
/**
 * Fired when the rewind picker confirms a message, BEFORE the fork happens.
 * `seq` is the session event seq of the picked user message (the fork itself
 * lands just before its turn — see channel.rewindTo).
 */
export interface TuiRewindPromptEvent extends TuiDecisionContext {
    /** Text of the picked message. */
    text: string;
    /** Session event seq of the picked message. */
    seq: number;
}
export type TuiRewindPromptDecision = 
/** Abort the rewind; the picker stays open. Optional reason is toasted. */
{
    cancel: true;
    reason?: string;
}
/** Extra choices rendered in the confirm pane on top of the built-in
 *  conversation-only rewind (which stays option zero). */
 | {
    modes: readonly TuiRewindMode[];
}
/** No opinion — the plain confirm pane shows, exactly as before. */
 | undefined;
/**
 * Fired after a rewind completed: the forked session is live and the
 * transcript replayed. The first listener returning a non-empty string has
 * it toasted as the post-rewind summary (serial bail semantics).
 */
export interface TuiRewindDoneEvent extends TuiDecisionContext {
    /** Text of the message that was rewound to (back in the input). */
    text: string;
    /** The mode id the user picked, or null for the built-in
     *  conversation-only rewind. */
    mode: string | null;
    /** Inclusive source seq the fork cut at (the child's seed end). */
    boundarySeq: number;
    /** The session that was forked away from. */
    sourceSessionId: string;
    /** The freshly created fork session — now the live one. */
    childSessionId: string;
}
/**
 * Fired before the live session is replaced (`/new` or `/resume`; rewind has
 * its own prompt event above). `targetSessionId` is set for resume only.
 */
export interface TuiSessionSwitchEvent extends TuiDecisionContext {
    kind: 'new' | 'resume';
    targetSessionId?: string;
}
export type TuiSessionSwitchDecision = 
/** Abort the switch; the current session stays live. Optional reason is
 *  toasted as a warning. */
{
    cancel: true;
    reason?: string;
} | undefined;
/**
 * Notification (parallel, fire-and-forget) after the live session changed.
 * Listener errors are logged, never propagated. Rebind per-session state
 * here; `previousSessionId` is undefined only when there was nothing live
 * before (not currently produced — every switch has a live source).
 */
export interface TuiSessionSwitchedEvent extends TuiDecisionContext {
    kind: 'new' | 'resume' | 'rewind' | 'fork';
    /** The session that just went live. */
    sessionId: string;
    previousSessionId?: string;
}
/** Fired before manual `/compact` runs. */
export interface TuiCompactEvent extends TuiDecisionContext {
}
export type TuiCompactDecision = 
/** Abort the compaction; optional reason is toasted as a warning. */
{
    cancel: true;
    reason?: string;
} | undefined;
declare module '@deepseek-ai/cordis' {
    interface Events {
        'tui/input'(event: TuiInputEvent): TuiInputDecision | Promise<TuiInputDecision>;
        'tui/rewind-prompt'(event: TuiRewindPromptEvent): TuiRewindPromptDecision | Promise<TuiRewindPromptDecision>;
        'tui/rewind-done'(event: TuiRewindDoneEvent): string | undefined | Promise<string | undefined>;
        'tui/session-switch'(event: TuiSessionSwitchEvent): TuiSessionSwitchDecision | Promise<TuiSessionSwitchDecision>;
        'tui/session-switched'(event: TuiSessionSwitchedEvent): void | Promise<void>;
        'tui/compact'(event: TuiCompactEvent): TuiCompactDecision | Promise<TuiCompactDecision>;
    }
}
//# sourceMappingURL=extension-events.d.ts.map
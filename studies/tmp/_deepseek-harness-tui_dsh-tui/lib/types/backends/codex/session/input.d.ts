/**
 * Input placement, the client follow-up queue and cancel receipts of one
 * Codex thread (docs/codex-backend-design.md §5.7, D8, D9).
 *
 * - Idle: every placement starts a turn (`turn/start`).
 * - A turn running (or starting): `steer` joins it (`turn/steer` with the
 *   expected turn id; a turn that cannot take it falls back to the queue,
 *   said once); `turn` / `followup` wait in the client queue and start one
 *   at a time after `turn/completed`; `now` goes to the queue front and
 *   interrupts the running turn.
 * - Nothing is shown optimistically: an input becomes a user row when its
 *   `userMessage` item carries its client id back (then `pending.changed`
 *   claims it); a turn that fails to start discards it.
 * - Cancel: the queue lives in this process, so every receipt is
 *   `confirmed`. Codex drops a steer the turn has not taken yet when the
 *   turn is interrupted (C0 V6): a `user` cancel queues those again in
 *   order (they still run next), an `interrupt` cancel drops them with the
 *   queue (the channel docks its copies).
 * - An interrupt that never completes the turn is force-closed after
 *   `forceSettleMs` (a stuck relay, F29).
 */
import type { AgentEvent } from '../../../agent/events.js';
import type { AgentInput, CancelCause, CancelReceipt, SubmitPlacement } from '../../../agent/session.js';
import { type Rec } from '../narrow.js';
import type { UserInput } from '../protocol/index.js';
import type { RpcClock } from '../rpc/client.js';
export interface InputQueueDeps {
    readonly threadId: string;
    call<R = unknown>(method: string, params: unknown): Promise<R>;
    emit(events: readonly AgentEvent[]): void;
    debug(message: string): void;
    /** Per-turn overrides (`turn/start` settings; C2 fills them). */
    overrides(): Rec;
    /** Retire a rejected experimental setting; never retry the user's input. */
    startFailed?(error: unknown, overrides: Rec): void;
    closed(): boolean;
    /** The open turn could not be settled by the server: close it here. */
    forceClose(turnId: string, reviewTurnId?: string): void;
    readonly clock: RpcClock;
    readonly forceSettleMs: number;
}
/** The model-facing input of a submission: every text block as its own
 *  text input (the first is what the user typed), in block order. */
export declare function userInputOf(input: AgentInput): UserInput[];
export declare function createInputQueue(deps: InputQueueDeps): {
    readonly activeTurnId: string | undefined;
    /** Whether a turn runs or is being started. */
    busy(): boolean;
    submit(input: AgentInput, placement: SubmitPlacement, wireInput?: readonly UserInput[]): Promise<{
        readonly accepted: boolean;
        readonly reason?: string;
    }>;
    cancel(cause: CancelCause): Promise<CancelReceipt>;
    /** Pull a queued input back before it is sent. */
    remove(id: string): boolean;
    /** A user message carried this client id back: the input ran. */
    claim(clientId: string): AgentEvent | undefined;
    onTurnStarted(turnId: string): void;
    /** Reserve the turn before review/start reaches the server. The returned
     *  cleanup releases only this request's wait if its RPC fails. */
    beginReview(): () => void;
    onReviewStarted(turnId: string): void;
    onTurnCompleted: (turnId: string | undefined, interrupted: boolean) => void;
    /** Re-queue a rejection's reason as the next turn (D10). */
    enqueueFollowup(id: string, text: string): void;
    /** The connection dropped: the running turn is gone, the queue stays. */
    connectionLost(): readonly AgentEvent[];
    connectionRestored(): void;
    /** The connection is gone for good: the parked queue is discarded (their
     *  pending rows say so) and later submits fail fast instead of parking
     *  forever behind an offline flag nothing will ever clear. */
    permanentLoss(): readonly AgentEvent[];
    /** Dispose: forget everything, stop the timer. */
    close(): void;
    /** Interrupt the running turn (best-effort, dispose path). */
    interrupt: (waitForReviewStart?: boolean) => Promise<boolean>;
};
export type InputQueue = ReturnType<typeof createInputQueue>;
//# sourceMappingURL=input.d.ts.map
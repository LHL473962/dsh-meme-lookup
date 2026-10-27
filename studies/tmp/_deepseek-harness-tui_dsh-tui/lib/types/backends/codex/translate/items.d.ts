/**
 * Codex thread items → Agent Domain events: the one mapping live
 * notifications and history replay share (docs/codex-backend-design.md §7.1).
 * `live.ts` calls {@link itemEvents} on `item/started` / `item/completed`
 * and adds the stream deltas; `replay.ts` calls it with `started` then
 * `completed` for every item of every recorded turn. Any mapping lives here
 * once; `verify-codex-live-replay` keeps the two paths equal.
 *
 * Turns, steps and attempts (§7.2–§7.3):
 *  - a turn opens with its first item (a user message → a user turn, a
 *    `userShell` command → a user turn, anything else → a system turn) and
 *    closes with `turn/completed` (live) / the end of the recorded turn;
 *  - one model reply is one attempt (`<turnId>#<step>`) in its own step:
 *    reasoning, message and plan items open it, a message or plan completing
 *    settles it as one canonical `assistant.message`; a tool item settles a
 *    reasoning-only attempt and joins the current step;
 *  - a tool item still open when its turn closes was interrupted (an
 *    interrupted item never completes and never reaches history, F11).
 *
 * Identity: `user.message.id` is the client id the channel submitted (the
 * item id for another client's message); its `anchor` is the item id, the
 * native fork/rewind anchor, and each anchor maps to its turn id.
 */
import type { AgentEvent, AgentEventOf, TurnEndReason, UsageDelta } from '../../../agent/events.js';
import { type Rec } from '../narrow.js';
import { type ResultWords } from './presentation.js';
/** The attempt (one model reply) being assembled. */
export interface OpenAttempt {
    readonly id: string;
    readonly step: number;
    reasoning: string;
    text: string;
    /** Reasoning streamed so far (a new summary part starts a paragraph). */
    streamedReasoning: string;
    /** Text streamed so far: what an interrupted reply settles with when its
     *  item never completed. */
    streamedText: string;
    /** Items whose raw reasoning stream is shown (no summary was streamed). */
    readonly rawReasoning: Set<string>;
    /** Items whose summary streamed (their raw text stream stays hidden). */
    readonly summarized: Set<string>;
}
/** A tool item that started and has not completed. */
export interface OpenTool {
    readonly name: string;
    readonly startedAt: number;
}
export interface ItemContextOptions {
    readonly cwd: string;
    readonly now?: () => number;
    readonly debug?: (message: string) => void;
    /** Where the numbering continues (a live translator after a replay). */
    readonly start?: {
        readonly turn: number;
        readonly seq: number;
    };
    readonly model?: string;
}
/** The translator state live and replay share (and hand over). */
export interface ItemContext {
    readonly cwd: string;
    readonly debug: (message: string) => void;
    now(): number;
    nextSeq(): number;
    readonly seq: number;
    model: string;
    turn: number;
    turnOpen: boolean;
    /** The native id of the open (or last) turn. */
    turnId: string;
    step: number;
    stepOpen: boolean;
    attempt: OpenAttempt | undefined;
    readonly openTools: Map<string, OpenTool>;
    /** User-message anchor → native turn id (fork / rewind). */
    readonly anchorTurns: Map<string, string>;
    /** A `/compact` this session asked for is running (manual trigger). */
    compactRequested: boolean;
    /** A compaction item ran in the open turn. */
    compactionSeen: boolean;
    /** Usage reported in the open turn (its `turn.end`). */
    turnUsage: UsageDelta | undefined;
    readonly words: ResultWords;
}
export declare function createItemContext(options: ItemContextOptions): ItemContext;
/** Open a turn (no-op when one is open). */
export declare function openTurn(ctx: ItemContext, out: AgentEvent[], origin: AgentEventOf<'turn.start'>['origin'], time: number, userMessageId?: string): void;
export declare function closeStep(ctx: ItemContext, out: AgentEvent[]): void;
/** A step for a tool that no reply opened (a turn's first item is a tool). */
export declare function ensureStep(ctx: ItemContext, out: AgentEvent[]): void;
/** The open attempt, or a new one in a new step. */
export declare function ensureAttempt(ctx: ItemContext, out: AgentEvent[], firstTokenTime?: number): OpenAttempt;
/** Settle the open attempt as one canonical assistant message. */
export declare function settleAttempt(ctx: ItemContext, out: AgentEvent[], time: number, interrupted?: boolean): void;
/**
 * Close the open turn: settle the reply, end the still-open tools as
 * interrupted, close the step, `turn.end`, then the failure's hint. A turn
 * that produced no item opens first (a turn that failed at once).
 */
export declare function closeTurn(ctx: ItemContext, out: AgentEvent[], reason: TurnEndReason, time: number): void;
/** Meter one model call without manufacturing or changing a message.
 *
 * `attribution` names the turn the WIRE notification carried: a straggler
 * usage for an already-closed turn (arriving after a newer turn opened) is
 * booked under ITS turn and never folded into the live turn's ledger. */
export declare function reportUsage(ctx: ItemContext, out: AgentEvent[], usage: UsageDelta, time: number, attribution?: {
    turn: number;
    stale: boolean;
}): void;
/** One item's events for one phase (see the module comment). */
export declare function itemEvents(item: Rec, phase: 'started' | 'completed', ctx: ItemContext, time: number): AgentEvent[];
//# sourceMappingURL=items.d.ts.map
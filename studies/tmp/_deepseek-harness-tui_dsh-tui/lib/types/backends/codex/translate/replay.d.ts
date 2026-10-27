/**
 * Recorded Codex turns → Agent Domain events (docs/codex-backend-design.md
 * §7.6): every item of every turn through the shared mapping (`items.ts`),
 * `started` then `completed`, oldest turn first. The context is handed on
 * to the live translator afterwards, so live numbering continues where the
 * replay ended.
 *
 * - Turns must carry full items (`itemsView: 'full'`, C0 V4).
 * - Times: a turn's `startedAt` / `completedAt` (seconds) when recorded.
 * - An in-progress turn (the last one of a running thread) stays open: its
 *   in-progress items only start, and live traffic completes them.
 * - History carries no approvals, questions, stream deltas or token usage.
 */
import type { AgentEvent } from '../../../agent/events.js';
import { type ItemContext } from './items.js';
/** Replay turns (oldest first) into events, advancing `ctx`. */
export declare function replayTurns(turns: readonly unknown[], ctx: ItemContext): AgentEvent[];
//# sourceMappingURL=replay.d.ts.map
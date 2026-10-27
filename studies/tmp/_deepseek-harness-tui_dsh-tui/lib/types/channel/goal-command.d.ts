/**
 * The backend-neutral `/goal` (N6): its grammar for a session that serves
 * goals through the typed `goals` capability (DSH keeps its own
 * `dsh-command-goal` registry row and never reaches this), the status it
 * prints, and the budget readout every goal surface shares.
 *
 * Grammar (the DSH command's control words, plus a token budget):
 *
 *   /goal                          the current goal (or usage)
 *   /goal <objective>              set or replace the objective
 *   /goal --budget 50k <objective> … under a token budget (50000, 50k, 1.5m)
 *   /goal edit <objective>         replace the objective (same as set)
 *   /goal pause | resume | clear   only when the word is the whole input
 *
 * Pure: parsing and formatting only; the channel core's `backendGoals`
 * host performs the capability calls.
 */
import type { ChannelGoal } from '../adapter/ports/channel-view.js';
/** What one `/goal` line asks for. */
export type GoalCommand = {
    readonly kind: 'status';
} | {
    readonly kind: 'set';
    readonly objective: string;
    readonly tokenBudget?: number;
} | {
    readonly kind: 'pause';
} | {
    readonly kind: 'resume';
} | {
    readonly kind: 'clear';
} | {
    readonly kind: 'invalid';
    readonly reason: string;
};
/** A token budget as typed (`50000`, `50k`, `1.5m`); undefined when invalid. */
export declare function parseTokenBudget(text: string): number | undefined;
/** Parse the text after `/goal`. */
export declare function parseGoalCommand(rawInput: string): GoalCommand;
type GoalBudget = NonNullable<ChannelGoal['budget']>;
/** `Used 12.3k / 50k tokens · 4m` (no cap: `Used 12.3k tokens · 4m`). */
export declare function formatGoalBudget(budget: GoalBudget): string;
/** The status-footer chip's compact budget: `12.3k/50k` (no cap: `12.3k`). */
export declare function formatGoalBudgetCompact(budget: GoalBudget): string;
/** The `/goal` status lines: the goal, its phase, its budget (or rounds),
 *  why it is blocked; usage when there is none. */
export declare function goalStatusLines(goal: ChannelGoal | undefined): string[];
export {};
//# sourceMappingURL=goal-command.d.ts.map
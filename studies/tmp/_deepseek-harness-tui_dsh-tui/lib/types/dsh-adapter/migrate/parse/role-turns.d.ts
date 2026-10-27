/**
 * Flat role list → imported turns, plus the shared size measure.
 *
 * The first migration adapters normalized every source into an alternating
 * user/assistant list. {@link fromRoleTurns} folds that list into the turn
 * model mechanically — a user message opens a turn, every assistant message
 * after it is one step — so an adapter that still produces the list imports
 * exactly as it did before the turn model existed.
 *
 * @module @deepseek-harness-tui/dsh-tui/migrate/parse/role-turns
 */
import type { ImportStats, ImportTurn, MigrationSession, MigrationTurn } from '../types.js';
/** Counters for a source that reports nothing it left out. */
export declare function emptyStats(): ImportStats;
/**
 * Fold a role list into turns.
 *
 * A list that starts with an assistant message opens a turn with no prompt
 * (the source lost its head); a trailing user message is a step-less turn.
 */
export declare function fromRoleTurns(list: readonly MigrationTurn[]): ImportTurn[];
/**
 * How many conversation messages an imported session carries: prompts,
 * mid-turn inputs and assistant steps (tool results are not counted). For a
 * role-list source this equals the list length.
 */
export declare function messageCount(session: Pick<MigrationSession, 'turns'>): number;
//# sourceMappingURL=role-turns.d.ts.map
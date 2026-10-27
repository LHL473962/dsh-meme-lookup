/**
 * The Claude backend's working-activity fold (the counterpart of the DSH
 * `dsh-working-activity` plugin): the translator's own state
 * (`ClaudeActivityState` — nothing is re-parsed here) plus the permission
 * bridges' parked-prompt signal become one working-line value per phase or
 * line change, published through the session's `workingActivity` capability
 * to the same store the DSH projection feed fills.
 *
 * Semantics mirror the plugin's where this backend has the fact:
 *  - a turn works only inside itself — nothing is published before the first
 *    turn, so the classic random-verb spinner keeps its slot unchanged;
 *  - a parked permission/dialog prompt outranks everything (`waiting`: the
 *    model is waiting on you);
 *  - the newest unsettled tool call is the `tool` phase (label = tool name,
 *    detail = the input's most DSH-like short field);
 *  - otherwise `thinking`: the ⏵ self-narration line when the reply
 *    carries one, else the tracked task's `activeForm` (the CLI's own
 *    spinner wording), else a plain localized word;
 *  - turn end parks on the `done` card (kept until the next turn, exactly
 *    like the plugin — the status line shows the summary while idle).
 *
 * `live` is always false on purpose: the value is settled copy (no elapsed
 * text), and the DSH store's live tick re-reads the DSH projection registry —
 * a live foreign value would be cleared by it within one tick. The elapsed
 * and shimmer animations are renderer-side (ActivityLine derives them from
 * the stamps), so nothing is lost.
 *
 * @module dsh-tui/backends/claude/activity
 */
import type { WorkingActivityView } from '../../agent/index.js';
import type { ClaudeActivityState } from './translate.js';
/**
 * The input's most DSH-like short field: the first string among
 * file_path / command / pattern / url / path, clipped. Undefined when the
 * input names none of them.
 */
export declare function activityDetail(input: unknown): string | undefined;
/** One publisher per session: it dedupes and owns the change feed. */
export interface ClaudeActivityPublisher {
    /** Fold the current state; returns (and announces) the value only when the
     *  phase or the line changed. `undefined` = nothing to publish (yet). */
    fold(state: ClaudeActivityState, waiting: boolean): WorkingActivityView | undefined;
    /** The latest published value (the done card persists past the turn). */
    last(): WorkingActivityView | undefined;
    /** Subscribe to values; a late subscriber immediately receives `last()`
     *  once (a rebind shows the running line without waiting for a change). */
    subscribe(listener: (view: WorkingActivityView) => void): () => void;
}
/** Create one session's publisher. `now` defaults to the wall clock. */
export declare function createClaudeActivityPublisher(options?: {
    now?: () => number;
}): ClaudeActivityPublisher;
//# sourceMappingURL=activity.d.ts.map
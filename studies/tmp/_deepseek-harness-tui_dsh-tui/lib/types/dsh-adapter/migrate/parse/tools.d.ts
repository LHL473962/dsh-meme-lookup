/**
 * Tool-call pairing for imported conversations.
 *
 * The one hard rule for replaying tool traffic is wire legality: every tool
 * call is answered by exactly one tool message before any later assistant
 * message, and every tool message answers a call. Sources do not guarantee
 * that — results arrive steps after their call (Claude batches them behind
 * consecutive assistant rows), transcripts start mid-conversation, runs are
 * interrupted before a result lands. This module restores the rule:
 *
 * - {@link CallIndex} attaches a late result to the STEP that made the call,
 *   never to whatever step is newest;
 * - {@link closeToolPairs} orders each step's results by call order, drops
 *   orphans and duplicates (counted), and answers unanswered calls with an
 *   empty result.
 *
 * @module @deepseek-harness-tui/dsh-tui/migrate/parse/tools
 */
import type { ImportStep, ImportTurn } from '../types.js';
/** Largest tool-result text kept per result, in UTF-8 bytes. */
export declare const TOOL_RESULT_MAX_BYTES: number;
/** Placeholder written instead of image bytes (never base64 into the log). */
export declare const IMAGE_PLACEHOLDER = "[image]";
/** A fresh empty step. */
export declare function newStep(model?: string): ImportStep;
/**
 * Clamp a tool-result text to {@link TOOL_RESULT_MAX_BYTES}, cutting on a
 * character boundary and noting how much was dropped.
 */
export declare function clampToolText(text: string): string;
/**
 * Session-wide call-id → step index. Register a step's calls when the step
 * is built; attach results as they arrive, wherever they arrive.
 */
export declare class CallIndex {
    private readonly stepOf;
    /** Results whose call id was never registered. */
    orphans: number;
    /** Index every tool-call block currently in `step`. */
    register(step: ImportStep): void;
    /** Whether a call with this id has been registered. */
    has(callId: string): boolean;
    /**
     * Attach one result to the step that made the call.
     * @returns false (and counts an orphan) when no such call is known.
     */
    attach(callId: string, text: string, isError: boolean): boolean;
}
/**
 * Make every step wire-legal, in place.
 *
 * Per step: results follow call order; a result for a call not in the step,
 * or a second result for one call, is dropped; a call without a result gets
 * an empty one. Across the session, a call id reused by a later step (a
 * source retry the source-specific cleanup did not collapse) is renamed
 * `<id>#<n>` together with its result — the session log folds tool calls by
 * id, and a duplicate id would swallow everything after it.
 *
 * @returns How many results were dropped.
 */
export declare function closeToolPairs(turns: readonly ImportTurn[]): number;
//# sourceMappingURL=tools.d.ts.map
import { SessionId, type SessionEvent, type SessionHeader } from '@deepseek-ai/dsh-session';
import type { MigrationSession } from './types.js';
/** One migration turn's model-visible outcome, ready for persistence. */
export interface SessionizedLog {
    readonly header: SessionHeader;
    readonly events: readonly SessionEvent[];
}
/**
 * The empty system head an imported log opens with, in whichever shape the
 * installed harness writes. `createSystemMessage` changed arity between the
 * validated lines: 0.1.5-alpha.2 takes the owning plugin and stamps a plugin
 * source, later lines take the text alone and stamp `system-prompt`. Calling
 * it with both arguments lets each line build its own native head (the later
 * one ignores the extra argument) instead of this module hard-coding either.
 */
/**
 * The checkpoint framing the native compaction engine writes around a summary
 * (dsh-compaction-basic `frameSummary`): a preamble, then the summary inside
 * `<compacted-summary>` tags. The tags are how a LATER compaction recognises
 * this node as a prior checkpoint and merges it instead of summarising the
 * summary, so an imported checkpoint has to carry them exactly. The package
 * does not export the constants; verify-migrate pins these against the
 * installed engine's own source so a drift fails the regression.
 */
export declare const CHECKPOINT_PREAMBLE = "This is an automatically generated checkpoint condensing an earlier span of the conversation to free up context. Treat the captured context as established background and build on it without restating it. Continue the task directly from the messages that follow, without acknowledging this checkpoint.";
export declare const SUMMARY_OPEN_TAG = "<compacted-summary>";
export declare const SUMMARY_CLOSE_TAG = "</compacted-summary>";
/**
 * Build one official DSH session log from a normalized foreign conversation.
 *
 * @param id - deterministic session id (see uuid.ts); the id IS the dedupe.
 * @param agentId - source adapter id, stamped into assistant provenance as
 *   `migrated:<agentId>` so the transcript can name where text came from.
 * @param session - the normalized foreign conversation.
 * @returns the official header plus the full event log, exactly as the
 *   persistence backend expects them.
 */
export declare function sessionize(id: SessionId, agentId: string, session: MigrationSession): SessionizedLog;
//# sourceMappingURL=sessionize.d.ts.map
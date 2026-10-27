export type { RecapOutcome } from '../adapter/ports/channel-catalog.js';
/**
 * Session recap (`/recap`, pi-recap semantics): a single TOOL-LESS LLM
 * call that summarizes the session's RECENT activity into one line and
 * proposes a short title. Unlike `/btw` it does not replay the full
 * derived history — the recent-activity excerpt below IS the payload, so
 * the call stays cheap and the recap is about the tail of the session,
 * which is exactly what a glance at a resumed/unknown session needs.
 *
 * The answer never enters the session log — it is pure UI state (the
 * RecapPanel in the Chat screen); applying the proposed title goes
 * through the normal `/rename` path (channel.renameSession).
 *
 * @module
 */
import type { SessionEvent } from '@deepseek-ai/dsh-session';
/** Max chars of recent activity fed to the recap call. */
export declare const RECAP_RECENT_CHARS = 6000;
/**
 * Collect the most recent user/assistant exchanges from a session event
 * log as plain `role: text` lines, capped to the tail turns and a char
 * budget. Rows derived from the log (tool cards, notices) are skipped —
 * the recap wants the conversation, not the chrome.
 */
export declare function collectRecentActivity(events: readonly SessionEvent[], limitChars: number): string;
/** The recap prompt and its answer parser are backend-neutral (the Claude
 *  backend's `/recap` uses the same contract): src/channel/side-prompts.ts. */
export { parseRecapResponse, wrapRecapPrompt } from '../channel/side-prompts.js';
//# sourceMappingURL=recap.d.ts.map
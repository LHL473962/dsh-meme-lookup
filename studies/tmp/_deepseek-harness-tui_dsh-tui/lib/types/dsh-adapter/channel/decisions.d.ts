import type { TuiInputDecision, TuiRewindPromptDecision } from '../extension-events.js';
import { NOTICE_CELLS } from '../sanitize.js';
/** `tui/input` return normalization: transform/handled/cancel or no opinion.
 *  A blank `{ text }` rewrite is NOT a decision — it is logged and the chain
 *  continues so a later veto listener still runs. */
export declare function normalizeInputDecision(result: unknown, warn: (what: string) => void): TuiInputDecision | undefined;
/** `tui/rewind-prompt` return normalization: cancel/modes or no opinion.
 *  Modes are COPIED with only validated, sanitized scalar fields — the raw
 *  plugin object must never reach the render path (a `description: {}` would
 *  crash ListItem's `.replace`, and control chars would corrupt the pane).
 *  Notices/reasons are toast-bound plugin text: sanitized too (see
 *  ./sanitize.js — the one implementation of the render-path contract). */
export declare function normalizeRewindPromptDecision(result: unknown, warn: (what: string) => void): TuiRewindPromptDecision | undefined;
/** Toast-width cap; defined beside the sanitizer it pairs with
 *  (`src/channel/sanitize.ts`) and re-exported for existing importers. */
export { NOTICE_CELLS };
/** `tui/rewind-done` return normalization: the first non-empty STRING is the
 *  summary; anything else is not a decision. */
export declare function normalizeRewindDoneSummary(result: unknown, warn: (what: string) => void): string | undefined;
//# sourceMappingURL=decisions.d.ts.map
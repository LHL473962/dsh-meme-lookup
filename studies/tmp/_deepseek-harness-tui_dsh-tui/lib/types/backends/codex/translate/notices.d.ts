import type { AgentEvent, TurnEndReason } from '../../../agent/events.js';
import { type Rec } from '../narrow.js';
type Notice = Extract<AgentEvent, {
    readonly type: 'notice';
}>;
/** The kebab-case name of a `codexErrorInfo` (a string or a one-key object). */
export declare function errorCategory(info: unknown): string | undefined;
/** Whether a configuration warning is the known sandbox fallback noise. */
export declare function isBubblewrapNoise(summary: string): boolean;
/** `error` with `willRetry`: one keyed warning per turn, updated in place. */
export declare function retryNotice(params: Rec): Notice | undefined;
/** `warning` / `guardianWarning` / `configWarning` / `deprecationNotice`. */
export declare function warningNotice(method: string, params: Rec): Notice | undefined;
/** The end reason of a `turn/completed` turn. */
export declare function turnEndReason(turn: Rec): TurnEndReason;
/**
 * The actionable hint after a failed turn, by its error category (§9.1):
 * sign in again, compact, wait for the limit, install the sandbox helper.
 * The turn's own message is already on its notice row.
 */
export declare function failureHint(reason: TurnEndReason, platform?: string): Notice | undefined;
/** `item/autoApprovalReview/*`: an info line while the auto-reviewer works. */
export declare function reviewNotice(method: string, params: Rec): Notice | undefined;
/** `mcpServer/startupStatus/updated` failing: one warning per server. */
export declare function mcpStartupNotice(params: Rec): Notice | undefined;
export {};
//# sourceMappingURL=notices.d.ts.map
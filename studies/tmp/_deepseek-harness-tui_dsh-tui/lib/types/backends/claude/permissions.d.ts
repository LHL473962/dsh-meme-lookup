/**
 * The Claude permission bridge: the session's `canUseTool` callback. Every prompt parks here, keyed by the
 * control request id, and surfaces to the channel as an Agent Domain event:
 *
 *  - an ordinary tool prompt → `permission.request` with backend-generated
 *    options (allow once; allow always — only when the CLI suggests what to
 *    remember and the prompt allows it — labelled by what it remembers;
 *    reject, with an optional typed reason);
 *  - `AskUserQuestion` → `question.request` (the questionnaire panel);
 *  - `ExitPlanMode` → `question.request` presented as a plan review (approve
 *    with auto-accepted edits / approve with manual approvals / keep
 *    planning, with feedback).
 *
 * The user's answer comes back through `respond` / `respondQuestion` /
 * `cancelQuestion` and becomes the `PermissionResult` the CLI expects.
 *
 * Deadlock rules (each covered by verify-claude-permissions):
 *  1. the SDK's abort signal (interrupt, turn end, process exit, `close()`)
 *     settles the prompt as withdrawn and closes the panel
 *     (`permission.settled{cancelled}` / `question.settled`), whichever
 *     delivery of the request it came with;
 *  2. a user cancel only interrupts the CLI (the session's `cancel()`); the
 *     abort that follows is rule 1 — this bridge never answers on its own;
 *  3. a dismissed panel is a rejection (the panel's Esc);
 *  4. dispose / switch denies every pending prompt (`settleAll`) before the
 *     query closes;
 *  5. parallel prompts all park; the shared store shows them FIFO, one at a
 *     time (the CLI itself asks one at a time);
 *  6. the callback never throws: a failure while building a prompt denies it.
 *
 * Persistence of an allow-always choice is entirely the CLI's: the bridge
 * hands back the CLI's own suggestions as `updatedPermissions` and never
 * writes a settings file.
 */
import type { CanUseTool, PermissionUpdate } from '@anthropic-ai/claude-agent-sdk';
import type { PermissionDecision, QuestionAnswers } from '../../agent/capabilities.js';
import type { AgentEvent, PermissionRequestView } from '../../agent/events.js';
import { type Rec } from './narrow.js';
/** The model-facing refusal. */
export declare const REJECT_MESSAGE = "User refused permission to run tool";
/** The model-facing answer to a cancelled `AskUserQuestion`. */
export declare const QUESTION_CANCEL_MESSAGE = "User cancelled the question";
/** The model-facing answer to a plan sent back for more planning. */
export declare const PLAN_KEEP_PLANNING_MESSAGE = "The user wants to keep planning and did not approve the plan";
/** The model-facing answer to a dismissed plan review. */
export declare const PLAN_DISMISSED_MESSAGE = "The user dismissed the plan review";
/** What a withdrawn prompt resolves with (the CLI records its own refusal). */
export declare const WITHDRAWN_MESSAGE = "The permission prompt was withdrawn";
/** What a prompt still open at dispose resolves with. */
export declare const CLOSED_MESSAGE = "The session closed before the user answered";
export interface ClaudePermissionBridgeDeps {
    /** The session cwd (paths in prompts display relative to it). */
    readonly cwd: string;
    /** Deliver events to the channel (buffered until it subscribes). */
    emit(events: readonly AgentEvent[]): void;
    debug(message: string): void;
    /** The number of parked prompts changed (session status). */
    onPendingChange?(count: number): void;
    /** The session is closing: new prompts are refused at once. */
    closing(): boolean;
}
/** One line naming what the tool would do. */
export declare function promptCommand(toolName: string, input: Rec, cwd: string): string | undefined;
/**
 * The allow-always label: what the CLI's suggestions would remember, in the
 * user's words. Undefined when no suggestion has a known shape (the generic
 * label stands in).
 */
export declare function alwaysLabel(suggestions: readonly PermissionUpdate[], cwd: string): string | undefined;
/** Create the bridge for one session. */
export declare function createClaudePermissionBridge(deps: ClaudePermissionBridgeDeps): {
    canUseTool: CanUseTool;
    respond: (requestId: string, decision: PermissionDecision) => void;
    respondQuestion: (requestId: string, answers: QuestionAnswers) => void;
    cancelQuestion: (requestId: string) => void;
    /** Every parked tool prompt, in park order. */
    pendingViews(): readonly PermissionRequestView[];
    readonly size: number;
    /** Withdraw everything (dispose, switch, a forced turn close). */
    settleAll(message?: string): void;
};
export type ClaudePermissionBridge = ReturnType<typeof createClaudePermissionBridge>;
//# sourceMappingURL=permissions.d.ts.map
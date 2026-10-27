/**
 * The shared permission prompt surface: one view shape the approval panel
 * renders for every backend, the small interface Chat drives it through, and
 * `PermissionStore`, the FIFO store a non-DSH session's `permission.request`
 * events park in.
 *
 * Queue semantics mirror the DSH `ApprovalStore`: parallel tool calls can
 * raise several prompts before any answer, so they drain first in, first out
 * with exactly one on the panel. A prompt settles exactly once:
 *  - `decide` — the user picked an option on the panel (allow once / allow
 *    always / reject, the reject optionally carrying the user's reason);
 *  - `withdraw` — the backend took the prompt back (its own cancellation:
 *    interrupt, turn end, process exit) → `cancelled`;
 *  - `withdrawSession` / `settleAll` — the session left the binding or the
 *    host tears down → `cancelled`.
 * Only a user decision reaches the backend: a withdrawn prompt was already
 * answered on the backend side, so answering it again would be a second,
 * conflicting verdict.
 *
 * Backend-neutral: no vendor types, no DSH imports (`verify:boundary`).
 */
import type { PermissionDecision } from '../agent/capabilities.js';
import type { PermissionOptionView, PermissionOutcome, PermissionRequestView } from '../agent/events.js';
/** What the approval panel renders for the active prompt. */
export interface PermissionPanelSnapshot {
    /** Stable key so the panel remounts (fresh focus state) per prompt. */
    readonly key: string;
    /** The tool (or its short display name) the prompt gates. */
    readonly toolName: string;
    /**
     * The asking session's id. A prompt from a session other than the attached
     * one (a DSH background session in the agent view) is labelled as such.
     */
    readonly agentId: string;
    /** Full prompt sentence, when the backend renders one. */
    readonly title?: string;
    /** One-line rendering of the gated action (command, file, URL). */
    readonly command?: string;
    /** Why the backend asks. */
    readonly reason?: string;
    /** What granting would allow. */
    readonly description?: string;
    /** The path outside the allowed directories that triggered the ask. */
    readonly blockedPath?: string;
    /** The asking subagent (a delegated agent inside the attached session). */
    readonly subagentId?: string;
    /** DSH source badge: the ask is not anchored to a live tool call. */
    readonly external?: true;
    /** The choices, in the backend's order; absent = allow once / reject. */
    readonly options?: readonly PermissionOptionView[];
    /** Reject first, and no single keystroke approves. */
    readonly defaultToNo?: boolean;
    /** No persistent "don't ask again" choice may be shown. */
    readonly suppressAlwaysAllow?: boolean;
    /** A user ask rule forced this prompt (no "don't ask again" either). */
    readonly matchedAskRule?: boolean;
    /** Typing on the panel composes a reason sent back with a rejection. */
    readonly feedback?: boolean;
}
/** The panel's outcome vocabulary (the DSH protocol's two plus allow-always). */
export type PermissionPanelOutcome = 'allowed-once' | 'allowed-always' | 'rejected';
/** The option the user picked, with the reason typed for a rejection. */
export interface PermissionPanelDecision {
    readonly optionId: string;
    readonly kind: PermissionOptionView['kind'];
    readonly feedback?: string;
    /**
     * The snapshot key of the panel that decided. A store ignores a decision
     * whose key is not its active prompt's: a keystroke a just-withdrawn panel
     * still handled must never answer the prompt that replaced it.
     */
    readonly key?: string;
}
/**
 * The store interface the approval panel host (Chat, the session
 * supervisor) drives: the DSH `ApprovalStore` and `PermissionStore` both
 * implement it, so one panel renders either.
 */
export interface PermissionPanelSource {
    subscribe(listener: () => void): () => void;
    getSnapshot(): PermissionPanelSnapshot | null;
    /** Settle the active prompt with the user's choice. */
    decide(outcome: PermissionPanelOutcome, decision?: PermissionPanelDecision): void;
}
/** The two choices every prompt without backend options offers. */
export declare const DEFAULT_PERMISSION_OPTIONS: readonly PermissionOptionView[];
/** The panel outcome of an option kind. */
export declare function panelOutcomeOf(kind: PermissionOptionView['kind']): PermissionPanelOutcome;
/**
 * The options a panel may show for one prompt, in display order: an
 * allow-always option is dropped when the prompt forbids it (suppressed, or
 * forced by an ask rule; backends already omit it, so this is a second
 * guard), and `defaultToNo` moves the rejections to the front.
 */
export declare function visiblePermissionOptions(snapshot: Pick<PermissionPanelSnapshot, 'options' | 'defaultToNo' | 'suppressAlwaysAllow' | 'matchedAskRule'>): readonly PermissionOptionView[];
/** One parked prompt: the backend's view plus how its settlement is reported. */
export interface PermissionAsk {
    /** The session that raised it (`AgentSessionRef.sessionId`). */
    readonly sessionId: string;
    readonly request: PermissionRequestView;
    /**
     * Called exactly once. `decision` is present only for a user decision
     * (allow-once / allow-always / rejected); `cancelled` carries none.
     */
    settle(outcome: PermissionOutcome, decision?: PermissionDecision): void;
}
/**
 * FIFO permission store for backend sessions (the shared half of the
 * approval flow). Chat renders `getSnapshot()` through the approval panel;
 * the channel parks and withdraws as the session's events arrive.
 */
export declare class PermissionStore implements PermissionPanelSource {
    private readonly queue;
    private active;
    private readonly listeners;
    private seq;
    /** Stable reference between mutations (useSyncExternalStore contract). */
    private snapshotCache;
    subscribe(listener: () => void): () => void;
    getSnapshot(): PermissionPanelSnapshot | null;
    /** Every parked prompt (active first), in the backend's own shape. */
    pending(): readonly PermissionRequestView[];
    /** Session ids with a parked prompt, deduplicated, in park order. */
    pendingAgentIds(): readonly string[];
    /** The first parked prompt's summary for one session. */
    pendingAgentDetail(sessionId: string): {
        readonly toolName: string;
        readonly reason?: string;
        readonly command?: string;
    } | undefined;
    /** Park one prompt; it surfaces once every earlier prompt settled. A
     *  duplicate (same session and request id) is refused as cancelled. */
    park(ask: PermissionAsk): void;
    /**
     * The user decided on the active prompt. The outcome's option comes from
     * `decision` when given (it names which allow-always option and carries a
     * rejection's reason); a bare outcome picks the first option of its kind.
     */
    decide(outcome: PermissionPanelOutcome, decision?: PermissionPanelDecision): void;
    /** The backend withdrew one prompt (its own cancellation). */
    withdraw(sessionId: string, requestId: string): boolean;
    /** A session left the binding: withdraw every prompt it parked. */
    withdrawSession(sessionId: string): void;
    /** Withdraw everything (host teardown). */
    settleAll(): void;
    private all;
    private find;
    private remove;
    /** A settle callback that throws must not wedge the queue. */
    private settle;
    private startNext;
    private rebuild;
    private emit;
}
//# sourceMappingURL=permissions.d.ts.map
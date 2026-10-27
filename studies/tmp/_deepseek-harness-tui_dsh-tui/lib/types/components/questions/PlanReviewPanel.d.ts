/**
 * The plan-review panel — exit-plan-mode decision card
 * for the DSH user-interaction seam. plan-mode's `exit_plan_mode` tool asks
 * through `ctx.userQuestions` with `intent: { kind: 'plan-review',
 * approve }`: the plan markdown arrives in `detail`, the approve/decline
 * choices in `options` (labels verbatim — the protocol answers with the
 * asker's own labels).
 *
 * Protocol-exact answer mapping (dsh-plan-mode):
 * - Approve: `{ selected: [intent.approve] }` — custom MUST be absent, or
 *   plan-mode treats it as keep-planning-with-feedback. An asker may name
 *   further approving options (`intent.approveAlso`, e.g. Claude's "approve,
 *   but keep asking for edits"): they follow the same clean-answer rule.
 * - Keep planning / feedback: `{ selected: [declineLabel], custom? }` where
 *   declineLabel is `intent.decline` when the asker names it, else the first
 *   option that does not approve (dsh-plan-mode names none).
 * - Esc / Ctrl+C: the store rejects with ASK_CANCELLED, which plan-mode
 *   reads as "the user dismissed the review to speak instead".
 *
 * Paste works on the feedback row like the composer: Ctrl+V/Alt+V (the
 * keymap `paste` binding) reads the system clipboard, and a bracketed
 * paste inserts its chunk — newlines/control chars flatten to spaces, and
 * pasted content NEVER picks an option or approves (a pasted digit or a
 * chunk of line breaks is text, not a quick-pick or an Enter). Editing
 * state (value + caret) lives in refs mutated synchronously per event —
 * one stdin chunk is one React batch, and the clipboard read resolves
 * asynchronously — with the caret counting code points so an emoji can
 * never be split by ←/→/⌫/Del (same contract as the plugin InputDialog).
 */
import React from 'react';
import type { QuestionSelection } from '../../channel/questions.js';
import { type ClipboardRead } from '../../utils/clipboard.js';
export type PlanReviewPanelProps = {
    /** The plan-review question (intent.kind === 'plan-review'). */
    readonly question: {
        readonly question: string;
        readonly header?: string;
        readonly detail?: string;
        readonly options?: ReadonlyArray<{
            readonly label: string;
            readonly description?: string;
        }>;
        readonly intent?: {
            readonly kind: 'plan-review';
            readonly approve: string;
            readonly approveAlso?: readonly string[];
            readonly decline?: string;
        };
    };
    readonly onAnswer: (selection: QuestionSelection) => void;
    /** Esc / Ctrl+C — dismissed to speak instead (ASK_CANCELLED). */
    readonly onCancel: () => void;
    /**
     * Test seam: clipboard reader for the Ctrl+V paste arm. Defaults to the
     * real cross-platform reader; headless verification injects a fake.
     */
    readonly readClipboardOverride?: () => Promise<ClipboardRead>;
};
export declare function PlanReviewPanel({ question, onAnswer, onCancel, readClipboardOverride, }: PlanReviewPanelProps): React.ReactNode;
//# sourceMappingURL=PlanReviewPanel.d.ts.map
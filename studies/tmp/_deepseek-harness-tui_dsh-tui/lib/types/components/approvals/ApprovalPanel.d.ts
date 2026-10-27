/**
 * The approval panel — the permission prompt every backend renders
 * through. One ask per panel: a
 * permission-colored divider header naming the tool, the gated command, the
 * asker's reason, "Allow this operation?", and a numbered option list.
 *
 * The options come from the request (`approval.options`); a request without
 * them — every DSH ask — offers exactly the DSH protocol's two rows (allow
 * once / reject), whose outcome set is closed with no allow-always or
 * feedback channel. A backend prompt may add an allow-always row (its label
 * says what would be remembered), hide it (`suppressAlwaysAllow`, a forcing
 * ask rule), put the rejection first with no one-key approve
 * (`defaultToNo`), and accept a typed reason with a rejection (`feedback`).
 * Esc and Ctrl+C reject (fail closed; Esc cancels the request).
 *
 * On a prompt that takes a reason, the reason is typed into the rejection
 * row once it has focus (↓ / Tab): there digits are text, so a reason that
 * starts with "2" can never pick allow-always, and allow-always is never a
 * digit shortcut — it takes focus plus Enter. The reason shows as at most
 * two lines (its tail, where the typing happens); the full text is sent.
 * A DSH prompt (two rows, no reason) keeps its digit shortcuts unchanged.
 * Every decision carries the panel key, so a keystroke this panel handles
 * after its prompt was withdrawn cannot answer the next one.
 */
import React from 'react';
import { type PermissionPanelDecision, type PermissionPanelOutcome, type PermissionPanelSnapshot } from '../../channel/permissions.js';
export type ApprovalPanelProps = {
    /** The approval to render (a permission store snapshot). */
    readonly approval: PermissionPanelSnapshot;
    /** True when the asking agent is NOT the attached session — a background
     *  (agent view) session's ask, answered from the same single panel. */
    readonly background?: boolean;
    /**
     * The user's choice: the outcome (`allowed-once` / `rejected` for the DSH
     * two-row prompt, plus `allowed-always`) and the picked option with any
     * typed rejection reason.
     */
    readonly onDecide: (outcome: PermissionPanelOutcome, decision: PermissionPanelDecision) => void;
};
/**
 * The rejection row with its reason, as at most two hard-wrapped rows: when
 * the reason does not fit, its tail (the typing position) is shown after an
 * ellipsis.
 */
export declare function feedbackRowLines(prefix: string, label: string, reason: string, columns: number, maxLines?: 1 | 2): string[];
export declare function ApprovalPanel({ approval, background, onDecide }: ApprovalPanelProps): React.ReactNode;
//# sourceMappingURL=ApprovalPanel.d.ts.map
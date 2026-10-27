/**
 * The questionnaire panel — ask-user-question UI for the
 * DSH user-interaction seam. One question per panel (progress header, header
 * chip, wrapped question text, optional detail, option list with focus
 * pointer and multi-select checkmarks), styled in the dsh-tui mist-blue
 * design language.
 *
 * The list's last row IS the free-text input (issue #9): no Tab, no mode
 * switch — the view never changes. Typing while focused on a real option
 * appends into that input row (single-select also attaches the option's
 * label, so the answer can carry both `selected` and `custom`); focusing
 * the input row itself and typing gives a pure custom answer.
 * Local /provider model lists additionally offer a Tab capability editor;
 * ordinary questionnaires retain the inline-answer behavior.
 *
 * Paste works on the input row like the composer: Ctrl+V/Alt+V (the keymap
 * `paste` binding, remappable in /settings) reads the system clipboard,
 * and a terminal bracketed paste (Ctrl+Shift+V / right-click / terminals
 * that intercept Ctrl+V) inserts its chunk — newlines and control chars are
 * flattened to spaces, pasted content never submits the panel. Editing
 * state (value + caret) lives in refs mutated synchronously per event: a
 * terminal delivers one stdin chunk as several key events inside a single
 * React batch, and the clipboard read resolves asynchronously — state
 * queued by one event is invisible to the next, and a paste must land at
 * the caret the user actually sees. The caret counts CODE POINTS (`[...s]`
 * iteration, same contract as the plugin InputDialog), so an emoji can
 * never be split into a lone surrogate by ←/→/⌫/Del or a paste boundary.
 */
import React from 'react';
import type { QuestionDraft, QuestionSelection } from '../../channel/questions.js';
import type { ProviderModelEditor as ModelEditor } from '../../adapter/ports/channel-settings.js';
import { type ClipboardRead } from '../../utils/clipboard.js';
export type AskUserQuestionPanelProps = {
    /** The question to render (from the QuestionStore snapshot). */
    readonly question: {
        readonly question: string;
        readonly header?: string;
        readonly detail?: string;
        readonly options?: ReadonlyArray<{
            readonly label: string;
            readonly description?: string;
        }>;
        readonly multiSelect?: boolean;
        /** Hide the trailing free-text input row for pure option questions
         *  (local wizards, e.g. /provider). Ignored when there are no options —
         *  a text-only question would otherwise be unanswerable. */
        readonly hideCustomInput?: boolean;
        /** Pre-checked option labels (multi-select) / default-focused option
         *  (single-select) shown on first display, before any saved draft — e.g.
         *  the models already enabled on a provider being edited. */
        readonly defaultSelected?: readonly string[];
        /** A URL the question is about (an MCP server's sign-in page): one line
         *  under the detail, an OSC 8 hyperlink where the terminal supports it
         *  (plain otherwise; a scheme that is not http(s)/file/mailto shows
         *  nothing — the notice row still names it). */
        readonly link?: string;
        /** A secret answer (a token, a password): the input row shows one `•`
         *  per typed code point; the submitted answer is the real text. */
        readonly secret?: boolean;
        /** Local /provider draft editor. Ordinary model-facing asks carry none. */
        readonly modelEditor?: ModelEditor;
        /** Presentation intent tag (rc.6): 'plan-review' switches to the
         *  decision-card layout; an intent never changes the protocol. */
        readonly intent?: {
            readonly kind: 'plan-review';
            readonly approve: string;
            readonly approveAlso?: readonly string[];
            readonly decline?: string;
        };
    };
    /** 1-based position within the batch (progress header). */
    readonly position: number;
    /** Total questions in the batch (progress header). */
    readonly total: number;
    /** Questions answered before the current one. */
    readonly answered: number;
    /** Previously saved answer or draft, restored when returning to this item. */
    readonly initialDraft?: QuestionDraft;
    readonly onAnswer: (selection: QuestionSelection) => void;
    /** Esc on the first question / Ctrl+C — aborts the whole ask. */
    readonly onCancel: () => void;
    /**
     * Esc, when the host wants to decide back-vs-cancel from the live store.
     * A same-batch → then Esc still runs on the panel mounted for question 1,
     * whose `onBack` is absent; this callback sees that → already advanced.
     */
    readonly onEscape?: (draft: QuestionDraft) => void;
    /** Esc / ← on later questions — navigates to the previous question. */
    readonly onBack?: (draft: QuestionDraft) => void;
    /**
     * → — navigates to the next question without submitting. On the free-text
     * row this only fires when the caret is already at the end, so ←/→ keep
     * editing the answer.
     */
    readonly onForward?: (draft: QuestionDraft) => void;
    /**
     * Test seam: clipboard reader for the Ctrl+V paste arm. Defaults to the
     * real cross-platform reader (PowerShell/pbpaste/wl-paste…); headless
     * verification injects a fake so paste outcomes are deterministic.
     */
    readonly readClipboardOverride?: () => Promise<ClipboardRead>;
    /**
     * Manual collapse (question panel fold, default Ctrl+K): while
     * collapsed the panel STAYS MOUNTED — draft refs survive, the fold
     * branch sits after every hook — and renders the two-line minimized
     * bar instead, with editing/caret layers gated off. Its own input
     * handler keeps Esc/Ctrl+C as "expand", never cancel, while folded.
     */
    readonly collapsed?: boolean;
    /** Expand back from the minimized bar (fold key / Esc / mouse click). */
    readonly onExpand?: () => void;
    /** Fold from the expanded panel (fold key / header-row click). */
    readonly onToggleFold?: () => void;
    /** True when mouse tracking is on: mouse-only affordances (the
     *  multi-select submit row) render only then — inline hosts have no
     *  pointer, so an unclickable row would just eat a line. */
    readonly fullscreen?: boolean;
};
export declare function AskUserQuestionPanel({ question, position, total, answered, initialDraft, onAnswer, onCancel, onEscape, onBack, onForward, readClipboardOverride, collapsed, onExpand, onToggleFold, fullscreen, }: AskUserQuestionPanelProps): React.ReactNode;
//# sourceMappingURL=AskUserQuestionPanel.d.ts.map
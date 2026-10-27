/**
 * The `AuthInteraction` bridge: pi-ai OAuth flows speak prompts and events;
 * every interactive surface in this ecosystem speaks `ctx.userQuestions`.
 *
 * `prompt()` maps one pi-ai prompt onto one question — `select` prompts carry
 * their options, text/secret/manual-code prompts expect the custom-answer
 * input row.
 *
 * `notify()` opens browser/device URLs for pi-ai. Browser flows immediately
 * race a callback server against a `manual_code` prompt; the URL and
 * copy/reopen/cancel actions therefore share that SAME question with the
 * paste field. A separate waiting question would claim the FIFO question
 * surface first and make remote/headless callback fallback unreachable.
 * Browser flows without a manual prompt still get a waiting panel. Device
 * flows use that panel to show/copy the short code until polling settles.
 *
 * One `AbortController` owns the whole run: pi-ai reads `interaction.signal`
 * to abort the flow, ask requests compose it with per-prompt cancellation,
 * and the waiting panel's cancel action fires it.
 *
 * Nothing here assumes a browser or GUI *exists* (TUI-RUN-001): when no
 * opener or clipboard helper is available the panel degrades to showing the
 * URL / code verbatim with a clear note, and where no question provider is
 * registered at all, `ask` rejects and the login command turns that into a
 * clear refusal.
 *
 * @module @deepseek-harness-tui/dsh-tui/oauth/interaction
 */
import type { AskUserQuestionItem, AskUserQuestionAnswer } from '@deepseek-ai/dsh-user-questions';
import type { PiAiAuthEvent, PiAiAuthInteraction, PiAiAuthPrompt } from './pi-ai.js';
/** The ask surface this bridge drives (usually `ctx.userQuestions.ask`). */
export type AskFn = (request: {
    questions: AskUserQuestionItem[];
    signal?: AbortSignal;
}) => Promise<AskUserQuestionAnswer>;
/** Injectable host conveniences (tests substitute recorders). */
export interface QuestionBridgeHelpers {
    openUrl?: (url: string) => boolean;
    copyText?: (text: string) => Promise<boolean>;
}
/** Human-readable copy for one notify event. */
export declare function describeEvent(event: PiAiAuthEvent): string;
/**
 * The bridge for one login run. At most one waiting panel exists at a time;
 * `settle()` retires it when the flow ends (any outcome), so a completed or
 * failed login never leaves an interactive dead end on screen.
 */
export declare class QuestionBridge implements PiAiAuthInteraction {
    private readonly ask;
    private readonly runAbort;
    readonly signal: AbortSignal;
    private readonly openUrl;
    private readonly copy;
    private waiting;
    private pendingBrowserView;
    private notice;
    private waitingClosed;
    constructor(ask: AskFn, runAbort: AbortController, helpers?: QuestionBridgeHelpers);
    prompt(prompt: PiAiAuthPrompt): Promise<string>;
    notify(event: PiAiAuthEvent): void;
    /** Close the waiting panel (if any) and stop answering for this run. */
    settle(): Promise<void>;
    private retireWaiting;
    /**
     * Show the waiting panel until the flow settles or the user cancels,
     * re-asking after a copy/reopen action with a one-line status prefix.
     */
    private runWaitingPanel;
}
//# sourceMappingURL=interaction.d.ts.map
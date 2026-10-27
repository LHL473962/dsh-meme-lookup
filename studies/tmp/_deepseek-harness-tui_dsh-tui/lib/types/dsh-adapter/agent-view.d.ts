/**
 * Agent view derivation helpers — pure functions over
 * session events that the channel folds into {@link AgentViewRow}s. Kept in
 * their own module so the focused regression (`scripts/verify-agent-view.mjs`)
 * can import them without spinning up a composition.
 *
 * @module @deepseek-harness-tui/dsh-tui/agent-view
 */
import type { SessionEvent } from '@deepseek-ai/dsh-session';
import type { PreviewEntry } from './sessions/index.js';
import type { AgentViewStatus } from './channel.js';
/** Agent-view row ordering: needs-input first, stopped last. */
export declare const AGENT_VIEW_STATUS_ORDER: readonly AgentViewStatus[];
/** How long a row summary may be before the UI truncates it. */
export declare const AGENT_VIEW_SUMMARY_LIMIT = 160;
/** The row name's budget: the fallback name is the first prompt compressed
 *  to this many cells, keeping the session list compact. */
export declare const AGENT_VIEW_NAME_LIMIT = 28;
/** Collapse every whitespace run (including newlines) into one space so a
 *  multi-paragraph reply always renders as a single row line. */
export declare function oneLine(text: string): string;
/** The first non-empty text block of a user/assistant message content. */
export declare function agentViewTextOf(content: unknown): string | undefined;
/** True when any of the events is a human user message. */
export declare function agentViewHasTurns(events: readonly SessionEvent[]): boolean;
/**
 * One agent-view row's derived facts, folded incrementally from events.
 * `hasTurns`, `summary` and `title` only walk events appended since the last
 * fold — session logs are append-only, so the cache never rescans history.
 */
export interface AgentViewFold {
    hasTurns: boolean;
    /** The first human prompt (the fallback title's source). */
    firstPrompt: string;
    /** Last non-empty assistant text, else last tool-call name, else the
     *  first prompt — the one-line "what is it doing" summary. */
    summary: string;
    /** Where the current summary came from: a tool call wins over a prompt,
     *  assistant text wins over both. */
    summaryKind: 'none' | 'prompt' | 'tool' | 'assistant';
    title: string;
    /** `time` of the last folded event (the row's updatedAt). */
    updatedAt: number;
    /** Whether the last folded turn ended with an error. */
    lastTurnFailed: boolean;
}
/**
 * Fold events `[start, end)` into `base` and return the combined result.
 * @param events - The append-only session log.
 * @param start - First index to fold (the previously folded length).
 * @param base - The fold the cache already holds.
 * @returns The extended fold.
 */
export declare function foldAgentViewEvents(events: readonly SessionEvent[], start: number, base: AgentViewFold): AgentViewFold;
/** The trailing exchanges of a live session's in-memory log. */
export declare function agentViewLivePreview(events: readonly SessionEvent[], limit: number): PreviewEntry[];
/** A row title when the session never recorded one: the opening prompt's
 *  opening words, else the working directory's basename. */
export declare function sessionTitleFallback(fold: AgentViewFold, cwd: string | undefined): string;
/**
 * The agent-view state for a live agent: a parked approval wins over a
 * running turn, a failed last turn over completion, and a conversation-less
 * idle agent stays plain idle.
 */
export declare function agentViewStatusOf(liveStatus: 'idle' | 'running', fold: AgentViewFold, needsInput: boolean): AgentViewStatus;
//# sourceMappingURL=agent-view.d.ts.map
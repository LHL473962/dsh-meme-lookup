/**
 * Agent view derivation helpers — pure functions over
 * session events that the channel folds into {@link AgentViewRow}s. Kept in
 * their own module so the focused regression (`scripts/verify-agent-view.mjs`)
 * can import them without spinning up a composition.
 *
 * @module @deepseek-harness-tui/dsh-tui/agent-view
 */
import { withoutTeammateReminder } from './compat/agent-team-0.2.0.js';
/** Agent-view row ordering: needs-input first, stopped last. */
export const AGENT_VIEW_STATUS_ORDER = [
    'needs-input', 'working', 'failed', 'completed', 'idle', 'stopped',
];
/** How long a row summary may be before the UI truncates it. */
export const AGENT_VIEW_SUMMARY_LIMIT = 160;
/** The row name's budget: the fallback name is the first prompt compressed
 *  to this many cells, keeping the session list compact. */
export const AGENT_VIEW_NAME_LIMIT = 28;
/** Collapse every whitespace run (including newlines) into one space so a
 *  multi-paragraph reply always renders as a single row line. */
export function oneLine(text) {
    return text.replace(/\s+/gu, ' ').trim();
}
/** The first non-empty text block of a user/assistant message content. */
export function agentViewTextOf(content) {
    if (typeof content === 'string') {
        const trimmed = content.trim();
        return trimmed.length > 0 ? trimmed : undefined;
    }
    if (!Array.isArray(content))
        return undefined;
    for (const block of content) {
        if (block === null || typeof block !== 'object')
            continue;
        const record = block;
        if (record['type'] !== 'text')
            continue;
        const text = record['text'];
        if (typeof text === 'string' && text.trim().length > 0)
            return text.trim();
    }
    return undefined;
}
/** True when any of the events is a human user message. */
export function agentViewHasTurns(events) {
    return events.some(event => event.type === 'user/message');
}
/**
 * Fold events `[start, end)` into `base` and return the combined result.
 * @param events - The append-only session log.
 * @param start - First index to fold (the previously folded length).
 * @param base - The fold the cache already holds.
 * @returns The extended fold.
 */
export function foldAgentViewEvents(events, start, base) {
    const fold = { ...base };
    for (let i = start; i < events.length; i += 1) {
        const event = events[i];
        fold.updatedAt = event.time;
        switch (event.type) {
            case 'user/message': {
                fold.hasTurns = true;
                // compat(dsh 0.2.0, log): a 0.2.0 teammate's first prompt drops its identity block.
                const text = agentViewTextOf(fold.firstPrompt.length === 0 ? withoutTeammateReminder(event.data).content : event.data.content);
                if (fold.firstPrompt.length === 0 && text !== undefined)
                    fold.firstPrompt = oneLine(text);
                // The prompt stands in for the summary only until the session
                // starts doing something (a tool call or assistant text replaces it).
                if (fold.summaryKind === 'none' && text !== undefined) {
                    fold.summary = oneLine(text);
                    fold.summaryKind = 'prompt';
                }
                break;
            }
            case 'assistant/message': {
                const text = agentViewTextOf(event.data.message.content);
                if (text !== undefined) {
                    fold.summary = oneLine(text);
                    fold.summaryKind = 'assistant';
                }
                break;
            }
            case 'tool/call': {
                // The current activity beats the prompt it was answering; assistant
                // text beats a tool call.
                if (fold.summaryKind === 'none' || fold.summaryKind === 'prompt') {
                    fold.summary = String(event.data.name);
                    fold.summaryKind = 'tool';
                }
                break;
            }
            case 'session/title': {
                const title = event.data.title;
                if (typeof title === 'string' && title.trim().length > 0)
                    fold.title = oneLine(title);
                break;
            }
            case 'turn/end': {
                const reason = event.data.reason;
                fold.lastTurnFailed = reason?.kind === 'error';
                break;
            }
            default:
                break;
        }
    }
    return fold;
}
/** The trailing exchanges of a live session's in-memory log. */
export function agentViewLivePreview(events, limit) {
    const entries = [];
    for (let i = events.length - 1; i >= 0 && entries.length < limit; i -= 1) {
        const event = events[i];
        if (event.type === 'user/message') {
            const text = agentViewTextOf(event.data.content);
            if (text !== undefined)
                entries.push({ role: 'user', text, at: event.time });
        }
        else if (event.type === 'assistant/message') {
            const text = agentViewTextOf(event.data.message.content);
            if (text !== undefined)
                entries.push({ role: 'assistant', text, at: event.time });
        }
    }
    return entries.reverse();
}
/** A row title when the session never recorded one: the opening prompt's
 *  opening words, else the working directory's basename. */
export function sessionTitleFallback(fold, cwd) {
    const source = fold.firstPrompt.length > 0 ? fold.firstPrompt : fold.summary;
    if (source.length > 0) {
        const clipped = source.length <= AGENT_VIEW_NAME_LIMIT
            ? source
            : `${source.slice(0, AGENT_VIEW_NAME_LIMIT - 1)}…`;
        return clipped;
    }
    const base = (cwd ?? '').length > 0 ? (cwd ?? '').split('/').filter(Boolean).at(-1) ?? '' : '';
    return base.length > 0 ? base : 'untitled';
}
/**
 * The agent-view state for a live agent: a parked approval wins over a
 * running turn, a failed last turn over completion, and a conversation-less
 * idle agent stays plain idle.
 */
export function agentViewStatusOf(liveStatus, fold, needsInput) {
    if (needsInput)
        return 'needs-input';
    if (liveStatus === 'running')
        return 'working';
    if (fold.lastTurnFailed)
        return 'failed';
    if (fold.hasTurns)
        return 'completed';
    return 'idle';
}

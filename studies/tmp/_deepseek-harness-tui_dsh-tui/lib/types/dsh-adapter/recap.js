/** Max chars of recent activity fed to the recap call. */
export const RECAP_RECENT_CHARS = 6000;
/** How many exchanges (user + assistant) the recap looks back. */
const RECAP_RECENT_TURNS = 6;
/** The first text block of a message `content` payload. */
function textOfContent(content) {
    if (typeof content === 'string')
        return content.trim() || undefined;
    if (!Array.isArray(content))
        return undefined;
    for (const block of content) {
        if (block === null || typeof block !== 'object')
            continue;
        const record = block;
        if (record['type'] !== 'text')
            continue;
        const value = record['text'];
        if (typeof value === 'string' && value.trim().length > 0)
            return value.trim();
    }
    return undefined;
}
/**
 * Collect the most recent user/assistant exchanges from a session event
 * log as plain `role: text` lines, capped to the tail turns and a char
 * budget. Rows derived from the log (tool cards, notices) are skipped —
 * the recap wants the conversation, not the chrome.
 */
export function collectRecentActivity(events, limitChars) {
    const entries = [];
    for (const event of events) {
        const record = event;
        if (record['type'] === 'user/message') {
            const data = record['data'];
            const text = textOfContent(data?.['content']);
            if (text !== undefined)
                entries.push({ role: 'user', text });
            continue;
        }
        if (record['type'] === 'assistant/message') {
            const data = record['data'];
            const message = data?.['message'];
            const text = textOfContent(message?.['content']);
            if (text !== undefined)
                entries.push({ role: 'assistant', text });
        }
    }
    const tail = entries.slice(-RECAP_RECENT_TURNS * 2);
    let budget = limitChars;
    // Admit NEWEST first: the recap exists to summarize where the session
    // STANDS, so the most recent exchanges must survive a long entry eating
    // the budget — oldest-first admission lets one oversized message starve
    // every exchange after it (the very ones a recap is for).
    const picked = [];
    for (const entry of [...tail].reverse()) {
        if (budget <= 0)
            break;
        const text = entry.text.length > budget ? entry.text.slice(0, budget) : entry.text;
        picked.push({ role: entry.role, text });
        budget -= text.length + entry.role.length + 2;
    }
    // Present in chronological order (oldest → newest) for readable quoting.
    picked.reverse();
    return picked.map(entry => `${entry.role}: ${entry.text}`).join('\n');
}
/** The recap prompt and its answer parser are backend-neutral (the Claude
 *  backend's `/recap` uses the same contract): src/channel/side-prompts.ts. */
export { parseRecapResponse, wrapRecapPrompt } from '../channel/side-prompts.js';

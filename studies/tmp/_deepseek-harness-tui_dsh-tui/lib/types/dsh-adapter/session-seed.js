import { INITIAL_POLICY_EVENTS, isHumanSource } from './fresh-agent.js';
/** Whether an inherited cut contains no human message or started turn. */
export function holdsNoConversation(events) {
    return !events.some(event => {
        if (event === null || typeof event !== 'object' || Array.isArray(event))
            return false;
        const { type, data } = event;
        if (type === 'turn/start')
            return true;
        if (type !== 'user/message' && type !== 'agent/inbox/spliced')
            return false;
        // An unreadable conversational event cannot prove an empty cut.
        if (data === null || typeof data !== 'object' || Array.isArray(data))
            return true;
        const record = data;
        if (type === 'user/message')
            return isHumanSource(record.source);
        if (!Array.isArray(record.inserted))
            return true;
        return record.inserted.some(message => {
            if (message === null || typeof message !== 'object')
                return false;
            const entry = message;
            return entry.role === 'user' && isHumanSource(entry.source);
        });
    });
}
/** Last value of each policy fact, ordered by its last occurrence in the cut. */
export function latestPolicyFacts(events) {
    const facts = new Map();
    for (const event of events) {
        if (event === null || typeof event !== 'object' || Array.isArray(event))
            continue;
        const { type, data } = event;
        if (typeof type !== 'string' || !INITIAL_POLICY_EVENTS.has(type))
            continue;
        facts.delete(type);
        facts.set(type, { type, data });
    }
    return [...facts.values()];
}
/** Replay after creation: appending during setup prevents the fresh-session gate from arming. */
export function replayPolicyFacts(session, facts) {
    const target = session;
    for (const fact of facts)
        target.append(fact.type, fact.data);
}

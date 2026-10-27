import React from 'react';
/** UI acknowledgement only; a failed task remains failed in the transcript. */
const failureKey = (agent) => JSON.stringify([
    agent.runId, agent.startedAt, agent.completedAt ?? agent.endedAt, agent.error, agent.stopReason,
]);
export function subagentFailureScope(channel) {
    return JSON.stringify([channel.sessionRef?.backendId ?? 'dsh', channel.sessionRef?.sessionId ?? channel.sessionId]);
}
export function createSubagentFailureReadStore() {
    const read = new Map();
    const listeners = new Set();
    let version = 0;
    const emit = () => {
        version += 1;
        for (const listener of [...listeners])
            listener();
    };
    return {
        subscribe(listener) {
            listeners.add(listener);
            return () => { listeners.delete(listener); };
        },
        getSnapshot: () => version,
        unread(scope, agents) {
            const seen = read.get(scope);
            return new Set(agents.filter(agent => agent.status === 'failed'
                && seen?.get(agent.agentId) !== failureKey(agent)).map(agent => agent.agentId));
        },
        acknowledge(scope, agent) {
            if (agent.status !== 'failed')
                return;
            const key = failureKey(agent);
            const seen = read.get(scope) ?? new Map();
            if (seen.get(agent.agentId) === key)
                return;
            seen.set(agent.agentId, key);
            read.set(scope, seen);
            emit();
        },
        forgetRecovered(scope, agents) {
            const seen = read.get(scope);
            if (seen === undefined)
                return;
            let changed = false;
            for (const agent of agents) {
                if (agent.status !== 'failed' && seen.delete(agent.agentId))
                    changed = true;
            }
            if (seen.size === 0)
                read.delete(scope);
            if (changed)
                emit();
        },
    };
}
// Survives panel/scene unmounts. Cold process starts intentionally begin unread.
export const subagentFailureRead = createSubagentFailureReadStore();
export function useUnreadSubagentFailures(channel) {
    React.useSyncExternalStore(subagentFailureRead.subscribe, subagentFailureRead.getSnapshot);
    const scope = subagentFailureScope(channel);
    const subagents = channel.subagents ?? [];
    React.useEffect(() => {
        subagentFailureRead.forgetRecovered(scope, subagents);
    }, [scope, subagents, channel.version]);
    return subagentFailureRead.unread(scope, subagents);
}

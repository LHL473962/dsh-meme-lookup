import { normalizeWorkspaceCwd } from './view.js';
/** Conversations shown by the workspace supervisor, including the live tip. */
export function visibleWorkspaceSessions(sessions, currentId) {
    const byId = new Map(sessions.map(session => [session.id, session]));
    const ancestors = new Set();
    let cursor = byId.get(currentId);
    while (cursor?.kind.kind === 'fork') {
        const parent = cursor.kind.parent;
        if (parent === undefined || ancestors.has(parent))
            break;
        ancestors.add(parent);
        cursor = byId.get(parent);
    }
    return sessions.filter(session => !session.archived && session.hasPrompt && session.kind.kind !== 'subagent' && !ancestors.has(session.id));
}
/** Count an already-filtered listing by exact normalized working directory. */
export function workspaceSessionCounts(sessions) {
    const counts = new Map();
    for (const session of sessions) {
        const key = normalizeWorkspaceCwd(session.cwd);
        counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return counts;
}

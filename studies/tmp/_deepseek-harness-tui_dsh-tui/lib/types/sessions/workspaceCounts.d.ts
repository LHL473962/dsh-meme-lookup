import type { SessionSummary } from '../adapter/ports/channel-session.js';
/** Conversations shown by the workspace supervisor, including the live tip. */
export declare function visibleWorkspaceSessions(sessions: readonly SessionSummary[], currentId: string): readonly SessionSummary[];
/** Count an already-filtered listing by exact normalized working directory. */
export declare function workspaceSessionCounts(sessions: readonly SessionSummary[]): ReadonlyMap<string, number>;
//# sourceMappingURL=workspaceCounts.d.ts.map
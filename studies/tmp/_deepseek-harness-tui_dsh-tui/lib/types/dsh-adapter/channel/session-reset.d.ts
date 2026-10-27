import type { ChannelState } from './types.js';
export type SessionResetState = Pick<ChannelState, 'rows' | 'todos' | 'pending' | 'goal' | 'sessionTitle' | 'sessionColor' | 'workingDirectory' | 'tokens' | 'mainCost' | 'subagentCost' | 'responseChars' | 'activeToolCount' | 'lastUserText' | 'working' | 'compaction' | 'cancelPending' | 'spinnerMode' | 'tps' | 'tpsSamples' | 'lastUsage' | 'turnUsage' | 'turnOutcome' | 'contextSegments' | 'costReport'
/** Staged "Send to Chat" contexts belong to the composer that staged them:
 *  an adopted session must never carry the previous conversation's chips
 *  (or hand its model a panel context the user staged elsewhere). */
 | 'attachedContexts'>;
/**
 * Reset the projection facts shared by every foreground session adoption.
 * Target-specific route, cwd, preset, loaded-context and status fields stay
 * with the caller: not every adoption has the same semantics for those.
 */
export declare function resetSessionProjection(state: SessionResetState, rowIds: {
    value: number;
}, resetProjector: () => void, resetSubagents: () => void, resetJobs: () => void): void;
//# sourceMappingURL=session-reset.d.ts.map
import type { ChannelState } from './types.js';
/**
 * The Channel installs its effectful command delegates atomically after every
 * specialist has been constructed.  Construction-time callers fail closed
 * rather than receiving a plausible no-op while the Channel is incomplete.
 */
export type ChannelActionDelegates = Pick<ChannelState, 'commandCompletions' | 'loadOlder' | 'rewindTo' | 'rewindToNode' | 'forkSession' | 'resumeTo' | 'newSession' | 'listWorkspaces' | 'listWorkspaceRegistry' | 'removeWorkspace' | 'renameWorkspaceAt' | 'resolveWorkspace' | 'switchWorkspace' | 'renameWorkspace' | 'workspaceCommands' | 'runWorkspaceCommand' | 'switchModel' | 'listEfforts' | 'setEffort' | 'setDefaultEffort' | 'cycleMode' | 'runPermissionPreset' | 'clear' | 'setActivityFrames' | 'listPresets' | 'switchPreset' | 'listModels' | 'listProviders' | 'invalidateModelCompletion' | 'listSkills' | 'describeCredential' | 'balanceInfo' | 'sideQuestion' | 'listFileCandidates' | 'listFiles' | 'cachedSessions' | 'listSessions' | 'previewSession' | 'listForeignSources' | 'listForeignSessions' | 'importForeignSession' | 'bindApprovalStore' | 'agentViewRows' | 'subscribeAgentView' | 'dispatchBackgroundAgent' | 'stopBackgroundAgent' | 'attachToAgent' | 'peekAgentSession' | 'replyToAgent' | 'backgroundCurrent' | 'setResumeTarget' | 'renameSession' | 'setSessionColor' | 'recapRecent' | 'deleteSession' | 'renameSessionTo' | 'compact' | 'cancelCompact' | 'runExternalCommand' | 'runExternalCommandOutcome' | 'pushLocal' | 'mcpStatus' | 'exportSession' | 'initWorkspace' | 'doctorInfo' | 'pluginsInfo' | 'listSubagents'> & {
    runLocalCommand(command: string, includeInContext: boolean): Promise<void>;
};
type ChannelActionMethodName = Exclude<keyof ChannelActionDelegates, 'runLocalCommand'>;
export type ChannelActionMethods = Pick<ChannelState, ChannelActionMethodName>;
/** The ChannelState-facing half of the readiness cell is deliberately pure:
 * one typed forwarding method per public action, with no service access. */
export declare function createChannelActionMethods(getReadyActions: () => ChannelActionDelegates): ChannelActionMethods;
export declare function createChannelActionReadiness(): {
    install(next: ChannelActionDelegates): void;
    /** Replace the installed table (the adoption-window extension, core/compose.ts). */
    reinstall(next: ChannelActionDelegates): void;
    getReadyActions(): ChannelActionDelegates;
};
/**
 * The explicit-unavailable half of a non-DSH composition: one delegate per
 * public action, each failing per its own contract (`false`, `null`,
 * `undefined`, an empty list or an `{ ok: false }` result) and, for an
 * action the user invoked, saying so through `unavailable(name)` (which
 * notifies `capability-unavailable-backend`). Nothing here pretends to succeed.
 *
 * Passive reads the renderer performs on its own (agent-view rows and their
 * subscription, the cached session list, workspace sub-commands, cache
 * invalidation, approval-store wiring) answer with their empty value
 * silently: they are not user actions, and a toast per render would be
 * noise. The composition overrides the generic actions (submit path, clear,
 * local rows, file queries, completions, `/new`, `/doctor`) and every action
 * whose capability the session does have.
 */
export declare function createUnavailableActionDelegates(unavailable: (name: string) => void, unavailableLines: (name: string) => string[]): ChannelActionDelegates;
export {};
//# sourceMappingURL=action-readiness.d.ts.map
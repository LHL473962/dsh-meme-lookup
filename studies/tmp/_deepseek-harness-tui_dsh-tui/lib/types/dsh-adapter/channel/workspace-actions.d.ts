import type { TuiWorkspaceEntry, TuiWorkspaceHost, TuiWorkspaceTarget } from '../workspaces.js';
import type { ChannelOwner } from './owner.js';
import type { NewSessionTarget } from './session-resume.js';
import type { ChannelState } from './types.js';
/** Workspace command/query surface. The selected cwd is published only by a successful session adoption. */
export declare function createWorkspaceActions(state: Pick<ChannelState, 'cwd' | 'displayCwd' | 'working' | 'emit'>, deps: {
    owner: Pick<ChannelOwner, 'assertActive'>;
    service: TuiWorkspaceHost;
    newSession(target?: NewSessionTarget): Promise<boolean>;
    refreshGitBranch(): void;
    notify: ChannelState['notify'];
}): {
    listWorkspaces: () => Promise<readonly TuiWorkspaceTarget[]>;
    listWorkspaceRegistry: () => Promise<readonly TuiWorkspaceEntry[]>;
    removeWorkspace: (path: string) => Promise<boolean>;
    renameWorkspaceAt: (path: string, title: string) => Promise<boolean>;
    resolveWorkspace: (uri: string) => Promise<TuiWorkspaceTarget | undefined>;
    switchWorkspace: (target: TuiWorkspaceTarget) => Promise<boolean>;
    renameWorkspace: (title: string) => Promise<boolean>;
    workspaceCommands: () => readonly Pick<import("../workspaces.js").TuiWorkspaceCommand, "name" | "description" | "aliases">[];
    runWorkspaceCommand: (name: string, input: string) => Promise<import("../workspaces.js").TuiWorkspaceCommandResult | undefined>;
};
//# sourceMappingURL=workspace-actions.d.ts.map
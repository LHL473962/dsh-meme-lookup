import type { TuiWorkspaceTarget, TuiWorkspaceCommand, TuiWorkspaceCommandResult, TuiWorkspaceEntry } from '../adapter/ports/channel-workspace.js';
export type { TuiWorkspaceTarget, TuiWorkspaceKind, TuiWorkspaceCommand, TuiWorkspaceCommandResult, TuiWorkspaceChoice, TuiWorkspaceEntry } from '../adapter/ports/channel-workspace.js';
import { Context, Service } from '@deepseek-ai/cordis';
export interface TuiCommandShell {
    resolve(request: {
        command: string;
        workdir?: string;
        timeoutMs?: number;
    }): unknown;
    run(spec: unknown): Promise<{
        exitCode: number | null;
        stdout: {
            text: string;
        };
        stderr: {
            text: string;
        };
        timedOut: boolean;
    }>;
}
export interface TuiWorkspaceProvider {
    /** URI schemes owned by this provider, without the trailing colon. */
    schemes: readonly string[];
    /** Enumerate targets owned by this provider. */
    list(signal?: AbortSignal): Promise<readonly TuiWorkspaceTarget[]> | readonly TuiWorkspaceTarget[];
    /** Resolve a provider URI, or return undefined when its scheme is not owned. */
    resolve(uri: string, signal?: AbortSignal): Promise<TuiWorkspaceTarget | undefined> | TuiWorkspaceTarget | undefined;
    /** Resolve a path relative to a cwd already owned by this provider. */
    resolvePath?(path: string, cwd: string, signal?: AbortSignal): Promise<TuiWorkspaceTarget | undefined> | TuiWorkspaceTarget | undefined;
    /** Describe an already-recorded cwd without performing I/O. */
    describe(cwd: string): TuiWorkspaceTarget | undefined;
    /** Override `!command` execution for a provider-owned cwd. */
    commandShell?(cwd: string): Promise<TuiCommandShell | undefined> | TuiCommandShell | undefined;
    /** Rename a provider-owned workspace durably. */
    rename?(cwd: string, title: string): Promise<TuiWorkspaceTarget | undefined> | TuiWorkspaceTarget | undefined;
    /** Provider-owned `/workspace <command>` extensions. */
    commands?: readonly TuiWorkspaceCommand[];
}
/** Host-only workspace controls used by the TUI front door.  Plugin-facing
 * service methods below are intentionally scoped to their calling activation;
 * the channel must use this facade to enumerate and route all providers. */
export interface TuiWorkspaceHost {
    list(currentCwd: string, signal?: AbortSignal): Promise<readonly TuiWorkspaceTarget[]>;
    resolve(request: string, currentCwd?: string, signal?: AbortSignal): Promise<TuiWorkspaceTarget | undefined>;
    describe(cwd: string): TuiWorkspaceTarget;
    commandShell(cwd: string): Promise<TuiCommandShell | undefined>;
    rename(cwd: string, title: string): Promise<TuiWorkspaceTarget>;
    /** Drop a workspace registration (never the directory or its session logs). */
    remove(cwd: string): Promise<boolean>;
    /**
     * The durable ledger's own listing, in its own order.
     *
     * Unlike `list`, this merges nothing and appends nothing: it is the set of
     * registrations the sidebar manages, including entries with no sessions and
     * entries whose directory has disappeared.
     */
    listRegistry(): Promise<readonly TuiWorkspaceEntry[]>;
    commands(): readonly Pick<TuiWorkspaceCommand, 'name' | 'aliases' | 'description'>[];
    runCommand(name: string, input: string, cwd: string, signal?: AbortSignal): Promise<TuiWorkspaceCommandResult | undefined>;
}
/** Registry-backed list surface for the workspace home screen. */
type RegistryWorkspaceEntry = TuiWorkspaceEntry;
/**
 * Enumerate the durable workspace registry, in its own display order.
 *
 * The sidebar needs the *registry* (every workspace the user ever registered,
 * including ones with no sessions yet), not the session-derived grouping the
 * `/resume` browser builds. Order, ids and titles come from the ledger;
 * `sessionCount` is filled in by the caller (the adapter holds no session
 * index), and `present` is derived here.
 */
export declare function listRegistryWorkspaces(runtime: TuiWorkspaceRuntime | undefined): Promise<readonly RegistryWorkspaceEntry[]>;
/**
 * Remove a workspace registration by path. Sessions and the directory survive:
 * only the ledger entry goes away, so the sessions reappear as ungrouped.
 *
 * @returns True when a record was removed, false when no record owned `cwd`
 *   (or the ledger is unmounted).
 */
export declare function removeRegistryWorkspace(runtime: TuiWorkspaceRuntime | undefined, cwd: string, owner?: object): Promise<boolean>;
declare module '@deepseek-ai/cordis' {
    interface Context {
        tuiWorkspaces: TuiWorkspaceRuntime;
    }
}
export declare const name = "dsh-tui-workspaces";
/** Bound every provider promise so one plugin cannot park workspace flows. */
export declare const WORKSPACE_PROVIDER_TIMEOUT_MS = 2000;
/** Registry and local fallback shared by the TUI and workspace plugins. */
export declare class TuiWorkspaceRuntime extends Service {
    constructor(ctx: Context);
    register(provider: TuiWorkspaceProvider): () => void;
    list(currentCwd: string, signal?: AbortSignal): Promise<readonly TuiWorkspaceTarget[]>;
    /** Resolve a URI, briefly allowing concurrently mounted providers to register. */
    resolve(reference: string, currentCwd?: string, signal?: AbortSignal): Promise<TuiWorkspaceTarget | undefined>;
    describe(cwd: string): TuiWorkspaceTarget;
    commandShell(cwd: string): Promise<TuiCommandShell | undefined>;
    rename(cwd: string, title: string): Promise<TuiWorkspaceTarget>;
    /**
     * Drop a workspace registration; the directory and session logs survive.
     *
     * Plugin-facing, and therefore bound by the SAME rule as {@link rename}: a
     * live calling activation is required, and the target must be a cwd one of
     * that activation's own providers vouches for. Without both, a plugin that
     * never owned the workspace 鈥?including one whose fiber was already disposed
     * and whose caller context is a retained handle 鈥?could delete a host
     * registration. Shadow policy alone is not caller authentication.
     */
    remove(cwd: string): Promise<boolean>;
    /** The durable ledger's own listing, in its own order. */
    listRegistry(): Promise<readonly TuiWorkspaceEntry[]>;
    commands(): readonly Pick<TuiWorkspaceCommand, 'name' | 'aliases' | 'description'>[];
    runCommand(name: string, input: string, cwd: string, signal?: AbortSignal): Promise<TuiWorkspaceCommandResult | undefined>;
    private notifyProviderWaiters;
}
/** Resolve the host-only facade for channel/plugin bootstrap code. */
export declare function getHostWorkspaceRuntime(runtime: TuiWorkspaceRuntime | undefined): TuiWorkspaceHost | undefined;
/** Local-only fallback for direct embedders that call createChannel() without
 * mounting the optional workspace registry/provider service. */
export declare function createLocalWorkspaceRuntime(): Pick<TuiWorkspaceRuntime, 'list' | 'resolve' | 'describe' | 'commandShell' | 'rename' | 'remove' | 'listRegistry' | 'commands' | 'runCommand'>;
export declare function localWorkspaceUri(path: string): string;
/** Resolve a native absolute path or the standard file URL form. */
export declare function parseLocalWorkspaceReference(reference: string): TuiWorkspaceTarget | undefined;
export default TuiWorkspaceRuntime;
//# sourceMappingURL=workspaces.d.ts.map
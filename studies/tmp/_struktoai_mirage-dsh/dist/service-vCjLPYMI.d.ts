import { Service, Context } from '@deepseek-ai/cordis';
import { ShellExplanation } from '@struktoai/mirage-core/policy/types';
import { Mount } from '@struktoai/mirage-core/workspace/mount/spec';
import { MountSpec } from '@struktoai/mirage-core/workspace/workspace/workspace';
import { Workspace, NodeWorkspaceOptions } from '@struktoai/mirage-node';

declare module '@deepseek-ai/cordis' {
    interface Context {
        mirage: MirageService;
    }
}
/**
 * A declarative mount, YAML-friendly: the VFS is named by its
 * registry type and built through `buildVfs`, so a dsh bundle
 * patch can mount anything without holding a live instance. Told apart
 * from a live `Mount` by the type of `vfs`: a string names a
 * registry entry, an object is the instance itself.
 */
interface MirageMountBlock {
    /** VFS registry name (`ram`, `s3`, `slack`, `redis`, ...). */
    vfs: string;
    /** Mount mode: `read`, `write`, or `exec`. Omitted = the workspace default. */
    mode?: string;
    /** VFS constructor config, passed to the registry factory. */
    config?: Record<string, unknown>;
}
/** One mount entry: a live spec or instance, or a declarative block. */
type MirageMount = MountSpec | Mount | MirageMountBlock;
/** A runtime entry, YAML-friendly: a name, or a name with its options. */
interface MirageRuntimeBlock {
    /** Runtime registry name (`monty`, `pyodide`, `quickjs`, ...). */
    name: string;
    /** Command words this runtime captures (e.g. `['python', 'python3']`). */
    captures?: string[];
    /** The runtime's own config block; a key it does not have is refused. */
    config?: Record<string, unknown>;
}
/**
 * Configuration for the shared mirage execution world. Exactly one of
 * `workspace` (adopt a live workspace the embedder owns and closes) or
 * `mounts` (construct a workspace here; the service closes it when its
 * plugin unloads) must be given.
 */
interface MirageConfig {
    /** A live workspace to adopt; its lifecycle stays with the embedder. */
    workspace?: Workspace;
    /** Mounts for a service-owned workspace, keyed by mount prefix. */
    mounts?: Record<string, MirageMount>;
    /**
     * Runtimes for a service-owned workspace, built via `buildRuntime`.
     * The YAML-friendly twin of `workspaceOptions.runtimes`; pass one or
     * the other, not both.
     */
    runtimes?: (string | MirageRuntimeBlock)[];
    /**
     * The roles (`profiles:` in mirage config), each a whole permission
     * document: its `commands.allow` list, its `commands.ask` and
     * `commands.deny` rules, the mount sections carrying rules of their
     * own, and the paths and vars it hides. The YAML-friendly twin of
     * `workspaceOptions.profiles`; pass one or the other, not both.
     *
     * Written as the document, not as an already-parsed profile: every
     * entry goes through `parseSessionProfile`, so a misspelled field is a
     * load error rather than a first-session one. That parse is what lets
     * a dsh bundle patch carry a policy at all, since
     * `workspaceOptions.profiles` wants profiles already parsed and a
     * patch file holds plain YAML.
     */
    profiles?: Record<string, unknown>;
    /**
     * Which role shapes a session created without one, the workspace's own
     * session included. A name `profiles` does not define is an error. The
     * YAML-friendly twin of `workspaceOptions.profile`.
     */
    profile?: string;
    /** Options forwarded to the service-owned workspace's constructor. */
    workspaceOptions?: NodeWorkspaceOptions;
}
/**
 * The one mirage `Workspace` behind every mirage-backed dsh provider
 * (`ctx.mirage`, mirroring how `ctx.e2b` owns one sandbox for the E2B
 * adapters). `MirageFileSystem` and `MirageShellExecutor` both inject it,
 * which is what keeps `ctx.fs` targets and `ctx.shell` commands in one
 * execution world: a `processPath` handed to the shell resolves there.
 *
 * Construction with live mounts is synchronous; a declarative mount
 * block defers to `buildVfs`, so consumers await `ready` (the
 * adapters do) and `workspace` throws until it resolves, mirroring how
 * the E2B service owner exposes its sandbox.
 */
declare class MirageService extends Service {
    static readonly provide = "mirage";
    /** Resolves to the shared workspace once every mount is built. */
    readonly ready: Promise<Workspace>;
    private built;
    private readonly plannedRuntimes;
    constructor(ctx: Context, config?: MirageConfig);
    /** The live workspace; throws until `ready` resolves. */
    get workspace(): Workspace;
    /**
     * The live workspace, or null while it is still building.
     *
     * The non-throwing twin of {@link workspace}, for a synchronous seam
     * method whose honest answer before `ready` is "this world cannot tell
     * you" rather than an exception. Reads `built` directly, as
     * {@link vfsOnly} does.
     */
    get workspaceIfReady(): Workspace | null;
    /**
     * The decision ledger: every ask this world has raised and every
     * answer given, questions still waiting included.
     *
     * The host's handle on the ask layer. A composition with an approval
     * channel answers inline and rarely reads this; one without it finds
     * its pending questions here (`pending()`) and answers them out of
     * band (`answer(id, outcome, scope)`), which is what makes an `ask`
     * rule usable with no human at the keyboard.
     */
    get decisions(): Workspace['decisions'];
    /**
     * What a line would do here, without doing it: the line's verdict, with
     * the exact exit code and stderr the agent would get, and its parse tree,
     * every command carrying its own outcome and the policies that spoke.
     *
     * A dry run through the same gate the dispatcher uses, so a host
     * reading this and an agent typing the line cannot be told different
     * things. It spends no ONCE answer, records no question and never
     * reaches the approval channel, which is what makes it safe to call
     * about a line nobody typed — a pre-execute check, or an operator
     * asking why a command was refused.
     *
     * @param line the command line to judge.
     * @param sessionId the session to judge it in; the default when empty.
     * @returns the line's explanation.
     */
    explain(line: string, sessionId?: string): Promise<ShellExplanation>;
    /**
     * True while every runtime in the world reaches only the vfs
     * (`Runtime.reach`), meaning the workspace dispatch is the single
     * gate for anything the agent can execute: every effect passes
     * mount modes, session grants, and policy before touching the real
     * backend behind a mount. The default world qualifies, and so do
     * the bridged engines, while the host `local` python or a remote
     * sandbox can act around the gate. Answers before `ready` from the
     * constructor-resolved entries (mounts resolve asynchronously,
     * runtimes never do) and from the live workspace afterwards, so a
     * later `addRuntime` or `removeRuntime` is seen.
     */
    get vfsOnly(): boolean;
    private open;
}

export { type MirageConfig as M, type MirageMount as a, type MirageMountBlock as b, type MirageRuntimeBlock as c, MirageService as d };

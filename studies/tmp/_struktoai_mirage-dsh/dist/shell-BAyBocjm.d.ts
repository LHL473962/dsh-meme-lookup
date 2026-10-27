import { Context } from '@deepseek-ai/cordis';
import { ShellExecutor, ShellExecRequest, ShellExecSpec, ShellExecution } from '@deepseek-ai/dsh-shell';

/** Configuration for the mirage shell executor. */
interface MirageShellConfig {
    /**
     * Default working directory for commands. Defaults to `/`. With
     * `sessionId` it instead seeds the bound session's initial cwd, and the
     * session's own cwd is the default from then on.
     */
    workdir?: string;
    /** Default foreground timeout in milliseconds. Defaults to 120000. */
    defaultTimeoutMs?: number;
    /** Upper cap on any requested timeout. Defaults to 600000. */
    maxTimeoutMs?: number;
    /** Default stdout capture budget in bytes. Defaults to 200000. */
    stdoutMaxBytes?: number;
    /** stderr capture budget in bytes. Defaults to 64000. */
    stderrMaxBytes?: number;
    /**
     * Bind every command to this named workspace session. By default each
     * command runs in an ephemeral fork of the workspace's default session,
     * so nothing persists between calls, which is the one-shot contract of
     * dsh's bash tool. With a session bound, `cd`, `export`, and function
     * definitions persist across calls, the persistent-shell contract. The
     * session is created on first use if the workspace does not have it; an
     * existing session is adopted as is.
     *
     * A spec carrying an explicit `env`, or a `workdir` that names a real
     * directory in this world, still runs as a one-call subshell of the
     * bound session, per mirage's `ExecuteOptions` semantics: both say
     * "just for this command". The two things dsh injects on every call
     * are deliberately not read that way, since neither carries that
     * intent and either would fork every command and leave the binding
     * with nothing to persist. A workdir resolved on the harness's own
     * machine names nothing here and is dropped; the managed `DSH_*`
     * snapshot is seeded into the session instead.
     */
    sessionId?: string;
    /**
     * When set, a background command whose streamed output overruns its
     * delta budget spills its full stdout and stderr to files under this
     * workspace directory, and `readOutput()` points at them so a reader
     * can recover what the delta dropped. The directory is a workspace
     * path (e.g. `/tmp` on a ram mount), so the agent reads the spill
     * through the same VFS as everything else; the writes go through the
     * workspace, so they appear in history like any other write. Unset
     * (the default) means no spill: output that overruns is simply
     * flagged `lossy`, the honest "no safe path available" answer.
     */
    spillDir?: string;
}
/**
 * Mirage-backed implementation of `ctx.shell`: `run` executes the command
 * line with mirage's own shell (coreutils-faithful commands, installed
 * CLIs, the policy layer) against the shared `ctx.mirage` workspace, so a
 * path from `ctx.fs` means the same file here. There is no OS process
 * behind a command: `signal` in results is a compatibility value for kills,
 * and abort/timeout act cooperatively at the executor's own boundaries.
 *
 * Every command runs in an ephemeral fork of the workspace's default
 * session, so no shell state survives from one call to the next, matching
 * the one-shot contract of dsh's bash tool. Configuring a `sessionId`
 * binds all commands to one named session instead, whose cwd, exports,
 * and functions persist across calls.
 */
declare class MirageShellExecutor extends ShellExecutor {
    static readonly inject: string[];
    private readonly workdir;
    private readonly defaultTimeoutMs;
    private readonly maxTimeoutMs;
    private readonly stdoutMaxBytes;
    private readonly stderrMaxBytes;
    private readonly sessionId;
    private readonly spillDir;
    private sessionReady;
    private readOnlyReady;
    private readonly seeding;
    private issued;
    private readonly seeded;
    constructor(ctx: Context, config?: MirageShellConfig);
    private workspace;
    /**
     * The directory this command actually runs in.
     *
     * dsh fills an unspecified workdir from the calling session's cwd (by
     * way of the sandbox policy's workspace root), and that is a directory
     * on the harness's own machine, which names nothing here. Running
     * there leaves `pwd` reporting a path the agent cannot reach and every
     * relative path failing, and, because a per-call cwd forks a subshell,
     * it also defeats a bound session on every call. So a workdir that is
     * not a directory in this world is treated as unset: the configured
     * default when unbound, the session's own cwd when bound.
     *
     * @param spec the resolved spec whose workdir is being placed.
     * @returns the workdir to execute under, `''` meaning the session's own.
     */
    private worldWorkdir;
    private newSpill;
    /**
     * With every runtime in the world reaching only the vfs
     * (`ctx.mirage.vfsOnly`), the workspace dispatch is the single gate
     * for anything a command can do, so this executor behaves like a
     * workspace-write sandbox: reads and writes land only where mounts
     * (and their modes) allow. Declaring it lets sandbox-aware plugins
     * (dsh's permission presets) compose over this executor. A world
     * holding a runtime with entry points around the gate (the host `local`
     * python, a remote sandbox) voids that claim, so this answers
     * undefined then (the base contract's "does not sandbox") and those
     * plugins refuse to compose instead of trusting a lie.
     */
    get sandboxMode(): ShellExecutor['sandboxMode'];
    /**
     * The mode this one call runs under: the policy the caller resolved
     * for it, or this executor's own default when the call carried none.
     * Undefined keeps the "no claim" answer for a world some runtime can
     * act outside of, where no mode would be true.
     *
     * @param spec the resolved spec whose policy is being read.
     * @returns the effective mode, or undefined when nothing is claimed.
     */
    private modeFor;
    /**
     * The session this call runs in: the read-only twin when the policy
     * confines it to reads, else this executor's own binding.
     *
     * `workspace-write` and `danger-full-access` both run in the ordinary
     * session, because the mounts and their modes already are the
     * workspace boundary and mirage has nothing wider to grant.
     *
     * @param spec the resolved spec whose policy selects the session.
     * @returns the session id to execute under, or undefined for the default.
     */
    private sessionFor;
    /**
     * The sandbox facts to stamp on this run's result and process handle,
     * or undefined when the world is not fully workspace-bound (no claim).
     *
     * `enforcement` is 'full': when every runtime reaches only the vfs, the
     * workspace gate cannot be bypassed, so unlike an OS sandbox on an older
     * kernel there is no promised effect it fails to govern. `runnerFailed`
     * is false because the workspace executor is the runner and a failure to
     * run surfaces as a rejected/aborted execution, not a runner that never
     * started.
     *
     * @param spec the resolved spec this run was built from.
     * @param denied whether the run was refused a write by the narrowing.
     * @returns the facts to stamp, or undefined when nothing is claimed.
     */
    private sandboxInfo;
    /**
     * Whether this run was refused, by the session's permission document
     * or by the read-only narrowing.
     *
     * The document's refusals ride the result itself: a `Deny`, an
     * unanswered ask and a policy that raised all leave `refusal` on the
     * `ExecuteResult`, whatever the line did with its streams (`2>&1`, a
     * trailing command that owns the status). That record is read for
     * every call, because a role's `commands.deny` and `commands.ask`
     * rules bind under `workspace-write` and `danger-full-access` alike:
     * a mode says what the mounts allow, and says nothing about whether a
     * rule forbids the line. The narrowing has no record, since it is
     * EROFS/EACCES from the mounts, so its signatures are still read off
     * stderr, and only for a call that ran read-only, where this executor
     * is what imposed it.
     *
     * @param spec the resolved spec this run was built from.
     * @param result what the workspace answered.
     * @param stderr the run's captured standard error.
     * @returns true when something refused the run.
     */
    private wasDenied;
    resolve(request: ShellExecRequest): ShellExecSpec;
    private ensureSession;
    /**
     * Seed this call's managed `DSH_*` snapshot into the bound session.
     *
     * These are harness facts about the session (its home, its id), not
     * overrides for one command, and on a bound session they have to live
     * in the session: handed over as a per-call `env` they would fork a
     * subshell on every call, since dsh never sends an empty snapshot.
     *
     * The snapshot replaces rather than merges, per the seam's own rule
     * that a fact absent from the current snapshot must not inherit a
     * stale value from an earlier one. Only the managed namespace is
     * touched, so a variable the agent exported itself is left alone.
     *
     * @param ws the live workspace holding the session.
     * @param sessionId the session this call runs in.
     * @param managed the call's managed snapshot.
     */
    private applyManagedEnv;
    private readOnlySession;
    /**
     * Create (once) the session a read-only call runs in: a twin of the
     * session this executor would otherwise use, with every grant it holds
     * narrowed to `read`, so mirage's own dispatch is what refuses the
     * write rather than a second permission layer bolted on here.
     *
     * The twin narrows, never widens, and that takes every part of the
     * source's view, which is what `narrow` in core stamps: modes, hidden
     * paths, hidden variables, command rules. Its modes cover every mount
     * at `read` (the one exception is the null sink, per
     * {@link SINK_PREFIX}), which is at least as narrow as whatever the
     * source held, since `read` is the weakest mode there is; naming a
     * mount only narrows it, so a prefix the map omits would keep its own
     * mode rather than disappear. The other three are copied from the
     * source session rather than recompiled, because the profile it was
     * created under is not something a session records.
     *
     * Leaving any of them behind widens. Hides are the obvious one: a
     * binding confined to `/allowed` would read `/secret` in read-only
     * mode although the same command is refused outside it. Command rules
     * are the one modes cannot stand in for, because a mode bounds a
     * mount and an account CLI reaches a service: a profile that denies
     * `slack message send` or `git push` still denies it here, where
     * every mount being `read` says nothing at all about it.
     *
     * The policy's `workspaceRoot` is deliberately not consulted anywhere:
     * it is a directory on the harness's machine, so containment against
     * it says nothing about this world. The mounts are the boundary.
     *
     * @returns the id of the read-only session.
     */
    private provisionReadOnly;
    private provisionSession;
    /**
     * Where and as whom one command runs, settled before it starts: the
     * session binding, the workdir in this world, and its managed env.
     *
     * Seeding the env is the one step that writes, so it comes last and
     * waits for any seed already running on the same session (the bound
     * one and its read-only twin queue apart). Calls are numbered as they
     * arrive, and a seed is skipped once a later call has seeded the same
     * session, so the newest snapshot wins: a slow or abandoned preparation
     * never lands an old one over it, and a stall before the seed holds up
     * no other call. A call carrying no snapshot seeds nothing, so it
     * never counts as the newest, but it still waits for the seeds already
     * running, so its command never sees one half applied.
     *
     * @param spec the resolved spec being prepared.
     * @returns the workspace, session and workdir the command runs under.
     */
    private prepare;
    execute(spec: ShellExecSpec): Promise<ShellExecution>;
}

export { type MirageShellConfig as M, MirageShellExecutor as a };

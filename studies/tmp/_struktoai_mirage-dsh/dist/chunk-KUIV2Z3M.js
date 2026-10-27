import {
  SpillSink,
  ensureDirPath
} from "./chunk-QH5H3VND.js";
import {
  StreamTail,
  TailBuffer
} from "./chunk-OZ2F4R6T.js";

// src/shell.ts
import { DSH_ENV_PREFIX, ShellExecutor } from "@deepseek-ai/dsh-shell";
import {
  Channel,
  JobConsole,
  KILLED_OUTCOME,
  exitOutcome
} from "@struktoai/mirage-core/shell/console/index";
import { setCwd } from "@struktoai/mirage-core/workspace/session/shell_dirs";
import { sessionView } from "@struktoai/mirage-core/workspace/session/state";
import { refusalLine } from "@struktoai/mirage-core/workspace/tools/io_text";
import { rstripSlash } from "@struktoai/mirage-core/utils/slash";
var DEFAULT_TIMEOUT_MS = 12e4;
var MAX_TIMEOUT_MS = 6e5;
var DEFAULT_STDOUT_MAX_BYTES = 2e5;
var DEFAULT_STDERR_MAX_BYTES = 64e3;
var STDERR_MARKER = new TextEncoder().encode("\n--- stderr ---\n");
var spillCounter = 0;
var SINK_PREFIX = "/dev";
var DENIAL_SIGNATURES = ["read-only mount at ", ": Permission denied", ": Read-only file system"];
function executeOptions(spec, workdir, signal, sessionId, bound, fallbackWorkdir, sink) {
  const managed = spec.dshEnv ?? {};
  const env = bound ? { ...spec.env ?? {} } : { ...spec.env ?? {}, ...managed };
  const cwd = workdir !== "" ? workdir : bound ? void 0 : fallbackWorkdir;
  return {
    signal,
    ...sessionId !== void 0 ? { sessionId } : {},
    ...cwd !== void 0 ? { cwd } : {},
    ...Object.keys(env).length > 0 ? { env } : {},
    ...spec.stdin !== void 0 ? { stdin: new TextEncoder().encode(spec.stdin) } : {},
    ...sink !== void 0 ? { sink } : {}
  };
}
function untilAborted(work, signal) {
  return new Promise((resolve, reject) => {
    const abort = () => {
      reject(signal.reason);
    };
    signal.addEventListener("abort", abort, { once: true });
    work.then(resolve, reject).finally(() => {
      signal.removeEventListener("abort", abort);
    });
  });
}
var ExecutionStore = class {
  constructor(deliver) {
    this.deliver = deliver;
  }
  deliver;
  nextSeq = 0;
  isClosed = false;
  waiters = [];
  get closed() {
    return this.isClosed;
  }
  async append(channel, data) {
    const chunk = { seq: this.nextSeq, ts: Date.now() / 1e3, channel, data };
    this.nextSeq += 1;
    await this.deliver(chunk);
    return chunk;
  }
  readFrom() {
    return Promise.resolve([[], this.nextSeq, false]);
  }
  wait() {
    if (this.isClosed) return Promise.resolve();
    return new Promise((resolve) => {
      this.waiters.push(resolve);
    });
  }
  close() {
    this.isClosed = true;
    for (const resolve of this.waiters.splice(0)) resolve();
    return Promise.resolve();
  }
};
var MirageShellExecution = class {
  status = "running";
  exitCode = null;
  signal = null;
  sandbox;
  done;
  observed;
  parts;
  console;
  pending;
  stdoutTail;
  stderrTail;
  failure = null;
  settledResult = null;
  lossy = false;
  inStderr = false;
  settled = false;
  /**
   * @param launch starts the command streaming into the console it is
   *   handed; null when the deadline expired while it was being prepared.
   * @param parts what the execution needs from its executor.
   */
  constructor(launch, parts) {
    this.parts = parts;
    this.console = new JobConsole(
      new ExecutionStore(
        (chunk) => chunk.channel === Channel.CONTROL ? Promise.resolve() : this.appendChunk(chunk)
      )
    );
    this.pending = new TailBuffer(parts.budget);
    this.stdoutTail = new StreamTail(parts.stdoutMaxBytes);
    this.stderrTail = new StreamTail(parts.stderrMaxBytes);
    this.observed = {
      stdout: { readFrom: (from) => this.readStream(this.stdoutTail, from, "stdout") },
      stderr: { readFrom: (from) => this.readStream(this.stderrTail, from, "stderr") }
    };
    this.done = launch === null ? this.settleExpired() : launch(this.console).then(
      (result) => this.settle(result, null),
      (err) => this.settle(null, err)
    );
  }
  readStream(tail, fromByte, channel) {
    const read = tail.readFrom(fromByte);
    const spillPath = channel === "stdout" ? this.parts.spill?.stdoutPath : this.parts.spill?.stderrPath;
    return { ...read, ...spillPath !== void 0 ? { spillPath } : {} };
  }
  async appendChunk(chunk) {
    const spill = this.parts.spill;
    if (spill !== null) await spill.ingest(chunk.channel, chunk.data);
    const tail = chunk.channel === Channel.STDERR ? this.stderrTail : this.stdoutTail;
    tail.append(chunk.data);
    let dropped = false;
    if (chunk.channel === Channel.STDERR) {
      if (!this.inStderr) {
        dropped = this.pending.append(STDERR_MARKER);
        this.inStderr = true;
      }
    } else {
      this.inStderr = false;
    }
    dropped = this.pending.append(chunk.data) || dropped;
    if (dropped) this.lossy = true;
    if ((dropped || tail.truncated) && spill !== null) await spill.begin();
  }
  async settle(result, err) {
    this.settled = true;
    let outcome;
    if (result !== null) {
      this.status = "completed";
      this.exitCode = result.exitCode;
      outcome = exitOutcome(result.exitCode);
    } else {
      this.status = "killed";
      this.signal = "SIGTERM";
      outcome = KILLED_OUTCOME;
      if (!this.parts.controller.signal.aborted) {
        this.failure = { error: err };
        const message = err instanceof Error ? err.message : String(err);
        await this.console.emit(Channel.STDERR, new TextEncoder().encode(message));
      }
    }
    if (result !== null) {
      const before = this.stderrTail.readFrom(0).text;
      const line = refusalLine(result.refusal);
      if (line !== "") {
        const lead = before === "" || before.endsWith("\n") ? "" : "\n";
        await this.console.emit(Channel.STDERR, new TextEncoder().encode(lead + line));
      }
    }
    await this.console.finish(outcome);
    this.stdoutTail.end();
    this.stderrTail.end();
    const stderr = this.stderrTail.readFrom(0).text;
    const sandbox = this.parts.verdict(result, stderr);
    if (sandbox !== void 0) this.sandbox = sandbox;
    this.parts.disarm();
  }
  async settleExpired() {
    this.settled = true;
    this.status = "killed";
    await this.console.finish(KILLED_OUTCOME);
    const sandbox = this.parts.verdict(null, "");
    if (sandbox !== void 0) this.sandbox = sandbox;
    this.parts.disarm();
  }
  readOutput() {
    const delta = this.pending.take();
    const lossy = this.lossy;
    this.lossy = false;
    const spill = this.parts.spill;
    return {
      delta,
      lossy,
      ...spill?.stdoutPath !== void 0 ? { stdoutSpillPath: spill.stdoutPath } : {},
      ...spill?.stderrPath !== void 0 ? { stderrSpillPath: spill.stderrPath } : {}
    };
  }
  kill() {
    if (this.settled) return false;
    this.parts.controller.abort();
    return true;
  }
  result() {
    this.settledResult ??= this.done.then(() => {
      if (this.failure !== null) throw this.failure.error;
      return {
        exitCode: this.exitCode,
        signal: this.signal,
        ...this.parts.classify(),
        timeoutMs: this.parts.timeoutMs,
        stdout: this.collected(this.stdoutTail, "stdout"),
        stderr: this.collected(this.stderrTail, "stderr"),
        ...this.sandbox !== void 0 ? { sandbox: this.sandbox } : {}
      };
    });
    return this.settledResult;
  }
  collected(tail, channel) {
    const read = this.readStream(tail, 0, channel);
    return {
      text: read.text,
      truncated: read.lossy,
      ...read.spillPath !== void 0 ? { spillPath: read.spillPath } : {}
    };
  }
};
var MirageShellExecutor = class extends ShellExecutor {
  static inject = ["mirage"];
  workdir;
  defaultTimeoutMs;
  maxTimeoutMs;
  stdoutMaxBytes;
  stderrMaxBytes;
  sessionId;
  spillDir;
  sessionReady = null;
  readOnlyReady = null;
  seeding = /* @__PURE__ */ new Map();
  issued = 0;
  seeded = /* @__PURE__ */ new Map();
  constructor(ctx, config = {}) {
    super(ctx);
    this.workdir = config.workdir ?? "/";
    this.defaultTimeoutMs = config.defaultTimeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.maxTimeoutMs = config.maxTimeoutMs ?? MAX_TIMEOUT_MS;
    this.stdoutMaxBytes = config.stdoutMaxBytes ?? DEFAULT_STDOUT_MAX_BYTES;
    this.stderrMaxBytes = config.stderrMaxBytes ?? DEFAULT_STDERR_MAX_BYTES;
    this.sessionId = config.sessionId;
    this.spillDir = config.spillDir;
  }
  // The workspace may still be building (declarative mounts resolve
  // asynchronously), so every execution awaits the service's `ready`.
  workspace() {
    return this.ctx.mirage.ready;
  }
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
  async worldWorkdir(spec) {
    if (spec.workdir === "") return "";
    const ws = await this.workspace();
    if (await ws.vfs.isDir(spec.workdir)) return spec.workdir;
    return this.sessionId === void 0 ? this.workdir : "";
  }
  // A spill sink for one background command, or null when no spill
  // directory is configured. The target reaches the live workspace so
  // the full stream lands on a mount the agent can read back.
  newSpill() {
    const dir = this.spillDir;
    if (dir === void 0) return null;
    const target = {
      ensureDir: async (d) => {
        const ws = await this.workspace();
        await ensureDirPath({ exists: (p) => ws.vfs.exists(p), mkdir: (p) => ws.vfs.mkdir(p) }, d);
      },
      write: async (p, bytes) => {
        const ws = await this.workspace();
        await ws.vfs.write(p, bytes);
      },
      append: async (p, bytes) => {
        const ws = await this.workspace();
        await ws.vfs.append(p, bytes);
      }
    };
    spillCounter += 1;
    const log = this.ctx.logger("mirage-dsh");
    return new SpillSink(target, dir, `mirage-shell-${spillCounter.toString()}`, (err) => {
      log.debug("spill to %s failed, output will not be recoverable: %o", dir, err);
    });
  }
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
  get sandboxMode() {
    return this.ctx.mirage.vfsOnly ? "workspace-write" : void 0;
  }
  /**
   * The mode this one call runs under: the policy the caller resolved
   * for it, or this executor's own default when the call carried none.
   * Undefined keeps the "no claim" answer for a world some runtime can
   * act outside of, where no mode would be true.
   *
   * @param spec the resolved spec whose policy is being read.
   * @returns the effective mode, or undefined when nothing is claimed.
   */
  modeFor(spec) {
    const declared = this.sandboxMode;
    if (declared === void 0) return void 0;
    return spec.sandboxPolicy?.mode ?? declared;
  }
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
  async sessionFor(spec) {
    if (this.modeFor(spec) !== "read-only") return this.sessionId;
    return this.readOnlySession();
  }
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
  sandboxInfo(spec, denied = false) {
    const mode = this.modeFor(spec);
    if (mode === void 0) return void 0;
    return { mode, denied, enforcement: "full", runnerFailed: false };
  }
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
  wasDenied(spec, result, stderr) {
    if (result.refusal !== null) return true;
    if (this.modeFor(spec) !== "read-only") return false;
    return DENIAL_SIGNATURES.some((signature) => stderr.includes(signature));
  }
  resolve(request) {
    const workdir = request.workdir ?? (this.sessionId === void 0 ? this.workdir : "");
    return {
      command: request.command,
      workdir,
      timeoutMs: Math.min(request.timeoutMs ?? this.defaultTimeoutMs, this.maxTimeoutMs),
      onExpiry: request.onExpiry ?? "kill",
      stdoutMaxBytes: request.stdoutMaxBytes ?? this.stdoutMaxBytes,
      signal: request.signal,
      stdin: request.stdin,
      env: request.env,
      dshEnv: request.dshEnv,
      sandboxPolicy: request.sandboxPolicy
    };
  }
  ensureSession() {
    if (this.sessionId === void 0) return Promise.resolve();
    this.sessionReady ??= this.provisionSession(this.sessionId).catch((err) => {
      this.sessionReady = null;
      throw err;
    });
    return this.sessionReady;
  }
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
  async applyManagedEnv(ws, sessionId, managed) {
    const session = ws.getSession(sessionId);
    const view = sessionView(session);
    for (const key of Object.keys(session.env)) {
      if (key.startsWith(DSH_ENV_PREFIX) && !(key in managed)) await view.unset(key);
    }
    for (const [key, value] of Object.entries(managed)) await view.set(key, value);
  }
  readOnlySession() {
    this.readOnlyReady ??= this.provisionReadOnly().catch((err) => {
      this.readOnlyReady = null;
      throw err;
    });
    return this.readOnlyReady;
  }
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
  async provisionReadOnly() {
    const ws = await this.workspace();
    const sessionId = `${this.sessionId ?? "mirage-dsh"}::read-only`;
    await ws.ensureSessionsLoaded();
    if (ws.listSessions().some((s) => s.sessionId === sessionId)) return sessionId;
    const source = ws.getSession(this.sessionId ?? ws.defaultSessionId);
    const grants = {};
    for (const entry of ws.mounts()) {
      grants[entry.prefix] = rstripSlash(entry.prefix) === SINK_PREFIX ? "exec" : "read";
    }
    const hidden = source.visibility.paths;
    const hide = [...hidden?.paths ?? [], ...hidden?.patterns ?? []];
    const twin = ws.createSession(sessionId, {
      mounts: grants,
      ...hide.length > 0 ? { permissions: { paths: { hide } } } : {}
    });
    twin.commands = source.commands;
    twin.visibility = {
      ...twin.visibility,
      vars: source.visibility.vars,
      commands: source.visibility.commands
    };
    setCwd(twin, this.workdir);
    return sessionId;
  }
  async provisionSession(sessionId) {
    const ws = await this.workspace();
    await ws.ensureSessionsLoaded();
    if (ws.listSessions().some((s) => s.sessionId === sessionId)) return;
    setCwd(ws.createSession(sessionId), this.workdir);
  }
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
  async prepare(spec) {
    const ticket = ++this.issued;
    await this.ensureSession();
    const ws = await this.workspace();
    const sessionId = await this.sessionFor(spec);
    const bound = this.sessionId !== void 0;
    const workdir = await this.worldWorkdir(spec);
    const managed = spec.dshEnv;
    if (bound && sessionId !== void 0) {
      const running = this.seeding.get(sessionId) ?? Promise.resolve();
      if (managed === void 0) {
        await running;
      } else {
        const seed = running.then(async () => {
          if (ticket < (this.seeded.get(sessionId) ?? 0)) return;
          await this.applyManagedEnv(ws, sessionId, managed);
          this.seeded.set(sessionId, ticket);
        });
        this.seeding.set(
          sessionId,
          seed.catch(() => void 0)
        );
        await seed;
      }
    }
    return { ws, sessionId, bound, workdir };
  }
  async execute(spec) {
    const controller = new AbortController();
    let timedOut = false;
    let aborted = false;
    const timer = spec.onExpiry === "kill" ? setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, spec.timeoutMs) : void 0;
    const onAbort = () => {
      if (!timedOut && !aborted) {
        aborted = true;
        controller.abort();
      }
    };
    if (spec.signal?.aborted === true) onAbort();
    else spec.signal?.addEventListener("abort", onAbort, { once: true });
    const disarm = () => {
      clearTimeout(timer);
      spec.signal?.removeEventListener("abort", onAbort);
    };
    const parts = {
      controller,
      budget: spec.stdoutMaxBytes,
      stdoutMaxBytes: spec.stdoutMaxBytes,
      stderrMaxBytes: this.stderrMaxBytes,
      timeoutMs: spec.timeoutMs,
      spill: this.newSpill(),
      classify: () => ({ timedOut, aborted }),
      verdict: (result, stderr) => this.sandboxInfo(spec, result !== null && this.wasDenied(spec, result, stderr)),
      disarm
    };
    let prepared;
    try {
      controller.signal.throwIfAborted();
      prepared = await untilAborted(this.prepare(spec), controller.signal);
    } catch (err) {
      if (!parts.classify().timedOut) {
        disarm();
        throw err;
      }
      return new MirageShellExecution(null, parts);
    }
    const { ws, sessionId, bound, workdir } = prepared;
    return new MirageShellExecution(
      (sink) => ws.shell(
        spec.command,
        executeOptions(spec, workdir, controller.signal, sessionId, bound, this.workdir, sink)
      ),
      parts
    );
  }
};

export {
  MirageShellExecutor
};
//# sourceMappingURL=chunk-KUIV2Z3M.js.map
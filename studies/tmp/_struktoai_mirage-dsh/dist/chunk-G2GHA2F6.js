import {
  StreamTail
} from "./chunk-OZ2F4R6T.js";

// src/subprocess.ts
import {
  SubprocessRuntime
} from "@deepseek-ai/dsh-subprocess";
import { PassThrough } from "stream";
import { pipeline } from "stream/promises";
import { PathSpec } from "@struktoai/mirage-core/types";
function validateOutput(mode) {
  if (mode === "pipe" || mode === "inherit") return;
  if (!Number.isSafeInteger(mode.maxBytes) || mode.maxBytes < 0)
    throw new Error("invalid output budget");
  if (mode.spill !== void 0)
    throw new Error("subprocess spill is unsupported; use ctx.spill for recovery");
}
function waitBounded(done, signal) {
  if (signal?.aborted) return Promise.resolve(false);
  return new Promise((resolve, reject) => {
    const aborted = () => {
      resolve(false);
    };
    signal?.addEventListener("abort", aborted, { once: true });
    void done.then(() => {
      resolve(true);
    }, reject).finally(() => signal?.removeEventListener("abort", aborted));
  });
}
var MirageSubprocess = class extends SubprocessRuntime {
  constructor(ctx, config = {}) {
    super(ctx);
    this.config = config;
    ctx.effect(() => async () => {
      this.closed = true;
      const handles = [...this.handles];
      for (const handle of handles) handle.terminate();
      await Promise.all(handles.map((handle) => handle.waitForExit()));
    });
  }
  config;
  static inject = ["mirage"];
  handles = /* @__PURE__ */ new Set();
  closed = false;
  async resolveExecutable(command, env, signal) {
    if (command.includes("/") && !command.startsWith("/"))
      throw new Error("relative executable paths are unsupported");
    signal?.throwIfAborted();
    const ws = await this.ctx.mirage.ready;
    this.checkWorld();
    const child = ws.spawn(
      { argv: ["which", command], ...env === void 0 ? {} : { env } },
      this.config.sessionId
    );
    const abort = () => {
      child.terminate();
    };
    signal?.addEventListener("abort", abort, { once: true });
    try {
      if (signal?.aborted) abort();
      const result = await child.communicate();
      signal?.throwIfAborted();
      if (result.exitCode !== 0) throw new Error(`executable not found: ${command}`);
      return new TextDecoder().decode(result.stdout).trim();
    } finally {
      signal?.removeEventListener("abort", abort);
    }
  }
  spawn(spec) {
    spec.signal?.throwIfAborted();
    this.checkWorld();
    if (this.closed) throw new Error("subprocess service is closed");
    if (spec.argv.length === 0 || !spec.argv[0] || spec.argv.some((arg) => typeof arg !== "string" || arg.includes("\0")))
      throw new Error("invalid argv");
    if (!spec.cwd.startsWith("/") || spec.cwd.includes("\0"))
      throw new Error("cwd must be an absolute workspace path");
    if (!Number.isFinite(spec.graceMs) || spec.graceMs <= 0 || spec.graceMs > 2147483647)
      throw new Error("invalid graceMs");
    validateOutput(spec.stdio.stdout);
    validateOutput(spec.stdio.stderr);
    if (spec.stdio.control !== void 0)
      throw new Error(
        "a control channel is unsupported: a workspace process inherits no descriptors"
      );
    const env = {};
    for (const [name, value] of Object.entries(spec.env ?? {})) {
      if (value === void 0) throw new Error("environment tombstones are unsupported");
      if (name.includes("=") || name.includes("\0") || value.includes("\0"))
        throw new Error("invalid environment");
      env[name] = value;
    }
    const stdin = spec.stdio.stdin === "pipe" ? new PassThrough() : void 0;
    const stdout = spec.stdio.stdout === "pipe" ? new PassThrough() : void 0;
    const stderr = spec.stdio.stderr === "pipe" ? new PassThrough() : void 0;
    const outTail = typeof spec.stdio.stdout === "object" ? new StreamTail(spec.stdio.stdout.maxBytes) : void 0;
    const errTail = typeof spec.stdio.stderr === "object" ? new StreamTail(spec.stdio.stderr.maxBytes) : void 0;
    let child;
    let workspace;
    let cancelled = false;
    const terminate = () => {
      cancelled = true;
      child?.terminate();
      stdin?.destroy();
      stdout?.destroy();
      stderr?.destroy();
    };
    spec.signal?.addEventListener("abort", terminate, { once: true });
    const drain = async (source, pipe, tail, inherited) => {
      if (pipe !== void 0) {
        await pipeline(source, pipe);
        return;
      }
      for await (const chunk of source) {
        if (tail !== void 0) tail.append(chunk);
        else if (!inherited.write(chunk))
          await new Promise((resolve) => inherited.once("drain", resolve));
      }
      tail?.end();
    };
    const done = this.ctx.mirage.ready.then(async (ws) => {
      workspace = ws;
      this.checkWorld();
      if (cancelled || spec.signal?.aborted || this.closed)
        throw new Error("subprocess cancelled before start");
      child = ws.spawn(
        { argv: spec.argv, cwd: PathSpec.fromStrPath(spec.cwd), env },
        this.config.sessionId
      );
      const launched = child;
      let finished = false;
      void launched.wait().then(() => {
        finished = true;
        stdin?.end();
      });
      const feed = async () => {
        try {
          if (stdin !== void 0)
            for await (const chunk of stdin)
              await launched.stdin.write(new Uint8Array(chunk));
          else if (typeof spec.stdio.stdin === "object")
            await launched.stdin.write(new TextEncoder().encode(spec.stdio.stdin.data));
        } catch (error) {
          if (!finished && !cancelled) throw error;
        } finally {
          launched.stdin.close();
        }
      };
      const [info] = await Promise.all([
        launched.wait(),
        feed(),
        drain(launched.stdout, stdout, outTail, process.stdout),
        drain(launched.stderr, stderr, errTail, process.stderr)
      ]);
      if (info.failure !== null) throw new Error(info.failure);
      return { exitCode: info.exitCode, signal: null };
    }).catch((error) => {
      terminate();
      throw error;
    }).finally(() => spec.signal?.removeEventListener("abort", terminate));
    const range = async () => {
      try {
        await done;
      } catch {
      }
      if (workspace !== void 0 && child !== void 0) {
        const pid = child.pid;
        for (; ; ) {
          const active = workspace.processes.live().filter((process2) => process2.info.groupId === pid);
          if (active.length === 0) break;
          await Promise.all(active.map((process2) => process2.join()));
        }
      }
    };
    const exited = range();
    const handle = {
      stdin,
      stdout,
      stderr,
      collected: {
        ...outTail === void 0 ? {} : { stdout: outTail },
        ...errTail === void 0 ? {} : { stderr: errTail }
      },
      control: void 0,
      done,
      terminate,
      waitForExit: (signal) => waitBounded(exited, signal)
    };
    this.handles.add(handle);
    void exited.then(() => this.handles.delete(handle));
    return handle;
  }
  terminalEnvironment(signal) {
    signal?.throwIfAborted();
    return Promise.resolve({ platform: "posix" });
  }
  spawnTerminal(_spec) {
    return Promise.reject(new Error("Mirage has no terminal allocation capability"));
  }
  checkWorld() {
    if (!this.ctx.mirage.vfsOnly)
      throw new Error(
        "Mirage subprocess requires workspace runtimes; native descendant tracking is unavailable"
      );
  }
};

export {
  MirageSubprocess
};
//# sourceMappingURL=chunk-G2GHA2F6.js.map
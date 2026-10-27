// src/approval.ts
import { Outcome, Scope } from "@struktoai/mirage-core/policy/types";
import { shellQuote } from "@struktoai/mirage-core/utils/quote";
var APPROVAL_TOOL_NAME = "bash";
function approverOf(ctx) {
  const held = ctx.get("approval");
  if (held === null || typeof held !== "object") return null;
  const { request } = held;
  return typeof request === "function" ? held : null;
}
function approvalReason(record) {
  const line = [record.command, ...record.argv].map(shellQuote).join(" ");
  return `${record.reason}: ${line}`;
}
function askThroughApproval(ctx) {
  return async (record, signal) => {
    const approver = approverOf(ctx);
    if (approver === null) return null;
    const outcome = await approver.request({
      agent: void 0,
      toolName: APPROVAL_TOOL_NAME,
      callId: record.id,
      reason: approvalReason(record),
      ...signal !== void 0 ? { signal } : {}
    });
    const verb = outcome === "allowed-once" ? Outcome.ALLOW : Outcome.DENY;
    return { ...record, outcome: verb, scope: Scope.ONCE };
  };
}

// src/service.ts
import { Service } from "@deepseek-ai/cordis";
import { buildRuntime } from "@struktoai/mirage-core/runtime/table";
import { parseMountMode } from "@struktoai/mirage-core/types";
import { snakeToCamel } from "@struktoai/mirage-core/utils/normalize";
import { Mount } from "@struktoai/mirage-core/workspace/mount/spec";
import { Workspace, buildVfs, parseSessionProfile } from "@struktoai/mirage-node";
function isMountBlock(entry) {
  if (Array.isArray(entry)) return false;
  return typeof entry.vfs === "string";
}
async function resolveMount(entry) {
  const vfs = await buildVfs(entry.vfs, entry.config ?? {});
  return new Mount(vfs, {
    ...entry.mode !== void 0 ? { mode: parseMountMode(entry.mode) } : {},
    vfsRef: entry.vfs
  });
}
function parseProfiles(raw) {
  const out = {};
  for (const [name, block] of Object.entries(raw)) {
    out[name] = parseSessionProfile(block, `profile \`${name}\``);
  }
  return out;
}
function camelKeys(block) {
  return Object.fromEntries(Object.entries(block).map(([key, value]) => [snakeToCamel(key), value]));
}
function toRuntimeEntry(entry) {
  if (typeof entry === "string") return entry;
  const { name, config, ...options } = entry;
  return buildRuntime(
    name,
    config === void 0 ? options : { ...options, config: camelKeys(config) }
  );
}
function builtEntry(entry) {
  return typeof entry === "string" ? buildRuntime(entry) : entry;
}
var MirageService = class extends Service {
  static provide = "mirage";
  /** Resolves to the shared workspace once every mount is built. */
  ready;
  built = null;
  plannedRuntimes;
  constructor(ctx, config = {}) {
    super(ctx, "mirage");
    if (config.workspace !== void 0 && config.mounts !== void 0) {
      throw new Error("mirage: pass either workspace or mounts, not both");
    }
    if (config.workspace !== void 0) {
      if (config.runtimes !== void 0 || config.workspaceOptions !== void 0 || config.profiles !== void 0 || config.profile !== void 0) {
        throw new Error(
          "mirage: runtimes, profiles, profile and workspaceOptions configure a service-owned workspace, not an adopted workspace"
        );
      }
      this.built = config.workspace;
      this.ready = Promise.resolve(config.workspace);
      return;
    }
    if (config.mounts === void 0) {
      throw new Error("mirage: one of workspace or mounts is required");
    }
    const options = { ...config.workspaceOptions ?? {} };
    if (config.runtimes !== void 0) {
      if (options.runtimes !== void 0) {
        throw new Error("mirage: pass runtimes or workspaceOptions.runtimes, not both");
      }
      options.runtimes = config.runtimes.map(toRuntimeEntry);
    }
    if (config.profiles !== void 0) {
      if (options.profiles !== void 0) {
        throw new Error("mirage: pass profiles or workspaceOptions.profiles, not both");
      }
      options.profiles = parseProfiles(config.profiles);
    }
    if (config.profile !== void 0) {
      if (options.profile !== void 0) {
        throw new Error("mirage: pass profile or workspaceOptions.profile, not both");
      }
      options.profile = config.profile;
    }
    options.onAsk ??= askThroughApproval(ctx);
    this.plannedRuntimes = options.runtimes?.map(builtEntry);
    if (this.plannedRuntimes !== void 0) options.runtimes = [...this.plannedRuntimes];
    const blocks = Object.values(config.mounts).some(isMountBlock);
    if (blocks) {
      this.ready = this.open(config.mounts, options);
      void this.ready.catch(() => void 0);
    } else {
      const owned = new Workspace(config.mounts, options);
      this.built = owned;
      this.ready = Promise.resolve(owned);
    }
    ctx.effect(
      () => async () => {
        const ws = await this.ready.catch(() => null);
        if (ws !== null) await ws.close();
      },
      "mirage workspace"
    );
  }
  /** The live workspace; throws until `ready` resolves. */
  get workspace() {
    if (this.built === null) {
      throw new Error("mirage: workspace is not ready yet; await ctx.mirage.ready");
    }
    return this.built;
  }
  /**
   * The live workspace, or null while it is still building.
   *
   * The non-throwing twin of {@link workspace}, for a synchronous seam
   * method whose honest answer before `ready` is "this world cannot tell
   * you" rather than an exception. Reads `built` directly, as
   * {@link vfsOnly} does.
   */
  get workspaceIfReady() {
    return this.built;
  }
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
  get decisions() {
    return this.workspace.decisions;
  }
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
  async explain(line, sessionId = "") {
    const ws = await this.ready;
    return ws.explain(line, sessionId);
  }
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
  get vfsOnly() {
    const entries = this.built === null ? this.plannedRuntimes ?? [] : this.built.runtimes();
    return entries.every((entry) => entry.reach === "workspace");
  }
  async open(mounts, options) {
    const resolved = {};
    for (const [prefix, entry] of Object.entries(mounts)) {
      resolved[prefix] = isMountBlock(entry) ? await resolveMount(entry) : entry;
    }
    const ws = new Workspace(resolved, options);
    this.built = ws;
    return ws;
  }
};

export {
  APPROVAL_TOOL_NAME,
  approverOf,
  approvalReason,
  askThroughApproval,
  MirageService
};
//# sourceMappingURL=chunk-OHZACFWO.js.map
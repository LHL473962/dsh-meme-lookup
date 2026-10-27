var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __knownSymbol = (name2, symbol) => (symbol = Symbol[name2]) ? symbol : Symbol.for("Symbol." + name2);
var __typeError = (msg) => {
  throw TypeError(msg);
};
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __decoratorStart = (base) => [, , , __create(base?.[__knownSymbol("metadata")] ?? null)];
var __decoratorStrings = ["class", "method", "getter", "setter", "accessor", "field", "value", "get", "set"];
var __expectFn = (fn) => fn !== void 0 && typeof fn !== "function" ? __typeError("Function expected") : fn;
var __decoratorContext = (kind, name2, done, metadata, fns) => ({ kind: __decoratorStrings[kind], name: name2, metadata, addInitializer: (fn) => done._ ? __typeError("Already initialized") : fns.push(__expectFn(fn || null)) });
var __decoratorMetadata = (array, target) => __defNormalProp(target, __knownSymbol("metadata"), array[3]);
var __runInitializers = (array, flags, self, value) => {
  for (var i = 0, fns = array[flags >> 1], n = fns && fns.length; i < n; i++) flags & 1 ? fns[i].call(self) : value = fns[i].call(self, value);
  return value;
};
var __decorateElement = (array, flags, name2, decorators, target, extra) => {
  var fn, it, done, ctx, access, k = flags & 7, s = !!(flags & 8), p = !!(flags & 16);
  var j = k > 3 ? array.length + 1 : k ? s ? 1 : 2 : 0, key = __decoratorStrings[k + 5];
  var initializers = k > 3 && (array[j - 1] = []), extraInitializers = array[j] || (array[j] = []);
  var desc = k && (!p && !s && (target = target.prototype), k < 5 && (k > 3 || !p) && __getOwnPropDesc(k < 4 ? target : { get [name2]() {
    return __privateGet(this, extra);
  }, set [name2](x) {
    return __privateSet(this, extra, x);
  } }, name2));
  k ? p && k < 4 && __name(extra, (k > 2 ? "set " : k > 1 ? "get " : "") + name2) : __name(target, name2);
  for (var i = decorators.length - 1; i >= 0; i--) {
    ctx = __decoratorContext(k, name2, done = {}, array[3], extraInitializers);
    if (k) {
      ctx.static = s, ctx.private = p, access = ctx.access = { has: p ? (x) => __privateIn(target, x) : (x) => name2 in x };
      if (k ^ 3) access.get = p ? (x) => (k ^ 1 ? __privateGet : __privateMethod)(x, target, k ^ 4 ? extra : desc.get) : (x) => x[name2];
      if (k > 2) access.set = p ? (x, y) => __privateSet(x, target, y, k ^ 4 ? extra : desc.set) : (x, y) => x[name2] = y;
    }
    it = (0, decorators[i])(k ? k < 4 ? p ? extra : desc[key] : k > 4 ? void 0 : { get: desc.get, set: desc.set } : target, ctx), done._ = 1;
    if (k ^ 4 || it === void 0) __expectFn(it) && (k > 4 ? initializers.unshift(it) : k ? p ? extra = it : desc[key] = it : target = it);
    else if (typeof it !== "object" || it === null) __typeError("Object expected");
    else __expectFn(fn = it.get) && (desc.get = fn), __expectFn(fn = it.set) && (desc.set = fn), __expectFn(fn = it.init) && initializers.unshift(fn);
  }
  return k || __decoratorMetadata(array, target), desc && __defProp(target, name2, desc), p ? k ^ 4 ? extra : desc : target;
};
var __publicField = (obj, key, value) => __defNormalProp(obj, typeof key !== "symbol" ? key + "" : key, value);
var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError("Cannot " + msg);
var __privateIn = (member, obj) => Object(obj) !== obj ? __typeError('Cannot use the "in" operator on this value') : member.has(obj);
var __privateGet = (obj, member, getter) => (__accessCheck(obj, member, "read from private field"), getter ? getter.call(obj) : member.get(obj));
var __privateSet = (obj, member, value, setter) => (__accessCheck(obj, member, "write to private field"), setter ? setter.call(obj, value) : member.set(obj, value), value);
var __privateMethod = (obj, member, method) => (__accessCheck(obj, member, "access private method"), method);

// src/shared/constants.ts
var PLUGIN_NAME = "cloudbase-dsh-plugin";
var MCP_PACKAGE = "@cloudbase/cloudbase-mcp@latest";

// src/server/mcp-bridge.ts
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
function findPackageRoot(startDir) {
  let dir = startDir;
  for (let depth = 0; depth < 6; depth += 1) {
    if (existsSync(join(dir, "package.json"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return startDir;
}
var PACKAGE_ROOT = findPackageRoot(dirname(fileURLToPath(import.meta.url)));
var SessionEnvCache = class {
  entries = /* @__PURE__ */ new Map();
  get(sessionId) {
    return this.entries.get(sessionId);
  }
  set(sessionId, envId, alias) {
    const entry = {
      sessionId,
      envId,
      alias,
      updatedAt: Date.now()
    };
    this.entries.set(sessionId, entry);
    return entry;
  }
  clear(sessionId) {
    this.entries.delete(sessionId);
  }
  list() {
    return [...this.entries.values()].sort((a, b) => b.updatedAt - a.updatedAt);
  }
  listForSession(sessionId) {
    const current = this.entries.get(sessionId);
    return {
      bound: this.list(),
      current
    };
  }
};
var ENV_HINT_FILENAME = "cloudbase-dsh-env-hint.json";
function envHintFilePath() {
  const override = process.env.CLOUDBASE_DSH_ENV_HINT_FILE;
  if (override) return override;
  return join(tmpdir(), ENV_HINT_FILENAME);
}
function writeEnvHint(cache, sessionId, activeEnvId) {
  const path = envHintFilePath();
  mkdirSync(dirname(path), { recursive: true });
  const payload = {
    activeEnvId,
    activeSessionId: sessionId,
    bound: cache.list(),
    updatedAt: Date.now()
  };
  writeFileSync(path, JSON.stringify(payload), "utf8");
}
function mcpLaunchScriptPath() {
  return join(PACKAGE_ROOT, "scripts", "mcp-launch.mjs");
}
function buildMcpClientConfig(_env = process.env) {
  return {
    serverName: "cloudbase",
    transport: "stdio",
    command: "node",
    args: [mcpLaunchScriptPath()],
    env: {}
  };
}
function loginHint(signedIn) {
  if (signedIn) {
    return "CloudBase \u5DF2\u590D\u7528\u672C\u673A\u767B\u5F55\u6001\u3002\u53EF\u76F4\u63A5\u8C03\u7528 mcp__cloudbase__* \u5DE5\u5177\u3002";
  }
  return [
    "CloudBase \u5C1A\u672A\u767B\u5F55\u3002\u8BF7\u8C03\u7528 mcp__cloudbase__auth\uFF0Caction=start_auth\uFF0CauthMode=device\u3002",
    "\u6253\u5F00\u8FD4\u56DE\u7684 verification URL\uFF0C\u5728\u6D4F\u89C8\u5668\u5B8C\u6210\u6388\u6743\u540E\u767B\u5F55\u6001\u4F1A\u6301\u4E45\u5316\uFF0C\u65E0\u9700 API Key\u3002",
    "\u4E0D\u8981\u8BBE\u7F6E\u65E0\u6548\u7684 CLOUDBASE_API_KEY\uFF0C\u5426\u5219\u4F1A\u6321\u4F4F device-code \u6D41\u7A0B\u3002"
  ].join(" ");
}
var AUTH_SKIP_INJECT = /* @__PURE__ */ new Set([
  "status",
  "start_auth",
  "logout",
  "login_by_api_key",
  "list_bound_envs",
  "set_env"
]);
function cloudbaseToolNeedsEnv(rawToolName, args) {
  if (rawToolName === "auth") {
    const action = typeof args.action === "string" ? args.action : "";
    return !AUTH_SKIP_INJECT.has(action);
  }
  if (rawToolName === "downloadTemplate" || rawToolName === "searchKnowledgeBase") {
    return false;
  }
  return true;
}
function resolveSessionId(session) {
  if (typeof session === "object" && session !== null) {
    const row = session;
    const id = row.id ?? row.sessionId;
    if (typeof id === "string" && id.length > 0) return id;
  }
  return "default";
}

// src/server/mcp-client.ts
import { spawn } from "node:child_process";

// src/server/resolve-mcp-cmd.ts
import { existsSync as existsSync2, readdirSync, statSync } from "node:fs";
import { homedir } from "node:os";
import { dirname as dirname2, join as join2 } from "node:path";
function findCachedCloudbaseMcpBin(npxRoot = join2(homedir(), ".npm", "_npx")) {
  if (!existsSync2(npxRoot)) return void 0;
  let best;
  let entries;
  try {
    entries = readdirSync(npxRoot);
  } catch {
    return void 0;
  }
  for (const name2 of entries) {
    const bin = join2(npxRoot, name2, "node_modules", ".bin", "cloudbase-mcp");
    if (!existsSync2(bin)) continue;
    let mtime = 0;
    try {
      mtime = statSync(bin).mtimeMs;
    } catch {
      continue;
    }
    if (!best || mtime > best.mtime) best = { path: bin, mtime };
  }
  return best?.path;
}
function findCachedCloudbaseMcpEntry(bin) {
  const entry = join2(
    dirname2(dirname2(bin)),
    "@cloudbase",
    "cloudbase-mcp",
    "dist",
    "cli.cjs"
  );
  return existsSync2(entry) ? entry : void 0;
}
function resolveMcpLaunch(env = process.env, options = {}) {
  const envCmd = env.CLOUDBASE_MCP_COMMAND?.trim();
  if (envCmd) {
    const args = env.CLOUDBASE_MCP_ARGS ? env.CLOUDBASE_MCP_ARGS.split(",").map((s) => s.trim()).filter(Boolean) : ["-y", MCP_PACKAGE];
    return { command: envCmd, args, source: "env" };
  }
  const cached = findCachedCloudbaseMcpBin(options.npxRoot);
  if (cached) {
    const entry = findCachedCloudbaseMcpEntry(cached);
    if (entry) {
      return { command: process.execPath, args: [entry], source: "npx-cache" };
    }
    if (process.platform !== "win32") {
      return { command: cached, args: [], source: "npx-cache" };
    }
  }
  return {
    command: "npx",
    args: ["-y", MCP_PACKAGE],
    source: "npx",
    shell: process.platform === "win32"
  };
}

// src/server/mcp-client.ts
var MCP_REQUEST_TIMEOUT_MS = 9e4;
var ENV_CHANGED_NOTIFICATION_METHOD = "notifications/cloudbase/env_changed";
function extractEnvChangedNotification(message) {
  if (message.method !== ENV_CHANGED_NOTIFICATION_METHOD) return void 0;
  const params = asRecord(message.params);
  return typeof params.envId === "string" && params.envId.length > 0 ? params.envId : void 0;
}
function encodeMessage(payload) {
  const json = Buffer.from(`${JSON.stringify(payload)}
`, "utf8");
  const header = Buffer.from(`Content-Length: ${json.length}\r
\r
`, "utf8");
  return Buffer.concat([header, json]);
}
function parseMcpFrames(buffer) {
  const messages = [];
  let rest = buffer;
  while (rest.length > 0) {
    const headerEnd = rest.indexOf("\r\n\r\n");
    if (headerEnd === -1) {
      const nl = rest.indexOf(10);
      if (nl === -1) break;
      const line = rest.subarray(0, nl).toString("utf8").trim();
      rest = rest.subarray(nl + 1);
      if (!line) continue;
      try {
        messages.push(JSON.parse(line));
      } catch {
        break;
      }
      continue;
    }
    const header = rest.subarray(0, headerEnd).toString("utf8");
    const match = /Content-Length:\s*(\d+)/i.exec(header);
    if (!match) {
      rest = rest.subarray(headerEnd + 4);
      continue;
    }
    const length = Number(match[1]);
    const bodyStart = headerEnd + 4;
    if (rest.length < bodyStart + length) break;
    const body = rest.subarray(bodyStart, bodyStart + length).toString("utf8");
    rest = rest.subarray(bodyStart + length);
    messages.push(JSON.parse(body));
  }
  return { messages, rest };
}
function extractToolPayload(result) {
  if (!result) return void 0;
  if (result.structuredContent !== void 0) return result.structuredContent;
  const texts = (result.content ?? []).map((item) => item.text).filter((text) => typeof text === "string" && text.length > 0);
  if (texts.length === 0) return result;
  const joined = texts.join("\n");
  try {
    return JSON.parse(joined);
  } catch {
    return joined;
  }
}
var CloudBaseMcpBridge = class {
  child = null;
  buf = Buffer.alloc(0);
  nextId = 1;
  pending = /* @__PURE__ */ new Map();
  ready = null;
  lastInjectedEnvId;
  envListeners = /* @__PURE__ */ new Set();
  env;
  command;
  args;
  shell;
  sessionEnvCache;
  getSessionId;
  constructor(options = {}) {
    this.env = options.env ?? process.env;
    if (options.command != null) {
      this.command = options.command;
      this.args = options.args ?? ["-y", MCP_PACKAGE];
      this.shell = false;
    } else {
      const launch = resolveMcpLaunch(this.env);
      this.command = launch.command;
      this.args = options.args ?? launch.args;
      this.shell = launch.shell ?? false;
    }
    this.sessionEnvCache = options.sessionEnvCache;
    this.getSessionId = options.getSessionId;
  }
  async listTools() {
    await this.ensureReady();
    const response = await this.request("tools/list", {});
    const result = asRecord(response.result);
    const tools = Array.isArray(result.tools) ? result.tools : [];
    return tools.map((tool) => asRecord(tool).name).filter((name2) => typeof name2 === "string");
  }
  /**
   * 订阅环境变更事件。触发点：会话 AI 调 auth set_env 成功（显式或
   * ensureSessionEnv 隐式重绑）。面板用它做事件驱动状态同步，替代云端轮询。
   */
  onEnvChanged(listener) {
    this.envListeners.add(listener);
    return () => {
      this.envListeners.delete(listener);
    };
  }
  notifyEnvChanged(envId) {
    for (const listener of this.envListeners) {
      listener(envId);
    }
  }
  async callTool(name2, args) {
    await this.ensureReady();
    if (name2 === "auth" && args.action === "set_env" && typeof args.envId === "string") {
      const response2 = await this.request("tools/call", { name: name2, arguments: args });
      const payload = this.unwrapResponse(response2, name2);
      this.lastInjectedEnvId = args.envId;
      this.notifyEnvChanged(args.envId);
      return payload;
    }
    const rebound = await this.ensureSessionEnv(name2, args);
    if (rebound) this.notifyEnvChanged(rebound);
    const response = await this.request("tools/call", { name: name2, arguments: args });
    return this.unwrapResponse(response, name2);
  }
  dispose() {
    for (const item of this.pending.values()) {
      item.reject(new Error("MCP bridge disposed"));
    }
    this.pending.clear();
    this.child?.kill();
    this.child = null;
    this.ready = null;
  }
  ensureReady() {
    if (this.ready) return this.ready;
    this.ready = this.start();
    return this.ready;
  }
  async start() {
    const childEnv = {
      ...this.env,
      CLOUDBASE_MCP_DISABLE_LOG_FILE: "true"
    };
    delete childEnv.CLOUDBASE_API_KEY;
    for (const key of Object.keys(childEnv)) {
      if (/^https?_proxy$/i.test(key) || key.toLowerCase() === "all_proxy") {
        delete childEnv[key];
      }
    }
    const child = spawn(this.command, this.args, {
      env: childEnv,
      stdio: ["pipe", "pipe", "pipe"],
      shell: this.shell
    });
    this.child = child;
    child.stdin?.on("error", () => {
    });
    child.stdout.on("data", (chunk) => this.onData(chunk));
    child.stderr.on("data", (chunk) => {
      if (this.env.CLOUDBASE_MCP_DEBUG === "1") {
        process.stderr.write(`[cloudbase-mcp] ${chunk.toString("utf8")}`);
      }
    });
    child.on("error", (err) => {
      this.child = null;
      this.ready = null;
      for (const item of this.pending.values()) {
        item.reject(err);
      }
      this.pending.clear();
    });
    child.on("exit", () => {
      this.child = null;
      this.ready = null;
      for (const item of this.pending.values()) {
        item.reject(new Error("MCP server exited"));
      }
      this.pending.clear();
    });
    await this.request("initialize", {
      protocolVersion: "2024-11-05",
      capabilities: {},
      clientInfo: { name: "@cloudbase/dsh-plugin", version: "0.1.0" }
    });
    this.notify("notifications/initialized", {});
  }
  onData(chunk) {
    const parsed = parseMcpFrames(Buffer.concat([this.buf, chunk]));
    this.buf = Buffer.from(parsed.rest);
    for (const message of parsed.messages) {
      if (typeof message.id !== "number") {
        const envId = extractEnvChangedNotification(message);
        if (envId) {
          this.lastInjectedEnvId = envId;
          this.notifyEnvChanged(envId);
        }
        continue;
      }
      const pending = this.pending.get(message.id);
      if (!pending) continue;
      this.pending.delete(message.id);
      pending.resolve(message);
    }
  }
  request(method, params) {
    const id = this.nextId++;
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        if (this.pending.has(id)) {
          this.pending.delete(id);
          reject(new Error(`${method} timed out`));
        }
      }, MCP_REQUEST_TIMEOUT_MS);
      this.pending.set(id, {
        resolve: (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        reject: (error) => {
          clearTimeout(timer);
          reject(error);
        }
      });
      try {
        this.child?.stdin.write(encodeMessage({ jsonrpc: "2.0", id, method, params }));
      } catch {
      }
    });
  }
  notify(method, params) {
    this.child?.stdin.write(encodeMessage({ jsonrpc: "2.0", method, params }));
  }
  unwrapResponse(response, name2) {
    if (response.error) {
      throw new Error(response.error.message || `MCP ${name2} failed`);
    }
    const result = response.result ?? {};
    if (result.isError) {
      const payload = extractToolPayload(result);
      const message = typeof payload === "string" ? payload : JSON.stringify(payload ?? { message: `MCP ${name2} returned isError` });
      throw new Error(message);
    }
    return extractToolPayload(result);
  }
  async ensureSessionEnv(name2, args) {
    if (!this.sessionEnvCache || !cloudbaseToolNeedsEnv(name2, args)) return void 0;
    const sessionId = this.getSessionId?.();
    if (!sessionId) return void 0;
    const bound = this.sessionEnvCache.get(sessionId);
    if (!bound?.envId || bound.envId === this.lastInjectedEnvId) return void 0;
    await this.request("tools/call", {
      name: "auth",
      arguments: { action: "set_env", envId: bound.envId }
    });
    this.lastInjectedEnvId = bound.envId;
    return bound.envId;
  }
};
function asRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value : {};
}

// src/shared/sql-ident.ts
var IDENT_RE = /^[A-Za-z_][A-Za-z0-9_]*$/;
function quotePgIdent(name2) {
  if (!IDENT_RE.test(name2)) {
    throw new Error(`Invalid PostgreSQL identifier: ${name2}`);
  }
  return `"${name2}"`;
}
function quotePgTable(table) {
  const parts = table.split(".").filter((part) => part.length > 0);
  if (parts.length === 0 || parts.length > 2) {
    throw new Error(`Invalid table reference: ${table}`);
  }
  const schema = parts.length === 2 ? parts[0] : "public";
  const name2 = parts.length === 2 ? parts[1] : parts[0];
  if (!schema || !name2) {
    throw new Error(`Invalid table reference: ${table}`);
  }
  return `${quotePgIdent(schema)}.${quotePgIdent(name2)}`;
}

// src/shared/column-form.ts
function mapSchemaColumns(payload) {
  const primary = new Set(
    Array.isArray(payload.primaryKey) ? payload.primaryKey.map((item) => String(item)) : []
  );
  const updatable = String(payload.kind ?? "table").toLowerCase().includes("table");
  const columns = Array.isArray(payload.columns) ? payload.columns : [];
  return columns.map((item) => {
    const row = item !== null && typeof item === "object" && !Array.isArray(item) ? item : {};
    const name2 = String(row.name ?? row.column_name ?? "");
    const dataType = String(row.dataType ?? row.data_type ?? row.type ?? "text");
    const nullable = Boolean(row.isNullable ?? row.nullable ?? row.is_nullable === "YES");
    const enums = Array.isArray(row.enums) ? row.enums.map((value) => String(value)) : void 0;
    return {
      name: name2,
      type: dataType,
      dataType,
      nullable,
      isUpdatable: updatable && row.isUpdatable !== false,
      primaryKey: primary.has(name2) || Boolean(row.primaryKey),
      enums
    };
  });
}

// src/server/data-service.ts
import { createHash, createHmac } from "node:crypto";

// src/server/term-map.ts
var REGION_LABEL = {
  "ap-shanghai": "\u4E0A\u6D77",
  "ap-guangzhou": "\u5E7F\u5DDE",
  "ap-beijing": "\u5317\u4EAC",
  "ap-chengdu": "\u6210\u90FD",
  "ap-nanjing": "\u5357\u4EAC",
  "ap-chongqing": "\u91CD\u5E86",
  "ap-hongkong": "\u4E2D\u56FD\u9999\u6E2F",
  "ap-singapore": "\u65B0\u52A0\u5761",
  "ap-tokyo": "\u4E1C\u4EAC",
  "ap-seoul": "\u9996\u5C14",
  "na-siliconvalley": "\u7845\u8C37",
  "na-ashburn": "\u5F17\u5409\u5C3C\u4E9A",
  "eu-frankfurt": "\u6CD5\u5170\u514B\u798F"
};
var USAGE_MODULE_LABEL = {
  FLEXDB: "\u6587\u6863\u578B\u6570\u636E\u5E93",
  TDSQL: "\u6570\u636E\u5E93",
  SCF: "\u4E91\u51FD\u6570",
  EKS: "\u4E91\u6258\u7BA1",
  COS: "\u5BF9\u8C61\u5B58\u50A8",
  AI: "AI",
  HOSTING: "\u9759\u6001\u6258\u7BA1",
  Auth: "\u8EAB\u4EFD\u8BA4\u8BC1",
  APIInvocation: "API \u8C03\u7528",
  HTTPInvocation: "HTTP \u8C03\u7528",
  VM: "\u865A\u62DF\u673A",
  Workflow: "\u5DE5\u4F5C\u6D41",
  Other: "\u5176\u4ED6"
};
var INTERNAL_CODE_RE = /\b(FLEXDB|TDSQL|SCF|EKS)\b/g;
function mapUsageModule(code) {
  return USAGE_MODULE_LABEL[code] ?? code;
}
function mapRegion(code) {
  if (!code) return "\u672A\u77E5\u5730\u57DF";
  const label = REGION_LABEL[code];
  return label ? `${label}\uFF08${code}\uFF09` : code;
}
function scrubInternalCodes(text) {
  return text.replace(INTERNAL_CODE_RE, (code) => mapUsageModule(code));
}
function formatBytes(bytes) {
  if (bytes === void 0 || Number.isNaN(bytes)) return "\u2014";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} kB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}
function formatUsageItem(moduleCode, used, quota) {
  const productName = mapUsageModule(moduleCode);
  if (used && quota) return { productName, usedLabel: `${used} / ${quota}` };
  if (used) return { productName, usedLabel: used };
  return { productName, usedLabel: "\u2014" };
}

// src/shared/apps-access.ts
function rec(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function str(value) {
  return typeof value === "string" && value.length > 0 ? value : void 0;
}
function normalizeUrl(domainOrUrl) {
  const trimmed = domainOrUrl.trim();
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
function mapVersionToDeployment(serviceName, version, previewUrl) {
  const row = rec(version);
  const buildId = str(row.BuildId ?? row.buildId);
  const versionName = str(row.VersionName ?? row.versionName ?? row.Version ?? row.version);
  const statusRaw = str(row.Status ?? row.status) ?? "unknown";
  const status = normalizeDeployStatus(statusRaw);
  const deployedAt = str(row.CreateTime ?? row.createTime ?? row.DeployTime ?? row.deployTime ?? row.UpdateTime) ?? void 0;
  const id = buildId ?? versionName ?? `${serviceName}-${deployedAt ?? "unknown"}`;
  return {
    id: `app:${serviceName}:${id}`,
    resourceType: "app",
    resourceName: serviceName,
    status,
    deployedAt,
    previewUrl,
    buildId,
    versionName,
    relatedResources: [{ type: "app", name: serviceName }]
  };
}
function normalizeDeployStatus(raw) {
  const lower = raw.toLowerCase();
  if (lower === "success" || lower === "succeed" || lower === "ready" || lower === "active") {
    return "success";
  }
  if (lower === "failed" || lower === "fail" || lower === "error") return "failed";
  if (lower.includes("build") || lower === "running" || lower === "processing") return "building";
  if (lower === "pending" || lower === "waiting" || lower === "queue") return "pending";
  return "unknown";
}
function sortDeploymentsNewestFirst(items) {
  return [...items].sort((a, b) => {
    const ta = a.deployedAt ? Date.parse(a.deployedAt) : 0;
    const tb = b.deployedAt ? Date.parse(b.deployedAt) : 0;
    return tb - ta;
  });
}

// ../platform-kit/src/pg/sql.ts
function quoteIdent(value) {
  return `"${value.replace(/"/g, '""')}"`;
}
function parseSchemaTable(schemaTable) {
  const parts = schemaTable.split(".");
  if (parts.length >= 2) {
    return { schema: parts[0], table: parts.slice(1).join(".") };
  }
  return { schema: "public", table: schemaTable };
}
function qualifiedTable(schemaTable) {
  const { schema, table } = parseSchemaTable(schemaTable);
  return `${quoteIdent(schema)}.${quoteIdent(table)}`;
}
function sqlListSchemaPolicies(schema = "public") {
  return `
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies
WHERE schemaname = '${schema.replace(/'/g, "''")}'
ORDER BY tablename, policyname;
`.trim();
}
function sqlToggleRLS(schemaTable, enable) {
  const action = enable ? "ENABLE" : "DISABLE";
  return `ALTER TABLE ${qualifiedTable(schemaTable)} ${action} ROW LEVEL SECURITY;`;
}
function sqlDropPolicy(schemaTable, policyName) {
  return `DROP POLICY ${quoteIdent(policyName)} ON ${qualifiedTable(schemaTable)};`;
}
function formatRoles(roles) {
  if (roles.length === 0) return "PUBLIC";
  return roles.map((role) => role.toLowerCase() === "public" ? "PUBLIC" : quoteIdent(role)).join(", ");
}
function sqlCreatePolicy(input) {
  const permissive = input.permissive === false ? "RESTRICTIVE" : "PERMISSIVE";
  const parts = [
    `CREATE POLICY ${quoteIdent(input.name)} ON ${qualifiedTable(input.schemaTable)}`,
    `AS ${permissive}`,
    `FOR ${input.command.toUpperCase()}`,
    `TO ${formatRoles(input.roles)}`
  ];
  if (input.using?.trim()) {
    parts.push(`USING (${input.using.trim()})`);
  }
  if (input.withCheck?.trim()) {
    parts.push(`WITH CHECK (${input.withCheck.trim()})`);
  }
  return `${parts.join(" ")};`;
}
function sqlAlterPolicy(input) {
  const targetName = input.previousName ?? input.name;
  const clauses = [];
  if (input.name && input.previousName && input.name !== input.previousName) {
    clauses.push(`RENAME TO ${quoteIdent(input.name)}`);
  }
  if (input.command) {
    clauses.push(`FOR ${input.command.toUpperCase()}`);
  }
  if (input.roles.length > 0) {
    clauses.push(`TO ${formatRoles(input.roles)}`);
  }
  if (input.using !== void 0) {
    clauses.push(`USING (${input.using.trim() || "true"})`);
  }
  if (input.withCheck !== void 0) {
    clauses.push(`WITH CHECK (${input.withCheck.trim() || "true"})`);
  }
  if (clauses.length === 0) {
    throw new Error("No policy fields to alter");
  }
  return `ALTER POLICY ${quoteIdent(targetName)} ON ${qualifiedTable(input.schemaTable)} ${clauses.join(" ")};`;
}
function sqlListFunctions(schema = "public") {
  return `
SELECT n.nspname AS schema, p.proname AS name, pg_get_function_result(p.oid) AS return_type,
       l.lanname AS language
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
JOIN pg_language l ON l.oid = p.prolang
WHERE n.nspname = '${schema.replace(/'/g, "''")}'
  AND p.prokind = 'f'
ORDER BY p.proname;
`.trim();
}
function sqlListExtensions() {
  return `
SELECT e.extname AS name, n.nspname AS schema, e.extversion AS version
FROM pg_extension e
JOIN pg_namespace n ON n.oid = e.extnamespace
ORDER BY e.extname;
`.trim();
}
function sqlListRoles() {
  return `
SELECT rolname AS name, rolsuper AS superuser, rolcanlogin AS can_login
FROM pg_roles
WHERE rolname NOT LIKE 'pg_%'
ORDER BY rolname;
`.trim();
}
function sqlListIndexes(schemaTable) {
  const { schema, table } = parseSchemaTable(schemaTable);
  return `
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = '${schema.replace(/'/g, "''")}'
  AND tablename = '${table.replace(/'/g, "''")}'
ORDER BY indexname;
`.trim();
}
function sqlListTables() {
  return `
SELECT n.nspname AS schema, c.relname AS name, c.relkind AS kind,
       c.reltuples AS estimated_rows
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE c.relkind IN ('r', 'v', 'p')
  AND n.nspname NOT IN ('pg_catalog', 'information_schema')
ORDER BY n.nspname, c.relname;
`.trim();
}
function sqlListSchemas() {
  return `
SELECT nspname AS name, nspowner::regrole::text AS owner
FROM pg_namespace
WHERE nspname NOT LIKE 'pg_%'
  AND nspname <> 'information_schema'
ORDER BY nspname;
`.trim();
}
function sqlListTriggers(schema = "public") {
  return `
SELECT n.nspname AS schema, c.relname AS table_name, t.tgname AS name,
       pg_get_triggerdef(t.oid) AS definition
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE NOT t.tgisinternal
  AND n.nspname = '${schema.replace(/'/g, "''")}'
ORDER BY c.relname, t.tgname;
`.trim();
}
function sqlListTypes(schema = "public") {
  return `
SELECT n.nspname AS schema, t.typname AS name, pg_catalog.format_type(t.oid, NULL) AS definition
FROM pg_type t
JOIN pg_namespace n ON n.oid = t.typnamespace
WHERE n.nspname = '${schema.replace(/'/g, "''")}'
  AND t.typtype IN ('e', 'c', 'd')
ORDER BY t.typname;
`.trim();
}
function sqlListColumnPrivileges(schemaTable) {
  const { schema, table } = parseSchemaTable(schemaTable);
  return `
SELECT grantee, column_name, privilege_type
FROM information_schema.column_privileges
WHERE table_schema = '${schema.replace(/'/g, "''")}'
  AND table_name = '${table.replace(/'/g, "''")}'
ORDER BY grantee, column_name;
`.trim();
}
function sqlListMigrations() {
  return `
SELECT version, name, applied_at
FROM pg_migrations
ORDER BY version DESC
LIMIT 100;
`.trim();
}
function sqlTableColumns(schemaTable) {
  const { schema, table } = parseSchemaTable(schemaTable);
  return `
SELECT column_name, data_type, is_nullable, column_default,
       (SELECT COUNT(*) > 0 FROM pg_index i
        JOIN pg_attribute a ON a.attrelid = i.indrelid AND a.attnum = ANY(i.indkey)
        WHERE i.indrelid = (quote_ident('${schema.replace(/'/g, "''")}') || '.' || quote_ident('${table.replace(/'/g, "''")}'))::regclass
          AND i.indisprimary AND a.attname = c.column_name) AS is_pk
FROM information_schema.columns c
WHERE table_schema = '${schema.replace(/'/g, "''")}'
  AND table_name = '${table.replace(/'/g, "''")}'
ORDER BY ordinal_position;
`.trim();
}
function sqlTableForeignKeys(schemaTable) {
  const { schema, table } = parseSchemaTable(schemaTable);
  return `
SELECT con.conname AS constraint_name,
       att.attname AS column_name,
       fn.nspname || '.' || ft.relname AS references,
       fatt.attname AS referenced_column
FROM pg_constraint con
JOIN pg_class cl ON cl.oid = con.conrelid
JOIN pg_namespace n ON n.oid = cl.relnamespace
JOIN pg_attribute att ON att.attrelid = con.conrelid AND att.attnum = ANY(con.conkey)
JOIN pg_class ft ON ft.oid = con.confrelid
JOIN pg_namespace fn ON fn.oid = ft.relnamespace
JOIN pg_attribute fatt ON fatt.attrelid = con.confrelid AND fatt.attnum = ANY(con.confkey)
WHERE con.contype = 'f'
  AND n.nspname = '${schema.replace(/'/g, "''")}'
  AND cl.relname = '${table.replace(/'/g, "''")}';
`.trim();
}
function sqlTableRlsStatus(schemaTable) {
  const { schema, table } = parseSchemaTable(schemaTable);
  return `
SELECT c.relrowsecurity AS rls_enabled, c.relforcerowsecurity AS force_rls
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = '${schema.replace(/'/g, "''")}'
  AND c.relname = '${table.replace(/'/g, "''")}';
`.trim();
}
function sqlWrapDdl(sql) {
  const escaped = sql.replace(/'/g, "''");
  return `DO LANGUAGE plpgsql $$ BEGIN EXECUTE '${escaped}'; END $$;`;
}

// ../platform-kit/src/services/resource-map.ts
function rec2(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function arr(value) {
  return Array.isArray(value) ? value : [];
}
function str2(value) {
  return typeof value === "string" && value.length > 0 ? value : void 0;
}
function num(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}
function mapFunctionSummary(item) {
  const row = rec2(item);
  const name2 = str2(row.FunctionName ?? row.functionName ?? row.Name);
  if (!name2) return void 0;
  return {
    name: name2,
    runtime: str2(row.Runtime ?? row.runtime),
    status: str2(row.Status ?? row.status),
    invokeCount: num(row.InvokeCount ?? row.invokeCount ?? row.InvocationCount),
    updatedAt: str2(row.ModTime ?? row.UpdateTime ?? row.updatedAt ?? row.AddTime)
  };
}
function mapFunctionTrigger(item) {
  const row = rec2(item);
  const name2 = str2(row.TriggerName ?? row.Name ?? row.name ?? row.Type ?? row.type);
  if (!name2) return void 0;
  return {
    name: name2,
    type: str2(row.Type ?? row.type ?? row.TriggerType) ?? "unknown",
    triggerDesc: str2(row.TriggerDesc ?? row.TriggerDescStr ?? row.qualifier ?? row.TriggerDesc)
  };
}
function mapFunctionDetail(payload, fallbackName) {
  const root = rec2(payload);
  const fn = rec2(root.Function);
  const row = Object.keys(fn).length > 0 ? { ...root, ...fn } : root;
  const env = rec2(row.Environment);
  const variables = arr(env.Variables ?? env.variables);
  const triggers = arr(row.Triggers ?? row.triggers).map(mapFunctionTrigger).filter((item) => Boolean(item));
  return {
    name: str2(row.FunctionName ?? row.Name) ?? fallbackName,
    runtime: str2(row.Runtime),
    status: str2(row.Status),
    invokeCount: num(row.InvokeCount),
    updatedAt: str2(row.ModTime ?? row.UpdateTime),
    handler: str2(row.Handler),
    timeout: num(row.Timeout),
    memorySize: num(row.MemorySize),
    description: str2(row.Description),
    environment: variables.map((item) => {
      const entry = rec2(item);
      const key = str2(entry.Key ?? entry.key ?? entry.Name);
      if (!key) return void 0;
      return { key, value: str2(entry.Value ?? entry.value) ?? "" };
    }).filter((item) => Boolean(item)),
    triggers
  };
}
function mapFunctionLog(item) {
  const row = rec2(item);
  const message = str2(row.RetMsg ?? row.Log ?? row.message ?? row.Msg ?? row.content) ?? "";
  return {
    requestId: str2(row.RequestId ?? row.requestId),
    time: str2(row.StartTime ?? row.Time ?? row.time),
    durationMs: num(row.Duration ?? row.duration),
    message
  };
}
function mapCloudRunService(item) {
  const row = rec2(item);
  const config = rec2(row.ServerConfig ?? row.Config);
  const name2 = str2(row.ServerName ?? row.Name ?? row.ServiceName ?? config.ServerName);
  if (!name2) return void 0;
  return {
    name: name2,
    status: str2(row.Status ?? row.ServerStatus ?? config.Status),
    version: str2(row.VersionName ?? row.CurrentVersion ?? config.VersionName),
    traffic: str2(row.FlowRatio ?? row.Traffic ?? config.FlowRatio),
    cpu: str2(config.Cpu ?? row.Cpu),
    memory: str2(config.Mem ?? config.Memory ?? row.Mem),
    instanceCount: num(config.MinNum ?? config.MaxNum ?? row.InstanceCount)
  };
}
function mapCloudRunVersion(item) {
  const row = rec2(item);
  const versionName = str2(row.VersionName ?? row.versionName ?? row.Name);
  if (!versionName) return void 0;
  return {
    versionName,
    status: str2(row.Status ?? row.status),
    deployedAt: str2(row.UpdateTime ?? row.CreateTime ?? row.DeployedAt),
    flowRatio: num(row.FlowRatio ?? row.flowRatio)
  };
}
function mapCloudRunDeploy(item) {
  const row = rec2(item);
  const id = str2(row.RunId ?? row.BuildId ?? row.DeployId ?? row.Id) ?? str2(row.VersionName) ?? void 0;
  if (!id) return void 0;
  return {
    id,
    status: str2(row.Status ?? row.status),
    deployedAt: str2(row.CreateTime ?? row.UpdateTime ?? row.DeployTime),
    buildId: str2(row.BuildId),
    runId: str2(row.RunId)
  };
}
function mapCloudRunLogLine(item) {
  if (typeof item === "string") return { message: item };
  const row = rec2(item);
  return {
    time: str2(row.Time ?? row.time ?? row.Timestamp),
    message: str2(row.Text ?? row.Log ?? row.message ?? row.Msg) ?? JSON.stringify(item)
  };
}
function mapHostingDomain(item, kind = "custom") {
  if (typeof item === "string" && item) return { domain: item, kind };
  const row = rec2(item);
  const domain = str2(row.Domain ?? row.domain ?? row.StaticDomain ?? row.DefaultDomain);
  if (!domain) return void 0;
  return {
    domain,
    status: str2(row.Status ?? row.status),
    kind
  };
}
function mapHostingVersion(serviceName, item) {
  const row = rec2(item);
  const versionName = str2(row.VersionName ?? row.versionName ?? row.BuildId) ?? "unknown";
  return {
    serviceName,
    versionName,
    status: str2(row.Status ?? row.status),
    deployedAt: str2(row.CreateTime ?? row.UpdateTime ?? row.deployedAt)
  };
}
function mapStorageBucket(item, kind = "storage") {
  const row = rec2(item);
  const name2 = str2(row.Bucket ?? row.BucketName ?? row.Name ?? row.name);
  if (!name2) return void 0;
  return {
    name: name2,
    region: str2(row.Region ?? row.region),
    createdAt: str2(row.CreateTime ?? row.createdAt),
    sizeLabel: str2(row.Size ?? row.sizeLabel),
    cdnDomain: str2(row.CdnDomain ?? row.CustomDomain),
    kind
  };
}
function mapCdnCacheItem(item, bucket) {
  const row = rec2(item);
  return {
    id: str2(row.TaskId ?? row.Id ?? row.RequestId) ?? bucket ?? "cdn",
    status: str2(row.Status ?? row.status) ?? "unknown",
    bucket
  };
}
var FN_LOGS_CLS_FALLBACK = /请升级到最新版开发者工具|当前版本不支持更多日志检索/;
var BUILD_LOG_CODING = "Build logs need a linked build account. Use process logs for image deploys.";

// src/server/data-service.ts
function rec3(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value : {};
}
function arr2(value) {
  return Array.isArray(value) ? value : [];
}
function str3(value) {
  return typeof value === "string" && value.length > 0 ? value : void 0;
}
function num2(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : void 0;
}
function hasPostgresqlSignal(env) {
  const pgList = arr2(env.PostgreSQL ?? env.postgresql);
  if (pgList.length > 0) return true;
  const metaList = arr2(env.Meta ?? env.meta);
  return metaList.some((item) => {
    const row = rec3(item);
    const key = str3(row.Key ?? row.key) ?? "";
    const value = String(row.Value ?? row.value ?? "").toLowerCase();
    return /^postgre[_]?sql$/i.test(key) && value === "enable";
  });
}
function deriveRuntimeMode(env) {
  const explicit = str3(env.RuntimeMode ?? env.runtimeMode)?.toLowerCase();
  if (explicit) {
    if (explicit.includes("postgres") || explicit === "pg") return "postgresql";
    return explicit;
  }
  if (hasPostgresqlSignal(env)) return "postgresql";
  const databases = arr2(env.Databases ?? env.databases);
  if (databases.length > 0) return "nosql";
  return void 0;
}
function envIsPostgres(env) {
  const mode = (deriveRuntimeMode(env) ?? "").toLowerCase();
  return mode.includes("postgres") || mode === "pg" || hasPostgresqlSignal(env);
}
function unwrapData(payload) {
  const root = rec3(payload);
  const nested = rec3(root.data);
  return Object.keys(nested).length > 0 ? nested : root;
}
function looksLikeWriteSql(sql) {
  return /^\s*(insert|update|delete|alter|drop|create|truncate|grant|revoke|replace|merge|call|do)\b/i.test(
    sql
  );
}
var CLS_TIME_RE = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
var CLS_UNAVAILABLE_MESSAGE = "\u5F53\u524D\u73AF\u5883\u672A\u5F00\u901A\u65E5\u5FD7\u670D\u52A1";
function formatClsTime(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
function toClsTime(value, fallback) {
  if (value && CLS_TIME_RE.test(value)) return value;
  if (value) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return formatClsTime(parsed);
  }
  return formatClsTime(fallback);
}
function isClsUnavailableError(error) {
  const message = error instanceof Error ? error.message : String(error ?? "");
  return /topic not exist|未接入日志|日志服务未开通|HTTP 404|ResourceNotFound|FailedOperation\.TopicNotExist|TopicNotExist/i.test(
    message
  );
}
function mapTableKind(kindRaw) {
  const kind = kindRaw.toLowerCase();
  if (kind.includes("view") || kindRaw === "v") return "view";
  if (kind.includes("func")) return "function";
  return "table";
}
function defaultLoginOptions() {
  return [
    { method: "device-code", title: "Device code", description: "OAuth device authorization flow" },
    { method: "apikey", title: "API Key", description: "Environment API Key login" }
  ];
}
function mapAuthPayload(payload, signedIn) {
  return {
    signedIn,
    envId: str3(payload.current_env_id ?? payload.currentEnvId ?? payload.envId ?? payload.EnvId),
    authMode: str3(payload.authMode ?? payload.mode),
    persisted: Boolean(payload.persisted ?? signedIn),
    tempCredentialsAvailable: Boolean(payload.tempCredentials ?? payload.hasTempCredentials),
    verificationUrl: str3(payload.verification_uri_complete ?? payload.verificationUrl ?? payload.url),
    userCode: str3(payload.user_code ?? payload.userCode),
    loginOptions: signedIn ? void 0 : defaultLoginOptions(),
    message: scrubInternalCodes(
      str3(payload.message) ?? (signedIn ? "\u5DF2\u767B\u5F55" : "\u672A\u767B\u5F55\uFF0C\u8BF7\u9009\u62E9\u767B\u5F55\u65B9\u5F0F")
    )
  };
}
function createCloudBaseDataService(bridge, appendUserMessage, getSession, sessionEnvCache, getCurrentSessionId) {
  const authListeners = /* @__PURE__ */ new Set();
  let authPollTimer;
  const PROBE_CACHE_TTL_MS = 6e4;
  const RESULT_CACHE_TTL_MS = 3e4;
  const AUTH_FALLBACK_INTERVAL_MS = 6e4;
  const ENV_BINDING_BREAK_MS = 6e4;
  const ENV_BINDING_ERROR = /ENV_REQUIRED|AUTH_REQUIRED/i;
  let probeCache = null;
  let envBindingBreakAt = 0;
  function createTtlCache(ttlMs) {
    const store = /* @__PURE__ */ new Map();
    return {
      get(key) {
        const hit = store.get(key);
        if (!hit) return void 0;
        if (Date.now() - hit.at > ttlMs) {
          store.delete(key);
          return void 0;
        }
        return hit.value;
      },
      set(key, value) {
        store.set(key, { value, at: Date.now() });
      },
      clear() {
        store.clear();
      }
    };
  }
  const resultCache = createTtlCache(RESULT_CACHE_TTL_MS);
  function invalidateAuthCaches() {
    probeCache = null;
    resultCache.clear();
    envBindingBreakAt = 0;
  }
  async function callCapi(service2, action, params = {}, version) {
    if (envBindingBreakAt && Date.now() - envBindingBreakAt < ENV_BINDING_BREAK_MS) {
      throw new Error("\u73AF\u5883\u7ED1\u5B9A\u6821\u9A8C\u5DF2\u6682\u505C\u91CD\u8BD5\uFF0C\u8BF7\u91CD\u65B0\u767B\u5F55\u6216\u5207\u6362\u73AF\u5883\u540E\u518D\u8BD5");
    }
    const args = { service: service2, action, params };
    if (version) args.version = version;
    else if (service2 === "tcbr") args.version = "2022-02-17";
    try {
      return unwrapData(await bridge.callTool("callCloudApi", args));
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (ENV_BINDING_ERROR.test(message)) {
        envBindingBreakAt = Date.now();
      }
      throw error;
    }
  }
  async function rawAuthCall(args) {
    return unwrapData(await bridge.callTool("auth", args));
  }
  async function probeCredentials() {
    if (probeCache && Date.now() - probeCache.at < PROBE_CACHE_TTL_MS) {
      return probeCache.value;
    }
    try {
      const payload = await callCapi("tcb", "DescribeEnvs", {});
      const envList = arr2(payload.EnvList ?? payload.env_candidates ?? payload.envCandidates);
      probeCache = { value: envList.length > 0, at: Date.now() };
      return probeCache.value;
    } catch {
      probeCache = { value: false, at: Date.now() };
      return false;
    }
  }
  async function resolveActiveEnvId() {
    const sessionId = getCurrentSessionId?.();
    const cached = sessionId && sessionEnvCache ? sessionEnvCache.get(sessionId)?.envId : void 0;
    if (cached) return cached;
    try {
      const auth = await rawAuthCall({ action: "status" });
      return str3(auth.current_env_id ?? auth.currentEnvId ?? auth.envId ?? auth.EnvId) ?? cached;
    } catch {
      return cached;
    }
  }
  async function requireEnvId() {
    const envId = await resolveActiveEnvId();
    if (!envId) {
      throw new Error("\u672A\u7ED1\u5B9A\u73AF\u5883\uFF0C\u8BF7\u5148\u767B\u5F55\u5E76\u9009\u62E9\u73AF\u5883");
    }
    return envId;
  }
  async function describeEnvRecord(envId) {
    const envPayload = await callCapi("tcb", "DescribeEnvs", { EnvId: envId });
    return rec3(arr2(envPayload.EnvList)[0]);
  }
  async function resolveDefaultBucket(envId, preferred) {
    if (preferred) return preferred;
    const env = await describeEnvRecord(envId);
    return str3(rec3(arr2(env.Storages ?? env.storages)[0]).Bucket ?? env.storageBucket);
  }
  function escapeSqlLiteral(value) {
    return value.replace(/'/g, "''");
  }
  async function isPostgresEnv() {
    const envId = await requireEnvId();
    const env = await describeEnvRecord(envId);
    return envIsPostgres(env);
  }
  async function resolveAccessToken() {
    const raw = await rawAuthCall({ action: "status" }).catch(() => ({}));
    return str3(
      raw.access_token ?? raw.accessToken ?? raw.token ?? raw.TempSecretId ?? raw.apiKey
    );
  }
  async function executePgSql(sql) {
    const envId = await requireEnvId();
    return callCapi("tcb", "ExecutePGSql", { EnvId: envId, Sql: sql });
  }
  async function executePgSqlWithDdlRetry(sql) {
    try {
      return await executePgSql(sql);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (!/InternalError|internal error/i.test(message)) {
        throw error;
      }
      return executePgSql(sqlWrapDdl(sql));
    }
  }
  function notifyAuthListeners(status) {
    for (const listener of authListeners) {
      listener(status);
    }
  }
  async function buildAuthStatus(probe = true) {
    const raw = await rawAuthCall({ action: "status" }).catch(() => ({}));
    const rawSigned = Boolean(raw.signedIn) || Boolean(raw.AUTH_READY) || str3(raw.auth_status) === "READY" || str3(raw.status) === "AUTH_READY" || str3(raw.code) === "AUTH_READY" || str3(raw.code) === "ENV_READY";
    const valid = rawSigned && (!probe || await probeCredentials());
    const status = mapAuthPayload(raw, valid);
    if (!valid) {
      status.signedIn = false;
      status.loginOptions = defaultLoginOptions();
    }
    return status;
  }
  const service = {
    async listTables() {
      let pgError;
      try {
        const payload = await executePgSql(sqlListTables());
        const rows = parseSqlRows(payload);
        if (rows.length > 0) {
          return rows.map((row) => ({
            name: str3(row.name) ?? "unknown",
            schema: str3(row.schema) ?? "public",
            kind: mapTableKind(str3(row.kind) ?? "r"),
            rowCount: num2(row.estimated_rows)
          }));
        }
      } catch (error) {
        pgError = error instanceof Error ? error.message : String(error);
      }
      let nosqlError;
      try {
        const nosql = unwrapData(
          await bridge.callTool("readNoSqlDatabaseStructure", {
            action: "listCollections"
          })
        );
        const collections = arr2(nosql.collections ?? nosql.Collections);
        if (collections.length > 0) {
          return collections.map((item) => {
            const row = rec3(item);
            return {
              name: str3(row.CollectionName ?? row.name) ?? "unknown",
              schema: "document",
              kind: "table",
              rowCount: num2(row.Count ?? row.count)
            };
          });
        }
      } catch (error) {
        nosqlError = error instanceof Error ? error.message : String(error);
      }
      if (pgError) throw new Error(pgError);
      if (nosqlError) throw new Error(nosqlError);
      return [];
    },
    async listTableColumns(table) {
      const payload = await executePgSql(
        sqlTableColumns(table.includes(".") ? table : `public.${table}`)
      );
      const rows = parseSqlRows(payload);
      const columns = rows.map((row) => ({
        name: str3(row.column_name) ?? "unknown",
        type: str3(row.data_type) ?? "unknown",
        dataType: str3(row.data_type) ?? "unknown",
        nullable: str3(row.is_nullable)?.toUpperCase() === "YES",
        isUpdatable: true,
        primaryKey: Boolean(row.is_pk)
      }));
      return mapSchemaColumns({
        columns,
        primaryKey: columns.filter((c) => c.primaryKey).map((c) => c.name),
        kind: "table"
      });
    },
    async listAppUsers(opts) {
      const result = await service.searchAppUsers({
        pageSize: opts?.limit ?? 50,
        pageNo: Math.floor((opts?.offset ?? 0) / (opts?.limit ?? 20)) + 1
      });
      return result.users;
    },
    async searchAppUsers(opts) {
      const envId = await requireEnvId();
      const keyword = opts?.keyword?.trim();
      let payload;
      try {
        payload = await callCapi("tcb", "DescribeUserList", {
          EnvId: envId,
          PageNo: opts?.pageNo ?? 1,
          PageSize: keyword ? 100 : opts?.pageSize ?? 50
        });
      } catch (err) {
        if (/env_not_exist|backend not found|operation[._ ]?failed/i.test(err instanceof Error ? err.message : String(err))) {
          return { users: [], total: 0 };
        }
        throw err;
      }
      const data = rec3(payload.Data ?? payload);
      const users = arr2(data.UserList ?? data.users ?? payload.UserList);
      const mapped = users.map((item) => {
        const row = rec3(item);
        const statusRaw = str3(row.UserStatus ?? row.userStatus ?? row.Status)?.toUpperCase();
        return {
          uid: str3(row.Uid ?? row.uid ?? row.uuid ?? row.id) ?? "unknown",
          name: str3(row.Username ?? row.Name ?? row.name ?? row.NickName),
          email: str3(row.Email ?? row.email),
          phone: str3(row.Phone ?? row.phone),
          createdAt: str3(row.CreateTime ?? row.createdAt ?? row.CreatedAt),
          lastLoginAt: str3(row.LastLoginTime ?? row.lastLoginAt ?? row.UpdateTime),
          status: statusRaw === "BLOCKED" || statusRaw === "DISABLE" ? "disabled" : "normal"
        };
      });
      const keywordLower = keyword?.toLowerCase();
      const filtered = keywordLower ? mapped.filter(
        (user) => user.uid.toLowerCase().includes(keywordLower) || user.name?.toLowerCase().includes(keywordLower) || user.email?.toLowerCase().includes(keywordLower) || user.phone?.toLowerCase().includes(keywordLower)
      ) : mapped;
      return {
        users: filtered,
        total: keywordLower ? filtered.length : num2(data.Total ?? payload.Total ?? data.total) ?? filtered.length
      };
    },
    async setAppUserStatus(uid, enabled) {
      const envId = await requireEnvId();
      await callCapi("tcb", "ModifyUser", {
        EnvId: envId,
        Uid: uid,
        UserStatus: enabled ? "ACTIVE" : "BLOCKED"
      });
    },
    async listSecrets() {
      const envId = await requireEnvId();
      const secrets = [];
      try {
        const listed = await callCapi("tcb", "ListFunctions", { EnvId: envId, Limit: 20 });
        const functions = arr2(listed.Functions ?? listed.functions);
        for (const item of functions.slice(0, 20)) {
          const row = rec3(item);
          const name2 = str3(row.FunctionName ?? row.Name);
          if (!name2) continue;
          try {
            const detail = await callCapi("tcb", "GetFunction", {
              EnvId: envId,
              FunctionName: name2
            });
            const env = rec3(detail.Environment ?? rec3(detail.Function).Environment);
            for (const variable of arr2(env.Variables ?? env.variables)) {
              const entry = rec3(variable);
              const key = str3(entry.Key ?? entry.key ?? entry.Name);
              if (!key) continue;
              const value = str3(entry.Value ?? entry.value) ?? "";
              secrets.push({
                source: name2,
                sourceKind: "function",
                key,
                valueMasked: value.length > 4 ? `${value.slice(0, 2)}***` : "***"
              });
            }
          } catch {
          }
        }
      } catch {
      }
      return secrets;
    },
    async readRows(table, opts) {
      const limit = opts?.limit ?? 50;
      const offset = opts?.offset ?? 0;
      const sql = `SELECT * FROM ${quotePgTable(table)} LIMIT ${limit} OFFSET ${offset}`;
      return service.runReadSql(sql);
    },
    async runReadSql(sql) {
      if (looksLikeWriteSql(sql)) {
        throw new Error("\u5199 SQL \u5FC5\u987B\u7ECF\u4F1A\u8BDD\u786E\u8BA4\u540E\u7531 runPgDDL \u6267\u884C");
      }
      const started = Date.now();
      const payload = await executePgSql(sql);
      return toRowPage(payload, Date.now() - started);
    },
    async listStorage(path = "", opts) {
      if (!await isPostgresEnv()) {
        return [];
      }
      const bucket = opts?.bucket?.trim();
      if (!bucket) return [];
      const prefix = path.replace(/^\//, "").replace(/\/$/, "");
      const bucketEsc = escapeSqlLiteral(bucket);
      const prefixFilter = prefix ? `AND name LIKE '${escapeSqlLiteral(prefix)}/%'` : "";
      const payload = await executePgSql(
        `SELECT name, metadata, created_at, updated_at FROM storage.objects WHERE bucket_id = '${bucketEsc}' ${prefixFilter} ORDER BY name LIMIT 500;`
      );
      const seenDirs = /* @__PURE__ */ new Set();
      const objects = [];
      for (const row of parseSqlRows(payload)) {
        const fullName = str3(row.name) ?? "";
        if (!fullName) continue;
        const relative = prefix ? fullName.slice(prefix.length + (prefix ? 1 : 0)) : fullName;
        const slashIdx = relative.indexOf("/");
        if (slashIdx >= 0) {
          const dirName = relative.slice(0, slashIdx);
          const dirPath = prefix ? `${prefix}/${dirName}/` : `${dirName}/`;
          if (!seenDirs.has(dirPath)) {
            seenDirs.add(dirPath);
            objects.push({
              cloudPath: dirPath,
              name: dirName,
              isDirectory: true,
              size: 0,
              sizeLabel: "\u2014"
            });
          }
          continue;
        }
        const meta = rec3(row.metadata);
        const size = num2(meta.size ?? meta.Size) ?? 0;
        objects.push({
          cloudPath: fullName,
          name: relative || fullName.split("/").pop() || fullName,
          isDirectory: false,
          size,
          sizeLabel: formatBytes(size),
          updatedAt: str3(row.updated_at ?? row.created_at)
        });
      }
      return objects;
    },
    async uploadStorage(cloudPath, opts) {
      if (!await isPostgresEnv()) {
        throw new Error("Non-PG upload requires host COS provider");
      }
      const envId = await requireEnvId();
      const bucket = opts?.bucket?.trim();
      if (!bucket) throw new Error("bucket required for upload");
      if (!opts?.fileBase64) throw new Error("fileBase64 required for upload");
      const fileName = opts.fileName?.trim() || cloudPath.split("/").filter(Boolean).pop() || "upload.bin";
      const basePath = cloudPath.endsWith("/") ? cloudPath : cloudPath.includes("/") ? `${cloudPath.replace(/\/?$/, "/")}` : "";
      const objectName = `${basePath}${fileName}`.replace(/^\//, "");
      const token = await resolveAccessToken();
      if (!token) throw new Error("No access token available for PG storage upload");
      const body = Buffer.from(opts.fileBase64, "base64");
      const url = `https://${envId}.api.tcloudbasegateway.com/v1/storages/object/${encodeURIComponent(bucket)}/${objectName.split("/").map(encodeURIComponent).join("/")}`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": opts.contentType ?? "application/octet-stream",
          "Content-Length": String(body.length)
        },
        body
      });
      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`Upload failed (${response.status}): ${text.slice(0, 240)}`);
      }
    },
    async storageUrl(cloudPath, opts) {
      if (!await isPostgresEnv()) {
        throw new Error("storageUrl requires host COS provider for non-PG environments");
      }
      const envId = await requireEnvId();
      const bucket = opts?.bucket?.trim();
      if (!bucket) throw new Error("bucket required");
      const token = await resolveAccessToken();
      if (!token) throw new Error("No access token for signed download URL");
      const objectName = cloudPath.replace(/^\//, "");
      const signUrl = `https://${envId}.api.tcloudbasegateway.com/v1/storages/object/sign/${encodeURIComponent(bucket)}/${objectName.split("/").map(encodeURIComponent).join("/")}`;
      const response = await fetch(signUrl, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ expiresIn: 3600 })
      });
      if (!response.ok) {
        throw new Error(`Sign download URL failed (${response.status})`);
      }
      const payload = rec3(await response.json().catch(() => ({})));
      const url = str3(payload.url ?? payload.signedUrl ?? payload.downloadUrl);
      if (!url) throw new Error("Signed URL missing from gateway response");
      return { url, expiresInSec: 3600 };
    },
    async authStatus() {
      return buildAuthStatus(false);
    },
    async startLogin(method = "device-code", params) {
      if (method === "host-injected") {
        return buildAuthStatus(true);
      }
      if (method === "apikey") {
        const envId = params?.envId;
        const apiKey = params?.apiKey;
        if (!envId || !apiKey) {
          return {
            signedIn: false,
            persisted: false,
            tempCredentialsAvailable: false,
            loginOptions: defaultLoginOptions(),
            message: "API Key \u767B\u5F55\u9700\u8981 envId \u4E0E apiKey"
          };
        }
        invalidateAuthCaches();
        const payload2 = await rawAuthCall({
          action: "login_by_api_key",
          envId,
          apiKey
        });
        const status2 = mapAuthPayload(payload2, await probeCredentials());
        notifyAuthListeners(status2);
        return status2;
      }
      const payload = await rawAuthCall({ action: "start_auth", authMode: "device" });
      const status = mapAuthPayload(payload, false);
      status.signedIn = false;
      if (payload.verification_uri_complete || payload.verificationUrl) {
        status.verificationUrl = str3(payload.verification_uri_complete ?? payload.verificationUrl ?? payload.url) ?? "";
        status.userCode = str3(payload.user_code ?? payload.userCode) ?? "";
        status.message = scrubInternalCodes(
          str3(payload.message) ?? "\u8BF7\u5728\u6D4F\u89C8\u5668\u5B8C\u6210 device-code \u6388\u6743"
        );
      }
      notifyAuthListeners(status);
      return status;
    },
    async startAuth() {
      return service.startLogin("device-code");
    },
    authStateChange(listener) {
      authListeners.add(listener);
      if (!authPollTimer) {
        authPollTimer = setInterval(() => {
          void buildAuthStatus(false).then(notifyAuthListeners);
        }, AUTH_FALLBACK_INTERVAL_MS);
      }
      void buildAuthStatus(false).then(listener);
      return () => {
        authListeners.delete(listener);
        if (authListeners.size === 0 && authPollTimer) {
          clearInterval(authPollTimer);
          authPollTimer = void 0;
        }
      };
    },
    async logout() {
      await rawAuthCall({ action: "logout", confirm: "yes" });
      invalidateAuthCaches();
      const status = {
        signedIn: false,
        persisted: false,
        tempCredentialsAvailable: false,
        loginOptions: defaultLoginOptions(),
        message: "\u5DF2\u9000\u51FA\u767B\u5F55"
      };
      notifyAuthListeners(status);
      return status;
    },
    async listEnvironments() {
      const payload = await callCapi("tcb", "DescribeEnvs", {});
      const candidates = arr2(
        payload.env_candidates ?? payload.envCandidates ?? payload.EnvList ?? payload.Envs
      );
      return candidates.map((item) => {
        const row = rec3(item);
        return {
          envId: str3(row.envId ?? row.EnvId ?? row.env_id) ?? "unknown",
          alias: str3(row.alias ?? row.Alias),
          region: str3(row.region ?? row.Region),
          status: str3(row.status ?? row.Status),
          envType: str3(row.env_type ?? row.envType ?? row.EnvType)
        };
      }).filter((item) => item.status === "NORMAL" || item.status === void 0);
    },
    async setEnvironment(envId) {
      const payload = await rawAuthCall({ action: "set_env", envId });
      const sessionId = getCurrentSessionId?.();
      const resolvedEnvId = str3(payload.envId ?? payload.EnvId) ?? envId;
      if (sessionEnvCache && sessionId) {
        sessionEnvCache.set(sessionId, resolvedEnvId);
        writeEnvHint(sessionEnvCache, sessionId, resolvedEnvId);
      }
      invalidateAuthCaches();
      const status = await buildAuthStatus(false);
      status.envId = resolvedEnvId;
      notifyAuthListeners(status);
      return status;
    },
    async appAuthConfig() {
      return service.getAuthLoginConfig();
    },
    async getAuthLoginConfig() {
      const envId = await requireEnvId();
      const payload = await callCapi("tcb", "DescribeAppAuth", { EnvId: envId }).catch(() => ({}));
      const providers = arr2(payload.Providers ?? payload.providers).map(
        (item) => {
          const row = rec3(item);
          const rawName = str3(row.ProviderType ?? row.type ?? row.name) ?? "unknown";
          return {
            name: providerLabel(rawName),
            enabled: Boolean(row.Status === "ENABLED" || row.enabled || row.Enable)
          };
        }
      );
      return { providers };
    },
    async metrics() {
      const names = [
        { metricName: "FunctionInvocation", label: "\u51FD\u6570\u8C03\u7528" },
        { metricName: "DbRead", label: "DB \u8BFB" },
        { metricName: "DbWrite", label: "DB \u5199" },
        { metricName: "FunctionError", label: "\u9519\u8BEF\u7387", danger: true }
      ];
      const envId = await resolveActiveEnvId();
      if (!envId) {
        return names.map((item) => ({
          name: item.metricName,
          label: item.label,
          valueLabel: "\u2014",
          points: [],
          danger: "danger" in item ? item.danger : false
        }));
      }
      const cached = resultCache.get(`metrics:${envId}`);
      if (cached) return cached;
      const end = /* @__PURE__ */ new Date();
      const start = new Date(end.getTime() - 24 * 3600 * 1e3);
      const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
      const series = [];
      for (const item of names) {
        try {
          const payload = await callCapi("tcb", "DescribeCurveData", {
            EnvId: envId,
            MetricName: item.metricName,
            StartTime: fmt(start),
            EndTime: fmt(end),
            Period: 3600
          });
          const points = extractPoints(payload);
          const latest = points[points.length - 1] ?? 0;
          series.push({
            name: item.metricName,
            label: item.label,
            valueLabel: formatMetricValue(latest, item.metricName),
            points,
            danger: "danger" in item ? item.danger : false
          });
        } catch {
          series.push({
            name: item.metricName,
            label: item.label,
            valueLabel: "\u2014",
            points: [],
            danger: "danger" in item ? item.danger : false
          });
        }
      }
      resultCache.set(`metrics:${envId}`, series);
      return series;
    },
    async usage() {
      const envId = await requireEnvId();
      const cached = resultCache.get(`usage:${envId}`);
      if (cached) return cached;
      const end = /* @__PURE__ */ new Date();
      const start = new Date(end.getFullYear(), end.getMonth(), 1);
      const fmtDate = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const payload = await callCapi("tcb", "DescribeUsage", {
        EnvId: envId,
        StartDate: fmtDate(start),
        EndDate: fmtDate(end)
      });
      const usages = arr2(payload.Usages ?? payload.modules ?? payload.usage ?? payload.items);
      if (usages.length > 0) {
        const items = usages.map((item) => {
          const row = rec3(item);
          const code = str3(row.Module ?? row.type ?? row.module ?? row.name) ?? "Other";
          const credits = num2(row.CreditsValue);
          const used = str3(row.used ?? row.usedLabel) ?? (credits !== void 0 ? `${credits} \u8D44\u6E90\u70B9` : stringifyUsage(row.usedValue ?? row.value));
          const quota = str3(row.quota ?? row.limit);
          return formatUsageItem(code, used, quota);
        });
        resultCache.set(`usage:${envId}`, items);
        return items;
      }
      const entries = Object.entries(rec3(payload)).filter(([key]) => ["FLEXDB", "TDSQL", "SCF", "EKS", "COS", "HOSTING", "Auth"].includes(key)).map(([key, value]) => formatUsageItem(key, stringifyUsage(value)));
      resultCache.set(`usage:${envId}`, entries);
      return entries;
    },
    async recentErrors() {
      try {
        const result = await service.searchLogs({ queryString: "log:ERROR", limit: 20, sort: "desc" });
        return result.entries.slice(0, 20);
      } catch (error) {
        return [
          {
            message: scrubInternalCodes(
              error instanceof Error ? error.message : String(error)
            ),
            level: "warn"
          }
        ];
      }
    },
    async checkLogService() {
      try {
        const envId = await requireEnvId();
        const end = /* @__PURE__ */ new Date();
        await callCapi("tcb", "SearchClsLog", {
          EnvId: envId,
          QueryString: "*",
          Limit: 1,
          StartTime: formatClsTime(new Date(end.getTime() - 36e5)),
          EndTime: formatClsTime(end),
          Sort: "desc"
        });
        return true;
      } catch (error) {
        if (isClsUnavailableError(error)) return false;
        return false;
      }
    },
    async searchLogs(opts) {
      const envId = await requireEnvId();
      const end = /* @__PURE__ */ new Date();
      const start = new Date(end.getTime() - 4 * 36e5);
      try {
        const payload = await callCapi("tcb", "SearchClsLog", {
          EnvId: envId,
          QueryString: opts.queryString || "*",
          StartTime: toClsTime(opts.startTime, start),
          EndTime: toClsTime(opts.endTime, end),
          Limit: Math.min(opts.limit ?? 50, 100),
          Context: opts.context,
          Sort: opts.sort ?? "desc"
        });
        const envelope = `${str3(payload.message) ?? ""} ${JSON.stringify(payload)}`;
        if (payload.success === false || isClsUnavailableError(envelope)) {
          throw new Error(str3(payload.message) ?? CLS_UNAVAILABLE_MESSAGE);
        }
        const logResults = rec3(payload.LogResults ?? payload.logResults);
        const logs = arr2(
          logResults.Results ?? logResults.results ?? payload.Results ?? payload.logs ?? payload.items
        );
        const contextOut = str3(logResults.Context ?? logResults.context ?? payload.Context ?? payload.context);
        return {
          entries: logs.map((item, index) => mapLogEntry(item, index)),
          context: contextOut
        };
      } catch (error) {
        if (isClsUnavailableError(error)) {
          throw new Error(CLS_UNAVAILABLE_MESSAGE);
        }
        throw error;
      }
    },
    async getTableSchema(schemaTable) {
      const qualified = schemaTable.includes(".") ? schemaTable : `public.${schemaTable}`;
      const [colPayload, idxPayload, fkPayload, rlsPayload, policyPayload] = await Promise.all([
        executePgSql(sqlTableColumns(qualified)),
        executePgSql(sqlListIndexes(qualified)),
        executePgSql(sqlTableForeignKeys(qualified)),
        executePgSql(sqlTableRlsStatus(qualified)),
        executePgSql(sqlListSchemaPolicies(qualified.split(".")[0] ?? "public"))
      ]);
      const colRows = parseSqlRows(colPayload);
      const columns = colRows.map((row) => ({
        name: str3(row.column_name) ?? "unknown",
        type: str3(row.data_type) ?? "unknown",
        dataType: str3(row.data_type) ?? "unknown",
        nullable: str3(row.is_nullable)?.toUpperCase() === "YES",
        isUpdatable: true,
        primaryKey: Boolean(row.is_pk)
      }));
      const mapped = mapSchemaColumns({
        columns,
        primaryKey: columns.filter((c) => c.primaryKey).map((c) => c.name),
        kind: "table"
      });
      const rlsRow = parseSqlRows(rlsPayload)[0] ?? {};
      const tableName = qualified.split(".")[1] ?? qualified;
      const schemaName = qualified.split(".")[0] ?? "public";
      const policiesRaw = parseSqlRows(policyPayload).filter(
        (p) => str3(p.tablename) === tableName && str3(p.schemaname) === schemaName
      );
      return {
        schemaTable: qualified,
        kind: "table",
        rowCount: null,
        columns: mapped,
        primaryKey: mapped.filter((c) => c.primaryKey).map((c) => c.name),
        indexes: parseSqlRows(idxPayload).map((row) => ({
          name: str3(row.indexname) ?? "index",
          definition: str3(row.indexdef) ?? ""
        })),
        foreignKeys: parseSqlRows(fkPayload).map((row) => ({
          constraintName: str3(row.constraint_name) ?? "",
          columnName: str3(row.column_name) ?? "",
          references: str3(row.references) ?? "",
          referencedColumn: str3(row.referenced_column) ?? ""
        })),
        security: {
          rowLevelSecurityEnabled: Boolean(rlsRow.rls_enabled),
          forceRowLevelSecurity: Boolean(rlsRow.force_rls),
          policies: policiesRaw.map(mapPolicyRow)
        }
      };
    },
    async listSchemaPolicies(schema = "public") {
      const payload = await executePgSql(sqlListSchemaPolicies(schema));
      return parsePolicyRows(payload);
    },
    async listSchemas() {
      const payload = await executePgSql(sqlListSchemas());
      return parseSqlRows(payload).map((row) => ({
        name: str3(row.name) ?? "unknown",
        owner: str3(row.owner)
      }));
    },
    async listTriggers(schema = "public") {
      const payload = await executePgSql(sqlListTriggers(schema));
      return parseSqlRows(payload).map((row) => ({
        schema: str3(row.schema) ?? schema,
        table: str3(row.table_name) ?? "",
        name: str3(row.name) ?? "unknown",
        definition: str3(row.definition)
      }));
    },
    async listTypes(schema = "public") {
      const payload = await executePgSql(sqlListTypes(schema));
      return parseSqlRows(payload).map((row) => ({
        schema: str3(row.schema) ?? schema,
        name: str3(row.name) ?? "unknown",
        definition: str3(row.definition)
      }));
    },
    async listColumnPrivileges(schemaTable) {
      const payload = await executePgSql(
        sqlListColumnPrivileges(schemaTable.includes(".") ? schemaTable : `public.${schemaTable}`)
      );
      return parseSqlRows(payload).map((row) => ({
        grantee: str3(row.grantee) ?? "",
        columnName: str3(row.column_name) ?? "",
        privilegeType: str3(row.privilege_type) ?? ""
      }));
    },
    async runPgDDL(sql, confirm) {
      if (!confirm) {
        throw new Error("runPgDDL \u9700\u8981 confirm=true");
      }
      const payload = await executePgSqlWithDdlRetry(sql);
      return {
        ok: payload.error === void 0 && payload.Error === void 0,
        message: str3(payload.message) ?? "OK"
      };
    },
    async upsertPolicy(input, confirm) {
      const sql = input.previousName ? sqlAlterPolicy(input) : sqlCreatePolicy(input);
      await service.runPgDDL(sql, confirm);
    },
    async dropPolicy(schemaTable, policyName, confirm) {
      await service.runPgDDL(sqlDropPolicy(schemaTable, policyName), confirm);
    },
    async toggleTableRls(schemaTable, enable, confirm) {
      await service.runPgDDL(sqlToggleRLS(schemaTable, enable), confirm);
    },
    async listPgFunctions(schema = "public") {
      const payload = await executePgSql(sqlListFunctions(schema));
      return parseSqlRows(payload).map((row) => ({
        schema: str3(row.schema) ?? schema,
        name: str3(row.name) ?? "unknown",
        returnType: str3(row.return_type),
        language: str3(row.language)
      }));
    },
    async listPgExtensions() {
      const payload = await executePgSql(sqlListExtensions());
      return parseSqlRows(payload).map((row) => ({
        name: str3(row.name) ?? "unknown",
        schema: str3(row.schema),
        version: str3(row.version)
      }));
    },
    async listPgRoles() {
      const payload = await executePgSql(sqlListRoles());
      return parseSqlRows(payload).map((row) => ({
        name: str3(row.name) ?? "unknown",
        superuser: Boolean(row.superuser),
        canLogin: Boolean(row.can_login)
      }));
    },
    async listMigrations() {
      try {
        const payload = await executePgSql(sqlListMigrations());
        return parseSqlRows(payload).map((row) => ({
          version: str3(row.version) ?? "unknown",
          name: str3(row.name),
          appliedAt: str3(row.applied_at)
        }));
      } catch {
        return [];
      }
    },
    async listPgMigrations() {
      return service.listMigrations();
    },
    async listGatewayRoutes() {
      const envId = await requireEnvId();
      const payload = await callCapi("tcb", "DescribeHTTPServiceRoute", {
        EnvId: envId,
        Filters: [{ Name: "DomainType", Values: ["HTTPSERVICE"] }],
        Offset: 0,
        Limit: 100
      });
      const domains = arr2(payload.Domains ?? payload.domains);
      const routes = [];
      for (const domainEntry of domains) {
        const domainRow = rec3(domainEntry);
        const domain = str3(domainRow.Domain ?? domainRow.domain) ?? "";
        for (const route of arr2(domainRow.Routes ?? domainRow.routes)) {
          routes.push(mapGatewayRoute(route, domain));
        }
      }
      return routes;
    },
    async upsertGatewayRoute(input) {
      const envId = await requireEnvId();
      if (input.routeId) {
        await callCapi("tcb", "ModifyHTTPServiceRoute", {
          EnvId: envId,
          Domain: input.domain,
          Routes: [
            {
              Path: input.path,
              UpstreamResourceType: input.upstreamResourceType,
              UpstreamResourceName: input.upstreamResourceName,
              EnableAuth: input.enableAuth,
              EnablePathTransmission: input.enablePathTransmission,
              Enable: input.enable ?? true
            }
          ]
        });
        return;
      }
      await callCapi("tcb", "CreateHTTPServiceRoute", {
        EnvId: envId,
        Domain: {
          Domain: input.domain,
          Routes: [
            {
              Path: input.path,
              UpstreamResourceType: input.upstreamResourceType,
              UpstreamResourceName: input.upstreamResourceName,
              EnableAuth: input.enableAuth,
              EnablePathTransmission: input.enablePathTransmission,
              Enable: input.enable ?? true
            }
          ]
        }
      });
    },
    async deleteGatewayRoute(routeId, confirm) {
      if (!confirm) throw new Error("deleteGatewayRoute \u9700\u8981 confirm=true");
      const envId = await requireEnvId();
      const routes = await service.listGatewayRoutes();
      const target = routes.find((r) => r.routeId === routeId) ?? routes.find((r) => gatewayRouteKey(r.domain, r.path) === routeId);
      if (!target) throw new Error(`Route ${routeId} not found`);
      await callCapi("tcb", "DeleteHTTPServiceRoute", {
        EnvId: envId,
        Domain: target.domain,
        Paths: [target.path]
      });
    },
    async getGatewayPrivilege() {
      const envId = await requireEnvId();
      const payload = await callCapi("tcb", "DescribeCloudBaseGWService", {
        ServiceId: envId,
        EnableRegion: true,
        EnableUnion: true
      });
      return {
        enableService: Boolean(payload.EnableService ?? payload.enableService),
        enableAuth: Boolean(payload.EnableAuth ?? payload.enableAuth)
      };
    },
    async listCustomDomains() {
      const envId = await requireEnvId();
      const payload = await callCapi("tcb", "DescribePublicGwDomains", { EnvId: envId });
      return arr2(payload.Domains ?? payload.domains).map((item) => {
        const row = rec3(item);
        return {
          domain: str3(row.Domain ?? row.domain) ?? "",
          status: str3(row.Status ?? row.status)?.toLowerCase() === "ok" ? "ok" : "binding",
          accessType: str3(row.AccessType ?? row.accessType),
          certificateId: str3(row.CertId ?? row.certificateId),
          cnameTarget: str3(row.CNAMEDomain ?? row.cnameTarget),
          createdAt: str3(row.CreateTime ?? row.createdAt)
        };
      });
    },
    async listGatewayDomains() {
      const domains = await service.listCustomDomains();
      return domains.map((d) => d.domain).filter(Boolean);
    },
    async bindCustomDomain(input) {
      const envId = await requireEnvId();
      await callCapi("tcb", "CreatePublicGwCustomDomain", {
        EnvId: envId,
        CustomDomain: input.domain,
        CertId: input.certId,
        CNAMEDomain: input.cnameDomain,
        Desc: input.description
      }).catch(
        async () => callCapi("tcb", "BindPublicGwCustomDomain", {
          EnvId: envId,
          CustomDomain: input.domain,
          CertId: input.certId,
          CNAMEDomain: input.cnameDomain
        })
      );
    },
    async deleteCustomDomain(domain, confirm) {
      if (!confirm) throw new Error("deleteCustomDomain \u9700\u8981 confirm=true");
      const envId = await requireEnvId();
      await callCapi("tcb", "UnbindPublicGwCustomDomain", {
        EnvId: envId,
        CustomDomain: domain
      });
    },
    async listSafetyDomains() {
      const envId = await requireEnvId();
      const payload = await callCapi("tcb", "DescribeSafetySource", {
        EnvId: envId,
        Offset: 0,
        Limit: 100
      });
      return arr2(payload.Sources ?? payload.sources ?? payload.items).map((item) => {
        const row = rec3(item);
        return {
          id: str3(row.ItemId ?? row.id) ?? "",
          appName: str3(row.AppName ?? row.appName) ?? ""
        };
      });
    },
    async getStorageSecurityRules(bucketName) {
      const envId = await requireEnvId();
      const bucket = bucketName ?? await resolveDefaultBucket(envId);
      if (!bucket) return { aclTag: "PRIVATE", rule: void 0 };
      const payload = await callCapi("tcb", "DescribeStorageSafeRule", {
        EnvId: envId,
        Bucket: bucket
      });
      return {
        aclTag: str3(payload.AclTag ?? payload.aclTag) ?? "PRIVATE",
        rule: str3(payload.Rule ?? payload.rule)
      };
    },
    async setStorageSecurityRules(rules) {
      const envId = await requireEnvId();
      const bucket = rules.bucket ?? await resolveDefaultBucket(envId);
      if (!bucket) throw new Error("\u65E0\u6CD5\u89E3\u6790\u5B58\u50A8 Bucket");
      await callCapi("tcb", "ModifyStorageSafeRule", {
        EnvId: envId,
        Bucket: bucket,
        AclTag: rules.aclTag,
        Rule: rules.rule
      });
    },
    async listCdnCacheConfig(bucketName) {
      const envId = await requireEnvId();
      const bucket = bucketName ?? await resolveDefaultBucket(envId);
      if (!bucket) return { status: "unknown" };
      const payload = await callCapi("tcb", "DescribeCDNChainTask", {
        EnvId: envId,
        Bucket: bucket
      }).catch(() => ({}));
      return {
        status: str3(payload.Status ?? payload.status) ?? "unknown"
      };
    },
    async getStorageCustomDomains() {
      const envId = await requireEnvId();
      const payload = await callCapi("tcb", "DescribeHostingDomain", {
        EnvId: envId
      }).catch(() => ({}));
      return arr2(payload.DomainSet ?? payload.Domains ?? payload.domains).map((item) => {
        const row = rec3(item);
        return {
          domain: str3(row.Domain ?? row.domain) ?? "",
          status: str3(row.Status ?? row.status)
        };
      });
    },
    async listFunctionNames() {
      const envId = await requireEnvId();
      const payload = await callCapi("tcb", "ListFunctions", { EnvId: envId, Limit: 100, Offset: 0 });
      return arr2(payload.Functions ?? payload.functions).map((item) => str3(rec3(item).FunctionName ?? rec3(item).Name)).filter((value) => Boolean(value));
    },
    async listFunctions(opts) {
      const envId = await requireEnvId();
      try {
        const payload = await callCapi("tcb", "ListFunctions", {
          EnvId: envId,
          Limit: opts?.limit ?? 100,
          Offset: opts?.offset ?? 0,
          ...opts?.searchKey ? { SearchKey: opts.searchKey } : {}
        });
        return arr2(payload.Functions ?? payload.functions).map(mapFunctionSummary).filter((item) => Boolean(item));
      } catch (err) {
        if (/backend not found/i.test(err instanceof Error ? err.message : String(err))) {
          return [];
        }
        throw err;
      }
    },
    async getFunction(name2) {
      const envId = await requireEnvId();
      try {
        const payload = await callCapi("tcb", "GetFunction", {
          EnvId: envId,
          FunctionName: name2,
          Namespace: envId
        });
        return mapFunctionDetail(payload, name2);
      } catch {
        const payload = await callCapi("tcb", "GetFunction", {
          EnvId: envId,
          FunctionName: name2
        });
        return mapFunctionDetail(payload, name2);
      }
    },
    async listFunctionTriggers(name2) {
      const envId = await requireEnvId();
      const detail = await service.getFunction(name2);
      if (detail.triggers.length > 0) return detail.triggers;
      try {
        const payload = await callCapi("scf", "ListTriggers", {
          FunctionName: name2,
          Namespace: envId
        });
        return arr2(payload.Triggers ?? payload.triggers).map(mapFunctionTrigger).filter((item) => Boolean(item));
      } catch {
        return [];
      }
    },
    async listFunctionLogs(name2, opts) {
      const envId = await requireEnvId();
      try {
        const payload = await callCapi("tcb", "GetFunctionLogs", {
          EnvId: envId,
          FunctionName: name2,
          Limit: opts?.limit ?? 20,
          Offset: 0
        });
        return arr2(payload.Data ?? payload.Logs ?? payload.logs).map(mapFunctionLog).filter((item) => Boolean(item));
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (!FN_LOGS_CLS_FALLBACK.test(message)) throw error;
        const cls = await service.searchLogs({
          queryString: `functionName:${name2}`,
          service: "tcb",
          limit: opts?.limit ?? 20
        });
        return cls.entries.map((entry) => ({
          requestId: entry.id,
          time: entry.time,
          message: entry.message
        }));
      }
    },
    async invokeFunction(name2, payload) {
      const envId = await requireEnvId();
      const eventPayload = payload?.trim() || "{}";
      try {
        JSON.parse(eventPayload);
      } catch {
        throw new Error("Payload must be valid JSON");
      }
      const result = await callCapi("scf", "Invoke", {
        FunctionName: name2,
        Namespace: envId,
        ClientContext: "",
        LogType: "Tail",
        Qualifier: "$LATEST",
        Event: eventPayload
      });
      const ret = rec3(result.Result ?? result);
      const msg = str3(ret.RetMsg ?? ret.retMsg) ?? JSON.stringify(result);
      const log = str3(result.LogResult ?? result.Log ?? ret.Log);
      return { result: log ? `${msg}

--- Log ---
${log}` : msg };
    },
    async listCloudRunServices() {
      const envId = await requireEnvId();
      const payload = await callCapi("tcbr", "DescribeCloudRunServers", { EnvId: envId });
      return arr2(payload.ServerList ?? payload.serverList).map(mapCloudRunService).filter((item) => Boolean(item));
    },
    async getCloudRunService(name2) {
      const envId = await requireEnvId();
      const payload = await callCapi("tcbr", "DescribeCloudRunServerDetail", {
        EnvId: envId,
        ServerName: name2
      });
      const service2 = mapCloudRunService(payload.ServerBaseInfo ?? payload.Server ?? payload) ?? {
        name: name2
      };
      const versions = arr2(
        payload.VersionItems ?? payload.Versions ?? rec3(payload.ServerBaseInfo).VersionItems
      ).map(mapCloudRunVersion).filter((item) => Boolean(item));
      return { service: service2, versions };
    },
    async listCloudRunDeployRecords(name2) {
      const envId = await requireEnvId();
      const payload = await callCapi("tcbr", "DescribeCloudRunDeployRecord", {
        EnvId: envId,
        ServerName: name2
      });
      return arr2(payload.DeployRecord ?? payload.Records ?? payload.DeployRecords).map(mapCloudRunDeploy).filter((item) => Boolean(item));
    },
    async getCloudRunProcessLog(name2, runId) {
      const envId = await requireEnvId();
      let resolvedRunId = runId;
      if (!resolvedRunId) {
        const records = await service.listCloudRunDeployRecords(name2);
        resolvedRunId = records[0]?.runId;
      }
      if (!resolvedRunId) return [];
      const payload = await callCapi("tcbr", "DescribeCloudRunProcessLog", {
        EnvId: envId,
        ServerName: name2,
        RunId: resolvedRunId
      });
      return arr2(payload.Logs ?? payload.logs ?? payload.Log).map(mapCloudRunLogLine);
    },
    async getCloudRunBuildLog(name2, buildId) {
      const envId = await requireEnvId();
      try {
        const payload = await callCapi("tcbr", "DescribeCloudRunBuildLog", {
          EnvId: envId,
          ServerName: name2,
          ...buildId ? { BuildId: buildId } : {}
        });
        const text = str3(rec3(payload.Log).Text) ?? str3(payload.Text) ?? JSON.stringify(payload);
        return { text };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { text: "", unsupportedReason: /CODING|qcloud user/i.test(message) ? BUILD_LOG_CODING : message };
      }
    },
    async listHostingDomains() {
      const envId = await requireEnvId();
      const domains = [];
      try {
        const hosting = await callCapi("tcb", "DescribeHostingDomain", { EnvId: envId });
        for (const item of arr2(hosting.DomainSet ?? hosting.Domains)) {
          domains.push(mapHostingDomain(item, "custom"));
        }
        if (str3(hosting.DefaultDomain)) {
          domains.push({ domain: str3(hosting.DefaultDomain), kind: "default", status: "online" });
        }
      } catch {
      }
      try {
        const env = await describeEnvRecord(envId);
        for (const item of arr2(env.StaticStorages ?? env.staticStorages)) {
          domains.push(mapHostingDomain(item, "default"));
        }
      } catch {
      }
      try {
        const apps = await callCapi("tcb", "DescribeCloudAppList", {
          EnvId: envId,
          DeployType: "static-hosting",
          PageNo: 1,
          PageSize: 50
        });
        for (const item of arr2(apps.ServiceList ?? apps.apps)) {
          domains.push(mapHostingDomain(item, "app"));
        }
      } catch {
      }
      const seen = /* @__PURE__ */ new Set();
      return domains.filter((item) => {
        if (!item?.domain || seen.has(item.domain)) return false;
        seen.add(item.domain);
        return true;
      });
    },
    async listHostingVersions() {
      const envId = await requireEnvId();
      const records = [];
      const apps = await callCapi("tcb", "DescribeCloudAppList", {
        EnvId: envId,
        DeployType: "static-hosting",
        PageNo: 1,
        PageSize: 50
      }).catch(() => ({}));
      for (const app of arr2(apps.ServiceList ?? apps.apps)) {
        const serviceName = str3(rec3(app).ServiceName ?? rec3(app).serviceName);
        if (!serviceName) continue;
        try {
          const versions = await callCapi("tcb", "DescribeCloudAppVersionList", {
            EnvId: envId,
            DeployType: "static-hosting",
            ServiceName: serviceName,
            PageNo: 1,
            PageSize: 20
          });
          for (const version of arr2(versions.VersionList ?? versions.versions)) {
            records.push(mapHostingVersion(serviceName, version));
          }
        } catch {
        }
      }
      return records.filter((item) => Boolean(item));
    },
    async listStorageBuckets() {
      if (await isPostgresEnv()) {
        const payload = await executePgSql(
          "SELECT id, name, public, created_at FROM storage.buckets ORDER BY created_at DESC NULLS LAST;"
        );
        return parseSqlRows(payload).map(
          (row) => mapStorageBucket(
            {
              Name: str3(row.id ?? row.name),
              CreateTime: str3(row.created_at)
            },
            "storage"
          )
        ).filter((item) => Boolean(item));
      }
      const envId = await requireEnvId();
      const env = await describeEnvRecord(envId);
      return arr2(env.Storages ?? env.storages).map((item) => mapStorageBucket(item, "storage")).filter((item) => Boolean(item));
    },
    async listHostingObjects(prefix) {
      const envId = await requireEnvId();
      const store = await callCapi("tcb", "DescribeStaticStore", { EnvId: envId }).catch(
        () => ({})
      );
      const stores = arr2(store.Data ?? store.data ?? store.StaticStoreInfo ?? store.staticStoreInfo);
      const first = rec3(stores[0] ?? {});
      const bucket = str3(first.Bucket ?? first.bucket);
      const region = str3(first.Region ?? first.region);
      if (!bucket || !region) return [];
      const credPayload = await rawAuthCall({
        action: "get_temp_credentials",
        confirm: "yes",
        reveal: true
      });
      const cred = rec3(credPayload.credentials ?? credPayload);
      const secretId = str3(cred.secretId ?? cred.SecretId);
      const secretKey = str3(cred.secretKey ?? cred.SecretKey);
      const token = str3(cred.token ?? cred.Token ?? cred.sessionToken ?? cred.SessionToken);
      if (!secretId || !secretKey || !token) {
        throw new Error("\u5F53\u524D\u767B\u5F55\u6001\u4E0D\u652F\u6301\u5BFC\u51FA\u4E34\u65F6\u5BC6\u94A5\uFF0C\u65E0\u6CD5\u5217\u51FA\u6258\u7BA1\u6587\u4EF6");
      }
      const cleanPrefix = (prefix ?? "").replace(/^\//, "");
      const xml = await cosListObjects({
        bucket,
        region,
        params: {
          "delimiter": "/",
          "encoding-type": "url",
          "max-keys": "1000",
          "prefix": cleanPrefix
        },
        secretId,
        secretKey,
        token
      });
      return parseCosListObjectsXml(xml, cleanPrefix);
    },
    async listCdnCacheItems(bucketName) {
      const envId = await requireEnvId();
      const bucket = await resolveDefaultBucket(envId, bucketName);
      if (!bucket) return [];
      const payload = await callCapi("tcb", "DescribeCDNChainTask", {
        EnvId: envId,
        Bucket: bucket
      }).catch(() => ({}));
      return [mapCdnCacheItem(payload, bucket)];
    },
    async createStorageBucket(name2, opts) {
      const trimmed = name2.trim();
      if (!trimmed || !/^[a-z0-9][a-z0-9_-]*$/i.test(trimmed)) {
        throw new Error("Invalid bucket name");
      }
      if (await isPostgresEnv()) {
        const escaped = escapeSqlLiteral(trimmed);
        const publicFlag = opts?.public ? "true" : "false";
        await executePgSqlWithDdlRetry(
          `INSERT INTO storage.buckets (id, name, public) VALUES ('${escaped}', '${escaped}', ${publicFlag});`
        );
        return;
      }
      throw new Error("\u8BE5\u73AF\u5883\u4E0D\u652F\u6301\u521B\u5EFA\u5B58\u50A8\u6876");
    },
    async deleteStorageBucket(name2, confirm) {
      if (!confirm) throw new Error("deleteStorageBucket requires confirm=true");
      if (await isPostgresEnv()) {
        const escaped = escapeSqlLiteral(name2.trim());
        await executePgSqlWithDdlRetry(`DELETE FROM storage.buckets WHERE id = '${escaped}';`);
        return;
      }
      throw new Error("\u8BE5\u73AF\u5883\u4E0D\u652F\u6301\u5220\u9664\u5B58\u50A8\u6876");
    },
    async listSslCertificates() {
      try {
        const payload = await callCapi("ssl", "DescribeCertificates", { Offset: 0, Limit: 100 });
        return arr2(payload.Certificates ?? payload.certificates).map((item) => {
          const row = rec3(item);
          return {
            id: str3(row.CertificateId ?? row.certificateId ?? row.Id) ?? "",
            name: str3(row.Alias ?? row.Domain ?? row.domain) ?? "",
            status: str3(row.Status ?? row.status)
          };
        });
      } catch {
        return [];
      }
    },
    async listAuthDomains() {
      const envId = await requireEnvId();
      const payload = await callCapi("tcb", "DescribeAuthDomains", { EnvId: envId }).catch(
        () => ({})
      );
      return arr2(payload.Domains ?? payload.AuthDomains ?? payload.domains).map((item) => {
        const row = rec3(item);
        return {
          domain: str3(row.Domain ?? row.domain) ?? "",
          id: str3(row.Id ?? row.id),
          status: str3(row.Status ?? row.status)
        };
      });
    },
    async deleteAuthDomain(domainId, confirm) {
      if (!confirm) throw new Error("deleteAuthDomain \u9700\u8981 confirm=true");
      const envId = await requireEnvId();
      await callCapi("tcb", "DeleteAuthDomain", {
        EnvId: envId,
        DomainIds: [domainId]
      });
    },
    async setGatewayServiceEnabled(enable) {
      const envId = await requireEnvId();
      await callCapi("tcb", "ModifyCloudBaseGWPrivilege", {
        ServiceId: envId,
        EnableService: enable
      });
    },
    async setGatewayAuthEnabled(enable) {
      const envId = await requireEnvId();
      await callCapi("tcb", "ModifyCloudBaseGWPrivilege", {
        ServiceId: envId,
        EnableService: enable,
        Options: [{ Key: "authswitch", Value: enable ? "true" : "false" }]
      });
    },
    async fetchMetricSeries(metricName, opts) {
      const labels = {
        FunctionInvocation: "\u51FD\u6570\u8C03\u7528",
        DbRead: "DB \u8BFB",
        DbWrite: "DB \u5199",
        FunctionError: "\u9519\u8BEF\u7387"
      };
      const envId = await resolveActiveEnvId();
      if (!envId) {
        return {
          name: metricName,
          label: labels[metricName] ?? metricName,
          valueLabel: "\u2014",
          points: [],
          danger: metricName === "FunctionError"
        };
      }
      try {
        const payload = await callCapi("tcb", "DescribeCurveData", {
          EnvId: envId,
          MetricName: metricName,
          StartTime: opts?.startTime,
          EndTime: opts?.endTime,
          Period: opts?.period ?? 3600
        });
        const points = extractPoints(payload);
        const latest = points[points.length - 1] ?? 0;
        return {
          name: metricName,
          label: labels[metricName] ?? metricName,
          valueLabel: formatMetricValue(latest, metricName),
          points,
          danger: metricName === "FunctionError"
        };
      } catch {
        return {
          name: metricName,
          label: labels[metricName] ?? metricName,
          valueLabel: "\u2014",
          points: [],
          danger: metricName === "FunctionError"
        };
      }
    },
    async envInfo() {
      const auth = await rawAuthCall({ action: "status" }).catch(() => ({}));
      const activeEnvId = str3(auth.current_env_id ?? auth.currentEnvId) ?? "";
      const cached = resultCache.get(`envInfo:${activeEnvId}`);
      if (cached) return cached;
      let env = {};
      if (activeEnvId) {
        const info2 = await callCapi("tcb", "DescribeEnvs", { EnvId: activeEnvId });
        env = rec3(arr2(info2.EnvList)[0]);
      }
      const envId = str3(env.EnvId ?? env.envId) ?? activeEnvId;
      let functionCount = 0;
      if (envId) {
        try {
          const fn = await callCapi("tcb", "ListFunctions", { EnvId: envId, Limit: 100, Offset: 0 });
          functionCount = arr2(fn.Functions ?? fn.functions).length;
        } catch {
          functionCount = 0;
        }
      }
      let hostingDomainCount = 0;
      if (envId) {
        try {
          const hosting = await callCapi("tcb", "DescribeHostingDomain", { EnvId: envId });
          const domains = arr2(hosting.DomainSet ?? hosting.Domains ?? hosting.domains);
          const staticCount = arr2(env.StaticStorages ?? env.staticStorages).length;
          hostingDomainCount = domains.length || staticCount || (str3(hosting.DefaultDomain) ? 1 : 0);
        } catch {
          hostingDomainCount = 0;
        }
      }
      let runtimeMode = deriveRuntimeMode(env);
      let isPg = envIsPostgres(env);
      if (!isPg && envId) {
        try {
          await callCapi("tcb", "ExecutePGSql", { EnvId: envId, Sql: "SELECT 1 AS probe" });
          isPg = true;
          runtimeMode = "postgresql";
        } catch {
        }
      }
      const info = {
        envId,
        regionLabel: mapRegion(str3(env.Region ?? env.region)),
        regionCode: str3(env.Region ?? env.region),
        functionCount,
        hostingDomainCount,
        timezone: str3(env.Timezone) ?? "Asia/Shanghai",
        alias: str3(env.Alias ?? env.alias),
        runtimeMode,
        isPostgresEnv: isPg
      };
      resultCache.set(`envInfo:${activeEnvId}`, info);
      return info;
    },
    async appendToSession(text) {
      if (!appendUserMessage) {
        throw new Error("\u5F53\u524D\u4F1A\u8BDD\u672A\u66B4\u9732 append \u901A\u9053\uFF0C\u8BF7\u76F4\u63A5\u5728\u5BF9\u8BDD\u6846\u53D1\u9001\u8BE5\u6307\u4EE4");
      }
      await appendUserMessage(text);
    },
    async capi(service2, action, params = {}) {
      return callCapi(service2, action, params);
    },
    async listAccessEndpoints() {
      const endpoints = [];
      let envId;
      try {
        envId = await requireEnvId();
      } catch {
        return endpoints;
      }
      const seen = /* @__PURE__ */ new Set();
      const pushEndpoint = (endpoint) => {
        if (seen.has(endpoint.url)) return;
        seen.add(endpoint.url);
        endpoints.push(endpoint);
      };
      try {
        const listPayload = await callCapi("tcb", "DescribeCloudAppList", {
          EnvId: envId,
          DeployType: "static-hosting",
          PageNo: 1,
          PageSize: 100
        });
        const apps = arr2(listPayload.ServiceList ?? listPayload.apps);
        for (const app of apps) {
          const row = rec3(app);
          const serviceName = str3(row.ServiceName ?? row.serviceName);
          const domain = str3(row.Domain ?? row.domain);
          if (serviceName && domain) {
            pushEndpoint({
              id: `app:${serviceName}`,
              label: serviceName,
              url: normalizeUrl(domain),
              resourceType: "app",
              serviceName
            });
          }
        }
      } catch {
      }
      try {
        const hosting = await callCapi("tcb", "DescribeHostingDomain", { EnvId: envId });
        const defaultDomain = str3(hosting.DefaultDomain ?? hosting.defaultDomain);
        if (defaultDomain) {
          pushEndpoint({
            id: "hosting:default",
            label: "\u9759\u6001\u6258\u7BA1",
            url: normalizeUrl(defaultDomain),
            resourceType: "hosting"
          });
        }
      } catch {
      }
      try {
        const envPayload = await callCapi("tcb", "DescribeEnvs", { EnvId: envId });
        const env = rec3(arr2(envPayload.EnvList)[0]);
        for (const store of arr2(env.StaticStorages ?? env.staticStorages)) {
          const row = rec3(store);
          const domain = str3(row.StaticDomain ?? row.staticDomain ?? row.Domain ?? row.domain);
          if (domain) {
            pushEndpoint({
              id: `hosting:${domain}`,
              label: "\u9759\u6001\u6258\u7BA1",
              url: normalizeUrl(domain),
              resourceType: "hosting"
            });
          }
        }
      } catch {
      }
      return endpoints;
    },
    async listDeployments() {
      const records = [];
      let envId;
      try {
        envId = await requireEnvId();
      } catch {
        return records;
      }
      try {
        const listPayload = await callCapi("tcb", "DescribeCloudAppList", {
          EnvId: envId,
          DeployType: "static-hosting",
          PageNo: 1,
          PageSize: 50
        });
        const apps = arr2(listPayload.ServiceList ?? listPayload.apps);
        for (const app of apps) {
          const row = rec3(app);
          const serviceName = str3(row.ServiceName ?? row.serviceName);
          if (!serviceName) continue;
          const previewUrl = str3(row.Domain ?? row.domain) ? normalizeUrl(str3(row.Domain ?? row.domain)) : void 0;
          try {
            const versionsPayload = await callCapi("tcb", "DescribeCloudAppVersionList", {
              EnvId: envId,
              DeployType: "static-hosting",
              ServiceName: serviceName,
              PageNo: 1,
              PageSize: 10
            });
            const versions = arr2(versionsPayload.VersionList ?? versionsPayload.versions);
            for (const version of versions) {
              const mapped = mapVersionToDeployment(serviceName, version, previewUrl);
              if (mapped) records.push(mapped);
            }
          } catch {
          }
        }
      } catch {
      }
      return sortDeploymentsNewestFirst(records);
    },
    async rollbackDeployment(_record) {
      return false;
    },
    async sessionBoundEnv(sessionId) {
      const session = getSession?.(sessionId);
      const events = session?.events;
      if (!events) return void 0;
      for (let index = events.length - 1; index >= 0; index -= 1) {
        const event = events[index];
        if (!event || event.type !== "tool/call") continue;
        const data = event.data ?? {};
        if (!str3(data.name)?.includes("auth")) continue;
        try {
          const args = JSON.parse(data.arguments ?? "{}");
          if (args.action === "set_env" && typeof args.envId === "string") {
            return args.envId;
          }
        } catch {
        }
      }
      return void 0;
    }
  };
  if (typeof bridge.onEnvChanged === "function") {
    bridge.onEnvChanged((envId) => {
      invalidateAuthCaches();
      void buildAuthStatus(false).then((status) => {
        status.envId = envId;
        notifyAuthListeners(status);
      }).catch(() => {
      });
    });
  }
  return service;
}
function parseLogContentFields(row) {
  const contentRaw = row.Content ?? row.content ?? row.Logs ?? row.logs;
  if (typeof contentRaw === "string") {
    const trimmed = contentRaw.trim();
    if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (parsed !== null && typeof parsed === "object" && !Array.isArray(parsed)) {
          return rec3(parsed);
        }
      } catch {
      }
    }
    return {};
  }
  if (contentRaw !== null && typeof contentRaw === "object" && !Array.isArray(contentRaw)) {
    return rec3(contentRaw);
  }
  return {};
}
function mapLogEntry(item, index) {
  const row = rec3(item);
  const contentFields = parseLogContentFields(row);
  const merged = { ...contentFields, ...row };
  const message = scrubInternalCodes(
    str3(
      merged.log ?? merged.message ?? merged.Msg ?? merged.topic ?? (typeof merged.Content === "string" && !merged.Content.trim().startsWith("{") ? merged.Content : void 0) ?? (typeof merged.content === "string" && !merged.content.trim().startsWith("{") ? merged.content : void 0) ?? contentFields.path ?? contentFields.logType ?? (typeof row.Content === "string" ? row.Content : void 0) ?? (typeof row.content === "string" ? row.content : void 0)
    ) ?? ""
  );
  const levelRaw = str3(merged.level ?? merged.Level ?? merged.loglevel)?.toLowerCase() ?? "info";
  const level = levelRaw.includes("error") ? "error" : levelRaw.includes("warn") ? "warn" : levelRaw.includes("debug") ? "debug" : "info";
  return {
    id: str3(merged.id ?? merged.RequestId ?? merged.PkgLogId) ?? String(index),
    time: str3(merged.time ?? merged.timestamp ?? merged.Time ?? merged.Timestamp),
    service: str3(merged.service ?? merged.src ?? merged.module ?? contentFields.logType),
    message: message || "\u2014",
    title: message,
    level,
    raw: merged
  };
}
function mapPolicyRow(item) {
  const row = rec3(item);
  return {
    name: str3(row.name ?? row.policyname) ?? "policy",
    schema: str3(row.schema ?? row.schemaname),
    table: str3(row.table ?? row.tablename),
    permissive: str3(row.permissive),
    roles: arr2(row.roles).map(String),
    command: str3(row.command ?? row.cmd) ?? "ALL",
    using: str3(row.using ?? row.qual),
    withCheck: str3(row.withCheck ?? row.with_check)
  };
}
function parsePolicyRows(payload) {
  return parseSqlRows(payload).map(mapPolicyRow);
}
function parseSqlRows(payload) {
  const columns = arr2(payload.columns ?? payload.Columns).map((item) => typeof item === "string" ? item : str3(rec3(item).name)).filter((name2) => Boolean(name2));
  const zip = (values) => {
    const row = {};
    columns.forEach((col, index) => {
      row[col] = values[index];
    });
    return row;
  };
  const rowsRaw = arr2(payload.rows ?? payload.records ?? payload.data ?? payload.items ?? payload.Rows);
  return rowsRaw.map((item) => {
    if (typeof item === "string") {
      try {
        const parsed = JSON.parse(item);
        if (Array.isArray(parsed)) return zip(parsed);
        if (parsed !== null && typeof parsed === "object") return rec3(parsed);
      } catch {
      }
      return zip([item]);
    }
    if (Array.isArray(item)) return zip(item);
    return rec3(item);
  });
}
function gatewayRouteKey(domain, path) {
  return `${domain}::${path}`;
}
function mapGatewayRoute(item, domainOverride) {
  const row = rec3(item);
  const domain = domainOverride ?? str3(row.Domain ?? row.domain) ?? "";
  const path = str3(row.Path ?? row.path) ?? "/";
  const routeId = str3(row.RouteId ?? row.routeId ?? row.id) ?? (domain ? gatewayRouteKey(domain, path) : void 0);
  return {
    routeId,
    domain,
    path,
    upstreamResourceType: str3(row.UpstreamResourceType ?? row.upstreamResourceType) ?? "",
    upstreamResourceName: str3(
      row.UpstreamResourceName ?? row.upstreamResourceName ?? row.targetName
    ) ?? "",
    enableAuth: Boolean(row.EnableAuth ?? row.enableAuth),
    enable: row.Enable === void 0 ? void 0 : Boolean(row.Enable ?? row.enable),
    domainType: str3(row.DomainType ?? row.domainType)
  };
}
function normalizeSqlRow(item) {
  if (typeof item === "string") {
    try {
      const parsed = JSON.parse(item);
      if (Array.isArray(parsed)) return { __values: parsed };
      if (parsed !== null && typeof parsed === "object") return rec3(parsed);
    } catch {
    }
    return { __values: [item] };
  }
  if (Array.isArray(item)) return { __values: item };
  return rec3(item);
}
function materializeSqlRow(row, columns) {
  const values = arr2(row.__values);
  if (values.length === 0) return row;
  const out = {};
  columns.forEach((col, index) => {
    out[col] = values[index];
  });
  return out;
}
function toRowPage(payload, elapsedMs) {
  const rowsRaw = arr2(
    payload.rows ?? payload.records ?? payload.data ?? payload.items ?? payload.Rows ?? payload.values
  );
  const columns = arr2(payload.columns ?? payload.Columns).map((item) => typeof item === "string" ? item : str3(rec3(item).name)).filter((name2) => Boolean(name2)) ?? [];
  const rows = rowsRaw.map(normalizeSqlRow).map((row) => materializeSqlRow(row, columns));
  const inferred = columns.length > 0 ? columns : rows[0] && rows[0].__values === void 0 ? Object.keys(rows[0]) : [];
  return {
    columns: inferred,
    rows,
    total: num2(payload.total ?? payload.rowCount ?? payload.AffectedRows) ?? rows.length,
    elapsedMs
  };
}
function extractPoints(payload) {
  const curve = rec3(payload.Curve);
  const data = arr2(
    curve.NewValues ?? curve.Values ?? payload.NewValues ?? payload.Values ?? payload.DataPoints ?? payload.points ?? payload.series ?? payload.values
  );
  return data.map((item) => {
    if (typeof item === "number") return item;
    const row = rec3(item);
    return num2(row.Value ?? row.value ?? row.Average ?? row.Sum) ?? 0;
  }).slice(-24);
}
function formatMetricValue(value, metricName) {
  if (metricName === "FunctionError") {
    return `${(value * (value <= 1 ? 100 : 1)).toFixed(1)}%`.replace(/\.0%/, "%");
  }
  if (value >= 1e3) return `${(value / 1e3).toFixed(1)}k`;
  return String(Math.round(value));
}
async function cosListObjects(opts) {
  const host = `${opts.bucket}.cos.${opts.region}.myqcloud.com`;
  const headers = { host };
  if (opts.token) headers["x-cos-security-token"] = opts.token;
  const paramKeys = Object.keys(opts.params).sort();
  const query = paramKeys.map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(opts.params[key] ?? "")}`).join("&");
  const authorization = cosSignRequest({
    method: "GET",
    host,
    path: "/",
    paramKeys,
    query,
    headerKeys: Object.keys(headers).sort(),
    headers,
    secretId: opts.secretId,
    secretKey: opts.secretKey,
    nowMs: Date.now()
  });
  const requestHeaders = { Authorization: authorization };
  if (opts.token) requestHeaders["x-cos-security-token"] = opts.token;
  const response = await fetch(`https://${host}/?${query}`, { headers: requestHeaders });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`\u5217\u51FA\u6258\u7BA1\u6587\u4EF6\u5931\u8D25 (${response.status})\uFF1A${text.slice(0, 200)}`);
  }
  return response.text();
}
function cosSignRequest(opts) {
  const start = Math.floor(opts.nowMs / 1e3) - 60;
  const end = start + 600;
  const keyTime = `${start};${end}`;
  const signKey = createHmac("sha1", opts.secretKey).update(keyTime).digest("hex");
  const headerList = opts.headerKeys.map((key) => `${key.toLowerCase()}=${encodeURIComponent(opts.headers[key] ?? "")}`).join("&");
  const httpString = `${opts.method.toLowerCase()}
${opts.path}
${opts.query}
${headerList}
`;
  const stringToSign = `sha1
${keyTime}
${createHash("sha1").update(httpString).digest("hex")}
`;
  const signature = createHmac("sha1", signKey).update(stringToSign).digest("hex");
  return [
    "q-sign-algorithm=sha1",
    `q-ak=${encodeURIComponent(opts.secretId)}`,
    `q-sign-time=${keyTime}`,
    `q-key-time=${keyTime}`,
    `q-header-list=${opts.headerKeys.map((key) => key.toLowerCase()).join(";")}`,
    `q-url-param-list=${opts.paramKeys.join(";")}`,
    `q-signature=${signature}`
  ].join("&");
}
function extractXmlTag(block, tag) {
  const match = new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`).exec(block);
  return match ? match[1] : void 0;
}
function parseCosListObjectsXml(xml, basePrefix) {
  const objects = [];
  const seenDirs = /* @__PURE__ */ new Set();
  const contentsRe = /<Contents>([\s\S]*?)<\/Contents>/g;
  let match;
  while ((match = contentsRe.exec(xml)) !== null) {
    const block = match[1] ?? "";
    const key = decodeURIComponent(extractXmlTag(block, "Key") ?? "");
    if (!key) continue;
    const size = Number(extractXmlTag(block, "Size")) || 0;
    objects.push({
      cloudPath: key,
      name: key.split("/").pop() || key,
      isDirectory: false,
      size,
      sizeLabel: formatBytes(size),
      updatedAt: extractXmlTag(block, "LastModified")
    });
  }
  const prefixesRe = /<CommonPrefixes>([\s\S]*?)<\/CommonPrefixes>/g;
  while ((match = prefixesRe.exec(xml)) !== null) {
    const block = match[1] ?? "";
    const dirKey = decodeURIComponent(extractXmlTag(block, "Prefix") ?? "");
    if (!dirKey || seenDirs.has(dirKey)) continue;
    seenDirs.add(dirKey);
    const relative = basePrefix ? dirKey.slice(basePrefix.length) : dirKey;
    const dirName = relative.replace(/\/$/, "").split("/").pop() || dirKey;
    objects.push({
      cloudPath: dirKey.endsWith("/") ? dirKey : `${dirKey}/`,
      name: dirName,
      isDirectory: true,
      size: 0,
      sizeLabel: "\u2014"
    });
  }
  return objects;
}
function stringifyUsage(value) {
  if (value === void 0 || value === null) return void 0;
  if (typeof value === "string") return scrubInternalCodes(value);
  if (typeof value === "number") return formatBytes(value);
  const row = rec3(value);
  const used = str3(row.used ?? row.Used);
  const quota = str3(row.quota ?? row.Quota);
  if (used && quota) return `${used} / ${quota}`;
  return used;
}
function providerLabel(type) {
  const map = {
    EMAIL: "\u90AE\u7BB1\u5BC6\u7801",
    WX_MP: "\u5FAE\u4FE1",
    WX_OPEN: "\u5FAE\u4FE1\u5F00\u653E\u5E73\u53F0",
    WX_MICRO_APP: "\u5FAE\u4FE1",
    ANONYMOUS: "\u533F\u540D",
    USERNAME: "\u7528\u6237\u540D\u5BC6\u7801"
  };
  return map[type] ?? type;
}

// node_modules/@deepseek-ai/dsh-typert-protocol/lib/index.js
import { Service } from "@deepseek-ai/cordis";
var TYPERT_REMOTE_SEGMENT_PATTERN = /^[A-Za-z0-9_$.-]+$/;
function isTypertRemoteSegment(value) {
  return value !== "." && value !== ".." && TYPERT_REMOTE_SEGMENT_PATTERN.test(value);
}
var markers = /* @__PURE__ */ new WeakMap();
function bindTypertRemote(service, serviceKey, options = {}) {
  validateName("service key", serviceKey);
  const namespace = options.namespace ?? serviceKey;
  validateName("namespace", namespace);
  return Object.freeze({
    service,
    serviceKey,
    namespace
  });
}
var TypertRemoteService = class extends Service {
  /** Visible binding consumed by the Gateway's source-mode discovery. */
  typertRemote;
  /**
  * Register the Service and bind the same key to Typert Gateway.
  * @param ctx - owning Cordis Context.
  * @param serviceKey - exact Cordis service key and default wire namespace.
  * @param options - optional distinct wire namespace.
  */
  constructor(ctx, serviceKey, options = {}) {
    super(ctx, serviceKey);
    this.typertRemote = bindTypertRemote(this, this.name, options);
  }
};
function Remote(methodOrExportName, context) {
  if (typeof methodOrExportName === "string") {
    validateName("Remote export name", methodOrExportName);
    return function(_method, decoratorContext) {
      addMarkerInitializer(decoratorContext, { kind: "direct" }, methodOrExportName);
    };
  }
  if (context === void 0) throw new TypeError("typert-protocol: Remote decorator context is missing");
  addMarkerInitializer(context, { kind: "direct" });
}
function addMarkerInitializer(context, invocation, exportName) {
  if (context.private || context.static || typeof context.name !== "string") throw new TypeError("typert-protocol: Remote decorators require a public instance method with a string name");
  const method = context.name;
  context.addInitializer(function() {
    const prototype = Object.getPrototypeOf(this);
    if (prototype === null) throw new TypeError(`typert-protocol: cannot mark Remote method "${method}" on an object without a prototype`);
    mark(prototype, method, invocation, exportName);
  });
}
function mark(prototype, method, invocation, exportName) {
  let table = markers.get(prototype);
  if (table === void 0) {
    table = /* @__PURE__ */ new Map();
    markers.set(prototype, table);
  }
  const marker = {
    ...exportName === void 0 || exportName === method ? {} : { exportName },
    invocation: Object.freeze(invocation)
  };
  const current = table.get(method);
  if (current !== void 0) {
    if (current.exportName === marker.exportName && sameInvocation(current.invocation, invocation)) return;
    throw new Error(`typert-protocol: Remote method "${method}" has conflicting invocation markers`);
  }
  table.set(method, Object.freeze(marker));
}
function sameInvocation(left, right) {
  return left.kind === right.kind && (left.kind === "direct" || right.kind === "context" && left.context === right.context);
}
function validateName(subject, value) {
  if (!isTypertRemoteSegment(value)) throw new TypeError(`typert-protocol: ${subject} must contain only RPC endpoint segment characters`);
}

// src/server/remote-service.ts
var JSON_CODEC = { mode: "src-json" };
function toJsonSafe(value) {
  if (value === void 0) return null;
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (Array.isArray(value)) return value.map((item) => toJsonSafe(item));
  if (value !== null && typeof value === "object") {
    const prototype = Object.getPrototypeOf(value);
    if (prototype !== Object.prototype && prototype !== null) return value;
    const out = {};
    for (const [key, item] of Object.entries(value)) {
      if (item === void 0) continue;
      out[key] = toJsonSafe(item);
    }
    return out;
  }
  return value;
}
function invoke(method, params = []) {
  return {
    id: `@cloudbase/dsh-plugin#cloudbaseData/${method}`,
    service: "cloudbaseData",
    namespace: "cloudbaseData",
    method,
    invocation: { kind: "direct" },
    parameters: params.map((name2) => ({ name: name2, wire: name2, source: "json", codec: JSON_CODEC })),
    result: JSON_CODEC
  };
}
function buildCloudBaseTypertContribution() {
  return {
    package: "@cloudbase/dsh-plugin",
    face: "host",
    schemas: [],
    invocations: [
      invoke("listTables"),
      invoke("listTableColumns", ["table"]),
      invoke("listAppUsers", ["limit", "offset"]),
      invoke("listSecrets"),
      invoke("readRows", ["table", "limit", "offset"]),
      invoke("runReadSql", ["sql"]),
      invoke("listStorage", ["path"]),
      invoke("storageUrl", ["cloudPath"]),
      invoke("authStatus"),
      invoke("startAuth"),
      invoke("startLogin", ["method", "params"]),
      invoke("logout"),
      invoke("listMigrations"),
      invoke("listEnvironments"),
      invoke("setEnvironment", ["envId"]),
      invoke("appAuthConfig"),
      invoke("metrics"),
      invoke("usage"),
      invoke("recentErrors"),
      invoke("envInfo"),
      invoke("appendToSession", ["text"]),
      invoke("capi", ["service", "action", "params"]),
      invoke("listAccessEndpoints"),
      invoke("listDeployments"),
      invoke("rollbackDeployment", ["record"]),
      invoke("sessionBoundEnv", ["sessionId"]),
      invoke("searchAppUsers", ["keyword", "pageNo", "pageSize"]),
      invoke("setAppUserStatus", ["uid", "enabled"]),
      invoke("checkLogService"),
      invoke("searchLogs", ["queryString", "service", "startTime", "endTime", "limit", "sort", "context"]),
      invoke("getTableSchema", ["schemaTable"]),
      invoke("listSchemaPolicies", ["schema"]),
      invoke("runPgDDL", ["sql", "confirm"]),
      invoke("listPgFunctions", ["schema"]),
      invoke("listPgExtensions"),
      invoke("listPgRoles"),
      invoke("listPgMigrations"),
      invoke("listCustomDomains"),
      invoke("bindCustomDomain", ["input"]),
      invoke("deleteCustomDomain", ["domain", "confirm"]),
      invoke("listSchemas"),
      invoke("listTriggers", ["schema"]),
      invoke("listTypes", ["schema"]),
      invoke("listColumnPrivileges", ["schemaTable"]),
      invoke("listSafetyDomains"),
      invoke("getStorageSecurityRules"),
      invoke("setStorageSecurityRules", ["rules"]),
      invoke("listCdnCacheConfig"),
      invoke("getStorageCustomDomains"),
      invoke("getAuthLoginConfig"),
      invoke("listGatewayRoutes"),
      invoke("upsertGatewayRoute", ["input"]),
      invoke("deleteGatewayRoute", ["routeId", "confirm"]),
      invoke("getGatewayPrivilege"),
      invoke("listGatewayDomains"),
      invoke("listFunctionNames"),
      invoke("setGatewayServiceEnabled", ["enable"]),
      invoke("setGatewayAuthEnabled", ["enable"]),
      invoke("fetchMetricSeries", ["metricName", "startTime", "endTime", "period"]),
      invoke("listFunctions", ["searchKey", "limit", "offset"]),
      invoke("getFunction", ["name"]),
      invoke("listFunctionTriggers", ["name"]),
      invoke("listFunctionLogs", ["name", "limit"]),
      invoke("invokeFunction", ["name", "payload"]),
      invoke("listCloudRunServices"),
      invoke("getCloudRunService", ["name"]),
      invoke("listCloudRunDeployRecords", ["name"]),
      invoke("getCloudRunProcessLog", ["name", "runId"]),
      invoke("getCloudRunBuildLog", ["name", "buildId"]),
      invoke("listHostingDomains"),
      invoke("listHostingVersions"),
      invoke("listHostingObjects", ["prefix"]),
      invoke("listStorageBuckets"),
      invoke("uploadStorage", ["cloudPath", "bucket", "fileBase64", "fileName", "contentType"]),
      invoke("createStorageBucket", ["name", "isPublic"]),
      invoke("deleteStorageBucket", ["name", "confirm"]),
      invoke("listSslCertificates"),
      invoke("listCdnCacheItems", ["bucketName"]),
      invoke("listAuthDomains"),
      invoke("deleteAuthDomain", ["domainId", "confirm"]),
      invoke("upsertPolicy", ["input", "confirm"]),
      invoke("dropPolicy", ["schemaTable", "policyName", "confirm"]),
      invoke("toggleTableRls", ["schemaTable", "enable", "confirm"])
    ]
  };
}
var _toggleTableRls_dec, _dropPolicy_dec, _upsertPolicy_dec, _deleteAuthDomain_dec, _listAuthDomains_dec, _listCdnCacheItems_dec, _listSslCertificates_dec, _deleteStorageBucket_dec, _createStorageBucket_dec, _uploadStorage_dec, _listStorageBuckets_dec, _listHostingObjects_dec, _listHostingVersions_dec, _listHostingDomains_dec, _getCloudRunBuildLog_dec, _getCloudRunProcessLog_dec, _listCloudRunDeployRecords_dec, _getCloudRunService_dec, _listCloudRunServices_dec, _invokeFunction_dec, _listFunctionLogs_dec, _listFunctionTriggers_dec, _getFunction_dec, _listFunctions_dec, _fetchMetricSeries_dec, _setGatewayAuthEnabled_dec, _setGatewayServiceEnabled_dec, _listFunctionNames_dec, _listGatewayDomains_dec, _getGatewayPrivilege_dec, _deleteGatewayRoute_dec, _upsertGatewayRoute_dec, _listGatewayRoutes_dec, _getStorageCustomDomains_dec, _listCdnCacheConfig_dec, _setStorageSecurityRules_dec, _getStorageSecurityRules_dec, _listSafetyDomains_dec, _listColumnPrivileges_dec, _listTypes_dec, _listTriggers_dec, _listSchemas_dec, _deleteCustomDomain_dec, _bindCustomDomain_dec, _listCustomDomains_dec, _listMigrations_dec, _listPgMigrations_dec, _listPgRoles_dec, _listPgExtensions_dec, _listPgFunctions_dec, _runPgDDL_dec, _listSchemaPolicies_dec, _getTableSchema_dec, _searchLogs_dec, _checkLogService_dec, _setAppUserStatus_dec, _searchAppUsers_dec, _sessionBoundEnv_dec, _rollbackDeployment_dec, _listDeployments_dec, _listAccessEndpoints_dec, _capi_dec, _appendToSession_dec, _envInfo_dec, _recentErrors_dec, _usage_dec, _metrics_dec, _appAuthConfig_dec, _setEnvironment_dec, _listEnvironments_dec, _getAuthLoginConfig_dec, _logout_dec, _startLogin_dec, _startAuth_dec, _authStatus_dec, _storageUrl_dec, _listStorage_dec, _runReadSql_dec, _readRows_dec, _listSecrets_dec, _listAppUsers_dec, _listTableColumns_dec, _listTables_dec, _a, _init;
var CloudBaseRemoteService = class extends (_a = TypertRemoteService, _listTables_dec = [Remote("listTables")], _listTableColumns_dec = [Remote("listTableColumns")], _listAppUsers_dec = [Remote("listAppUsers")], _listSecrets_dec = [Remote("listSecrets")], _readRows_dec = [Remote("readRows")], _runReadSql_dec = [Remote("runReadSql")], _listStorage_dec = [Remote("listStorage")], _storageUrl_dec = [Remote("storageUrl")], _authStatus_dec = [Remote("authStatus")], _startAuth_dec = [Remote("startAuth")], _startLogin_dec = [Remote("startLogin")], _logout_dec = [Remote("logout")], _getAuthLoginConfig_dec = [Remote("getAuthLoginConfig")], _listEnvironments_dec = [Remote("listEnvironments")], _setEnvironment_dec = [Remote("setEnvironment")], _appAuthConfig_dec = [Remote("appAuthConfig")], _metrics_dec = [Remote("metrics")], _usage_dec = [Remote("usage")], _recentErrors_dec = [Remote("recentErrors")], _envInfo_dec = [Remote("envInfo")], _appendToSession_dec = [Remote("appendToSession")], _capi_dec = [Remote("capi")], _listAccessEndpoints_dec = [Remote("listAccessEndpoints")], _listDeployments_dec = [Remote("listDeployments")], _rollbackDeployment_dec = [Remote("rollbackDeployment")], _sessionBoundEnv_dec = [Remote("sessionBoundEnv")], _searchAppUsers_dec = [Remote("searchAppUsers")], _setAppUserStatus_dec = [Remote("setAppUserStatus")], _checkLogService_dec = [Remote("checkLogService")], _searchLogs_dec = [Remote("searchLogs")], _getTableSchema_dec = [Remote("getTableSchema")], _listSchemaPolicies_dec = [Remote("listSchemaPolicies")], _runPgDDL_dec = [Remote("runPgDDL")], _listPgFunctions_dec = [Remote("listPgFunctions")], _listPgExtensions_dec = [Remote("listPgExtensions")], _listPgRoles_dec = [Remote("listPgRoles")], _listPgMigrations_dec = [Remote("listPgMigrations")], _listMigrations_dec = [Remote("listMigrations")], _listCustomDomains_dec = [Remote("listCustomDomains")], _bindCustomDomain_dec = [Remote("bindCustomDomain")], _deleteCustomDomain_dec = [Remote("deleteCustomDomain")], _listSchemas_dec = [Remote("listSchemas")], _listTriggers_dec = [Remote("listTriggers")], _listTypes_dec = [Remote("listTypes")], _listColumnPrivileges_dec = [Remote("listColumnPrivileges")], _listSafetyDomains_dec = [Remote("listSafetyDomains")], _getStorageSecurityRules_dec = [Remote("getStorageSecurityRules")], _setStorageSecurityRules_dec = [Remote("setStorageSecurityRules")], _listCdnCacheConfig_dec = [Remote("listCdnCacheConfig")], _getStorageCustomDomains_dec = [Remote("getStorageCustomDomains")], _listGatewayRoutes_dec = [Remote("listGatewayRoutes")], _upsertGatewayRoute_dec = [Remote("upsertGatewayRoute")], _deleteGatewayRoute_dec = [Remote("deleteGatewayRoute")], _getGatewayPrivilege_dec = [Remote("getGatewayPrivilege")], _listGatewayDomains_dec = [Remote("listGatewayDomains")], _listFunctionNames_dec = [Remote("listFunctionNames")], _setGatewayServiceEnabled_dec = [Remote("setGatewayServiceEnabled")], _setGatewayAuthEnabled_dec = [Remote("setGatewayAuthEnabled")], _fetchMetricSeries_dec = [Remote("fetchMetricSeries")], _listFunctions_dec = [Remote("listFunctions")], _getFunction_dec = [Remote("getFunction")], _listFunctionTriggers_dec = [Remote("listFunctionTriggers")], _listFunctionLogs_dec = [Remote("listFunctionLogs")], _invokeFunction_dec = [Remote("invokeFunction")], _listCloudRunServices_dec = [Remote("listCloudRunServices")], _getCloudRunService_dec = [Remote("getCloudRunService")], _listCloudRunDeployRecords_dec = [Remote("listCloudRunDeployRecords")], _getCloudRunProcessLog_dec = [Remote("getCloudRunProcessLog")], _getCloudRunBuildLog_dec = [Remote("getCloudRunBuildLog")], _listHostingDomains_dec = [Remote("listHostingDomains")], _listHostingVersions_dec = [Remote("listHostingVersions")], _listHostingObjects_dec = [Remote("listHostingObjects")], _listStorageBuckets_dec = [Remote("listStorageBuckets")], _uploadStorage_dec = [Remote("uploadStorage")], _createStorageBucket_dec = [Remote("createStorageBucket")], _deleteStorageBucket_dec = [Remote("deleteStorageBucket")], _listSslCertificates_dec = [Remote("listSslCertificates")], _listCdnCacheItems_dec = [Remote("listCdnCacheItems")], _listAuthDomains_dec = [Remote("listAuthDomains")], _deleteAuthDomain_dec = [Remote("deleteAuthDomain")], _upsertPolicy_dec = [Remote("upsertPolicy")], _dropPolicy_dec = [Remote("dropPolicy")], _toggleTableRls_dec = [Remote("toggleTableRls")], _a) {
  constructor(ctx, data) {
    super(ctx, "cloudbaseData");
    __runInitializers(_init, 5, this);
    __publicField(this, "data");
    this.data = data;
  }
  async listTables() {
    return toJsonSafe(await this.data.listTables());
  }
  async listTableColumns(table) {
    return toJsonSafe(await this.data.listTableColumns(table));
  }
  async listAppUsers(limit, offset) {
    return toJsonSafe(
      await this.data.listAppUsers({
        limit: limit === void 0 ? void 0 : limit,
        offset: offset === void 0 ? void 0 : offset
      })
    );
  }
  async listSecrets() {
    return toJsonSafe(await this.data.listSecrets());
  }
  async readRows(table, limit, offset) {
    return toJsonSafe(await this.data.readRows(table, {
      limit: limit === void 0 ? void 0 : limit,
      offset: offset === void 0 ? void 0 : offset
    }));
  }
  async runReadSql(sql) {
    return toJsonSafe(await this.data.runReadSql(sql));
  }
  async listStorage(path) {
    return toJsonSafe(await this.data.listStorage(path === void 0 ? "" : path));
  }
  async storageUrl(cloudPath) {
    return toJsonSafe(await this.data.storageUrl(cloudPath));
  }
  async authStatus() {
    return toJsonSafe(await this.data.authStatus());
  }
  async startAuth() {
    return toJsonSafe(await this.data.startAuth());
  }
  async startLogin(method, params) {
    return toJsonSafe(await this.data.startLogin(method, params));
  }
  async logout() {
    return toJsonSafe(await this.data.logout());
  }
  async getAuthLoginConfig() {
    return toJsonSafe(await this.data.getAuthLoginConfig());
  }
  async listEnvironments() {
    return toJsonSafe(await this.data.listEnvironments());
  }
  async setEnvironment(envId) {
    return toJsonSafe(await this.data.setEnvironment(envId));
  }
  async appAuthConfig() {
    return toJsonSafe(await this.data.appAuthConfig());
  }
  async metrics() {
    return toJsonSafe(await this.data.metrics());
  }
  async usage() {
    return toJsonSafe(await this.data.usage());
  }
  async recentErrors() {
    return toJsonSafe(await this.data.recentErrors());
  }
  async envInfo() {
    return toJsonSafe(await this.data.envInfo());
  }
  async appendToSession(text) {
    return toJsonSafe(await this.data.appendToSession(text));
  }
  async capi(service, action, params = {}) {
    return toJsonSafe(await this.data.capi(service, action, params));
  }
  async listAccessEndpoints() {
    return toJsonSafe(await this.data.listAccessEndpoints());
  }
  async listDeployments() {
    return toJsonSafe(await this.data.listDeployments());
  }
  async rollbackDeployment(record) {
    if (!this.data.rollbackDeployment) return false;
    return toJsonSafe(await this.data.rollbackDeployment(record));
  }
  async sessionBoundEnv(sessionId) {
    return toJsonSafe(await this.data.sessionBoundEnv(sessionId));
  }
  async searchAppUsers(keyword, pageNo, pageSize) {
    return toJsonSafe(await this.data.searchAppUsers({ keyword, pageNo, pageSize }));
  }
  async setAppUserStatus(uid, enabled) {
    return toJsonSafe(await this.data.setAppUserStatus(uid, enabled));
  }
  async checkLogService() {
    return toJsonSafe(await this.data.checkLogService());
  }
  async searchLogs(queryString, service, startTime, endTime, limit, sort, context) {
    return toJsonSafe(
      await this.data.searchLogs({
        queryString,
        service,
        startTime,
        endTime,
        limit,
        sort,
        context
      })
    );
  }
  async getTableSchema(schemaTable) {
    return toJsonSafe(await this.data.getTableSchema(schemaTable));
  }
  async listSchemaPolicies(schema) {
    return toJsonSafe(await this.data.listSchemaPolicies(schema));
  }
  async runPgDDL(sql, confirm) {
    return toJsonSafe(await this.data.runPgDDL(sql, confirm));
  }
  async listPgFunctions(schema) {
    return toJsonSafe(await this.data.listPgFunctions?.(schema));
  }
  async listPgExtensions() {
    return toJsonSafe(await this.data.listPgExtensions?.());
  }
  async listPgRoles() {
    return toJsonSafe(await this.data.listPgRoles?.());
  }
  async listPgMigrations() {
    return toJsonSafe(await this.data.listPgMigrations?.());
  }
  async listMigrations() {
    return toJsonSafe(await this.data.listMigrations?.());
  }
  async listCustomDomains() {
    return toJsonSafe(await this.data.listCustomDomains?.());
  }
  async bindCustomDomain(input) {
    return toJsonSafe(await this.data.bindCustomDomain?.(input));
  }
  async deleteCustomDomain(domain, confirm) {
    return toJsonSafe(await this.data.deleteCustomDomain?.(domain, confirm));
  }
  async listSchemas() {
    return toJsonSafe(await this.data.listSchemas?.());
  }
  async listTriggers(schema) {
    return toJsonSafe(await this.data.listTriggers?.(schema));
  }
  async listTypes(schema) {
    return toJsonSafe(await this.data.listTypes?.(schema));
  }
  async listColumnPrivileges(schemaTable) {
    return toJsonSafe(await this.data.listColumnPrivileges?.(schemaTable));
  }
  async listSafetyDomains() {
    return toJsonSafe(await this.data.listSafetyDomains?.());
  }
  async getStorageSecurityRules() {
    return toJsonSafe(await this.data.getStorageSecurityRules?.());
  }
  async setStorageSecurityRules(rules) {
    return toJsonSafe(await this.data.setStorageSecurityRules?.(rules));
  }
  async listCdnCacheConfig() {
    return toJsonSafe(await this.data.listCdnCacheConfig?.());
  }
  async getStorageCustomDomains() {
    return toJsonSafe(await this.data.getStorageCustomDomains?.());
  }
  async listGatewayRoutes() {
    return toJsonSafe(await this.data.listGatewayRoutes());
  }
  async upsertGatewayRoute(input) {
    return toJsonSafe(await this.data.upsertGatewayRoute(input));
  }
  async deleteGatewayRoute(routeId, confirm) {
    return toJsonSafe(await this.data.deleteGatewayRoute(routeId, confirm));
  }
  async getGatewayPrivilege() {
    return toJsonSafe(await this.data.getGatewayPrivilege());
  }
  async listGatewayDomains() {
    return toJsonSafe(await this.data.listGatewayDomains?.());
  }
  async listFunctionNames() {
    return toJsonSafe(await this.data.listFunctionNames?.());
  }
  async setGatewayServiceEnabled(enable) {
    return toJsonSafe(await this.data.setGatewayServiceEnabled?.(enable));
  }
  async setGatewayAuthEnabled(enable) {
    return toJsonSafe(await this.data.setGatewayAuthEnabled?.(enable));
  }
  async fetchMetricSeries(metricName, startTime, endTime, period) {
    return toJsonSafe(await this.data.fetchMetricSeries(metricName, { startTime, endTime, period }));
  }
  async listFunctions(searchKey, limit, offset) {
    return toJsonSafe(await this.data.listFunctions?.({ searchKey, limit, offset }));
  }
  async getFunction(name2) {
    return toJsonSafe(await this.data.getFunction?.(name2));
  }
  async listFunctionTriggers(name2) {
    return toJsonSafe(await this.data.listFunctionTriggers?.(name2));
  }
  async listFunctionLogs(name2, limit) {
    return toJsonSafe(await this.data.listFunctionLogs?.(name2, { limit }));
  }
  async invokeFunction(name2, payload) {
    return toJsonSafe(await this.data.invokeFunction?.(name2, payload));
  }
  async listCloudRunServices() {
    return toJsonSafe(await this.data.listCloudRunServices?.());
  }
  async getCloudRunService(name2) {
    return toJsonSafe(await this.data.getCloudRunService?.(name2));
  }
  async listCloudRunDeployRecords(name2) {
    return toJsonSafe(await this.data.listCloudRunDeployRecords?.(name2));
  }
  async getCloudRunProcessLog(name2, runId) {
    return toJsonSafe(await this.data.getCloudRunProcessLog?.(name2, runId));
  }
  async getCloudRunBuildLog(name2, buildId) {
    return toJsonSafe(await this.data.getCloudRunBuildLog?.(name2, buildId));
  }
  async listHostingDomains() {
    return toJsonSafe(await this.data.listHostingDomains?.());
  }
  async listHostingVersions() {
    return toJsonSafe(await this.data.listHostingVersions?.());
  }
  async listHostingObjects(prefix) {
    return toJsonSafe(await this.data.listHostingObjects?.(prefix));
  }
  async listStorageBuckets() {
    return toJsonSafe(await this.data.listStorageBuckets?.());
  }
  async uploadStorage(cloudPath, bucket, fileBase64, fileName, contentType) {
    return toJsonSafe(
      await this.data.uploadStorage?.(cloudPath, { bucket, fileBase64, fileName, contentType })
    );
  }
  async createStorageBucket(name2, isPublic) {
    return toJsonSafe(await this.data.createStorageBucket?.(name2, { public: isPublic }));
  }
  async deleteStorageBucket(name2, confirm) {
    return toJsonSafe(await this.data.deleteStorageBucket?.(name2, confirm));
  }
  async listSslCertificates() {
    return toJsonSafe(await this.data.listSslCertificates?.());
  }
  async listCdnCacheItems(bucketName) {
    return toJsonSafe(await this.data.listCdnCacheItems?.(bucketName));
  }
  async listAuthDomains() {
    return toJsonSafe(await this.data.listAuthDomains?.());
  }
  async deleteAuthDomain(domainId, confirm) {
    return toJsonSafe(await this.data.deleteAuthDomain?.(domainId, confirm));
  }
  async upsertPolicy(input, confirm) {
    return toJsonSafe(await this.data.upsertPolicy?.(input, confirm));
  }
  async dropPolicy(schemaTable, policyName, confirm) {
    return toJsonSafe(await this.data.dropPolicy?.(schemaTable, policyName, confirm));
  }
  async toggleTableRls(schemaTable, enable, confirm) {
    return toJsonSafe(await this.data.toggleTableRls?.(schemaTable, enable, confirm));
  }
};
_init = __decoratorStart(_a);
__decorateElement(_init, 1, "listTables", _listTables_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "listTableColumns", _listTableColumns_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "listAppUsers", _listAppUsers_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "listSecrets", _listSecrets_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "readRows", _readRows_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "runReadSql", _runReadSql_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "listStorage", _listStorage_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "storageUrl", _storageUrl_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "authStatus", _authStatus_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "startAuth", _startAuth_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "startLogin", _startLogin_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "logout", _logout_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "getAuthLoginConfig", _getAuthLoginConfig_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "listEnvironments", _listEnvironments_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "setEnvironment", _setEnvironment_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "appAuthConfig", _appAuthConfig_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "metrics", _metrics_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "usage", _usage_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "recentErrors", _recentErrors_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "envInfo", _envInfo_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "appendToSession", _appendToSession_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "capi", _capi_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "listAccessEndpoints", _listAccessEndpoints_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "listDeployments", _listDeployments_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "rollbackDeployment", _rollbackDeployment_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "sessionBoundEnv", _sessionBoundEnv_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "searchAppUsers", _searchAppUsers_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "setAppUserStatus", _setAppUserStatus_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "checkLogService", _checkLogService_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "searchLogs", _searchLogs_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "getTableSchema", _getTableSchema_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "listSchemaPolicies", _listSchemaPolicies_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "runPgDDL", _runPgDDL_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "listPgFunctions", _listPgFunctions_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "listPgExtensions", _listPgExtensions_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "listPgRoles", _listPgRoles_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "listPgMigrations", _listPgMigrations_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "listMigrations", _listMigrations_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "listCustomDomains", _listCustomDomains_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "bindCustomDomain", _bindCustomDomain_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "deleteCustomDomain", _deleteCustomDomain_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "listSchemas", _listSchemas_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "listTriggers", _listTriggers_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "listTypes", _listTypes_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "listColumnPrivileges", _listColumnPrivileges_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "listSafetyDomains", _listSafetyDomains_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "getStorageSecurityRules", _getStorageSecurityRules_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "setStorageSecurityRules", _setStorageSecurityRules_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "listCdnCacheConfig", _listCdnCacheConfig_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "getStorageCustomDomains", _getStorageCustomDomains_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "listGatewayRoutes", _listGatewayRoutes_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "upsertGatewayRoute", _upsertGatewayRoute_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "deleteGatewayRoute", _deleteGatewayRoute_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "getGatewayPrivilege", _getGatewayPrivilege_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "listGatewayDomains", _listGatewayDomains_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "listFunctionNames", _listFunctionNames_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "setGatewayServiceEnabled", _setGatewayServiceEnabled_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "setGatewayAuthEnabled", _setGatewayAuthEnabled_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "fetchMetricSeries", _fetchMetricSeries_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "listFunctions", _listFunctions_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "getFunction", _getFunction_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "listFunctionTriggers", _listFunctionTriggers_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "listFunctionLogs", _listFunctionLogs_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "invokeFunction", _invokeFunction_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "listCloudRunServices", _listCloudRunServices_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "getCloudRunService", _getCloudRunService_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "listCloudRunDeployRecords", _listCloudRunDeployRecords_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "getCloudRunProcessLog", _getCloudRunProcessLog_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "getCloudRunBuildLog", _getCloudRunBuildLog_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "listHostingDomains", _listHostingDomains_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "listHostingVersions", _listHostingVersions_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "listHostingObjects", _listHostingObjects_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "listStorageBuckets", _listStorageBuckets_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "uploadStorage", _uploadStorage_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "createStorageBucket", _createStorageBucket_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "deleteStorageBucket", _deleteStorageBucket_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "listSslCertificates", _listSslCertificates_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "listCdnCacheItems", _listCdnCacheItems_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "listAuthDomains", _listAuthDomains_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "deleteAuthDomain", _deleteAuthDomain_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "upsertPolicy", _upsertPolicy_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "dropPolicy", _dropPolicy_dec, CloudBaseRemoteService);
__decorateElement(_init, 1, "toggleTableRls", _toggleTableRls_dec, CloudBaseRemoteService);
__decoratorMetadata(_init, CloudBaseRemoteService);

// src/server/skill-provider.ts
import { existsSync as existsSync3, readFileSync as readFileSync2 } from "node:fs";
import { dirname as dirname3, join as join3 } from "node:path";
import { fileURLToPath as fileURLToPath2 } from "node:url";
var BUNDLED_SKILL_RANK = 600;
var PROVIDER_NAME = "cloudbase";
var INVOCATION = { modelInvocable: true, userInvocable: true };
function bundledSkillsDir() {
  const here = dirname3(fileURLToPath2(import.meta.url));
  const candidates = [
    join3(here, "../skills/cloudbase"),
    join3(here, "../../skills/cloudbase"),
    join3(process.cwd(), "skills/cloudbase")
  ];
  return candidates.find((dir) => existsSync3(dir)) ?? join3(process.cwd(), "skills/cloudbase");
}
function registerBundledSkill(skills) {
  const provider = createBundledSkillProvider();
  skills?.registerProvider?.(() => provider);
}
function createBundledSkillProvider() {
  return {
    name: PROVIDER_NAME,
    async list() {
      const skill = readBundledSkill();
      return skill === void 0 ? [] : [toCandidate(skill)];
    },
    async get() {
      const skill = readBundledSkill();
      if (skill === void 0) return void 0;
      return { ...toCandidate(skill), content: skill.body };
    }
  };
}
function readBundledSkill() {
  const directory = bundledSkillsDir();
  const path = join3(directory, "SKILL.md");
  if (!existsSync3(path)) return void 0;
  const raw = readFileSync2(path, "utf8");
  const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw);
  const frontmatter = match?.[1];
  const body = match?.[2];
  if (frontmatter === void 0 || body === void 0) return void 0;
  const name2 = field(frontmatter, "name");
  const description = field(frontmatter, "description");
  if (name2 === void 0 || description === void 0) return void 0;
  return { name: name2, description, body: body.trim(), path, directory };
}
function field(frontmatter, key) {
  const match = new RegExp(`^${key}:\\s*(.+)$`, "m").exec(frontmatter);
  let value = match?.[1]?.trim();
  if (value === void 0 || value.length === 0) return void 0;
  if (value.startsWith('"') && value.endsWith('"') || value.startsWith("'") && value.endsWith("'")) {
    value = value.slice(1, -1);
  }
  return value.length === 0 ? void 0 : value;
}
function toCandidate(skill) {
  return {
    name: skill.name,
    description: skill.description,
    invocation: INVOCATION,
    provider: PROVIDER_NAME,
    source: "bundled",
    rank: BUNDLED_SKILL_RANK,
    locator: { path: skill.path, directory: skill.directory },
    resourceBase: { kind: "directory", path: skill.directory },
    path: skill.path
  };
}

// src/server/index.ts
var name = PLUGIN_NAME;
var inject = ["systemPrompt", "sessions", "typert", "skills"];
function createAppend(ctx) {
  return async (text) => {
    const session = ctx.sessions?.current?.();
    if (!session?.append) {
      throw new Error("Session append is not available in this DSH profile");
    }
    await session.append({
      type: "user/message",
      content: [{ type: "text", text }],
      surfaceOp: "append"
    });
  };
}
function resolveCurrentSessionId(ctx) {
  return resolveSessionId(ctx.sessions?.current?.());
}
function apply(ctx) {
  const sessionEnvCache = new SessionEnvCache();
  const bridge = new CloudBaseMcpBridge({
    sessionEnvCache,
    getSessionId: () => resolveCurrentSessionId(ctx)
  });
  const data = createCloudBaseDataService(
    bridge,
    createAppend(ctx),
    (sessionId) => {
      if (sessionId) return ctx.sessions?.get?.(sessionId);
      return ctx.sessions?.current?.();
    },
    sessionEnvCache,
    () => resolveCurrentSessionId(ctx)
  );
  new CloudBaseRemoteService(ctx, data);
  try {
    ctx.typert?.register?.(buildCloudBaseTypertContribution());
  } catch (error) {
    ctx.logger?.warn?.(
      `[cloudbase] typert register skipped: ${error instanceof Error ? error.message : String(error)}`
    );
  }
  ctx.effect?.(() => () => bridge.dispose());
  try {
    registerBundledSkill(ctx.skills);
  } catch (error) {
    ctx.logger?.warn?.(
      `[cloudbase] skill register skipped: ${error instanceof Error ? error.message : String(error)}`
    );
  }
  ctx.systemPrompt?.section?.({
    name: "cloudbase",
    // 放到 persona(0) 之后、工具描述之前的说明区
    order: 50,
    text: [
      "You have CloudBase MCP tools named mcp__cloudbase__*.",
      "Reuse the local tcb login state. Never ask for an API Key if auth status is ready.",
      "If auth is missing, call mcp__cloudbase__auth with action=start_auth and authMode=device, then show the verification URL.",
      "Bind an environment with mcp__cloudbase__auth action=set_env envId=<id>. cloudbase-mcp remembers it for later tool calls \u2014 do not call set_env before every query.",
      "To inspect auth and the current environment, call mcp__cloudbase__auth action=status.",
      "For a new web app: downloadTemplate(react) \u2192 local Vite preview \u2192 create PG tables with managePgDatabase \u2192 manageHosting upload \u2192 return the real domain.",
      "Do not mention internal codes FLEXDB, SCF, or TDSQL in user-facing text."
    ].join(" ")
  });
}
export {
  CloudBaseMcpBridge,
  CloudBaseRemoteService,
  SessionEnvCache,
  apply,
  buildMcpClientConfig,
  createCloudBaseDataService,
  inject,
  loginHint,
  mapRegion,
  mapUsageModule,
  name,
  scrubInternalCodes
};
//# sourceMappingURL=index.js.map

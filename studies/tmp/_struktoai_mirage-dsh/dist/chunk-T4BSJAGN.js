import {
  ensureDirPath
} from "./chunk-QH5H3VND.js";

// src/spill-store.ts
import { Buffer } from "buffer";
import { createHash, randomBytes } from "crypto";
import { posix } from "path";
import { SpillLocator, SpillStore } from "@deepseek-ai/dsh-spill";
var DEFAULT_SPILL_DIR = "/tmp/dsh-spill";
var NAME_PREFIX_BYTES = 6;
var SESSION_DIGEST_CHARS = 12;
function encodeSegment(raw) {
  if (raw.length === 0) return "~";
  if (raw === ".") return "~002E";
  if (raw === "..") return "~002E~002E";
  let out = "";
  for (const ch of raw) {
    const code = ch.codePointAt(0) ?? 0;
    out += ch !== "~" && /^[A-Za-z0-9._-]$/.test(ch) ? ch : `~${code.toString(16).toUpperCase().padStart(4, "0")}`;
  }
  return out;
}
function sessionDirName(sessionId) {
  const digest = createHash("sha256").update(sessionId).digest("hex");
  return `session-${digest.slice(0, SESSION_DIGEST_CHARS)}`;
}
var MirageSpillStore = class extends SpillStore {
  static inject = ["mirage"];
  dir;
  constructor(ctx, config = {}) {
    super(ctx);
    const dir = config.dir ?? DEFAULT_SPILL_DIR;
    if (!posix.isAbsolute(dir)) {
      throw new Error(`mirage: spill dir must be an absolute workspace path, got ${dir}`);
    }
    this.dir = posix.resolve("/", dir);
  }
  async saveText(input) {
    const workspace = await this.ctx.mirage.ready;
    const dir = posix.join(this.dir, sessionDirName(input.owner.sessionId));
    const name = `${randomBytes(NAME_PREFIX_BYTES).toString("hex")}-${encodeSegment(input.suggestedName)}`;
    const path = posix.join(dir, name);
    try {
      await ensureDirPath(
        { exists: (p) => workspace.vfs.exists(p), mkdir: (p) => workspace.vfs.mkdir(p) },
        dir
      );
      await workspace.vfs.write(path, input.content);
    } catch (err) {
      throw new Error(`mirage: cannot write spill artifact to ${path}`, { cause: err });
    }
    return {
      locator: SpillLocator(path),
      bytes: Buffer.byteLength(input.content, "utf8"),
      retrievalHint: "Use read with offset/limit, or grep this workspace path to search within it."
    };
  }
};

export {
  MirageSpillStore
};
//# sourceMappingURL=chunk-T4BSJAGN.js.map
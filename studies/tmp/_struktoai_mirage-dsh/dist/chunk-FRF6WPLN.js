import {
  applyLiteralEdit,
  decodeStrictText,
  detectsCrlf,
  normalizeLineEndings,
  restoreLineEndings
} from "./chunk-OZ2F4R6T.js";

// src/fs.ts
import { Buffer } from "buffer";
import { isAbsolute, posix, relative, resolve, sep } from "path";
import { FileSystem, FsError as FsError2, FsTargetKey, FsVersion } from "@deepseek-ai/dsh-fs";
import { DiskVFS } from "@struktoai/mirage-node";
import { Session } from "@struktoai/mirage-core/workspace/workspace/workspace";
import { readerOf } from "@struktoai/mirage-core/workspace/files";
import { FileType } from "@struktoai/mirage-core/types";
import { isMissingPath as isMissingPath2 } from "@struktoai/mirage-core/errors/fs";
import { compareCodePoints } from "@struktoai/mirage-core/utils/sort";

// src/errors.ts
import { FsError } from "@deepseek-ai/dsh-fs";
import { isMissingPath } from "@struktoai/mirage-core/errors/fs";
import { withRefusal } from "@struktoai/mirage-core/workspace/tools/io_text";
function assertNotAborted(signal, operation) {
  if (signal?.aborted === true) {
    throw new FsError(`${operation} aborted`, "FS_ABORTED");
  }
}
function codeOf(err) {
  if (err === null || typeof err !== "object") return null;
  const stamped = err;
  return typeof stamped.code === "string" ? stamped.code : null;
}
function codeFor(err) {
  if (isMissingPath(err)) return "FS_NOT_FOUND";
  if (err instanceof Error && err.name === "PolicyDenied") return "FS_SANDBOX_DENIED";
  switch (codeOf(err)) {
    case "EISDIR":
      return "FS_NOT_REGULAR_FILE";
    case "ENOTDIR":
      return "FS_NOT_DIRECTORY";
    case "EACCES":
    case "EPERM":
    case "EROFS":
      return "FS_PERMISSION_DENIED";
    default:
      return "FS_IO_ERROR";
  }
}
function mapMirageError(err, operation, displayPath) {
  if (err instanceof FsError) return err;
  if (err instanceof Error && err.name === "AbortError") {
    return new FsError(`${operation} aborted`, "FS_ABORTED", { cause: err });
  }
  const message = err instanceof Error ? err.message : String(err);
  const refusal = err?.refusal ?? null;
  const text = withRefusal(`cannot ${operation} "${displayPath}": ${message}`, refusal);
  return new FsError(text.trimEnd(), codeFor(err), { cause: err });
}

// src/fs.ts
var DEFAULT_DIFF_BASIS_MAX_BYTES = 10 * 1024 * 1024;
function versionOf(stat) {
  if (stat.fingerprint !== null) return FsVersion(`fp:${stat.fingerprint}`);
  if (stat.revision !== null) return FsVersion(`rev:${stat.revision}`);
  if (stat.modified !== null || stat.size !== null) {
    return FsVersion(`meta:${stat.modified ?? ""}:${String(stat.size ?? "")}`);
  }
  return FsVersion("unversioned");
}
function typeOf(stat) {
  switch (stat.type) {
    case FileType.DIRECTORY:
      return "directory";
    case FileType.SYMLINK:
      return "other";
    default:
      return "file";
  }
}
async function* singleChunk(text) {
  yield await Promise.resolve(text);
}
function tooLarge(displayPath, maxBytes, size) {
  const found = size === void 0 ? "" : `${String(size)} bytes `;
  return new FsError2(
    `cannot read "${displayPath}": ${found}exceeds the ${String(maxBytes)} byte cap`,
    "FS_TOO_LARGE"
  );
}
function escapesRoot(rel) {
  return rel === ".." || rel.startsWith(`..${sep}`) || isAbsolute(rel);
}
function ownerPrefixOf(virtual, mounts) {
  const probe = virtual.endsWith("/") ? virtual : `${virtual}/`;
  let winner;
  for (const mount of mounts) {
    if (!probe.startsWith(mount.prefix)) continue;
    if (winner === void 0 || mount.prefix.length > winner.length) winner = mount.prefix;
  }
  return winner;
}
function shadowedByLink(links, virtual) {
  if (links === null) return false;
  try {
    return links.follow(virtual) !== virtual;
  } catch {
    return true;
  }
}
var MirageFileSystem = class extends FileSystem {
  static inject = ["mirage"];
  fsOps = null;
  cwd;
  sessionId;
  diffBasisMaxBytes;
  // Per-targetKey tail promise: serializes mutating ops so the
  // read -> guard -> write window cannot interleave (one concurrent writer
  // wins, the rest observe the new version and reject as stale).
  locks = /* @__PURE__ */ new Map();
  constructor(ctx, config = {}) {
    super(ctx);
    this.cwd = config.cwd ?? "/";
    this.sessionId = config.sessionId;
    this.diffBasisMaxBytes = config.diffBasisMaxBytes ?? DEFAULT_DIFF_BASIS_MAX_BYTES;
  }
  // The workspace may still be building (declarative mounts resolve
  // asynchronously), so every entry point awaits the service's `ready`
  // once and caches the dispatcher. The caller's signal can fire during
  // that wait, after its entry assertion passed, so it is asserted
  // again here, before the op it guards dispatches.
  //
  // `ready` does not hydrate: a workspace freshly attached to a shared
  // store still holds a minted default session and an empty link table
  // until its first op loads both. This adapter reads the links off the
  // dispatcher's reader outside a dispatch, so it hydrates before they are
  // consulted, or a persisted hide would be judged by the wrong session.
  async files(signal, operation = "ready") {
    if (this.fsOps === null) {
      const host = await this.ctx.mirage.ready;
      await host.ensureSessionsLoaded();
      await host.namespace.ensureLoaded();
      this.fsOps = this.sessionId === void 0 ? host.vfs : new Session(host, this.sessionId).vfs;
    }
    assertNotAborted(signal, operation);
    return this.fsOps;
  }
  /**
   * The namespace as the session this adapter's ops run as sees it: the
   * dispatcher's reader, so a link the session cannot see is never followed
   * (the typed path reaches the dispatcher and is refused as absent, not
   * resolved to the visible target it points at), and never listed.
   */
  get reader() {
    if (this.fsOps === null) {
      throw new Error("mirage: filesystem used before the workspace is ready");
    }
    return readerOf(this.fsOps);
  }
  /**
   * The same confinement claim `MirageShellExecutor` makes, off the same
   * fact and for the same reason: with every runtime reaching only the
   * vfs, a mutation cannot land anywhere but a mount, under its mode.
   *
   * The two seams sit over one world, so answering differently here
   * would let dsh fence a bash write and wave an identical `ctx.fs`
   * write straight through.
   */
  get sandboxMode() {
    return this.ctx.mirage.vfsOnly ? "workspace-write" : void 0;
  }
  /**
   * Refuse a mutation the call's sandbox policy does not allow.
   *
   * `workspaceRoot` is deliberately not consulted: it is a directory on
   * the harness's own machine, so containment against it says nothing
   * about this world. The mounts and their modes are the boundary, and
   * `read-only` is the one mode that narrows them further. Wording and
   * code mirror `dsh-fs-sandbox`, so the tool layer renders one denial
   * marker whichever backend refused.
   *
   * @param policy the per-call policy, absent for an unguarded mutation.
   * @param displayPath the path to name in the refusal.
   */
  assertMutable(policy, displayPath) {
    if (policy?.mode !== "read-only") return;
    throw new FsError2(
      `cannot write "${displayPath}": file access denied under read-only mode`,
      "FS_SANDBOX_DENIED"
    );
  }
  /**
   * The base a relative path resolves against.
   *
   * dsh hands `ctx.fs` either the calling session's cwd or the sandbox
   * policy's workspace root, and both are directories on the harness's
   * own machine that name nothing here. Resolving `notes.txt` against
   * one yields `/Users/.../notes.txt`, which every read then reports as
   * absent. So a base that is not a directory in this world falls back
   * to the configured one, the same rule the shell executor applies to
   * a workdir.
   *
   * An absolute path ignores its base, so it never pays for the probe.
   *
   * @param path the path being resolved.
   * @param cwd the caller's base, if any.
   * @returns the base to resolve against.
   */
  async resolveBase(path, cwd) {
    if (cwd === void 0 || posix.isAbsolute(path)) return this.cwd;
    return await (await this.files()).isDir(cwd) ? cwd : this.cwd;
  }
  normalize(path, base) {
    return posix.resolve(base, path);
  }
  follow(path) {
    try {
      return this.reader.resolve(path);
    } catch (err) {
      throw mapMirageError(err, "resolve", path);
    }
  }
  withLock(key, body) {
    const mapKey = String(key);
    const previous = this.locks.get(mapKey) ?? Promise.resolve();
    const next = previous.then(body, body);
    const tail = next.then(
      () => void 0,
      () => void 0
    );
    this.locks.set(mapKey, tail);
    void tail.then(() => {
      if (this.locks.get(mapKey) === tail) this.locks.delete(mapKey);
    });
    return next;
  }
  async resolve(path, opts) {
    assertNotAborted(opts?.signal, "resolve");
    await this.files(opts?.signal, "resolve");
    const followed = this.follow(this.normalize(path, await this.resolveBase(path, opts?.cwd)));
    return { targetKey: FsTargetKey(followed), displayPath: followed };
  }
  processPath(target) {
    return String(target.targetKey);
  }
  /**
   * The workspace path naming the same file as `hostPath`, when a mount
   * puts one there.
   *
   * Most of this world has no host spelling at all: an S3 key, a Slack
   * message and a Notion row are not files the harness could open, and
   * claiming otherwise would hand the caller a path that reads as the
   * wrong bytes. A disk mount is the one place the two worlds hold the
   * same file, so it is the one place a host path is answerable; every
   * other mount declines, and so does a workspace still building.
   *
   * @param hostPath absolute path in the harness host filesystem.
   * @returns the virtual path for the same file, or undefined when no
   *   mount maps it.
   */
  processPathFromHostPath(hostPath) {
    if (!isAbsolute(hostPath)) return void 0;
    const workspace = this.ctx.mirage.workspaceIfReady;
    if (workspace === null) return void 0;
    const host = resolve(hostPath);
    const mounts = workspace.mounts();
    for (const entry of mounts) {
      const { vfs } = entry;
      if (!(vfs instanceof DiskVFS)) continue;
      const rel = relative(vfs.root, host);
      if (escapesRoot(rel)) continue;
      const joined = `${entry.prefix}${rel.split(sep).join("/")}`;
      const virtual = joined.length > 1 && joined.endsWith("/") ? joined.slice(0, -1) : joined;
      if (ownerPrefixOf(virtual, mounts) !== entry.prefix) continue;
      if (shadowedByLink(workspace.namespace, virtual)) continue;
      return virtual;
    }
    return void 0;
  }
  fileUrl(target) {
    const encoded = String(target.targetKey).split("/").map(encodeURIComponent).join("/");
    return `file://${encoded}`;
  }
  contains(parent, child) {
    const parentKey = String(parent.targetKey);
    const childKey = String(child.targetKey);
    if (parentKey === childKey) return true;
    const prefix = parentKey === "/" ? "/" : `${parentKey}/`;
    return childKey.startsWith(prefix);
  }
  async stat(target, signal) {
    assertNotAborted(signal, "stat");
    const key = String(target.targetKey);
    let stat;
    try {
      stat = await (await this.files(signal, "stat")).stat(key);
    } catch (err) {
      if (isMissingPath2(err)) return void 0;
      throw mapMirageError(err, "stat", target.displayPath);
    }
    return {
      version: versionOf(stat),
      type: typeOf(stat),
      ...stat.size !== null ? { size: stat.size } : {}
    };
  }
  async lstat(path, opts, signal) {
    assertNotAborted(signal, "lstat");
    await this.files(signal, "lstat");
    const normalized = this.normalize(path, await this.resolveBase(path, opts?.cwd));
    const parentFollowed = normalized === "/" ? "/" : posix.join(this.follow(posix.dirname(normalized)), posix.basename(normalized));
    const linkTarget = this.reader.readlink(parentFollowed);
    if (linkTarget !== null) {
      return {
        version: FsVersion(`link:${linkTarget}`),
        type: "symlink",
        size: new TextEncoder().encode(linkTarget).byteLength
      };
    }
    let stat;
    try {
      stat = await (await this.files(signal, "lstat")).stat(parentFollowed);
    } catch (err) {
      if (isMissingPath2(err)) return void 0;
      throw mapMirageError(err, "lstat", normalized);
    }
    return {
      version: versionOf(stat),
      type: typeOf(stat) === "directory" ? "directory" : typeOf(stat),
      ...stat.size !== null ? { size: stat.size } : {}
    };
  }
  async readText(target, signal) {
    assertNotAborted(signal, "read");
    const key = String(target.targetKey);
    let bytes;
    try {
      bytes = await (await this.files(signal, "read")).read(key);
    } catch (err) {
      throw mapMirageError(err, "read", target.displayPath);
    }
    return decodeStrictText(bytes, target.displayPath);
  }
  async streamText(target, signal) {
    const text = await this.readText(target, signal);
    return singleChunk(text);
  }
  /**
   * Stat a read target and refuse anything that is not a regular file.
   *
   * A backend read of a directory key surfaces as a missing path, which
   * would report a path that plainly exists as absent.
   *
   * @param target the resolved target about to be read.
   * @param signal aborts the stat.
   * @returns the stat row, or undefined when the mount reports none.
   */
  async statRegularFile(target, signal) {
    const info = await this.stat(target, signal);
    if (info !== void 0 && info.type !== "file") {
      throw new FsError2(
        `cannot read "${target.displayPath}": not a regular file`,
        "FS_NOT_REGULAR_FILE"
      );
    }
    return info;
  }
  async readBytes(target, signal, maxBytes) {
    assertNotAborted(signal, "read");
    const info = await this.statRegularFile(target, signal);
    if (info?.size !== void 0 && info.size > maxBytes) {
      throw tooLarge(target.displayPath, maxBytes, info.size);
    }
    const key = String(target.targetKey);
    let bytes;
    try {
      bytes = await (await this.files(signal, "read")).read(key, { size: maxBytes + 1 });
    } catch (err) {
      throw mapMirageError(err, "read", target.displayPath);
    }
    if (bytes.byteLength > maxBytes) {
      throw tooLarge(target.displayPath, maxBytes);
    }
    return bytes;
  }
  async readByteRange(target, range, signal) {
    assertNotAborted(signal, "read");
    await this.statRegularFile(target, signal);
    if (range.length === 0) return new Uint8Array(0);
    try {
      return await (await this.files(signal, "read")).read(String(target.targetKey), { offset: range.offset, size: range.length });
    } catch (err) {
      throw mapMirageError(err, "read", target.displayPath);
    }
  }
  async listDir(target, signal) {
    assertNotAborted(signal, "list");
    const key = String(target.targetKey);
    const info = await this.stat(target, signal);
    if (info === void 0) {
      throw new FsError2(
        `cannot list "${target.displayPath}": no such file or directory`,
        "FS_NOT_FOUND"
      );
    }
    if (info.type !== "directory") {
      throw new FsError2(`cannot list "${target.displayPath}": not a directory`, "FS_NOT_DIRECTORY");
    }
    let children;
    try {
      children = await (await this.files(signal, "list")).readdir(key);
    } catch (err) {
      throw mapMirageError(err, "list", target.displayPath);
    }
    const names = /* @__PURE__ */ new Set();
    for (const childPath of children) {
      names.add(posix.basename(childPath));
    }
    for (const name of this.reader.linkNames(key)) names.add(name);
    const entries = [];
    for (const name of [...names].sort(compareCodePoints)) {
      assertNotAborted(signal, "list");
      entries.push(await this.dirEntry(key, name, signal));
    }
    return entries;
  }
  async dirEntry(parentKey, name, signal) {
    const childPath = parentKey === "/" ? `/${name}` : `${parentKey}/${name}`;
    let followed;
    try {
      followed = this.follow(childPath);
    } catch {
      return {
        name,
        type: "other",
        target: { targetKey: FsTargetKey(childPath), displayPath: childPath }
      };
    }
    const target = { targetKey: FsTargetKey(followed), displayPath: childPath };
    let stat;
    try {
      stat = await (await this.files(signal, "list")).stat(followed);
    } catch (err) {
      if (err instanceof FsError2 && err.code === "FS_ABORTED") throw err;
      return { name, type: "other", target };
    }
    return {
      name,
      type: typeOf(stat),
      target,
      version: versionOf(stat),
      ...stat.size !== null ? { size: stat.size } : {}
    };
  }
  async writeText(target, content, expected, signal, sandboxPolicy) {
    return this.withLock(target.targetKey, async () => {
      assertNotAborted(signal, "write");
      this.assertMutable(sandboxPolicy, target.displayPath);
      const key = String(target.targetKey);
      const existing = await this.stat(target, signal);
      if (existing !== void 0 && existing.type !== "file") {
        throw new FsError2(
          `cannot write "${target.displayPath}": not a regular file`,
          "FS_NOT_REGULAR_FILE"
        );
      }
      if (expected?.kind === "createIfAbsent" && existing !== void 0) {
        throw new FsError2(
          `cannot write "${target.displayPath}": file already exists`,
          "FS_NOT_OBSERVED"
        );
      }
      if (expected?.kind === "replaceIfVersion") {
        if (existing?.version !== expected.version) {
          throw new FsError2(
            `cannot write "${target.displayPath}": file changed since it was read`,
            "FS_STALE_VERSION"
          );
        }
      }
      const before = existing === void 0 ? null : await this.diffBasis(target, content);
      const crlf = before !== null && detectsCrlf(before);
      try {
        await (await this.files(signal, "write")).write(key, restoreLineEndings(normalizeLineEndings(content), crlf));
      } catch (err) {
        throw mapMirageError(err, "write", target.displayPath);
      }
      return {
        operation: existing === void 0 ? "create" : "update",
        version: await this.versionAfterWrite(target),
        before: before === null ? null : normalizeLineEndings(before),
        after: normalizeLineEndings(content)
      };
    });
  }
  // The overwrite-diff basis: the prior content when it is text and both
  // sides fit the exclusive limit, else null (dsh renders a whole-file
  // diff then). Never fails the write itself.
  async diffBasis(target, content) {
    if (Buffer.byteLength(content, "utf8") >= this.diffBasisMaxBytes) return null;
    let bytes;
    try {
      bytes = await (await this.files()).read(String(target.targetKey));
    } catch {
      return null;
    }
    if (bytes.byteLength >= this.diffBasisMaxBytes) return null;
    try {
      return decodeStrictText(bytes, target.displayPath);
    } catch {
      return null;
    }
  }
  async versionAfterWrite(target) {
    const after = await this.stat(target);
    return after?.version ?? FsVersion(`missing:${String(target.targetKey)}`);
  }
  async editText(target, edit, expected, signal, sandboxPolicy) {
    return this.withLock(target.targetKey, async () => {
      assertNotAborted(signal, "edit");
      this.assertMutable(sandboxPolicy, target.displayPath);
      const key = String(target.targetKey);
      const existing = await this.stat(target, signal);
      if (existing === void 0) {
        throw new FsError2(
          `cannot edit "${target.displayPath}": file changed since it was read`,
          "FS_STALE_VERSION"
        );
      }
      if (existing.type !== "file") {
        throw new FsError2(
          `cannot edit "${target.displayPath}": not a regular file`,
          "FS_NOT_REGULAR_FILE"
        );
      }
      if (expected !== void 0 && existing.version !== expected.version) {
        throw new FsError2(
          `cannot edit "${target.displayPath}": file changed since it was read`,
          "FS_STALE_VERSION"
        );
      }
      let bytes;
      try {
        bytes = await (await this.files(signal, "edit")).read(key);
      } catch (err) {
        throw mapMirageError(err, "edit", target.displayPath);
      }
      const raw = decodeStrictText(bytes, target.displayPath);
      const original = normalizeLineEndings(raw);
      const edited = applyLiteralEdit(
        original,
        normalizeLineEndings(edit.oldString),
        normalizeLineEndings(edit.newString),
        edit.replaceAll,
        target.displayPath
      );
      try {
        await (await this.files(signal, "edit")).write(key, restoreLineEndings(edited, detectsCrlf(raw)));
      } catch (err) {
        throw mapMirageError(err, "edit", target.displayPath);
      }
      return {
        version: await this.versionAfterWrite(target),
        before: original,
        after: edited
      };
    });
  }
};

export {
  MirageFileSystem
};
//# sourceMappingURL=chunk-FRF6WPLN.js.map
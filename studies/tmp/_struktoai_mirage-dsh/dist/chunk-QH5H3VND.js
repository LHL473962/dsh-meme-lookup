// src/spill.ts
import { Channel } from "@struktoai/mirage-core/shell/console/index";
import { concat } from "@struktoai/mirage-core/utils/bytes";
async function ensureDirPath(dirs, dir) {
  let path = "";
  for (const part of dir.split("/").filter((p) => p !== "")) {
    path += `/${part}`;
    if (await dirs.exists(path)) continue;
    try {
      await dirs.mkdir(path);
    } catch (err) {
      if (!await dirs.exists(path)) throw err;
    }
  }
}
function totalLength(parts) {
  return parts.reduce((sum, p) => sum + p.byteLength, 0);
}
var SpillSink = class {
  stdoutPath;
  stderrPath;
  target;
  dir;
  base;
  onFailure;
  started = false;
  failed = false;
  stdoutParts = [];
  stderrParts = [];
  constructor(target, dir, base, onFailure = () => void 0) {
    this.target = target;
    this.dir = dir;
    this.base = base;
    this.onFailure = onFailure;
  }
  /** Buffer a chunk before spill starts, or append it to the file after. */
  async ingest(channel, data) {
    if (this.failed) return;
    if (!this.started) {
      if (channel === Channel.STDERR) this.stderrParts.push(data);
      else this.stdoutParts.push(data);
      return;
    }
    await this.appendFile(channel, data);
  }
  /** Flush the buffered streams to files; called once, on the first overrun. */
  async begin() {
    if (this.started || this.failed) return;
    try {
      await this.target.ensureDir(this.dir);
      if (totalLength(this.stdoutParts) > 0) {
        this.stdoutPath = `${this.dir}/${this.base}.stdout`;
        await this.target.write(this.stdoutPath, concat(this.stdoutParts));
      }
      if (totalLength(this.stderrParts) > 0) {
        this.stderrPath = `${this.dir}/${this.base}.stderr`;
        await this.target.write(this.stderrPath, concat(this.stderrParts));
      }
      this.started = true;
      this.stdoutParts = [];
      this.stderrParts = [];
    } catch (err) {
      this.onFailure(err);
      this.disable();
    }
  }
  async appendFile(channel, data) {
    try {
      if (channel === Channel.STDERR) {
        if (this.stderrPath === void 0) {
          this.stderrPath = `${this.dir}/${this.base}.stderr`;
          await this.target.write(this.stderrPath, data);
        } else {
          await this.target.append(this.stderrPath, data);
        }
      } else {
        if (this.stdoutPath === void 0) {
          this.stdoutPath = `${this.dir}/${this.base}.stdout`;
          await this.target.write(this.stdoutPath, data);
        } else {
          await this.target.append(this.stdoutPath, data);
        }
      }
    } catch (err) {
      this.onFailure(err);
      this.disable();
    }
  }
  /**
   * Give up on spilling and report no path.
   *
   * Called on a write failure, and by a reader that discovers it lost
   * bytes before they ever reached here: a file missing the middle of
   * the stream is worse than no file, because the path presents it as
   * the whole one.
   */
  disable() {
    this.failed = true;
    this.stdoutPath = void 0;
    this.stderrPath = void 0;
    this.stdoutParts = [];
    this.stderrParts = [];
  }
};

export {
  ensureDirPath,
  SpillSink
};
//# sourceMappingURL=chunk-QH5H3VND.js.map
// src/text.ts
import { FsError } from "@deepseek-ai/dsh-fs";
var BINARY_SAMPLE_BYTES = 8192;
function decodeStrictText(bytes, displayPath) {
  if (bytes.subarray(0, BINARY_SAMPLE_BYTES).includes(0)) {
    throw new FsError(`cannot read "${displayPath}": binary file`, "FS_NOT_TEXT");
  }
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(bytes);
  } catch (error) {
    throw new FsError(`cannot read "${displayPath}": invalid UTF-8 text`, "FS_NOT_TEXT", {
      cause: error
    });
  }
}
function normalizeLineEndings(value) {
  return value.replaceAll("\r\n", "\n");
}
function detectsCrlf(value) {
  const sample = value.slice(0, 4096);
  const crlf = sample.split("\r\n").length - 1;
  const lf = sample.split("\n").length - 1 - crlf;
  return crlf > lf;
}
function restoreLineEndings(value, crlf) {
  return crlf ? normalizeLineEndings(value).replaceAll("\n", "\r\n") : value;
}
function countOccurrences(haystack, needle) {
  if (needle.length === 0) return 0;
  let count = 0;
  let index = haystack.indexOf(needle);
  while (index !== -1) {
    count++;
    index = haystack.indexOf(needle, index + needle.length);
  }
  return count;
}
function applyLiteralEdit(content, oldString, newString, replaceAll, displayPath) {
  const matches = countOccurrences(content, oldString);
  if (matches === 0) {
    throw new FsError(`cannot edit "${displayPath}": oldString not found`, "FS_EDIT_NOT_FOUND");
  }
  if (matches > 1 && !replaceAll) {
    throw new FsError(
      `cannot edit "${displayPath}": oldString matches ${String(matches)} locations; pass replaceAll or a longer unique string`,
      "FS_AMBIGUOUS_EDIT"
    );
  }
  return replaceAll ? content.replaceAll(oldString, newString) : content.replace(oldString, newString);
}
function charBoundary(bytes, from) {
  let start = from;
  while (start < bytes.byteLength && ((bytes[start] ?? 0) & 192) === 128) start++;
  return start;
}
function charEnd(bytes) {
  const end = bytes.byteLength;
  for (let back = 1; back <= Math.min(4, end); back++) {
    const byte = bytes[end - back] ?? 0;
    if ((byte & 192) === 128) continue;
    const width = byte >= 194 && byte <= 223 ? 2 : byte >= 224 && byte <= 239 ? 3 : byte >= 240 && byte <= 244 ? 4 : 1;
    return width > back ? end - back : end;
  }
  return end;
}
var TailBuffer = class {
  budget;
  parts = [];
  bytes = 0;
  constructor(budget) {
    this.budget = budget;
  }
  /**
   * Append a chunk, dropping the oldest bytes that no longer fit.
   *
   * @param data the bytes to append.
   * @returns true when bytes were dropped to make room.
   */
  append(data) {
    this.parts.push(data);
    this.bytes += data.byteLength;
    if (this.bytes <= this.budget) return false;
    let excess = this.bytes - this.budget;
    while (excess > 0) {
      const head = this.parts[0];
      if (head === void 0) break;
      if (head.byteLength <= excess) {
        this.parts.shift();
        excess -= head.byteLength;
        this.bytes -= head.byteLength;
      } else {
        this.parts[0] = head.subarray(excess);
        this.bytes -= excess;
        excess = 0;
      }
    }
    return true;
  }
  /** How many bytes are held. */
  get size() {
    return this.bytes;
  }
  /**
   * The held bytes after the first `skip`, joined, leaving them held: only
   * what is asked for is copied.
   *
   * @param skip how many of the oldest held bytes to leave out.
   * @returns the rest, oldest first.
   */
  since(skip) {
    const out = new Uint8Array(Math.max(0, this.bytes - skip));
    let left = skip;
    let at = 0;
    for (const part of this.parts) {
      if (left >= part.byteLength) {
        left -= part.byteLength;
        continue;
      }
      const piece = part.subarray(left);
      left = 0;
      out.set(piece, at);
      at += piece.byteLength;
    }
    return out;
  }
  /**
   * Drain everything held, decoded as text.
   *
   * The head may sit mid-character, since dropping is byte-exact, so it
   * is re-aligned before decoding rather than rendered as a replacement
   * mark.
   *
   * @returns the buffered text; the buffer is left empty.
   */
  take() {
    if (this.parts.length === 0) return "";
    const joined = this.since(0);
    this.parts = [];
    this.bytes = 0;
    return new TextDecoder("utf-8", { fatal: false }).decode(
      joined.subarray(charBoundary(joined, 0))
    );
  }
};
var StreamTail = class {
  tail;
  offset = 0;
  ended = false;
  constructor(max) {
    this.tail = new TailBuffer(max);
  }
  /** Whether the tail has lost its head, so the stream is truncated. */
  get truncated() {
    return this.offset > this.tail.size;
  }
  append(chunk) {
    this.offset += chunk.byteLength;
    this.tail.append(chunk);
  }
  /** Mark the stream finished, so a read decodes through its last byte. */
  end() {
    this.ended = true;
  }
  readFrom(fromByte) {
    if (!Number.isSafeInteger(fromByte) || fromByte < 0 || fromByte > this.offset)
      throw new Error("invalid output offset");
    const start = this.offset - this.tail.size;
    const skip = Math.max(0, fromByte - start);
    let bytes = this.tail.since(skip);
    if (skip === 0 && start > 0) bytes = bytes.subarray(charBoundary(bytes, 0));
    const stop = this.ended ? bytes.byteLength : charEnd(bytes);
    return {
      text: new TextDecoder("utf-8", { fatal: false }).decode(bytes.subarray(0, stop)),
      nextOffset: this.offset - bytes.byteLength + stop,
      lossy: fromByte < start
    };
  }
};

export {
  decodeStrictText,
  normalizeLineEndings,
  detectsCrlf,
  restoreLineEndings,
  applyLiteralEdit,
  TailBuffer,
  StreamTail
};
//# sourceMappingURL=chunk-OZ2F4R6T.js.map
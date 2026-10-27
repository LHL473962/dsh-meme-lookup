/**
 * The Claude session transcript file, read-only:
 * what "load earlier" reads beyond the SDK's read API, which returns only
 * the model-visible chain after the latest compaction.
 *
 * Location: the CLI keeps `<config>/projects/<munged cwd>/<sessionId>.jsonl`
 * (`<config>` = `$CLAUDE_CONFIG_DIR` or `~/.claude`). The munged directory
 * name is never computed here (its encoding differs by runtime and
 * platform): the project directories are scanned for the session's file
 * name instead.
 *
 * Reading: the whole file, at most {@link MAX_TRANSCRIPT_BYTES} (larger is
 * refused, not truncated: a partial tree could misplace history), parsed
 * line by line — a malformed line costs that line (`src/backends/shared/jsonl.ts`).
 *
 * The chain: every entry names its `parentUuid`. A compaction writes a
 * `system/compact_boundary` entry with `parentUuid: null` (the resumed chain
 * stops there) and `logicalParentUuid` = the last entry before it, and lists
 * the entries it preserved (`compactMetadata.preservedMessages.uuids`, or
 * the older `preservedSegment` head…tail), which the loader splices after
 * the summary (`anchorUuid`). One older segment is the chain walked back from
 * a boundary's logical parent to the next `parentUuid: null` entry — an older
 * boundary or the session's first entry — with that older boundary's
 * preserved entries spliced in, and without the entries the newer boundary
 * preserved (those were shown after the newer summary already).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { homedir } from 'node:os';
import { join } from 'node:path';
import { claudeText } from './text.js';
import { parseJsonl } from '../shared/jsonl.js';
import { str } from './narrow.js';
/** The largest transcript file read (larger is refused). */
export const MAX_TRANSCRIPT_BYTES = 64 * 1024 * 1024;
/** Entries one older slice carries at most (extended back to a prompt). */
export const MAX_SLICE_ENTRIES = 1000;
/** Steps a chain walk takes at most (a corrupted tree cannot loop us). */
const MAX_WALK = 1_000_000;
const rec = (value) => typeof value === 'object' && value !== null && !Array.isArray(value) ? value : undefined;
/** The CLI's config directory for an environment. */
export function claudeConfigDir(env) {
    const dir = env.CLAUDE_CONFIG_DIR;
    return dir !== undefined && dir !== '' ? dir : join(homedir(), '.claude');
}
/** A session id is a file name, never a path. */
const SAFE_ID = /^[A-Za-z0-9][A-Za-z0-9._-]*$/u;
/**
 * Find `<sessionId>.jsonl` under `<configDir>/projects/*` (the most recently
 * written one if several project directories hold it).
 */
export function locateClaudeTranscript(sessionId, configDir) {
    if (!SAFE_ID.test(sessionId))
        return undefined;
    const projects = join(configDir, 'projects');
    let dirs;
    try {
        dirs = readdirSync(projects, { withFileTypes: true }).filter(entry => entry.isDirectory()).map(entry => entry.name);
    }
    catch {
        return undefined;
    }
    let found;
    for (const dir of dirs) {
        const path = join(projects, dir, `${sessionId}.jsonl`);
        try {
            const stat = statSync(path);
            if (!stat.isFile())
                continue;
            if (found === undefined || stat.mtimeMs > found.mtime)
                found = { path, mtime: stat.mtimeMs };
        }
        catch {
            // Not in this project.
        }
    }
    return found?.path;
}
/** Every entry of a transcript file (bounded; malformed lines skipped). */
export function readTranscriptEntries(path, maxBytes = MAX_TRANSCRIPT_BYTES) {
    const size = statSync(path).size;
    if (size > maxBytes)
        throw new Error(claudeText('claude-transcript-too-large', { mb: String(Math.round(maxBytes / (1024 * 1024))) }));
    const { records, badLines } = parseJsonl(readFileSync(path, 'utf8'));
    return { entries: records, badLines };
}
/** Whether an entry is a compaction boundary. */
export function isCompactBoundary(entry) {
    return entry?.type === 'system' && entry.subtype === 'compact_boundary';
}
/** The uuids a boundary preserved, oldest first. */
export function preservedUuids(boundary, byUuid) {
    const meta = rec(boundary.compactMetadata) ?? rec(boundary.compact_metadata);
    const listed = rec(meta?.preservedMessages)?.uuids;
    if (Array.isArray(listed))
        return listed.filter((uuid) => typeof uuid === 'string');
    const segment = rec(meta?.preservedSegment);
    const head = str(segment?.headUuid);
    const tail = str(segment?.tailUuid);
    if (head === undefined || tail === undefined)
        return [];
    const out = [];
    // A corrupted tree cannot send the walk round a cycle (as in olderSlice).
    const seen = new Set();
    let cursor = tail;
    while (cursor !== undefined && !seen.has(cursor) && out.length < MAX_WALK) {
        seen.add(cursor);
        out.push(cursor);
        if (cursor === head)
            return out.reverse();
        cursor = str(byUuid.get(cursor)?.parentUuid);
    }
    // The head was never reached: the segment is not where it claims to be.
    return [];
}
/** The cursor before the boundary a view starts at. */
export function cursorBefore(boundary, byUuid) {
    const end = str(boundary.logicalParentUuid);
    if (end === undefined)
        return undefined;
    return { end, exclude: new Set(preservedUuids(boundary, byUuid)) };
}
/** The newest compaction boundary a view starting at `head` began with. */
export function headBoundary(entries, byUuid, head) {
    const named = head === undefined ? undefined : byUuid.get(head);
    if (isCompactBoundary(named))
        return named;
    // The view's first entry is the summary right after it.
    const parent = named === undefined ? undefined : byUuid.get(str(named.parentUuid) ?? '');
    if (isCompactBoundary(parent))
        return parent;
    for (let index = entries.length - 1; index >= 0; index -= 1) {
        if (isCompactBoundary(entries[index]))
            return entries[index];
    }
    return undefined;
}
/** Whether a chain entry is a real prompt (a turn starts there). */
function isPrompt(entry) {
    if (entry.type !== 'user' || entry.isMeta === true || entry.isCompactSummary === true)
        return false;
    const content = rec(entry.message)?.content;
    if (typeof content === 'string')
        return content.trim() !== '' && !content.startsWith('<');
    return Array.isArray(content) && !content.some(block => rec(block)?.type === 'tool_result') && content.some(block => rec(block)?.type === 'text');
}
/**
 * One older slice: the entries (oldest first) the replay paints, and the
 * cursor of the slice before it (undefined: this was the oldest).
 */
export function olderSlice(byUuid, cursor, limit = MAX_SLICE_ENTRIES) {
    const chain = [];
    const seen = new Set();
    let uuid = cursor.end;
    while (uuid !== undefined && !seen.has(uuid) && chain.length < MAX_WALK) {
        seen.add(uuid);
        const entry = byUuid.get(uuid);
        if (entry === undefined)
            break;
        chain.push(entry);
        uuid = str(entry.parentUuid);
    }
    chain.reverse();
    const shown = chain.filter(entry => (entry.type === 'user' || entry.type === 'assistant') && entry.isSidechain !== true && !cursor.exclude.has(str(entry.uuid) ?? ''));
    if (shown.length > limit) {
        // The newest `limit` entries, extended back to the prompt their first
        // turn began with; the rest (all on the same chain) is the next slice.
        let cut = shown.length - limit;
        for (let index = cut; index >= Math.max(0, cut - limit); index -= 1) {
            if (isPrompt(shown[index])) {
                cut = index;
                break;
            }
        }
        const end = str(shown[cut - 1]?.uuid);
        return { entries: shown.slice(cut), ...(end === undefined ? {} : { next: { end, exclude: cursor.exclude } }) };
    }
    // The whole segment: it began at an older boundary (continue before that
    // one next) or at the session's first entry (nothing older).
    const root = chain[0];
    if (root === undefined || !isCompactBoundary(root))
        return { entries: shown };
    const next = cursorBefore(root, byUuid);
    // The older boundary's preserved entries follow its summary, as the loader
    // shows them.
    const meta = rec(root.compactMetadata);
    const preserved = preservedUuids(root, byUuid).flatMap((id) => {
        const entry = byUuid.get(id);
        return entry === undefined ? [] : [entry];
    });
    const anchor = str(rec(meta?.preservedMessages)?.anchorUuid) ?? str(rec(meta?.preservedSegment)?.anchorUuid);
    const anchored = anchor === undefined ? -1 : shown.findIndex(entry => entry.uuid === anchor);
    const at = anchored !== -1 ? anchored : shown.findIndex(entry => entry.isCompactSummary === true);
    const segment = preserved.length === 0 ? shown : [...shown.slice(0, at + 1), ...preserved, ...shown.slice(at + 1)];
    return { entries: segment, ...(next === undefined ? {} : { next }) };
}

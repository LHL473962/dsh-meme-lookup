/**
 * The `transcript` capability of a Claude session: "load
 * earlier" restores folded rows from, and prepends history older than the
 * resumed chain out of, the session's own transcript file — read-only,
 * synchronous, bounded (transcript-file.ts), replayed by the same replay as
 * a resume (replay.ts), so older rows look exactly like resumed ones.
 *
 * Older history exists only when the resumed chain began at a compaction
 * (`ClaudeReplay.compactedFrom`): slices are walked back one compaction
 * segment at a time (a long segment in bounded slices), newest first; the
 * cursor only moves on, so a repeated "load earlier" never repeats a slice.
 */
import { statSync } from 'node:fs';
import { claudeText } from './text.js';
import { replayClaudeTranscript } from './replay.js';
import { cursorBefore, headBoundary, locateClaudeTranscript, olderSlice, readTranscriptEntries } from './transcript-file.js';
export function createClaudeTranscriptHistory(deps) {
    const debug = deps.debug ?? (() => undefined);
    const sessionIdOf = () => typeof deps.sessionId === 'function' ? deps.sessionId() : deps.sessionId;
    let boundId = sessionIdOf();
    let path;
    let cursor = deps.compactedFrom === undefined ? 'done' : 'start';
    /**
     * The parsed file, keyed by its size and mtime: a "load earlier" press
     * parses the transcript once per change, not once per call (record and
     * older on the same press share it), and the full-record replay is kept
     * with it.
     */
    let parsed;
    /** The session moved to another id: its file, no older segments known. */
    const follow = () => {
        const id = sessionIdOf();
        if (id === boundId)
            return;
        boundId = id;
        path = undefined;
        parsed = undefined;
        cursor = 'done';
    };
    const load = () => {
        follow();
        path ??= locateClaudeTranscript(boundId, deps.configDir());
        if (path === undefined)
            throw new Error(claudeText('claude-transcript-missing', { id: boundId }));
        const stat = statSync(path);
        if (parsed !== undefined && parsed.size === stat.size && parsed.mtimeMs === stat.mtimeMs)
            return parsed;
        const { entries, badLines } = readTranscriptEntries(path);
        if (badLines > 0)
            debug(`claude: ${badLines} malformed transcript line(s) skipped`);
        parsed = { size: stat.size, mtimeMs: stat.mtimeMs, entries };
        return parsed;
    };
    const replay = (entries) => replayClaudeTranscript(entries, { cwd: deps.cwd, debug }).events;
    return {
        record() {
            const file = load();
            file.record ??= replay(file.entries.filter(entry => (entry.type === 'user' || entry.type === 'assistant') && entry.isSidechain !== true));
            return file.record;
        },
        hasOlder: () => {
            follow();
            return cursor !== 'done';
        },
        older() {
            if (cursor === 'done')
                return [];
            const file = load();
            const entries = file.entries;
            if (file.byUuid === undefined) {
                file.byUuid = new Map();
                for (const entry of entries)
                    if (typeof entry.uuid === 'string')
                        file.byUuid.set(entry.uuid, entry);
            }
            const byUuid = file.byUuid;
            let current;
            if (cursor === 'start') {
                const head = headBoundary(entries, byUuid, deps.compactedFrom);
                current = head === undefined ? undefined : cursorBefore(head, byUuid);
            }
            else {
                current = cursor;
            }
            // A slice with nothing to show (all hidden) moves on to the next one;
            // a corrupted tree cannot send the walk round in a circle.
            const visited = new Set();
            while (current !== undefined && !visited.has(current.end)) {
                visited.add(current.end);
                const slice = olderSlice(byUuid, current, deps.sliceEntries);
                current = slice.next;
                if (slice.entries.length > 0) {
                    cursor = current ?? 'done';
                    return replay(slice.entries);
                }
            }
            cursor = 'done';
            return [];
        },
    };
}

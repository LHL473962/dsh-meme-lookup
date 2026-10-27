/**
 * The Claude backend's persisted user choices
 * (`~/.dsh-tui/backends/claude/prefs.json`): the `/model`,
 * `/effort` and `/permission` picks a later session starts with. Backend-
 * scoped on purpose —
 * a Claude model id means nothing to the DSH `/model` preference, and the
 * CLI's own settings files are never written (the user's interactive
 * `claude` keeps its own choices).
 *
 * Best-effort like every `~/.dsh-tui` preference: a missing or corrupt file
 * reads as "no choice", a failed write is reported to the caller's debug
 * log and the session carries on.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { writeFileAtomic } from '../shared/atomic-file.js';
/** The permission modes the persisted choice may hold (the SDK's whole
 *  vocabulary). A stored `bypassPermissions` is never started in; the next
 *  start says so and clears it (options.ts, backend.ts). Anything else
 *  reads as no choice. */
export const CLAUDE_PERMISSION_MODES = ['default', 'acceptEdits', 'plan', 'dontAsk', 'auto', 'bypassPermissions'];
const FILE = 'prefs.json';
/** MRU notes kept (oldest dropped first): the file stays small. */
const LAST_USED_LIMIT = 200;
/** Session colours kept (the oldest set first is dropped). */
export const COLOR_LIMIT = 200;
/** Narrow a parsed document to what persists. */
function parsePrefs(parsed) {
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed))
        return {};
    const record = parsed;
    const lastUsed = {};
    const rawUsed = record.lastUsed;
    if (rawUsed !== null && typeof rawUsed === 'object' && !Array.isArray(rawUsed)) {
        for (const [id, value] of Object.entries(rawUsed)) {
            if (typeof value === 'number' && Number.isFinite(value))
                lastUsed[id] = value;
        }
    }
    const colors = {};
    const rawColors = record.colors;
    if (rawColors !== null && typeof rawColors === 'object' && !Array.isArray(rawColors)) {
        for (const [id, value] of Object.entries(rawColors)) {
            const entry = value !== null && typeof value === 'object' ? value : undefined;
            if (typeof entry?.color === 'string' && entry.color !== '' && typeof entry.at === 'number' && Number.isFinite(entry.at))
                colors[id] = { color: entry.color, at: entry.at };
        }
    }
    return {
        ...(Object.keys(colors).length === 0 ? {} : { colors }),
        ...(typeof record.model === 'string' && record.model !== '' ? { model: record.model } : {}),
        ...(typeof record.effort === 'string' && record.effort !== '' ? { effort: record.effort } : {}),
        ...(typeof record.permissionMode === 'string' && CLAUDE_PERMISSION_MODES.includes(record.permissionMode) ? { permissionMode: record.permissionMode } : {}),
        ...(typeof record.lastSession === 'string' && record.lastSession !== '' ? { lastSession: record.lastSession } : {}),
        ...(Object.keys(lastUsed).length === 0 ? {} : { lastUsed }),
    };
}
/** Apply a patch (pure). */
function patched(current, patch) {
    const next = { ...current };
    for (const key of ['model', 'effort', 'permissionMode', 'lastSession']) {
        const value = patch[key];
        if (value === undefined)
            continue;
        if (value === null)
            delete next[key];
        else
            next[key] = value;
    }
    return next;
}
/** Record one use (pure), keeping the newest {@link LAST_USED_LIMIT}. */
function touched(current, sessionId, now) {
    const entries = Object.entries({ ...current.lastUsed, [sessionId]: now })
        .sort((a, b) => b[1] - a[1])
        .slice(0, LAST_USED_LIMIT);
    return { ...current, lastUsed: Object.fromEntries(entries) };
}
/** Set or clear one session's colour (pure), keeping the newest {@link COLOR_LIMIT}. */
function coloured(current, sessionId, color, now) {
    const colors = { ...current.colors };
    delete colors[sessionId];
    if (color !== '')
        colors[sessionId] = { color, at: now };
    const kept = Object.entries(colors).sort((a, b) => b[1].at - a[1].at).slice(0, COLOR_LIMIT);
    const next = { ...current, colors: Object.fromEntries(kept) };
    if (kept.length === 0)
        delete next.colors;
    return next;
}
/** Drop one session (pure). */
function forgotten(current, sessionId) {
    const lastUsed = { ...current.lastUsed };
    delete lastUsed[sessionId];
    const colors = { ...current.colors };
    delete colors[sessionId];
    const next = { ...current, lastUsed, colors };
    if (Object.keys(lastUsed).length === 0)
        delete next.lastUsed;
    if (Object.keys(colors).length === 0)
        delete next.colors;
    if (current.lastSession === sessionId)
        delete next.lastSession;
    return next;
}
/** The file-backed prefs under `<dir>` (the host's `dataDir` for this
 *  backend). The directory is required: a backend never picks a location of
 *  its own under the host's data directory (D2, B-3). */
export function fileClaudePrefs(dir, debug = () => undefined) {
    const path = join(dir, FILE);
    const read = () => {
        try {
            return parsePrefs(JSON.parse(readFileSync(path, 'utf8')));
        }
        catch {
            return {};
        }
    };
    const save = (next) => {
        // Atomic: a plain `writeFileSync` truncates the target first, and
        // another terminal's read-modify-write in that window would start from
        // `{}` and wipe every field it does not know.
        try {
            writeFileAtomic(dir, FILE, `${JSON.stringify(next, null, 2)}\n`);
        }
        catch (error) {
            debug(`claude: prefs write failed (${error instanceof Error ? error.message : String(error)})`);
        }
    };
    return {
        read,
        write: patch => { save(patched(read(), patch)); },
        touch: sessionId => { save(touched(read(), sessionId, Date.now())); },
        forget: sessionId => { save(forgotten(read(), sessionId)); },
        color: sessionId => read().colors?.[sessionId]?.color ?? '',
        setColor: (sessionId, color) => { save(coloured(read(), sessionId, color, Date.now())); },
    };
}
/** An in-memory store (tests, embedders without a home directory). */
export function memoryClaudePrefs(initial = {}) {
    let data = { ...initial };
    return {
        get data() { return data; },
        read: () => data,
        write(patch) { data = patched(data, patch); },
        touch(sessionId) { data = touched(data, sessionId, Date.now()); },
        forget(sessionId) { data = forgotten(data, sessionId); },
        color: sessionId => data.colors?.[sessionId]?.color ?? '',
        setColor(sessionId, color) { data = coloured(data, sessionId, color, Date.now()); },
    };
}

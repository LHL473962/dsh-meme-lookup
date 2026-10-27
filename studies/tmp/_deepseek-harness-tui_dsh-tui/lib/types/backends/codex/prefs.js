/**
 * The Codex backend's persisted user choices
 * (`~/.dsh-tui/backends/codex/prefs.json`, docs/codex-backend-design.md
 * §5.18, D6): the model / effort / mode picks a later session starts with,
 * the session a bare `--backend codex --resume` opens, and this install's
 * last use of each thread. dsh-tui never writes Codex's own
 * `config.toml`; these apply per thread through `thread/start` /
 * `turn/start`.
 *
 * Best-effort like every `~/.dsh-tui` preference: a missing or corrupt file
 * reads as "no choice", a failed write goes to the debug log.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { writeFileAtomic } from '../shared/atomic-file.js';
import { CODEX_MODE_PARAMS, DEFAULT_CODEX_MODE, isCodexModeId } from './modes.js';
import { rec } from './narrow.js';
const FILE = 'prefs.json';
const LAST_USED_LIMIT = 200;
function parse(parsed) {
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed))
        return {};
    const record = parsed;
    const lastUsed = {};
    const colors = Object.fromEntries(Object.entries(rec(record.colors) ?? {}).filter((entry) => typeof entry[1] === 'string').slice(-LAST_USED_LIMIT));
    if (record.lastUsed !== null && typeof record.lastUsed === 'object' && !Array.isArray(record.lastUsed)) {
        for (const [id, value] of Object.entries(record.lastUsed)) {
            if (typeof value === 'number' && Number.isFinite(value))
                lastUsed[id] = value;
        }
    }
    return {
        ...(typeof record.model === 'string' && record.model !== '' ? { model: record.model } : {}),
        ...(typeof record.effort === 'string' && record.effort !== '' ? { effort: record.effort } : {}),
        ...(isCodexModeId(record.mode) ? { mode: record.mode } : {}),
        ...(typeof record.plan === 'boolean' ? { plan: record.plan } : {}),
        ...(typeof record.lastSession === 'string' && record.lastSession !== '' ? { lastSession: record.lastSession } : {}),
        ...(Object.keys(lastUsed).length === 0 ? {} : { lastUsed }),
        ...(Object.keys(colors).length === 0 ? {} : { colors }),
    };
}
function patched(current, patch) {
    const next = { ...current };
    for (const key of ['model', 'effort', 'mode', 'plan', 'lastSession']) {
        const value = patch[key];
        if (value === undefined)
            continue;
        if (value === null)
            delete next[key];
        else
            next[key] = value;
    }
    if (patch.colors !== undefined)
        next.colors = Object.fromEntries(Object.entries(patch.colors).slice(-LAST_USED_LIMIT));
    return next;
}
function touched(current, threadId, now) {
    const entries = Object.entries({ ...current.lastUsed, [threadId]: now }).sort((a, b) => b[1] - a[1]).slice(0, LAST_USED_LIMIT);
    return { ...current, lastUsed: Object.fromEntries(entries) };
}
function forgotten(current, threadId) {
    const lastUsed = { ...current.lastUsed };
    delete lastUsed[threadId];
    const next = { ...current, lastUsed };
    if (Object.keys(lastUsed).length === 0)
        delete next.lastUsed;
    if (current.lastSession === threadId)
        delete next.lastSession;
    return next;
}
/** Per-field start overrides: explicit prefs > config/read > defaults.
 * An unreadable config is not evidence that a user has no configuration. */
export function resolveCodexStartOptions(prefs, config) {
    const mode = prefs.mode === undefined ? undefined : CODEX_MODE_PARAMS[prefs.mode];
    const defaults = CODEX_MODE_PARAMS[DEFAULT_CODEX_MODE];
    return {
        ...(mode !== undefined ? { approvalPolicy: mode.approvalPolicy } : config !== undefined && config.approval_policy == null ? { approvalPolicy: defaults.approvalPolicy } : {}),
        ...(mode !== undefined ? { sandbox: mode.sandbox } : config !== undefined && config.sandbox_mode == null ? { sandbox: defaults.sandbox } : {}),
        ...(prefs.model === undefined ? {} : { model: prefs.model }),
        ...(prefs.effort === undefined ? {} : { config: { model_reasoning_effort: prefs.effort } }),
    };
}
/** Unwrap config/read without accepting a malformed answer as defaults. */
export function codexConfigOf(answer) {
    return rec(rec(answer)?.config);
}
/** The file-backed prefs under `<dir>` (the host's `dataDir` for this
 *  backend). The directory is required: a backend never picks a location of
 *  its own under the host's data directory (D2, B-3/B-5). */
export function fileCodexPrefs(dir, debug = () => undefined) {
    const path = join(dir, FILE);
    const read = () => {
        try {
            return parse(JSON.parse(readFileSync(path, 'utf8')));
        }
        catch {
            return {};
        }
    };
    const save = (next) => {
        try {
            writeFileAtomic(dir, FILE, `${JSON.stringify(next, null, 2)}\n`);
        }
        catch (error) {
            debug(`codex: prefs write failed (${error instanceof Error ? error.message : String(error)})`);
        }
    };
    return {
        read,
        write: patch => { save(patched(read(), patch)); },
        touch: threadId => { save(touched(read(), threadId, Date.now())); },
        forget: threadId => { save(forgotten(read(), threadId)); },
    };
}
/** An in-memory store (tests). */
export function memoryCodexPrefs(initial = {}) {
    let data = { ...initial };
    return {
        get data() { return data; },
        read: () => data,
        write(patch) { data = patched(data, patch); },
        touch(threadId) { data = touched(data, threadId, Date.now()); },
        forget(threadId) { data = forgotten(data, threadId); },
    };
}

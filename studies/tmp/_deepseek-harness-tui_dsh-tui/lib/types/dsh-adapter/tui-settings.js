import { logForDebugging } from '../utils/debug.js';
import { isRecord } from '../backends/shared/jsonl.js';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { withFileLock } from '@deepseek-ai/dsh-atomic-write';
import { backupUnreadableTuiSettings, createTuiSettings, mergeSettingsLayers, profilePatchPath, readLegacyTuiSettings, readProfileTuiSettings, readTuiSettings, TUI_SETTINGS_FILE, writeTuiSettings } from '../tuiSettingsFile.js';
/** A stale-revision write, in the error shape the settings screen retries on. */
class SettingsConflictError extends Error {
    code = 'SETTINGS_CONFLICT';
}
/** Apply one path op to a detached sparse layer; empty parents are pruned. */
function applySettingsOp(layer, op) {
    const [head, ...rest] = op.path;
    if (head === undefined) {
        return op.op === 'set' && isRecord(op.value) ? { ...op.value } : {};
    }
    const next = { ...layer };
    if (rest.length === 0) {
        if (op.op === 'set')
            next[head] = op.value;
        else
            delete next[head];
        return next;
    }
    const child = isRecord(layer[head]) ? layer[head] : {};
    const updated = applySettingsOp(child, op.op === 'set' ? { op: 'set', path: rest, value: op.value } : { op: 'unset', path: rest });
    if (Object.keys(updated).length === 0)
        delete next[head];
    else
        next[head] = updated;
    return next;
}
/**
 * The first boot without a document imports the profile patch's `dsh-tui`
 * row and an older host's `settings.yaml` section (once per source; only the
 * first of concurrent imports is written). A pending `settings.yaml` is the
 * user layer above the row, as on those hosts; one DSH already moved into the
 * patch (`.imported`) sits beneath it, since the patch may be newer. A later
 * boot under a profile whose patch the document was not imported from lays
 * that row beneath the user layer (explicit values always win) and records
 * the new source — the first profile no longer pins the document forever.
 */
function loadTuiSettings(input) {
    const file = input.file ?? TUI_SETTINGS_FILE;
    const existing = readTuiSettings(file);
    if (existing !== undefined) {
        const patch = profilePatchPath(input.profile);
        // 'none' names no source; anything else is a list of imported paths.
        const sources = existing.imported?.from === undefined || existing.imported.from === 'none' ? [] : existing.imported.from.split(', ');
        // An unreadable document keeps this boot's copy; one already carrying
        // this profile's patch (or none at all, `imported`-less) is adopted as is.
        if (existing.imported === undefined || existing.imported.from === 'unreadable' || sources.includes(patch))
            return existing;
        const row = readProfileTuiSettings(patch, input.keys);
        if (row === undefined)
            return existing;
        const reimported = (document) => ({
            version: 1,
            values: mergeSettingsLayers(row, document.values),
            imported: { from: `${document.imported?.from}, ${patch}`, at: Date.now() },
        });
        try {
            // Re-read as late as possible: another process may have written since
            // the first read, and its keys must survive the merge. Not under the
            // writer lock — like the first import, the merge only ever adds keys.
            const fresh = readTuiSettings(file) ?? existing;
            if (fresh.imported === undefined || fresh.imported.from === 'unreadable' || (fresh.imported.from !== 'none' && fresh.imported.from.split(', ').includes(patch)))
                return fresh;
            const next = reimported(fresh);
            writeTuiSettings(next, file);
            return next;
        }
        catch (error) {
            // Still usable for this boot; the next one retries the re-import.
            logForDebugging(`dsh-tui: settings re-import for "${input.profile}" could not be saved (${error instanceof Error ? error.message : String(error)})`);
            return reimported(existing);
        }
    }
    const patch = profilePatchPath(input.profile);
    const row = readProfileTuiSettings(patch, input.keys);
    const legacy = readLegacyTuiSettings(input.ns, input.keys);
    const values = legacy === undefined
        ? row ?? {}
        : legacy.pending ? mergeSettingsLayers(row ?? {}, legacy.values) : mergeSettingsLayers(legacy.values, row ?? {});
    const sources = [...(row === undefined ? [] : [patch]), ...(legacy === undefined ? [] : [legacy.from])];
    const document = { version: 1, values, imported: { from: sources.length === 0 ? 'none' : sources.join(', '), at: Date.now() } };
    try {
        // Two first launches race here: the later one adopts the document the
        // earlier one created rather than replacing it.
        if (!createTuiSettings(document, file))
            return readTuiSettings(file) ?? document;
    }
    catch (error) {
        // Still usable for this boot; the next one retries the import.
        logForDebugging(`dsh-tui: settings import could not be saved (${error instanceof Error ? error.message : String(error)})`);
    }
    return document;
}
export function createTuiSettingsService(input) {
    const file = input.file ?? TUI_SETTINGS_FILE;
    let document = loadTuiSettings({ file, ns: input.ns, profile: input.profile, keys: input.keys });
    /** A fault in the document, shown through `describe` so callers (the
     * settings screen's badges) can see it without a debug flag. */
    let warning = document.imported?.from === 'unreadable' ? { id: 'unreadable' } : undefined;
    let revision = 0;
    let schema;
    const watchers = new Set();
    /** The resolved value: the user layer through the registered schema's
     *  defaults (an invalid layer resolves to the defaults alone). */
    const resolved = () => {
        if (schema === undefined)
            return document.values;
        try {
            return schema(document.values);
        }
        catch (error) {
            logForDebugging(`dsh-tui: settings.json does not validate (${error instanceof Error ? error.message : String(error)}); using defaults`);
            try {
                return schema({});
            }
            catch {
                return {};
            }
        }
    };
    const own = { ns: input.ns, revision: 0, applies: 'live' };
    const describeOwn = () => ({ ...own, revision, value: resolved(), user: document.values, ...(warning === undefined ? {} : { warning }) });
    return {
        register(ns, registered) {
            if (ns !== input.ns)
                throw new Error(`dsh-tui: settings namespace "${ns}" is not served here`);
            schema = registered;
            return {
                get: () => resolved(),
                watch(callback) {
                    const watcher = (next) => { callback(next); };
                    watchers.add(watcher);
                    return () => { watchers.delete(watcher); };
                },
            };
        },
        describe(options) {
            const others = input.delegate?.()?.describe(options).filter(row => row.ns !== input.ns) ?? [];
            return [describeOwn(), ...others];
        },
        async mutate(ns, ops, expectedRevision) {
            if (ns !== input.ns) {
                const delegate = input.delegate?.();
                if (delegate === undefined)
                    throw new Error(`dsh-tui: no settings namespace "${ns}"`);
                return delegate.mutate(ns, ops, expectedRevision);
            }
            if (expectedRevision !== undefined && expectedRevision !== revision) {
                throw new SettingsConflictError(`dsh-tui: settings changed (revision ${revision}, expected ${expectedRevision})`);
            }
            // Apply onto the file as it is now: another dsh-tui process may have
            // written since boot (an unreadable file keeps this process's copy).
            // The lock spans the re-read and the replace, so concurrent writers of
            // different keys both land (its `<file>.lock` sibling needs the directory).
            mkdirSync(dirname(file), { recursive: true });
            await withFileLock(file, async () => {
                const latest = readTuiSettings(file);
                if (latest !== undefined && latest.imported?.from !== 'unreadable') {
                    document = latest;
                }
                else if (latest?.imported?.from === 'unreadable') {
                    // The first write over a document this boot could not parse must
                    // never destroy the original bytes: keep them beside the file (a
                    // failed backup aborts the write — the settings screen reports it).
                    const backup = backupUnreadableTuiSettings(file);
                    warning = { id: 'recovered', backup };
                    logForDebugging(`dsh-tui: settings.json was unreadable; the original bytes were kept at ${backup}`);
                }
                const values = ops.reduce((layer, op) => applySettingsOp(layer, op), { ...document.values });
                // The unreadable marker describes the file as read, not as rewritten.
                const { imported, ...rest } = document;
                const next = { ...rest, values, ...(imported === undefined || imported.from === 'unreadable' ? {} : { imported }) };
                writeTuiSettings(next, file);
                document = next;
            });
            revision += 1;
            const value = resolved();
            for (const watcher of [...watchers]) {
                try {
                    watcher(value);
                }
                catch (error) {
                    logForDebugging(`dsh-tui: settings watcher failed (${error instanceof Error ? error.message : String(error)})`);
                }
            }
        },
        get(ns) {
            if (ns === input.ns)
                return resolved();
            const delegate = input.delegate?.();
            return delegate?.get?.(ns) ?? delegate?.describe().find(row => row.ns === ns)?.value;
        },
    };
}

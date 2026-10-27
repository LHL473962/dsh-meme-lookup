import { walkFiles } from './adapters/scan-fs.js';
import { createForeignImporter } from './import-one.js';
import { MIGRATION_ADAPTERS } from './index.js';
/** Whether an adapter can be browsed (summary scan + full load). */
export function isBrowsable(adapter) {
    return adapter.walk !== undefined && adapter.scan !== undefined && adapter.load !== undefined;
}
const isAbort = (error) => error instanceof Error && error.name === 'AbortError';
const newestFirst = (a, b) => b.updatedAt - a.updatedAt;
function toRow(summary) {
    return { agentId: summary.agentId, key: summary.ref, title: summary.title, cwd: summary.cwd, updatedAt: summary.lastMessageAt };
}
/**
 * The browser behind one channel.
 * @param persistence - The host's session persistence (imports go through it,
 *   so an imported session is immediately visible to resume).
 * @param signal - Aborts in-flight walks when the channel is torn down.
 * @param adapters - Every registered adapter; only browsable ones are used.
 */
export function createForeignBrowser(persistence, signal, adapters = MIGRATION_ADAPTERS) {
    const browsable = adapters.filter(isBrowsable);
    const known = new Map();
    const generations = new Map();
    const importer = createForeignImporter(() => persistence());
    const adapterOf = (agentId) => browsable.find(adapter => adapter.id === agentId);
    const rowsOf = (agentId) => {
        const rows = [];
        for (const entry of known.get(agentId)?.values() ?? [])
            if (entry.summary !== null)
                rows.push(toRow(entry.summary));
        return rows.sort(newestFirst);
    };
    /** Whether a source has at least one candidate; the walk stops at the first. */
    const hasCandidate = async (adapter) => {
        for await (const _file of walkFiles(adapter.roots(), { ...adapter.walk, signal }))
            return true;
        return false;
    };
    return {
        /** Sources with at least one candidate, in registry order. */
        async listSources() {
            const present = await Promise.all(browsable.map(adapter => hasCandidate(adapter).catch(() => false)));
            return browsable.filter((_adapter, index) => present[index]).map(adapter => ({ agentId: adapter.id, label: adapter.label }));
        },
        /**
         * One source's conversations, newest first. A listing superseded by a
         * newer one of the same source resolves to what is known, without
         * publishing its own result.
         */
        async listSessions(agentId, onRow) {
            const adapter = adapterOf(agentId);
            if (adapter === undefined)
                return [];
            const generation = (generations.get(agentId) ?? 0) + 1;
            generations.set(agentId, generation);
            const previous = known.get(agentId);
            let scanned;
            try {
                scanned = await adapter.scan({
                    signal,
                    cached: (ref, fp) => {
                        const entry = previous?.get(ref);
                        return entry !== undefined && entry.fp.mtimeMs === fp.mtimeMs && entry.fp.size === fp.size ? entry.summary : undefined;
                    },
                    onEntry: onRow === undefined ? undefined : summary => onRow(toRow(summary)),
                });
            }
            catch (error) {
                // Channel teardown mid-walk: what is known stands.
                if (isAbort(error))
                    return rowsOf(agentId);
                throw error;
            }
            if (generations.get(agentId) === generation) {
                known.set(agentId, new Map(scanned.map(entry => [entry.ref, { fp: entry.fp, summary: entry.summary }])));
            }
            return rowsOf(agentId);
        },
        /** Import one listed conversation (or find the copy already imported). */
        importSession(agentId, key) {
            const adapter = adapterOf(agentId);
            if (adapter === undefined)
                return Promise.resolve({ kind: 'failed', reason: 'unknown-source' });
            // A key this run never listed still imports: with no known identity the
            // existence check misses, and the id is derived from what is loaded.
            const summary = known.get(agentId)?.get(key)?.summary ?? undefined;
            return importer.import(adapter, { sessionKey: summary?.sessionKey ?? '', ref: key, cwd: summary?.cwd ?? '' });
        },
    };
}

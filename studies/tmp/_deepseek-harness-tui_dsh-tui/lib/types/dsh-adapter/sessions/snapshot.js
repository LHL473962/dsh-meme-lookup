/** DSH provider scope over the shared, first-paint-only listing snapshot. */
import { isAbsolute, normalize } from 'node:path';
import { beginListingSnapshot as begin, readListingSnapshot as read } from '../../sessions/listSnapshot.js';
/** Only the known JSONL provider exposes a public, durable source configuration. */
function sourceKey(source) {
    if (source.name !== 'session-persistence-jsonl')
        return undefined;
    const config = source.config;
    if (config === null || typeof config !== 'object')
        return undefined;
    const { root, compression } = config;
    // Relative roots can change meaning after a workspace switch. Keep exact
    // path case, including on Windows, rather than sharing another store's rows.
    if (typeof root !== 'string' || !isAbsolute(root))
        return undefined;
    if (compression !== undefined && compression !== 'zstd' && compression !== 'none')
        return undefined;
    return JSON.stringify([source.name, normalize(root), compression ?? 'zstd']);
}
export function readListingSnapshot(source) {
    const key = sourceKey(source);
    return key === undefined ? undefined : read(key);
}
export function beginListingSnapshot(source) {
    const key = sourceKey(source);
    return key === undefined ? () => { } : begin(key);
}

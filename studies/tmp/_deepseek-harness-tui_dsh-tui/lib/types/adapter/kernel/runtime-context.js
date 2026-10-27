/** Immutable adapter runtime snapshot bound to one Cordis composition. */
import { compositionRoot } from '../../dsh-adapter/host-access.js';
import { parseAdapterRuntime, } from './runtime.js';
const snapshots = new WeakMap();
/**
 * Capture adapter mode and slice selection once for a composition. Runtime
 * policy must not be re-read from process.env by individual services: doing
 * so lets an in-process caller change shadow policy after mount.
 */
export function adapterRuntimeFor(ctx) {
    const root = compositionRoot(ctx);
    const key = root;
    const existing = snapshots.get(key);
    if (existing !== undefined)
        return existing;
    const snapshot = parseAdapterRuntime();
    snapshots.set(key, snapshot);
    return snapshot;
}
/** Test/embedding hook: explicit env input remains available without making
 * production services depend on mutable process state after construction. */
export function snapshotAdapterRuntime(env) {
    return parseAdapterRuntime(env);
}

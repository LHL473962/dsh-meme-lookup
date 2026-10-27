/** Immutable adapter runtime snapshot bound to one Cordis composition. */
import { compositionRoot } from '../../dsh-adapter/host-access.js';
import { type AdapterRuntimeOptions } from './runtime.js';
type AdapterContext = Parameters<typeof compositionRoot>[0];
/**
 * Capture adapter mode and slice selection once for a composition. Runtime
 * policy must not be re-read from process.env by individual services: doing
 * so lets an in-process caller change shadow policy after mount.
 */
export declare function adapterRuntimeFor(ctx: AdapterContext): AdapterRuntimeOptions;
/** Test/embedding hook: explicit env input remains available without making
 * production services depend on mutable process state after construction. */
export declare function snapshotAdapterRuntime(env: NodeJS.ProcessEnv): AdapterRuntimeOptions;
export {};
//# sourceMappingURL=runtime-context.d.ts.map
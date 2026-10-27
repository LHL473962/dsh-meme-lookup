/**
 * Replay-shadow isolation.
 *
 * Replay Shadow is only allowed inside an explicitly entered isolated replay
 * harness. This module is intentionally not re-exported through the kernel
 * public index: production code cannot accidentally enable replay semantics.
 *
 * The isolation is an explicit, scoped harness context rather than a mutable
 * process-global boolean:
 *
 * - `withReplayIsolation(callback)` runs `callback` inside an
 *   AsyncLocalStorage context. The context lasts only for that callback's
 *   async work; a thrown/rejected callback cannot leave a global permit
 *   behind.
 * - `enterReplayIsolation()` may only be called while already inside a
 *   `withReplayIsolation` scope (for nested leases). Calling it outside the
 *   scope throws, so a forgotten release cannot accidentally enable replay
 *   semantics on a real host.
 */
/** Run a callback inside an explicitly isolated replay context. */
export declare function withReplayIsolation<T>(callback: () => T): T;
/** Enter a nested replay-isolation lease. Must be called inside a
 * `withReplayIsolation` scope; returns a disposer that decrements the depth. */
export declare function enterReplayIsolation(): () => void;
/** True while an isolated replay context is active in the current async chain. */
export declare function isReplayIsolationActive(): boolean;
//# sourceMappingURL=replay-isolation.d.ts.map
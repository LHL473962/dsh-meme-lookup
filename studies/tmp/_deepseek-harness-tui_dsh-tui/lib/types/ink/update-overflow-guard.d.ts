/**
 * Self-healing guard for React's nested-update overflow — Minified React
 * error #185 ("Maximum update depth exceeded").
 *
 * WHY THIS EXISTS — the crash is a ratchet, not a single bad component.
 * react-reconciler counts consecutive commits that each end with more
 * pending Sync/InputContinuous/Default-lane updates on the same root
 * (`nestedUpdateCount`); once 50 commits pass without one that drains the
 * queue, the NEXT update enqueue throws #185 — from whichever timer or
 * store notification happens to fire first, which is why the stack points
 * at an innocent animation tick while the actual oscillating component is
 * someone else entirely (the upstream fork lineage hit this repeatedly:
 * Divider measure loops, MessageList streaming measure cascades, and the
 * repeated layout measurements during streaming).
 *
 * The throw is SELF-HEALING BY CONTRACT: `getRootForUpdatedFiber` resets
 * `nestedUpdateCount` to 0 and clears `rootWithNestedUpdates` *before*
 * throwing, so swallowing exactly this error class skips at most one frame
 * of animation while the next commit starts from a clean counter. That
 * turns a process-killing crash into a dropped tick plus a rate-limited
 * diagnostic breadcrumb naming the enqueue site that surfaced it.
 *
 * This guard deliberately does NOT swallow anything else: unknown errors
 * rethrow unchanged.
 */
/** Quench action for a source: pause its notification channel for `ms`. */
export type OverflowQuench = (ms: number) => void;
/** Test seam: reset rate-limit bookkeeping. */
export declare function resetUpdateOverflowGuardForTest(): void;
/**
 * Register a circuit-breaker action for a source. When the source trips
 * (sustained oscillation), the quench pauses its notification channel for
 * the backoff window — the strongest self-healing the guard can do without
 * killing the process. Sources without a quench (data channels that must
 * not stall) only get the escalated ERROR log.
 */
export declare function registerOverflowQuench(source: string, quench: OverflowQuench): void;
/**
 * Whether an error is the nested-update overflow (#185) — by message, the
 * only signal the production build exposes.
 */
export declare function isNestedUpdateOverflow(error: unknown): boolean;
/**
 * Swallow the nested-update overflow error, logging (rate-limited, with a
 * running count per window) which enqueue site surfaced it. Any other error
 * returns false so callers rethrow it untouched.
 *
 * @param error - The caught error from a subscriber/enqueue notification.
 * @param source - Stable label naming the enqueue site (for the log line).
 * @returns true when the error was the overflow and has been absorbed.
 */
export declare function swallowNestedUpdateOverflow(error: unknown, source: string): boolean;
/**
 * Invoke a notification callback with the overflow guard applied. The
 * callback's own non-overflow errors propagate unchanged.
 *
 * @param source - Stable label naming the enqueue site (for the log line).
 * @param onChange - The subscriber callback about to run.
 */
export declare function callWithUpdateOverflowGuard(source: string, onChange: () => void): void;
/**
 * Whether one more root-boundary #185 recovery is allowed inside the window
 * (the recovery is recorded when it is). `now` is injectable for tests.
 */
export declare function shouldRecoverBoundaryOverflow(now?: number): boolean;
/** Record that the upcoming mount follows an overflow recovery. */
export declare function noteBoundaryRecoveryRemount(): void;
/** Consume the recovery-remount mark: true at most once per recovery. */
export declare function consumeBoundaryRecoveryRemount(): boolean;
/**
 * Origin of a process-level fatal error, as reported to the sink.
 */
export type ProcessGuardOrigin = 'uncaughtException' | 'unhandledRejection';
/**
 * Fatal-error sink installed by the process owner (the dsh-tui runtime, which
 * routes it into the TUI's single exit funnel). Returning true means the sink
 * took ownership of the process — it runs the teardown (resume marker,
 * terminal restore, `dsh-tui crashed: …`) and exits non-zero. Returning false
 * leaves the error to Node's default crash, which keeps "fail loud, non-zero"
 * true when no sink is registered or the tree is being torn down.
 */
export type ProcessGuardFatalSink = (error: unknown, origin: ProcessGuardOrigin) => boolean;
/** Register (or clear, with undefined) the fatal-error sink. */
export declare function registerProcessGuardFatalSink(sink: ProcessGuardFatalSink | undefined): void;
/**
 * Normalize the reason handed to a fatal sink so the exit funnel can never
 * mistake a fatal error for a clean user exit. `Promise.reject()` and
 * `throw undefined` deliver `undefined`, and the funnel selects its crash path
 * with `error !== undefined` — passing the raw reason through would run the
 * zero-exit path while the sink reported that it owned the process. Defined
 * reasons (including non-Error values) are returned unchanged.
 */
export declare function fatalReasonForExit(error: unknown, origin: ProcessGuardOrigin): unknown;
/** Absorb one more error class at the process level (the absorber logs what
 *  it takes); returns the unregister handle. */
export declare function addProcessErrorAbsorber(absorb: (error: unknown) => boolean): () => void;
/** Whether the guard's process listeners are installed; the standalone entry
 *  drops DSH's fail-loud handlers only then (src/dsh-adapter/process-exit.ts). */
export declare function processGuardActive(): boolean;
export declare function installNestedUpdateOverflowProcessGuard(): void;
//# sourceMappingURL=update-overflow-guard.d.ts.map
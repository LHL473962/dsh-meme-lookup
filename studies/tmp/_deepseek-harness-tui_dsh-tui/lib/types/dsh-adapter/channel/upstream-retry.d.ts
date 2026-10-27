/**
 * Upstream auto-retry for DSH sessions: the llm-retry plugin (dsh-base)
 * already retries transient model-request failures per each provider
 * route's resolved retry policy, but the stock retryable-code set
 * (EMPTY_RESPONSE / RATE_LIMIT / SERVER / TIMEOUT / TRANSPORT) does not
 * include STREAM_CLOSED — the code dsh-llm-pi-ai throws when an upstream
 * SSE stream simply ends with no terminal event, i.e. the bare upstream
 * link drop. Those drops are exactly as transient as the classified
 * transport errors, so this module widens the policy to cover them.
 *
 * The widening is delivered where the retry policy actually lives: the
 * 'llm-pi-ai' settings section's 'providers.<route>.retryPolicy' field
 * (dsh-llm-retry executes it; the TUI never retries anything itself).
 * ensureUpstreamRetry seeds that field ONLY on the route(s) the bound
 * session actually uses (the channel feeds it the live provider at every
 * bind — boot, resume — and on each /model switch), and only when that route declares
 * no retryPolicy: an explicit value (from cordis.yml or a hand-edited
 * settings document) is a deliberate choice and is never overwritten, and
 * dormant channels are never touched. The settings user layer merges
 * recursively over the composition base, so a route configured through
 * the profile patch is reached with all its other fields intact.
 *
 * @module @deepseek-harness-tui/dsh-tui/channel/upstream-retry
 */
import type { Context } from '@deepseek-ai/cordis';
/** Retry attempts after the first request, matching both the upstream
 *  default and the product ask (retry 5 times). */
export declare const UPSTREAM_RETRY_MAX_RETRIES = 5;
/**
 * Failure codes the widened policy retries: the stock set dsh-llm's
 * resolveRetryPolicy defaults to, plus STREAM_CLOSED (dsh-llm-pi-ai's
 * signature for an upstream event stream that ended without a terminal
 * event). Codes outside the set (AUTH, INVALID_REQUEST, QUOTA, …) stay
 * non-retryable exactly as before.
 */
export declare const UPSTREAM_RETRYABLE_CODES: readonly string[];
/**
 * The retry policy value written under 'providers.<route>.retryPolicy'
 * (RetryPolicySchema's normal mode). A fresh object per call: settings
 * documents are plain JSON, never shared module state.
 */
export declare function upstreamRetryPolicy(): {
    mode: 'normal';
    maxRetries: number;
    retryableCodes: readonly string[];
};
/**
 * Provider routes whose resolved profile declares no retryPolicy — the ones
 * ensureUpstreamRetry may seed. A present value (any shape) marks a
 * deliberate choice and keeps the route out. With `wanted`, only those
 * routes are considered — the caller names the route(s) its session
 * actually uses, so dormant channels are never touched.
 */
export declare function routesWithoutRetryPolicy(section: unknown, wanted?: readonly string[]): readonly string[];
/** One settings mutation op per route (see ensureUpstreamRetry). */
export declare function upstreamRetryOps(routes: readonly string[]): readonly {
    op: 'set';
    path: readonly string[];
    value: unknown;
}[];
/**
 * Seed 'retryPolicy' (normal mode, 5 retries, transport-drop-aware codes)
 * on the given llm-pi-ai routes — and only those — when their resolved
 * profiles lack one, through the official settings mutation path (one
 * stale-revision retry, same contract as the provider wizard). Callers
 * name the route(s) the bound session actually uses, so channels nobody
 * switched to are never written. Per-route once-per-process is the
 * caller's guard; after a successful write the route carries the policy
 * and drops out on its own.
 * Best effort: no settings service, no llm-pi-ai namespace, a route the
 * section does not know (a non-pi-ai adapter route), or a refused write
 * all stay quiet (warn to the log on real errors).
 * @param ctx - Context with the settings service (optional at runtime).
 * @param notify - Channel notification for the one success line.
 * @param routes - Provider routes the current session uses.
 */
export declare function ensureUpstreamRetry(ctx: Context, notify: (text: string, options?: {
    color?: 'success' | 'warning' | 'error';
    timeoutMs?: number;
}) => void, routes: readonly string[]): Promise<void>;
//# sourceMappingURL=upstream-retry.d.ts.map
import { cleanScalarText } from './sanitize.js';
import { DECISION_EVENT_PERMISSIONS, decisionHandlersOf, decisionRegistryOf, isDecisionHandlerLive, } from './decision-guard.js';
/** Toast-bound plugin text (veto reasons) is render-path data: sanitized
 *  with the one shared implementation, capped at toast width. */
const NOTICE_CELLS = 200;
/** Explicit budgets from the DecisionEvents profile.  A timed-out handler is
 * treated as no-opinion and the chain continues; once the total budget is
 * exhausted the remaining handlers are skipped with the same policy. */
export const DECISION_HANDLER_TIMEOUT_MS = 1000;
export const DECISION_TOTAL_TIMEOUT_MS = 5000;
function freezeClone(value) {
    const seen = new WeakSet();
    const freeze = (current) => {
        if (current === null || typeof current !== 'object' || Object.isFrozen(current))
            return current;
        if (seen.has(current))
            return current;
        seen.add(current);
        for (const child of Object.values(current))
            freeze(child);
        return Object.freeze(current);
    };
    let copy;
    try {
        copy = structuredClone(value);
    }
    catch {
        // Decision payloads are host-created records.  Keep a defensive fallback
        // for degraded embedders rather than handing a shared object to a plugin.
        copy = JSON.parse(JSON.stringify(value));
    }
    return freeze(copy);
}
async function runBounded(task, timeoutMs) {
    let timer;
    const work = Promise.resolve()
        .then(task)
        .then(value => ({ kind: 'value', value }), error => ({ kind: 'error', error }));
    const timeout = new Promise(resolve => {
        timer = setTimeout(() => resolve({ kind: 'timeout' }), timeoutMs);
    });
    try {
        return await Promise.race([work, timeout]);
    }
    finally {
        if (timer !== undefined)
            clearTimeout(timer);
        // `work` has rejection handlers attached above, so a promise that settles
        // after a timeout cannot become an unhandled rejection.
    }
}
/**
 * Dispatch a decision event listener-by-listener in the host's stable order.
 *
 * Deliberately NOT `ctx.serial`: cordis bails at ANY non-null/false/undefined
 * return, so a malformed-but-object decision (a blank `{ text }` rewrite, a
 * junk primitive) would cut the chain before a later veto listener runs —
 * and one throwing listener rejects the whole dispatch, skipping every later
 * listener. Here:
 *
 * - a throwing listener is logged and the chain CONTINUES;
 * - each return value passes through `normalize` (per-event validation)
 *   INSIDE the same isolation boundary — a Proxy/throwing-getter return is
 *   logged and skipped like any other invalid shape;
 * - "no opinion" (undefined/null/false) and invalid shapes are logged and
 *   the chain CONTINUES;
 * - the first listener whose NORMALIZED decision is non-undefined wins;
 * - a decision that arrives after the handler was released (grant revoked,
 *   activation unloaded) is DISCARDED and the chain continues, because a
 *   handler is awaited: authority can end while its answer is still pending.
 *
 * Handlers come from the host-mediated DecisionEvents registry.  Raw Cordis
 * `ctx.on` listeners are intentionally absent from this path.
 */
export async function dispatchTuiDecision(ctx, name, payload, normalize) {
    const sessionId = typeof payload.sessionId === 'string' ? payload.sessionId : undefined;
    const scope = sessionId === undefined ? undefined : `session:${sessionId}`;
    const listeners = decisionHandlersOf(ctx, name, scope);
    const log = (message, error) => {
        try {
            if (error === undefined)
                ctx.logger.warn(message);
            else
                ctx.logger.warn(message, error);
        }
        catch {
            // Degraded ctx without a logger: warnings are best-effort.
        }
    };
    const started = Date.now();
    for (const handler of listeners) {
        // The handler's declared scope and its live grant, checked at the concrete
        // payload scope. GrantStore applies parent-scope grants and narrow deny
        // precedence, so an event-wide grant cannot bypass a revoked session; the
        // same check re-runs after the await below.
        const effectiveScope = scope ?? handler.scope;
        if (!isDecisionHandlerLive(ctx, handler, effectiveScope)) {
            log(`dsh-tui: ${name} handler from Component "${handler.componentId}" skipped after grant revocation`);
            continue;
        }
        const remaining = DECISION_TOTAL_TIMEOUT_MS - (Date.now() - started);
        if (remaining <= 0) {
            log(`dsh-tui: ${name} total decision budget exceeded; remaining handlers skipped`);
            break;
        }
        const bounded = await runBounded(() => handler.listener(freezeClone(payload)), Math.min(DECISION_HANDLER_TIMEOUT_MS, remaining));
        if (bounded.kind === 'timeout') {
            log(`dsh-tui: ${name} handler from Component "${handler.componentId}" exceeded ${DECISION_HANDLER_TIMEOUT_MS}ms; continuing`);
            continue;
        }
        if (bounded.kind === 'error') {
            log(`dsh-tui: ${name} listener failed; continuing with the next listener: %o`, bounded.error);
            continue;
        }
        const result = bounded.value;
        // normalize runs INSIDE the isolation boundary too: a hostile return
        // value (a Proxy or a throwing getter) must not reject the dispatch —
        // that would cut the chain before later veto listeners run, and leave
        // unhandled rejections at the fire-and-forget call sites.
        let decision;
        try {
            decision = normalize(result, what => log(`dsh-tui: ${name} listener returned ${what}; ignored`));
        }
        catch (error) {
            log(`dsh-tui: ${name} listener returned a value that threw during validation; ignored: %o`, error);
            continue;
        }
        if (decision !== undefined) {
            // The handler was awaited, so re-check liveness before accepting its
            // answer: a grant revoked or an activation unloaded during the await
            // releases the registration, and an answer from a released handler must
            // not win the chain. Continuing (rather than returning undefined) keeps
            // the released handler "as if unregistered".
            if (!isDecisionHandlerLive(ctx, handler, effectiveScope)) {
                log(`dsh-tui: ${name} handler from Component "${handler.componentId}" answered after its grant or activation was released; decision discarded`);
                continue;
            }
            return decision;
        }
    }
    return undefined;
}
/** Fire a non-veto DecisionEvents point with the same bounded, isolated
 * semantics.  Notifications deliberately ignore every return value. */
export async function dispatchTuiNotification(ctx, name, payload) {
    const sessionId = typeof payload.sessionId === 'string' ? payload.sessionId : undefined;
    const scope = sessionId === undefined ? undefined : `session:${sessionId}`;
    const listeners = decisionHandlersOf(ctx, name, scope);
    const log = (message, error) => {
        try {
            if (error === undefined)
                ctx.logger.warn(message);
            else
                ctx.logger.warn(message, error);
        }
        catch {
            // Degraded ctx without a logger: warnings are best-effort.
        }
    };
    const started = Date.now();
    // Notifications have no return-value or ordering semantics. Start every
    // listener from the same snapshot so one slow plugin cannot delay another
    // plugin's session rebind (or make a fire-and-forget dispatch look stuck).
    await Promise.all(listeners.map(async (handler) => {
        const permission = DECISION_EVENT_PERMISSIONS[name];
        const principal = { componentId: handler.componentId, activationId: handler.activationId };
        if (permission !== undefined
            && !decisionRegistryOf(ctx).grants.allows(principal, permission, scope ?? handler.scope)) {
            log(`dsh-tui: ${name} handler from Component "${handler.componentId}" skipped after grant revocation`);
            return;
        }
        const remaining = DECISION_TOTAL_TIMEOUT_MS - (Date.now() - started);
        if (remaining <= 0) {
            log(`dsh-tui: ${name} total decision budget exceeded; handler skipped`);
            return;
        }
        const bounded = await runBounded(() => handler.listener(freezeClone(payload)), Math.min(DECISION_HANDLER_TIMEOUT_MS, remaining));
        if (bounded.kind === 'timeout') {
            log(`dsh-tui: ${name} handler from Component "${handler.componentId}" exceeded ${DECISION_HANDLER_TIMEOUT_MS}ms; continuing`);
        }
        else if (bounded.kind === 'error') {
            log(`dsh-tui: ${name} listener failed; continuing with the other listeners: %o`, bounded.error);
        }
    }));
}
/** Shared normalizer for the veto-only decisions (session-switch, compact):
 *  `{ cancel: true, reason? }` or no opinion; everything else is ignored.
 *  The reason is toast-bound plugin text — sanitized (a veto must not
 *  smuggle control sequences onto the screen). */
export function normalizeCancelDecision(result, warn) {
    if (result === undefined || result === null || result === false)
        return undefined;
    if (typeof result === 'object' && result.cancel === true) {
        const reason = cleanScalarText(result.reason, NOTICE_CELLS);
        return { cancel: true, ...(reason === '' ? {} : { reason }) };
    }
    warn('an unrecognized decision shape');
    return undefined;
}

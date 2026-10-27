/**
 * User-question answerer compatibility.
 *
 * Legacy rc.2 exposes one global `registerProvider` seat. The 0.1.2 line removed that
 * API in favour of a scope-aware `user-questions/request` waterfall. Keep the
 * capability probe and both registration paths here so the TUI bootstrap only
 * consumes a small prepared-registration result.
 */
import { decideQuestionProviderYield, incumbentQuestionProviderId, tagTuiQuestionProvider, } from './providerGuard.js';
function hasLegacyProvider(service) {
    return typeof service.registerProvider === 'function';
}
/**
 * Prepare the answerer against whichever upstream API the active package
 * exposes. The legacy path registers immediately and binds the returned
 * disposer to this TUI fiber. The waterfall path returns a late binder because
 * channel.agentId changes across `/new`, `/resume`, and rewind.
 *
 * Agentless waterfall requests are claimed deliberately: dsh-auth's `/auth`
 * wizard asks through the same service without an agent. Foreign-agent
 * requests continue to the next answerer.
 *
 * Security scope (#586): the provider-seat guard (DUPLICATE_PROVIDER probe +
 * private symbol check) exists ONLY on the legacy path. The waterfall has no
 * seat. Agent-bearing requests are scope-filtered; agentless requests such as
 * dsh-auth `/auth` are dispatched without a scope carrier. Under the answerer
 * contract, the first eligible listener that returns instead of delegating
 * with `next()` claims the request. Cordis waterfall is around middleware,
 * however: an outer listener can call `next()` and then observe, replace, or
 * reject the downstream result, while `{ prepend: true }` inserts a listener
 * at the front. Upstream exposes no supported way to discover or reserve an
 * exclusive claimant, so the legacy guard and its warning cannot be
 * reproduced here.
 */
export function prepareQuestionAnswerer(ctx, service, answerer) {
    if (!hasLegacyProvider(service)) {
        const events = ctx;
        return {
            kind: 'waterfall',
            register: owner => events.on('user-questions/request', (request, next) => {
                if (request.agent !== undefined && String(request.agent.id) !== owner.agentId)
                    return next();
                return answerer.ask(request);
            }),
        };
    }
    const provider = { ask: request => answerer.ask(request) };
    tagTuiQuestionProvider(provider);
    try {
        ctx.effect(() => service.registerProvider(provider), 'dsh-tui.questions.legacy-provider');
        return { kind: 'legacy' };
    }
    catch (error) {
        if (error.code !== 'DUPLICATE_PROVIDER')
            throw error;
        return {
            kind: 'legacy',
            yieldDecision: decideQuestionProviderYield(incumbentQuestionProviderId(service)),
        };
    }
}

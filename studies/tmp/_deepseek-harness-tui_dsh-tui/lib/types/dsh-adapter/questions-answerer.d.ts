/**
 * User-question answerer compatibility.
 *
 * Legacy rc.2 exposes one global `registerProvider` seat. The 0.1.2 line removed that
 * API in favour of a scope-aware `user-questions/request` waterfall. Keep the
 * capability probe and both registration paths here so the TUI bootstrap only
 * consumes a small prepared-registration result.
 */
import type { Context } from '@deepseek-ai/cordis';
import type { AskUserQuestionAnswer, AskUserQuestionRequest } from '@deepseek-ai/dsh-user-questions';
import { type QuestionProviderYieldDecision } from './providerGuard.js';
export interface QuestionAnswerer {
    ask(request: AskUserQuestionRequest): Promise<AskUserQuestionAnswer>;
}
export type PreparedQuestionAnswerer = {
    readonly kind: 'legacy';
    /** Present only when another component already owns the provider seat. */
    readonly yieldDecision?: QuestionProviderYieldDecision;
} | {
    readonly kind: 'waterfall';
    /** Bind ownership after the mutable channel has been created. */
    register(owner: {
        readonly agentId: string;
    }): () => void;
};
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
export declare function prepareQuestionAnswerer(ctx: Context, service: unknown, answerer: QuestionAnswerer): PreparedQuestionAnswerer;
//# sourceMappingURL=questions-answerer.d.ts.map
/**
 * Question-provider seat guard (issue #98 security follow-up).
 *
 * On the legacy/rc `registerProvider` API, the harness allows exactly ONE
 * user-questions provider per context. The original fix made this TUI yield
 * the seat silently on DUPLICATE_PROVIDER so profiles carrying
 * @deepseek-ai/dsh-web-app keep booting — but silence cuts both ways: a
 * malicious plugin that registers FIRST also gets silent ownership of the
 * questionnaire and can answer the model's ask_user_question on the user's
 * behalf.
 *
 * The upstream error carries no incumbent identity (fixed message + code
 * only), and the public API offers no query — but the service stores the
 * incumbent provider object on its `provider` property, which is reachable
 * structurally. This module turns that probe into a whitelist decision with
 * PROVENANCE: silent yields are reserved for host-verified identities (this
 * module's private symbol tag — the true host-coexistence scenario), while a
 * whitelist hit that the incumbent merely self-reported (name/hostId/id
 * fields any plugin can copy) gets an honest "identity not host-verified"
 * alert: forgeable silence is worse than a loud warning.
 */
/**
 * Front doors allowed to hold the questionnaire seat without a notice.
 * Third-party plugins must not be listed here: the seat decides who speaks
 * FOR the user to the model.
 */
export declare const QUESTION_PROVIDER_HOST_WHITELIST: readonly string[];
/**
 * The incumbent provider's identity as probed off the service, plus whether
 * that identity is host-verified. `verified: true` can only be minted by
 * this module's private symbol tag; self-reported `name`/`hostId`/`id`
 * fields are readable but forgeable by any plugin.
 */
export interface IncumbentQuestionProviderIdentity {
    readonly id: string;
    readonly verified: boolean;
}
/** What apply() should do after a DUPLICATE_PROVIDER registration attempt. */
export interface QuestionProviderYieldDecision {
    /**
     * `silent` keeps the issue-#98 behavior (host-verified whitelist only);
     * `alert` notifies the user; `alert-unverified` is the honest variant for
     * a self-reported whitelist hit — the name matches a host front door but
     * nothing proves who wrote it.
     */
    readonly action: 'silent' | 'alert' | 'alert-unverified';
    /** The incumbent identity the decision was based on, when one was found. */
    readonly incumbentId: string | undefined;
}
/**
 * Decide how to react to an incumbent user-questions provider. Only a
 * HOST-VERIFIED whitelisted incumbent (the symbol tag) keeps the silent
 * yield: a self-reported `name: 'dsh-web-app'` is exactly what a seat
 * squatter would write, so whitelist hits without verification get the
 * unverified alert instead of silence. Third-party ids and no identity at
 * all alert — the conservative default, because silence is exactly what an
 * attacker squatting the seat wants.
 */
export declare function decideQuestionProviderYield(incumbent: IncumbentQuestionProviderIdentity | undefined): QuestionProviderYieldDecision;
/** Tag a provider this TUI is about to register so a later boot (recompose
 * leftover, restart race) can recognize itself in the seat. */
export declare function tagTuiQuestionProvider(provider: object): void;
/**
 * Probe the user-questions service for the incumbent provider's identity.
 *
 * Recognition order:
 *   1. this TUI's private symbol tag (unforgeable outside the module) —
 *      reported as verified;
 *   2. an explicit identity marker the incumbent attached (`name`, `hostId`,
 *      `id`) — readable for the notice text but reported as unverified,
 *      because those fields are trivially copyable by a squatter;
 *   3. nothing — return undefined, which the decision maps to the alert path.
 */
export declare function incumbentQuestionProviderId(service: object): IncumbentQuestionProviderIdentity | undefined;
//# sourceMappingURL=providerGuard.d.ts.map
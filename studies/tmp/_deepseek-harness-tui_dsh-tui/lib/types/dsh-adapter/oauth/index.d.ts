/**
 * Built-in subscription OAuth sign-in as LLM provider routes.
 *
 * One internal Cordis module mounts supported subscription routes from the
 * installed pi-ai catalog (ChatGPT/Codex, Claude, Grok, and newer flows when
 * available) as `llm` registry routes. Signed-in models appear in model
 * pickers; unsigned routes remain addressable for saved sessions. When the
 * Host supplies `deepseekAccount`, the same sign-in surface also delegates
 * DeepSeek browser authorization to that service; the Host owns its model
 * route, callback, and credential store.
 * `PiAiAdapter` runs with this
 * module's file-backed pi-ai `CredentialStore` injected
 * (`PiAiAuthInjection`): requests resolve the stored OAuth credential through
 * the provider's own auth and rotate refresh tokens under the store's lock.
 * Login/logout run over the `userQuestions` seam, so they work on any
 * interactive surface and refuse cleanly where none exists (TUI-RUN-001).
 *
 * ```yaml
 * - id: dsh-tui-auth
 *   name: '@deepseek-harness-tui/dsh-tui/oauth'
 *   inject: [llm, commands]
 *   config:
 *     # providers: [openai-codex, anthropic, xai]  # optional catalog subset;
 *     # newer pi-ai also offers openai and meta
 *     # credentialsFile: /secure/path/credentials.json   # default $DSH_HOME/dsh-auth/
 *     # Per-provider catalog overrides, keyed by provider id then model id:
 *     # any optional field keeps the installed catalog's value. The example
 *     # below tunes the Codex `gpt-5.6-sol` context window to 1M tokens.
 *     # modelOverrides:
 *     #   openai-codex:
 *     #     gpt-5.6-sol:
 *     #       contextWindow: 1000000
 * ```
 *
 * Routes register individually: a route another adapter family already owns
 * (an llm-pi-ai settings profile for the same provider) is refused by the
 * registry — that refusal is logged and the remaining routes still mount.
 *
 * @module @deepseek-harness-tui/dsh-tui/oauth
 */
import type { Context } from '@deepseek-ai/cordis';
import z from '@deepseek-ai/schemastery';
import type { LlmModelInfo } from '@deepseek-ai/dsh-llm';
import { PiAiAdapter } from '@deepseek-ai/dsh-llm-pi-ai';
import type { PiAiAdapterOptions } from '@deepseek-ai/dsh-llm-pi-ai';
import { type ModelOverride } from './profiles.js';
export declare const name = "dsh-auth";
/**
 * Deliberately empty. A hard code-level inject would deadlock any
 * composition lacking the `llm`/`commands` services at boot ("pending
 * (waiting for service: …)") — the failure mode dsh-tui documented for its
 * optional rows (#183). Both services resolve per call through `ctx.get` in
 * {@link apply}; the profile patch declares the inject at the *entry* level,
 * where a stale patch cannot deadlock a newer boot.
 */
export declare const inject: readonly string[];
/** Plugin configuration. */
export interface Config {
    /** Provider routes to mount; omitted means every supported flow in the installed pi-ai catalog. */
    providers?: string[];
    /** Credential file override; default `$DSH_HOME/dsh-auth/credentials.json`. */
    credentialsFile?: string;
    /**
     * Per-provider catalog overrides, keyed by provider id then model id (see
     * {@link ModelOverride}). A provider key naming a provider that is not
     * among the mounted set — or a model id the provider's catalog does not
     * ship — is refused, never skipped, so a typo lands as a boot error.
     */
    modelOverrides?: Record<string, Record<string, ModelOverride>>;
}
export declare const Config: z<Config>;
export type { DshAuthApi, DshAuthLoginResult, DshAuthSignInStatus, DshAuthService } from './service.js';
export { createDshAuthApi } from './service.js';
export { QuestionBridge, describeEvent } from './interaction.js';
export type { AskFn, QuestionBridgeHelpers } from './interaction.js';
export { copyToClipboard, openInBrowser, openerFor } from './opener.js';
export { CredentialFile, defaultCredentialsFile } from './credentials.js';
export { OAUTH_PROVIDER_IDS, availableOAuthProviderIds, buildOAuthProfile, type ModelOverride } from './profiles.js';
export { DEEPSEEK_ACCOUNT_PROVIDER, deepSeekAccountFrom, deepSeekCallbackOrigin, deepSeekClientMetadata, loginDeepSeekAccount } from './deepseek.js';
export { WhaleCouponStore } from './bonus.js';
/**
 * The adapter the plugin registers: a {@link PiAiAdapter} whose *advisory
 * catalog* is credential-gated. A provider with no stored OAuth credential
 * lists no models — its rows never reach any model picker, which is the
 * whole point: picking a model that would only fail with "not signed in"
 * is noise. The gate only shapes `listModels`; `resolveModel` and requests
 * are untouched, so a model id already saved in a session (or named
 * explicitly) keeps resolving exactly as the registry contract promises
 * ("advisory and never changes routing").
 *
 * An expired-but-stored credential still lists: token refresh runs on the
 * next request, and a picker that hid a refreshable provider would look
 * signed-out when it is not.
 */
export declare class CredentialGatedAdapter extends PiAiAdapter {
    private readonly hasCredential;
    constructor(options: PiAiAdapterOptions, hasCredential: (provider: string) => Promise<boolean>);
    listModels(provider: string): Promise<readonly LlmModelInfo[]>;
}
/** Mount the routes, the service, and the command. */
export declare function apply(ctx: Context, config: Config): void;
//# sourceMappingURL=index.d.ts.map
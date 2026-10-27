/**
 * Provider routes this plugin owns: the pi-ai catalog providers that ship an
 * OAuth flow, mounted with their catalog models, wire implementations, and
 * OAuth flow objects untouched. Credential resolution is not wrapped at all —
 * the adapter's collection carries this plugin's `CredentialStore`
 * (`PiAiAuthInjection`), so requests resolve the stored OAuth credential
 * through the provider's own auth and refresh tokens under the store's lock.
 *
 * The hand-built profile mirrors what an empty llm-pi-ai settings profile
 * resolves to for a catalog route, including the image-request defaults
 * (llm-pi-ai's own `DEFAULT_*` constants are not exported; the values below
 * are those constants, and the comment on each says so).
 *
 * @module @deepseek-harness-tui/dsh-tui/oauth/profiles
 */
import type { ResolvedPiAiProviderProfile } from '@deepseek-ai/dsh-llm-pi-ai';
import { type PiAiProvider } from './pi-ai.js';
/** Subscription routes this build can mount, in picker order. */
export declare const OAUTH_PROVIDER_IDS: readonly ["openai", "openai-codex", "anthropic", "xai", "meta"];
/** One routable provider id. */
export type OAuthProviderId = (typeof OAUTH_PROVIDER_IDS)[number];
/** Mount only flows actually shipped by the adapter's pi-ai instance. */
export declare function availableOAuthProviderIds(): OAuthProviderId[];
/**
 * One per-model catalog override a deployment may name, keyed by model id.
 * Every field is optional; an absent field keeps the installed catalog's
 * value, so one model's capacity can be tuned without restating the rest.
 */
export interface ModelOverride {
    /** Override the installed catalog's context window, in tokens. */
    contextWindow?: number;
    /** Override the installed catalog's max output tokens. */
    maxTokens?: number;
}
/** The OAuth flow object for one mounted route (login/refresh/toAuth live here). */
export declare function oauthOf(route: PiAiProvider): NonNullable<PiAiProvider['auth']['oauth']>;
/**
 * Build the resolved profile one route registers under. Mirrors the fields
 * `PiAiAdapter` reads: identity for selectors, the idle timeout, retry
 * policy, and image budgets it forwards per request, and the catalog provider
 * with its own models. Everything optional stays absent — the adapter treats
 * absence as "provider defaults" exactly as an empty llm-pi-ai profile would.
 * @param id - the OAuth provider route to mount.
 * @param modelOverrides - optional per-model catalog overrides (see
 *   {@link ModelOverride}); `undefined` serves the installed catalog unchanged.
 */
export declare function buildOAuthProfile(id: string, modelOverrides?: Readonly<Record<string, ModelOverride>>): ResolvedPiAiProviderProfile;
//# sourceMappingURL=profiles.d.ts.map
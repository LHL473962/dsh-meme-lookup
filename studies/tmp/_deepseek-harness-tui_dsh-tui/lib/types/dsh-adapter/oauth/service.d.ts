/**
 * The `ctx.dshAuth` service: the programmatic surface over this module's
 * mounted OAuth routes. UIs (the dsh-tui /provider wizard, a web settings
 * page) enumerate providers with masked sign-in state and drive login/logout
 * without touching the credential file or the pi-ai flow objects; the `/auth`
 * command in `command.ts` is a thin textual veneer over the same api.
 *
 * @module @deepseek-harness-tui/dsh-tui/oauth/service
 */
import { Service } from '@deepseek-ai/cordis';
import type { Context } from '@deepseek-ai/cordis';
import type { ResolvedPiAiProviderProfile } from '@deepseek-ai/dsh-llm-pi-ai';
import { CredentialFile } from './credentials.js';
import { type AskFn } from './interaction.js';
import { type DeepSeekAccountAuth } from './deepseek.js';
import { WhaleCouponStore } from './bonus.js';
/** One provider's sign-in state; never carries token material. */
export interface DshAuthSignInStatus {
    provider: string;
    /** Route display name (selectors, pickers). */
    label: string;
    /** The OAuth flow's own name, e.g. "OpenAI (ChatGPT Plus/Pro)". */
    oauthLabel: string;
    /** The flow's login-call-to-action label, when it ships one. */
    loginLabel: string | undefined;
    signedIn: boolean;
    expiresAt: number | undefined;
    /** Signed in, but the stored access token has expired (refresh may still work). */
    expired: boolean;
}
/** The outcome of a successful login. */
export interface DshAuthLoginResult {
    provider: string;
    oauthLabel: string;
    /** pi-ai tokens expire; the Host-owned DeepSeek account grant has no expiry. */
    expiresAt: number | undefined;
}
/** The service api consumed by commands and UIs. */
export interface DshAuthApi {
    /** Every mounted provider with masked sign-in state. */
    providers(): Promise<readonly DshAuthSignInStatus[]>;
    /**
     * Run one provider's OAuth login. `provider` omitted asks the interactive
     * surface to choose among providers not currently signed in.
     * @throws Error when no interactive surface is present, the provider is
     *   unknown, a login is already running, or the flow itself fails.
     */
    login(provider?: string, signal?: AbortSignal): Promise<DshAuthLoginResult>;
    /** Cancel an active sign-in and remove the stored credential; resolves whether one existed. */
    logout(provider: string): Promise<boolean>;
}
/** Cordis service holder; `api` is set by the plugin's apply. */
export declare class DshAuthService extends Service {
    api: DshAuthApi | undefined;
    readonly coupons: WhaleCouponStore;
    constructor(ctx: Context);
}
/** Everything the api factory needs; all cordis surface is injected, so tests run without a host. */
export interface DshAuthApiDeps {
    profiles: ReadonlyMap<string, ResolvedPiAiProviderProfile>;
    store: CredentialFile;
    /** The interactive ask surface, resolved per call so mounting order never matters. */
    resolveAsk: () => AskFn | undefined;
    /** Optional upstream account service; older hosts have only pi-ai routes. */
    resolveDeepSeekAccount?: () => DeepSeekAccountAuth | undefined;
    /** The active Host callback listener's browser-accessible loopback origin. */
    resolveCallbackOrigin?: () => string | Promise<string>;
    coupons?: WhaleCouponStore;
}
/**
 * The api implementation. One login runs per provider at a time (an in-flight
 * map, not a global lock: providers sign in independently); a second login
 * attempt for the same provider fails fast instead of stacking two flows.
 */
export declare function createDshAuthApi(deps: DshAuthApiDeps): DshAuthApi;
//# sourceMappingURL=service.d.ts.map
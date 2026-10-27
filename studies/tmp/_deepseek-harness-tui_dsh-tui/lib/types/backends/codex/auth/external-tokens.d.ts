/** Managed ChatGPT auth, one instance per hub. Token material stays between
 * the host credential source, JWT claims parsing, and JSON-RPC writes. */
import type { OAuthAccess, OAuthCredentialSource } from '../../../agent/backend.js';
import type { AccountView, SessionAuthView } from '../../../agent/capabilities.js';
import { type Rec } from '../narrow.js';
import { type RpcClock } from '../rpc/client.js';
import type { CodexHub } from '../rpc/hub.js';
import { type CodexAuthRoute } from './route.js';
export declare const CODEX_OAUTH_PROVIDER = "openai-codex";
export declare const CODEX_REFRESH_BUDGET_MS = 8000;
export type CodexTokenSource = 'channel' | 'dsh-auth' | 'codex-login' | 'api-key' | 'missing' | 'unknown';
export interface CodexAuthNotice {
    readonly level: 'warning' | 'error';
    readonly key: string;
    readonly text: string;
}
export interface CodexDeviceLogin {
    readonly loginId: string;
    readonly verificationUrl: string;
    readonly userCode: string;
    readonly done: Promise<boolean>;
    cancel(): Promise<void>;
}
export interface CodexAuthRuntime {
    readonly source: CodexTokenSource;
    readonly route: CodexAuthRoute;
    /** External auth failed after injection; this hub is not verified native. */
    readonly managedFailed: boolean;
    start(): Promise<void>;
    reconnect(): Promise<void>;
    status(): Promise<SessionAuthView>;
    account(): Promise<AccountView>;
    subscribe(listener: (notice: CodexAuthNotice) => void): () => void;
    deviceLogin(): Promise<CodexDeviceLogin>;
    apiKeyLogin(apiKey: string): Promise<void>;
}
export interface CodexAuthDeps {
    readonly hub: CodexHub;
    readonly cwd: string;
    readonly config?: Rec;
    readonly env?: Readonly<Record<string, string | undefined>>;
    readonly channel?: {
        readonly name: string;
        readonly baseUrl?: string;
    };
    readonly credential?: OAuthCredentialSource;
    /** Native-only hubs must never acquire managed auth on a later reconnect. */
    readonly externalAllowed?: boolean;
    /** Clean fallback does not retry stored auth until explicit reconnect. */
    readonly skipStoredCredential?: boolean;
    readonly clock?: RpcClock;
    readonly debug?: (message: string) => void;
}
interface ExternalTokens {
    readonly accessToken: string;
    readonly chatgptAccountId: string;
    readonly chatgptPlanType: string | null;
}
/** Decode our own stored JWT payload only; signature verification is the
 * provider's job. Missing account identity is not an injectable credential. */
export declare function externalTokensOf(access: OAuthAccess): ExternalTokens | undefined;
export declare function createCodexAuth(deps: CodexAuthDeps): CodexAuthRuntime;
/** All attached sessions share one login and one refresh handler per hub. */
export declare function acquireCodexAuth(deps: CodexAuthDeps): CodexAuthRuntime;
export {};
//# sourceMappingURL=external-tokens.d.ts.map
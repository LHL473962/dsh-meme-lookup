/**
 * TUI interaction for the Host-owned DeepSeek account authorization flow.
 *
 * The Host owns PKCE, its callback route, credential persistence, and the
 * `deepseek-account` LLM route. This module supplies a loopback callback
 * origin, mounts the official Host listener when an older bundle patch omits
 * it, and displays the Host's safe attempt state through the existing question
 * panel. It never reads or writes the account grant.
 */
import type { Context } from '@deepseek-ai/cordis';
import type { AccountClientMetadata, DeepSeekAccount } from '@deepseek-ai/dsh-deepseek-account';
import { type AskFn, type QuestionBridgeHelpers } from './interaction.js';
export declare const DEEPSEEK_ACCOUNT_PROVIDER = "deepseek-account";
/** Only the account operations this interaction surface consumes. */
export type DeepSeekAccountAuth = Pick<DeepSeekAccount, 'getState' | 'startSignIn' | 'cancelSignIn' | 'signOut' | 'watch'> & Partial<Pick<DeepSeekAccount, 'getUnnotifiedBonuses' | 'ackBonusNotified'>>;
/** Resolve late: the account provider is absent on older DSH hosts. */
export declare function deepSeekAccountFrom(ctx: Context): DeepSeekAccountAuth | undefined;
/** The Host webServer may be shared, supplied by the TUI row, or mounted as a fallback. */
export declare function deepSeekCallbackOrigin(ctx: Context): string;
/**
 * Keep DeepSeek login usable after a profile-only update from a global TUI
 * whose older bundle patch still mounts `dsh-tui-auth` but has no webserver
 * row. The official Host listener is mounted only on the first login that
 * needs it; an existing Web or user-owned listener is never replaced.
 */
export declare function createDeepSeekCallbackOriginResolver(ctx: Context): {
    resolve(): Promise<string>;
    dispose(): Promise<void>;
};
/** Platform request identity is supplied by the current TUI, not cached by the Host. */
export declare function deepSeekClientMetadata(): AccountClientMetadata;
/**
 * Start (or join) the upstream browser attempt, display its URL, and wait for
 * the upstream state stream. Esc/external abort cancels the exact attempt;
 * a commit that won that race is reported as success instead of a false
 * cancellation. The question panel is always retired before returning.
 */
export declare function loginDeepSeekAccount(account: DeepSeekAccountAuth, callbackOrigin: string, ask: AskFn, signal?: AbortSignal, helpers?: QuestionBridgeHelpers): Promise<void>;
//# sourceMappingURL=deepseek.d.ts.map
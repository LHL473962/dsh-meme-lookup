/**
 * The pi-ai instance owned by the installed dsh-llm-pi-ai adapter.
 *
 * Different host prereleases can depend on different pi-ai versions. Loading
 * a second catalog in this module and handing its Provider objects to the
 * adapter crosses package instances and is neither type- nor runtime-safe.
 * Resolve the adapter's own dependency instead, and derive every public type
 * from the adapter contract so this package owns no pi-ai version.
 */
import type { PiAiAdapterOptions, ResolvedPiAiProviderProfile } from '@deepseek-ai/dsh-llm-pi-ai';
export type PiAiProvider = NonNullable<ResolvedPiAiProviderProfile['piProvider']>;
type PiAiAuth = PiAiAdapterOptions['auth'];
export type PiAiAuthContext = PiAiAuth['authContext'];
export type PiAiCredentialStore = PiAiAuth['credentials'];
export type PiAiCredential = NonNullable<Awaited<ReturnType<PiAiCredentialStore['read']>>>;
export type PiAiCredentialInfo = Awaited<ReturnType<PiAiCredentialStore['list']>>[number];
type PiAiOAuth = NonNullable<PiAiProvider['auth']['oauth']>;
export type PiAiAuthInteraction = Parameters<PiAiOAuth['login']>[0];
export type PiAiAuthPrompt = Parameters<PiAiAuthInteraction['prompt']>[0];
export type PiAiAuthEvent = Parameters<PiAiAuthInteraction['notify']>[0];
/** pi-ai 0.87.1 added this optional login context; older flows ignore it. */
export interface PiAiLoginOptions {
    getDeviceId?: () => string;
}
/** Keep the optional second argument compatible with older adapter typings. */
export declare function loginOAuth(oauth: PiAiOAuth, interaction: PiAiAuthInteraction, options: PiAiLoginOptions): ReturnType<PiAiOAuth['login']>;
/** Fresh Provider objects from the exact pi-ai module used by dsh-llm-pi-ai. */
export declare const adapterBuiltinProviders: () => readonly PiAiProvider[];
export {};
//# sourceMappingURL=pi-ai.d.ts.map
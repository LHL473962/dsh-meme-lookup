import type { BackendDetection, BackendHost } from '../../agent/backend.js';
import { type CodexChannelProfile } from './channels.js';
import type { ChannelTokenStore } from '../shared/channel-tokens.js';
/** The Codex home the app-server will use (`CODEX_HOME`, else `~/.codex`). */
export declare function codexHomeDir(env?: NodeJS.ProcessEnv): string;
/** Whether a credential is visible without a network call. */
export declare function detectCodexAuth(env?: NodeJS.ProcessEnv, options?: {
    readonly channel?: CodexChannelProfile;
    readonly tokens?: ChannelTokenStore;
}): 'ok' | 'missing' | 'unknown';
export declare function detectCodex(host: BackendHost & {
    readonly tokenStore?: ChannelTokenStore;
}, env?: NodeJS.ProcessEnv): Promise<BackendDetection>;
//# sourceMappingURL=detect.d.ts.map
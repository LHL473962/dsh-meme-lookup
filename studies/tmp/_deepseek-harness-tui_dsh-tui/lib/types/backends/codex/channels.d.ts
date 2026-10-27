import type { SessionCapabilities } from '../../agent/capabilities.js';
import { channelProfileSlug } from '../shared/channel-slug.js';
import { type ChannelTokenStore } from '../shared/channel-tokens.js';
import { type Rec } from './narrow.js';
export interface CodexChannelProfile {
    readonly id: string;
    readonly name: string;
    readonly baseUrl?: string;
    readonly tokenRef?: string;
    /** File input is validated at save/start; only Responses is supported. */
    readonly wireApi?: string;
    readonly env?: Readonly<Record<string, string>>;
    readonly models?: Readonly<Record<string, string>>;
}
export interface CodexChannelsData {
    readonly active?: string;
    readonly channels: readonly CodexChannelProfile[];
}
export interface CodexChannels {
    read(): CodexChannelsData;
    setActive(id: string): void;
    save(profile: CodexChannelProfile): void;
    remove(id: string): void;
}
export interface CodexChannelLaunch {
    readonly args: readonly string[];
    readonly env: Readonly<Record<string, string>>;
    readonly injectedEnvKeys: readonly string[];
    readonly provider?: string;
}
export interface CodexChannelsRuntime {
    readonly capability: NonNullable<SessionCapabilities['channels']>;
    active(): CodexChannelProfile | undefined;
    refreshConfig(config?: Rec): void;
    launch(): CodexChannelLaunch;
}
export declare const channelSlug: typeof channelProfileSlug;
export declare const CODEX_CHANNEL_TOKEN_ENV = "DSH_TUI_CODEX_CHANNEL_TOKEN";
/** Reject credential-bearing URLs before either persistence or spawn. */
export declare function validateCodexBaseUrl(value: string): string;
/** Invalid endpoint rows remain selected so launch refuses, never silently
 * switching a hand-edited active connection to ambient OAuth credentials. */
export declare function parseCodexChannels(value: unknown): CodexChannelsData;
export declare const activeProfileOf: (data: CodexChannelsData) => CodexChannelProfile | undefined;
export declare const hasChannelConnection: (profile: CodexChannelProfile | undefined) => boolean;
/** The file-backed profiles under `<dir>` (the host's `dataDir` for this
 *  backend). The directory is required: a backend never picks a location of
 *  its own under the host's data directory (D2, B-3/B-5). Same
 *  atomic/upsert/damaged-file semantics as the mature Claude store. */
export declare function fileCodexChannels(dir: string, debug?: (message: string) => void): CodexChannels;
export declare function memoryCodexChannels(initial?: CodexChannelsData): CodexChannels;
/** The token only goes into the child environment, never an argv override. */
export declare function codexChannelLaunch(profile: CodexChannelProfile | undefined, tokens?: ChannelTokenStore): CodexChannelLaunch;
/** Synchronous channel capability over a config/read snapshot. The TUI's
 * own dshtui-* provider is not re-imported as if it were user settings. */
export declare function createCodexChannelsRuntime(deps: {
    readonly store: CodexChannels;
    readonly tokens?: ChannelTokenStore;
    readonly config?: Rec;
    readonly env?: Readonly<Record<string, string | undefined>>;
}): CodexChannelsRuntime;
//# sourceMappingURL=channels.d.ts.map
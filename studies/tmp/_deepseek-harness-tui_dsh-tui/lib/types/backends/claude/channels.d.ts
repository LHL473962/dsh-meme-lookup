import { channelProfileSlug } from '../shared/channel-slug.js';
/** One relay channel. */
export interface ClaudeChannelProfile {
    /** Stable slug of the name (the file's join key). */
    readonly id: string;
    /** Human-facing label (picker rows, notices). */
    readonly name: string;
    /** Exact requested-id → actual model (optional). */
    readonly models?: Readonly<Record<string, string>>;
    /** Tier keyword → actual model (optional; `default` = the any-model rule). */
    readonly tiers?: Readonly<Record<string, string>>;
    /** The relay endpoint the CLI child is pointed at (optional). */
    readonly baseUrl?: string;
    /** The credential-store ref holding the channel token (optional; never
     *  the token itself). */
    readonly tokenRef?: string;
    /** Channel-private env layered under baseUrl/token at spawn (optional). */
    readonly env?: Readonly<Record<string, string>>;
}
/** What persists. */
export interface ClaudeChannelsData {
    /** The id of the channel whose mapping is live; absent = none. */
    readonly active?: string;
    readonly channels: readonly ClaudeChannelProfile[];
}
/** Read / switch / upsert access (injectable: tests use an in-memory store). */
export interface ClaudeChannels {
    read(): ClaudeChannelsData;
    /** Make `id` the active channel (a no-op when no such channel exists). */
    setActive(id: string): void;
    /** Insert or refresh one profile by id (a re-import refreshes in place). */
    save(profile: ClaudeChannelProfile): void;
    /** Drop one profile by id; a dangling `active` goes
     *  with it (no channel left active until the next pick). */
    remove(id: string): void;
}
/** The stable id of a channel name (shared with the /channel wizard). */
export declare const channelSlug: typeof channelProfileSlug;
/** Narrow a parsed document to what persists (anything else reads as absent). */
export declare function parseChannels(parsed: unknown): ClaudeChannelsData;
/** The channel whose mapping is live (undefined when none is active). */
export declare function activeProfileOf(data: ClaudeChannelsData): ClaudeChannelProfile | undefined;
/** The file-backed profiles under `<dir>` (the host's `dataDir` for this
 *  backend). The directory is required: a backend never picks a location of
 *  its own under the host's data directory (D2, B-3). */
export declare function fileClaudeChannels(dir: string, debug?: (message: string) => void): ClaudeChannels;
/** An in-memory store (tests, embedders without a home directory). */
export declare function memoryClaudeChannels(initial?: ClaudeChannelsData): ClaudeChannels & {
    readonly data: ClaudeChannelsData;
};
/**
 * The channel profile hiding in the CLI settings `env`: the ANTHROPIC_BASE_URL
 * host names it, the ANTHROPIC_DEFAULT_*_MODEL (+ ANTHROPIC_MODEL) values
 * become its tiers. Exact `models` are never guessed — those stay the user's
 * own hand-written entries, and a re-import of the same id keeps them.
 * Undefined when the env holds neither a base URL nor any model value.
 */
export declare function importFromSettingsEnv(env: Record<string, string | undefined>, existing?: ClaudeChannelProfile): ClaudeChannelProfile | undefined;
/** The channel token in the CLI settings env: the value of
 *  `ANTHROPIC_AUTH_TOKEN`, for the caller to move into the credential store
 *  — the profile itself only ever records the derived `tokenRef`. */
export declare function importTokenFromSettingsEnv(env: Record<string, string | undefined>): string | undefined;
/** A channel profile's connection carries anything spawn-shaping. */
export declare function hasChannelConnection(profile: ClaudeChannelProfile | undefined): boolean;
//# sourceMappingURL=channels.d.ts.map
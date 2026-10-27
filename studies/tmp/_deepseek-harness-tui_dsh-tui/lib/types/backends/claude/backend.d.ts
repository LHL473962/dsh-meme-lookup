import type { AgentBackend } from '../../agent/backend.js';
import { type StartPermissionMode } from './options.js';
import { type ClaudePrefs } from './prefs.js';
import { type ClaudeChannelProfile } from './channels.js';
import { type ClaudeReplay } from './replay.js';
import { type ClaudeSessionStoreSdk } from './sdk.js';
/**
 * The start notices of an active channel profile against the effective
 * settings `env`: a base URL that differs from the settings' (cc-switch),
 * and which settings credentials the channel replaces this session (key
 * names only, never values).
 */
export declare function channelStartNotices(channel: Pick<ClaudeChannelProfile, 'name' | 'baseUrl' | 'tokenRef'>, settingsEnv: Readonly<Record<string, unknown>>): string[];
/**
 * The start notices of the resolved permission mode. A remembered bypass
 * that was not carried into this session is said once and forgotten, so
 * the next start resolves quietly.
 */
export declare function startModeNotices(start: StartPermissionMode, prefs: Pick<ClaudePrefs, 'write'>): string[];
/**
 * Where a persisted session lives and what it replays as. Throws (with a
 * user-facing sentence) when the store has no such session.
 */
export declare function loadClaudeTranscript(sdk: Pick<ClaudeSessionStoreSdk, 'getSessionInfo' | 'getSessionMessages' | 'listSubagents' | 'getSubagentMessages'>, target: {
    readonly sessionId: string;
    readonly cwd?: string;
}, fallbackCwd: string, debug?: (message: string) => void): Promise<{
    readonly cwd: string;
    readonly replay: ClaudeReplay;
}>;
export declare const claudeBackend: AgentBackend;
//# sourceMappingURL=backend.d.ts.map
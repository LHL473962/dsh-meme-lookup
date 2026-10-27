import type { SDKSessionInfo } from '@anthropic-ai/claude-agent-sdk';
import type { SessionCatalog } from '../../agent/backend.js';
import type { SessionSummary } from '../../agent/index.js';
import type { ClaudeSessionStoreSdk } from './sdk.js';
export interface ClaudeCatalogDeps {
    /** The session-store API (loaded on first use; the SDK is an optional peer). */
    loadSdk(): Promise<Pick<ClaudeSessionStoreSdk, 'listSessions' | 'getSessionInfo' | 'getSessionMessages' | 'renameSession' | 'deleteSession'>>;
    /** The directory a listing without a scope looks in. */
    cwd(): string;
    /** This install's last-used notes (epoch ms by session id). */
    lastUsed?(): Readonly<Record<string, number>>;
    snapshotKey?(): string | undefined;
}
/** One SDK record as a browser row. */
export declare function claudeSessionSummary(info: SDKSessionInfo, lastUsed?: Readonly<Record<string, number>>): SessionSummary;
/** The catalog over one SDK session store. */
export declare function createClaudeCatalog(deps: ClaudeCatalogDeps): SessionCatalog;
//# sourceMappingURL=catalog.d.ts.map
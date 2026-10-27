import type * as ClaudeSdk from '@anthropic-ai/claude-agent-sdk';
/** The SDK's session-store read/write API: the catalog, the
 *  resume replay, fork and conversation rewind. */
export type ClaudeSessionStoreSdk = Pick<typeof ClaudeSdk, 'listSessions' | 'getSessionInfo' | 'getSessionMessages' | 'listSubagents' | 'getSubagentMessages' | 'renameSession' | 'deleteSession' | 'forkSession'>;
/** The SDK surface this backend calls: a structural subset, so tests can
 *  hand the session a fake module without the real CLI. */
export type ClaudeSdkModule = Pick<typeof ClaudeSdk, 'query' | 'resolveSettings' | 'filterEscalatingDefaultMode'> & ClaudeSessionStoreSdk;
/** Import the SDK once per process; a failed import is retried next time. */
export declare function loadClaudeSdk(): Promise<ClaudeSdkModule>;
/** The installed SDK version, or undefined when it cannot be read. */
export declare function installedSdkVersion(): string | undefined;
//# sourceMappingURL=sdk.d.ts.map
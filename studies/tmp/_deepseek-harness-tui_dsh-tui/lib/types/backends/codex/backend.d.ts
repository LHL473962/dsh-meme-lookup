import type { AgentBackend, BackendHost, OpenTarget } from '../../agent/backend.js';
import type { AgentSession } from '../../agent/session.js';
import { type CodexAuthRuntime } from './auth/external-tokens.js';
import { type CodexChannels, type CodexChannelsRuntime } from './channels.js';
import { type Rec } from './narrow.js';
import { type CodexPrefs } from './prefs.js';
import { type CodexExecutable } from './rpc/binary.js';
import { type CodexHub, type CodexHubDeps } from './rpc/hub.js';
import { type RpcClock } from './rpc/client.js';
export interface CodexRuntime {
    readonly hub: CodexHub;
    readonly release: () => void;
    readonly cwd: string;
    readonly executable: CodexExecutable & {
        readonly version?: string;
    };
    readonly config?: Rec;
    readonly auth: CodexAuthRuntime;
    readonly channels: CodexChannelsRuntime;
    /** Store identity captured from this child, not later process env changes. */
    readonly catalogSource?: string;
    readonly startNotices?: readonly string[];
    /** Rejoin an idle native thread retained by the local daemon, if available. */
    readonly rejoinNativeDaemon?: () => Promise<CodexRuntime | undefined>;
}
export interface CodexRuntimeOptions {
    readonly executable?: CodexExecutable & {
        readonly version?: string;
    };
    readonly channels?: CodexChannels;
    readonly env?: NodeJS.ProcessEnv;
    readonly hubDeps?: CodexHubDeps;
    readonly authClock?: RpcClock;
}
/** Acquire the same platform runtime for open/resume/catalog. Tests replace
 * only the process, executable discovery and profile file, not the plumbing. */
export declare function prepareCodexRuntime(target: OpenTarget, host: BackendHost, options?: CodexRuntimeOptions): Promise<CodexRuntime>;
/** Open a native thread, rejoining its idle daemon writer on conflict. */
export declare function openCodexBackendSession(target: OpenTarget, host: BackendHost, options?: CodexRuntimeOptions & {
    readonly prefs?: CodexPrefs;
}): Promise<AgentSession>;
export declare const codexBackend: AgentBackend;
//# sourceMappingURL=backend.d.ts.map
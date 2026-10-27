/** Credential reconnect flow and account status text for a Claude session. */
import type { AccountInfo, SDKUserMessage } from '@anthropic-ai/claude-agent-sdk';
import type { AccountView, SessionAuthView } from '../../../agent/capabilities.js';
import type { AgentEvent, AgentEventMeta } from '../../../agent/events.js';
import { type ClaudeAuthPlan } from '../auth.js';
import type { ClaudeTranslator } from '../translate.js';
import type { ClaudeClock, ClaudeSessionDeps, Run } from './types.js';
export declare function createSessionAuth(context: {
    readonly deps: ClaudeSessionDeps;
    readonly clock: ClaudeClock;
    readonly translator: ClaudeTranslator;
    readonly pushed: Map<string, SDKUserMessage>;
    readonly idleWaiters: {
        resolve(): void;
        reject(error: Error): void;
    }[];
    readonly run: Run;
    readonly disposing: boolean;
    authPlan: ClaudeAuthPlan;
    readonly account: AccountInfo | undefined;
    readonly apiKeySource: string | undefined;
    idle(): boolean;
    stopForReconnect(): {
        readonly unstarted: readonly string[];
    };
    openRun(): Promise<void>;
    emit(events: readonly AgentEvent[], wake?: AgentEventMeta['wake']): void;
    consume(target: Run): Promise<void>;
    onExit(error: unknown): void;
    stopRun(target: Run): void;
}): {
    reconnect: (renewal: {
        readonly rejected?: string;
    }, options?: {
        readonly waitIdle?: boolean;
    }) => Promise<void>;
    onAuthFailure: () => void;
    authStatus: () => Promise<SessionAuthView>;
    readonly reconnecting: Promise<void> | undefined;
    readonly reconnectDeferred: boolean;
    attempts: number;
};
/** The `/login` and `/doctor` name of a credential source. */
export declare function authSourceLabel(plan: ClaudeAuthPlan): string;
/** Account lines (never the email). */
export declare function accountLines(view: AccountView): string[];
//# sourceMappingURL=auth.d.ts.map
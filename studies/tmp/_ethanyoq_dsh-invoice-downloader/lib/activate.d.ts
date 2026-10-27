import type { CredentialProvider } from '@deepseek-ai/dsh-credentials';
import type { LlmRuntime } from '@deepseek-ai/dsh-llm';
import type { SessionStore } from '@deepseek-ai/dsh-session';
import type { SubprocessRuntime } from '@deepseek-ai/dsh-subprocess';
import { type LlmContext } from './invoice-scanner.js';
import { type RuntimeConfig } from './runtime.js';
export interface PluginContext {
    effect(callback: () => void | (() => void), description?: string): void;
    subprocess: SubprocessRuntime;
    connection: {
        rpc: {
            handle(channel: string, handler: (endpoint: string, payload: unknown, signal: AbortSignal) => Promise<unknown>, options: {
                authority: 'loopback';
            }): void;
        };
    };
    sessions: SessionStore;
    llm: Pick<LlmRuntime, 'prepareCall'>;
    agentDefaultModel: LlmContext['agentDefaultModel'];
    credentials: CredentialProvider;
}
export interface PluginConfig extends RuntimeConfig {
    savePath?: string;
    deadlineMs?: number;
    graceMs?: number;
    imapFetchTimeoutSeconds?: number;
    profileDir?: string;
}
export declare const name = "invoice-downloader";
export declare const inject: string[];
export declare function apply(context: PluginContext, config: PluginConfig): void;

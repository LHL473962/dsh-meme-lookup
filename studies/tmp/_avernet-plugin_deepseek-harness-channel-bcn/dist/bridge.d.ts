import type { Context } from '@deepseek-ai/cordis';
import { type Agent } from '@deepseek-ai/dsh-agent';
import type { Config } from './config.js';
import { type RouteSelector } from './protocol.js';
import type { BcnWsClient } from './ws-client.js';
type JsonValue = null | boolean | number | string | JsonValue[] | {
    [key: string]: JsonValue;
};
declare module '@deepseek-ai/dsh-llm' {
    interface MessageSourceMap {
        /** @persistenceAttribution */
        'bcn-channel': {
            kind: 'bcn-channel';
        };
    }
}
export declare class BcnBridge {
    private readonly ctx;
    private readonly client;
    private readonly config;
    private readonly log?;
    private managedAgents;
    private ownedAgents;
    private sessionIdentityBySessionId;
    private runIdByMessageId;
    private runIdByTurn;
    private activeRunBySessionId;
    private runs;
    private completedRunIds;
    private disposers;
    private disposed;
    private interactions;
    constructor(ctx: Context, client: BcnWsClient, config: Config, log?: {
        info(message: string): void;
        warn(message: string): void;
        error(message: string): void;
        debug?(message: string): void;
    } | undefined);
    start(): void;
    get busy(): boolean;
    dispose(): Promise<void>;
    captureRoute(agent: Agent | undefined, selectors: RouteSelector[], reason: string, signal: AbortSignal): Promise<JsonValue>;
    assignTask(agent: Agent | undefined, targetBot: string, message: string, responseMode: string | undefined, signal: AbortSignal): Promise<JsonValue>;
    sendTaskMessage(agent: Agent | undefined, message: string, signal: AbortSignal): Promise<JsonValue>;
    completeTask(agent: Agent | undefined, summary: string, signal: AbortSignal): Promise<JsonValue>;
    private handleChatSend;
    private handleChatInject;
    private handleChatAbort;
    private handleInboxClaimed;
    private handleInboxDiscarded;
    private handleSessionEvent;
    private handleAssistantStream;
    private appendDelta;
    private captureAssistantMessage;
    private captureToolCall;
    private captureToolResult;
    private sendToolResult;
    private sendTerminal;
    private getOrCreateAgent;
    private createAgent;
    private activeRunForTaskTool;
    private sendTaskRequest;
}
export {};
//# sourceMappingURL=bridge.d.ts.map
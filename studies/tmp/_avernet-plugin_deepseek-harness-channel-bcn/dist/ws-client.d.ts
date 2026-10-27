import type { Config } from './config.js';
import type { ResolvedEndpoint } from './endpoint.js';
import { type BotSession, type EventFrame, type RequestFrame, type ResponseFrame } from './protocol.js';
type RequestHandler = (frame: RequestFrame) => Promise<void>;
type EventHandler = (frame: EventFrame) => Promise<void>;
export interface BcnWsClientOptions {
    endpoint: ResolvedEndpoint;
    session: BotSession;
    config: Config;
    onSessionChanged: (session: BotSession) => Promise<void>;
    status?: () => 'idle' | 'busy';
    log?: {
        info(message: string): void;
        warn(message: string): void;
        error(message: string): void;
        debug?(message: string): void;
    };
}
export declare class BcnWsClient {
    private readonly options;
    private socket;
    private openingSocket;
    private connectedState;
    private stopped;
    private connecting;
    private reconnectDelayMs;
    private reconnectTimer;
    private heartbeatTimer;
    private requestCounter;
    private eventSequence;
    private pending;
    private requestHandlers;
    private eventHandlers;
    private queuedEvents;
    private queuedEventBytes;
    private session;
    constructor(options: BcnWsClientOptions);
    get connected(): boolean;
    get botSession(): BotSession;
    start(): void;
    stop(): Promise<void>;
    onRequest(method: string, handler: RequestHandler): () => void;
    onEvent(event: string, handler: EventHandler): () => void;
    sendResponse(id: string, ok: boolean, payload?: Record<string, unknown>, error?: ResponseFrame['error']): void;
    sendEvent(event: string, payload: Record<string, unknown>): void;
    sendRequest(method: string, params: Record<string, unknown>, timeoutMs?: number, signal?: AbortSignal): Promise<ResponseFrame>;
    private scheduleConnect;
    private connectOnce;
    private openSocket;
    private installSocketListeners;
    private handleMessage;
    private handleResponse;
    private handleRequest;
    private handleEvent;
    private startHeartbeat;
    private flushQueuedEvents;
    private sendFrameNow;
    private rejectPending;
    private nextRequestId;
}
export {};
//# sourceMappingURL=ws-client.d.ts.map
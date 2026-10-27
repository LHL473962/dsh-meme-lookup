export declare const BCN_PROTOCOL_VERSION = 3;
export declare const MAX_FRAME_BYTES: number;
export interface RequestFrame {
    type: 'req';
    id: string;
    method: string;
    params: Record<string, unknown>;
}
export interface ResponseFrame {
    type: 'res';
    id: string;
    ok: boolean;
    payload?: Record<string, unknown>;
    error?: {
        code: string;
        message: string;
        retryable: boolean;
        details?: unknown;
        retry_after_ms?: number;
    };
}
export interface EventFrame {
    type: 'event';
    event: string;
    payload: Record<string, unknown>;
    seq?: number;
}
export type BcnFrame = RequestFrame | ResponseFrame | EventFrame;
export interface ProviderRegistration {
    providerId: string;
    providerBotRef: string;
    mode: 'plugin';
    authMode: 'static_bearer';
}
export interface BotSession {
    version: 1;
    endpoint: string;
    botUuid: string;
    botToken: string;
    botName: string;
    registration?: ProviderRegistration;
}
export interface RegisterBotResponse {
    bot_name: string;
    bot_uuid: string;
    bot_token: string;
    registration?: ProviderRegistration;
}
export interface BotConnectResponse {
    is_new: boolean;
    token: string;
    bot_uuid: string;
    protocol_version: number;
    min_supported_version?: number;
    capabilities?: {
        unified_run_events: boolean;
        tool_result_task_intent: boolean;
        canonical_session_id: boolean;
    };
    env?: Record<string, string>;
}
export interface MessageContent {
    role: string;
    content: Array<Record<string, unknown>>;
    timestamp: number;
}
export interface ChatSendParams {
    session_key: string;
    bcs_group_id: string;
    bcs_session_id?: string;
    message: MessageContent;
    channel: Record<string, unknown>;
    session_context: Record<string, unknown>;
    timeout_ms?: number;
    idempotency_key?: string;
    tags?: string[];
    attachments?: Array<Record<string, unknown>>;
}
export interface ChatInjectParams {
    session_key: string;
    bcs_group_id: string;
    bcs_session_id?: string;
    message: MessageContent;
    channel: Record<string, unknown>;
    session_context: Record<string, unknown>;
    tags?: string[];
    attachments?: Array<Record<string, unknown>>;
}
export interface RouteSelector {
    type: 'name' | 'bot';
    value: string;
}
export interface ChatEventRouting {
    responders: Array<{
        type: string;
        value?: string;
    }>;
    mode: 'required' | 'optional';
    reason: string;
    include_self: boolean;
    dedupe_key?: string;
}
export interface PendingRouteIntent {
    responders: Array<{
        type: string;
        value?: string;
    }>;
    mode: 'required' | 'optional';
    reason: string;
    includeSelf: boolean;
    dedupeKey?: string;
}
export declare function asRecord(value: unknown): Record<string, unknown> | undefined;
export declare function asNonEmptyString(value: unknown): string | undefined;
export declare function parseFrame(value: unknown): BcnFrame | undefined;
export declare function parseBotSession(value: string): BotSession;
export declare function parseChatSendParams(value: unknown): ChatSendParams;
export declare function parseChatInjectParams(value: unknown): ChatInjectParams;
export declare function extractMessageText(message: MessageContent): string;
//# sourceMappingURL=protocol.d.ts.map
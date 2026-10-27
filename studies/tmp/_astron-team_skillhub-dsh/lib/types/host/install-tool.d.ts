import type { Context } from '@deepseek-ai/cordis';
import type { PendingConversationInstall, CancelledConversationInstall, ConversationInstallRequest } from './conversation-install-request.js';
import type { ConversationSearchContext } from './search-tool.js';
import type { NativeOperation } from './types.js';
export declare const INSTALL_TOOL_NAME = "astron_skillhub_install";
export declare const installOutputSchema: {
    readonly oneOf: readonly [{
        readonly type: "object";
        readonly additionalProperties: false;
        readonly properties: {
            readonly schemaVersion: {
                readonly type: "integer";
                readonly const: 1;
                readonly required: true;
            };
            readonly kind: {
                readonly type: "string";
                readonly const: "skillhub-install";
                readonly required: true;
            };
            readonly status: {
                readonly type: "string";
                readonly const: "accepted";
                readonly required: true;
            };
            readonly toolCallId: {
                readonly type: "string";
                readonly required: true;
            };
            readonly operationId: {
                readonly type: "string";
                readonly required: true;
            };
            readonly hostInstanceId: {
                readonly type: "string";
                readonly required: true;
            };
            readonly namespace: {
                readonly type: "string";
                readonly required: true;
            };
            readonly slug: {
                readonly type: "string";
                readonly required: true;
            };
            readonly version: {
                readonly type: "string";
                readonly required: true;
            };
            readonly targetLabel: {
                readonly type: "string";
                readonly required: true;
            };
            readonly sourceLabel: {
                readonly type: "string";
                readonly required: true;
            };
            readonly sourceRevision: {
                readonly type: "string";
                readonly required: true;
            };
            readonly hostLabel: {
                readonly type: "string";
                readonly required: true;
            };
            readonly createdAt: {
                readonly type: "string";
                readonly required: true;
            };
        };
    }, {
        readonly type: "object";
        readonly additionalProperties: false;
        readonly properties: {
            readonly schemaVersion: {
                readonly type: "integer";
                readonly const: 1;
                readonly required: true;
            };
            readonly kind: {
                readonly type: "string";
                readonly const: "skillhub-install";
                readonly required: true;
            };
            readonly status: {
                readonly type: "string";
                readonly const: "awaiting-confirmation";
                readonly required: true;
            };
            readonly toolCallId: {
                readonly type: "string";
                readonly required: true;
            };
            readonly selectionRef: {
                readonly type: "string";
                readonly required: true;
            };
            readonly namespace: {
                readonly type: "string";
                readonly required: true;
            };
            readonly slug: {
                readonly type: "string";
                readonly required: true;
            };
            readonly version: {
                readonly type: "string";
                readonly required: true;
            };
            readonly sourceLabel: {
                readonly type: "string";
                readonly required: true;
            };
            readonly sourceRevision: {
                readonly type: "string";
                readonly required: true;
            };
            readonly createdAt: {
                readonly type: "string";
                readonly required: true;
            };
        };
    }, {
        readonly type: "object";
        readonly additionalProperties: false;
        readonly properties: {
            readonly schemaVersion: {
                readonly type: "integer";
                readonly const: 1;
                readonly required: true;
            };
            readonly kind: {
                readonly type: "string";
                readonly const: "skillhub-install";
                readonly required: true;
            };
            readonly status: {
                readonly type: "string";
                readonly const: "not-confirmed";
                readonly required: true;
            };
            readonly toolCallId: {
                readonly type: "string";
                readonly required: true;
            };
            readonly code: {
                readonly type: "string";
                readonly enum: readonly ["CONTEXT_STALE", "REQUEST_CONFLICT", "SOURCE_NOT_CONFIGURED", "SOURCE_DENIED", "SKILL_UNAVAILABLE", "RATE_LIMITED", "SOURCE_UNAVAILABLE", "TARGET_UNAVAILABLE", "UNCONFIRMED"];
                readonly required: true;
            };
        };
    }, {
        readonly type: "object";
        readonly additionalProperties: false;
        readonly properties: {
            readonly schemaVersion: {
                readonly type: "integer";
                readonly const: 1;
                readonly required: true;
            };
            readonly kind: {
                readonly type: "string";
                readonly const: "skillhub-install";
                readonly required: true;
            };
            readonly status: {
                readonly type: "string";
                readonly const: "cancelled";
                readonly required: true;
            };
            readonly toolCallId: {
                readonly type: "string";
                readonly required: true;
            };
        };
    }];
};
export declare function registerInstallTool(tools: Pick<Context['tools'], 'get' | 'register'>, install: (request: ConversationInstallRequest, context: ConversationSearchContext, signal: AbortSignal) => Promise<NativeOperation | PendingConversationInstall | CancelledConversationInstall | undefined>): () => void;

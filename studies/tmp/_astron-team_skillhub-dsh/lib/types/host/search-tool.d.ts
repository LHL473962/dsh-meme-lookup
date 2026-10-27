import type { Context } from '@deepseek-ai/cordis';
import type { ConversationSearchResult } from './search-result.js';
export declare const SEARCH_TOOL_NAME = "astron_skillhub_search";
export declare const searchOutputSchema: {
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
            readonly const: "skillhub-search";
            readonly required: true;
        };
        readonly query: {
            readonly type: "string";
            readonly required: true;
        };
        readonly sourceRevision: {
            readonly type: "string";
            readonly required: true;
        };
        readonly sourceLabel: {
            readonly type: "string";
            readonly required: true;
        };
        readonly createdAt: {
            readonly type: "string";
            readonly required: true;
        };
        readonly total: {
            readonly type: "integer";
            readonly required: true;
        };
        readonly returned: {
            readonly type: "integer";
            readonly required: true;
        };
        readonly limit: {
            readonly type: "integer";
            readonly required: true;
        };
        readonly items: {
            readonly type: "array";
            readonly required: true;
            readonly items: {
                readonly type: "object";
                readonly additionalProperties: false;
                readonly properties: {
                    readonly namespace: {
                        readonly type: "string";
                        readonly required: true;
                    };
                    readonly slug: {
                        readonly type: "string";
                        readonly required: true;
                    };
                    readonly latestVersion: {
                        readonly type: "string";
                        readonly required: true;
                    };
                    readonly summary: {
                        readonly type: "string";
                        readonly required: true;
                    };
                    readonly selectionRef: {
                        readonly type: "string";
                        readonly required: true;
                    };
                    readonly installation: {
                        readonly type: "object";
                        readonly additionalProperties: false;
                        readonly properties: {
                            readonly checkedAt: {
                                readonly type: "string";
                                readonly required: true;
                            };
                            readonly complete: {
                                readonly type: "boolean";
                                readonly required: true;
                            };
                            readonly unavailable: {
                                readonly type: "array";
                                readonly required: true;
                                readonly items: {
                                    readonly type: "string";
                                    readonly enum: readonly ["user", "project"];
                                };
                            };
                            readonly records: {
                                readonly type: "array";
                                readonly required: true;
                                readonly items: {
                                    readonly type: "object";
                                    readonly additionalProperties: false;
                                    readonly properties: {
                                        readonly scope: {
                                            readonly type: "string";
                                            readonly enum: readonly ["user", "project"];
                                            readonly required: true;
                                        };
                                        readonly version: {
                                            readonly type: "string";
                                            readonly required: true;
                                        };
                                        readonly state: {
                                            readonly type: "string";
                                            readonly enum: readonly ["present", "missing", "metadata-invalid", "mismatch", "unreadable"];
                                            readonly required: true;
                                        };
                                    };
                                };
                            };
                        };
                    };
                };
            };
        };
    };
};
export interface ConversationSearchContext {
    sessionId: string;
    callId: string;
    cwd: string;
}
export type { ConversationSearchResult } from './search-result.js';
export declare function registerSearchTool(tools: Pick<Context['tools'], 'get' | 'register'>, search: (query: string, context: ConversationSearchContext, signal: AbortSignal) => Promise<ConversationSearchResult>): () => void;

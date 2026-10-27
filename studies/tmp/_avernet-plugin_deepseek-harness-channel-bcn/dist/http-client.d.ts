import type { ResolvedEndpoint } from './endpoint.js';
import { type ProviderTokenScope } from './registration.js';
import { type RegisterBotResponse } from './protocol.js';
export interface HttpTransport {
    requestJson(endpoint: ResolvedEndpoint, path: string, options: {
        method: 'POST';
        headers?: Record<string, string>;
        body?: unknown;
        query?: URLSearchParams;
    }, timeoutMs: number): Promise<unknown>;
}
export declare class NodeHttpTransport implements HttpTransport {
    requestJson(endpoint: ResolvedEndpoint, path: string, options: {
        method: 'POST';
        headers?: Record<string, string>;
        body?: unknown;
        query?: URLSearchParams;
    }, timeoutMs: number): Promise<unknown>;
}
export declare class BcnRegistrationClient {
    private readonly endpoint;
    private readonly transport;
    private readonly timeoutMs;
    constructor(endpoint: ResolvedEndpoint, transport: HttpTransport, timeoutMs: number);
    register(token: string, botName: string, provider?: {
        scope: ProviderTokenScope;
        providerBotRef: string;
    }): Promise<RegisterBotResponse>;
}
//# sourceMappingURL=http-client.d.ts.map
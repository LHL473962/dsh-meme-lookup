import type { Context } from '@deepseek-ai/cordis';
import type { Config } from './config.js';
import { type DnsResolver, type ResolvedEndpoint } from './endpoint.js';
import { type HttpTransport } from './http-client.js';
import { type BotSession } from './protocol.js';
export interface ResolvedBotSession {
    session: BotSession;
    endpoint: ResolvedEndpoint;
}
export declare function loadOrRegisterBotSession(ctx: Context, config: Config, options?: {
    resolver?: DnsResolver;
    transport?: HttpTransport;
}): Promise<ResolvedBotSession>;
export declare function persistBotSession(ctx: Context, config: Config, session: BotSession): Promise<void>;
//# sourceMappingURL=credentials.d.ts.map
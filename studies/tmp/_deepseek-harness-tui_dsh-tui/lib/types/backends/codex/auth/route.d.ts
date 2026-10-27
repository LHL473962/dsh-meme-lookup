/** The only gate for injecting a dsh-auth ChatGPT token (§5.10).
 * Failed config/read and every non-first-party override fail closed. */
import { type Rec } from '../narrow.js';
export interface CodexAuthRoute {
    readonly firstParty: boolean;
    readonly provider: string;
    readonly host?: string;
    readonly reason?: 'config-unavailable' | 'channel' | 'provider' | 'provider-url' | 'base-url' | 'environment-url';
}
/** A host-only diagnostic: never URL credentials, path, query or fragment. */
export declare function codexOriginHost(value: unknown): string | undefined;
/** config is the config/read response's config member, not its envelope. */
export declare function codexAuthRoute(config: Rec | undefined, env?: Readonly<Record<string, string | undefined>>, channelActive?: boolean): CodexAuthRoute;
//# sourceMappingURL=route.d.ts.map
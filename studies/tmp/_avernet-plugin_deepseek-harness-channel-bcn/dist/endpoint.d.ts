import type { LookupFunction } from 'node:net';
export interface ResolvedEndpoint {
    readonly baseUrl: URL;
    readonly webSocketUrl: URL;
    readonly addresses: readonly {
        address: string;
        family: 4 | 6;
    }[];
    readonly lookup: LookupFunction;
    readonly loopback: boolean;
}
export type DnsResolver = (hostname: string) => Promise<readonly {
    address: string;
    family: number;
}[]>;
export declare function resolveEndpoint(input: string, resolver?: DnsResolver): Promise<ResolvedEndpoint>;
export declare function canonicalizeEndpoint(input: string): string;
export declare function parseEndpoint(input: string): URL;
export declare function isPublicAddress(address: string): boolean;
export declare function isLoopbackAddress(address: string): boolean;
//# sourceMappingURL=endpoint.d.ts.map
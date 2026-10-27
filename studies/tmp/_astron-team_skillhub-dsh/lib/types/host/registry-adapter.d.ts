import { z } from 'zod';
import type { CatalogLabels, CatalogPageResult, CatalogSort } from './types.js';
declare const searchSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        namespace: z.ZodString;
        slug: z.ZodString;
        latestVersion: z.ZodString;
        summary: z.ZodNullable<z.ZodString>;
    }, z.core.$strip>>;
    total: z.ZodNumber;
    limit: z.ZodNumber;
}, z.core.$strip>;
declare const resolveSchema: z.ZodObject<{
    namespace: z.ZodString;
    slug: z.ZodString;
    version: z.ZodString;
    versionId: z.ZodNumber;
    fingerprint: z.ZodString;
    downloadUrl: z.ZodString;
}, z.core.$strip>;
export type SearchResult = z.infer<typeof searchSchema>;
export type ResolvedSkill = z.infer<typeof resolveSchema>;
export type RegistryErrorCode = 'INVALID_SOURCE' | 'INVALID_INPUT' | 'ANONYMOUS_DENIED' | 'NOT_FOUND' | 'RATE_LIMITED' | 'REGISTRY_UNAVAILABLE' | 'HTTP_ERROR' | 'INVALID_RESPONSE' | 'RESPONSE_TOO_LARGE' | 'CANCELLED' | 'NETWORK_ERROR';
export declare class RegistryError extends Error {
    readonly code: RegistryErrorCode;
    readonly retryable: boolean;
    readonly status?: number | undefined;
    readonly retryAfterSeconds?: number | undefined;
    constructor(code: RegistryErrorCode, retryable: boolean, status?: number | undefined, retryAfterSeconds?: number | undefined);
}
/** Anonymous, read-only Registry transport; no CLI auth/configuration side effects. */
export declare class RegistryAdapter {
    private readonly fetchImpl;
    private readonly timeoutMs;
    readonly source: string;
    private retryAt;
    constructor(source: string, fetchImpl?: typeof fetch, timeoutMs?: number);
    search(query?: string, signal?: AbortSignal): Promise<SearchResult>;
    catalog(query: string, page: number, sort: CatalogSort, signal?: AbortSignal, label?: string): Promise<CatalogPageResult>;
    labels(signal?: AbortSignal): Promise<CatalogLabels>;
    resolve(namespace: string, slug: string, version?: string, signal?: AbortSignal): Promise<ResolvedSkill>;
    documentation(namespace: string, slug: string, version: string, signal?: AbortSignal): Promise<string>;
    metadata(namespace: string, slug: string, signal?: AbortSignal): Promise<{
        downloadCount: number | undefined;
        starCount: number | undefined;
        ratingCount: number | undefined;
        ratingAvg: number | undefined;
        id: number;
        namespace: string;
        slug: string;
        displayName: string | null;
        summary: string | null;
    }>;
    versions(namespace: string, slug: string, page: number, size: number, signal?: AbortSignal): Promise<{
        items: {
            version: string;
            changelog: string | null;
            publishedAt: string | null;
            downloadAvailable: boolean;
        }[];
        total: number;
        page: number;
        size: number;
    }>;
    /** Public browser query: the Registry filters and orders before pagination. */
    browseVersions(namespace: string, slug: string, page: number, size: number, signal?: AbortSignal): Promise<{
        items: {
            version: string;
            changelog: string | null;
            publishedAt: string | null;
            downloadAvailable: boolean;
        }[];
        total: number;
        page: number;
        size: number;
    }>;
    reviews(skillId: number, page: number, size: number, signal?: AbortSignal): Promise<{
        items: {
            displayName: string;
            reviewText: string;
            id: number;
            score: number;
            createdAt: string;
        }[];
        total: number;
        page: number;
        size: number;
    }>;
    private page;
    private json;
    private read;
}
export {};

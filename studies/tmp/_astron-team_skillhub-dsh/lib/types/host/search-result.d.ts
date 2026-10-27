import type { SearchInstallationStatus } from './types.js';
export interface ConversationSearchResult {
    schemaVersion: 1;
    kind: 'skillhub-search';
    query: string;
    sourceRevision: string;
    sourceLabel: string;
    createdAt: string;
    total: number;
    returned: number;
    limit: number;
    items: {
        namespace: string;
        slug: string;
        latestVersion: string;
        summary: string;
        selectionRef: string;
        installation?: SearchInstallationStatus;
    }[];
}
/** Persisted presentation metadata is untrusted and must not supply arbitrary actions. */
export declare function parseSearchResult(value: unknown): ConversationSearchResult | undefined;

import type { FileCandidate } from '../adapter/ports/channel-catalog.js';
export type { FileCandidate, FileCandidateKind } from '../adapter/ports/channel-catalog.js';
export interface FileSuggestionOptions {
    topK?: number;
    maxFiles?: number;
    maxDirectories?: number;
}
export declare function isPathLikeQuery(query: string): boolean;
export declare function fuzzySubsequenceScore(query: string, candidate: string): number | undefined;
export declare function rankFileCandidates(candidates: readonly FileCandidate[], query: string, topK?: number): FileCandidate[];
export declare function preserveSelection(previous: FileCandidate | undefined, next: readonly FileCandidate[], fallback?: number): number;
//# sourceMappingURL=fileSuggestions.d.ts.map
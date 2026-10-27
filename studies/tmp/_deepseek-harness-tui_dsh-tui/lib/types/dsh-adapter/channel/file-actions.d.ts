import type { FileCandidate } from '../../utils/fileSuggestions.js';
import type { MentionFs } from './types.js';
/** Workspace file queries and their per-cwd scan cache. */
export declare function createFileActions(deps: {
    owner: {
        current(): boolean;
        readonly signal: AbortSignal;
    };
    capture(): unknown;
    current(capture: unknown): boolean;
    cwd(): string;
    fs(): MentionFs | undefined;
}): {
    listFileCandidates: (query: string, options?: {
        signal?: AbortSignal;
        topK?: number;
    }) => Promise<readonly FileCandidate[]>;
    listFiles: () => Promise<readonly string[]>;
};
//# sourceMappingURL=file-actions.d.ts.map
import type { SessionCatalog } from '../../agent/backend.js';
import type { PreviewEntry, SessionSummary } from '../../agent/index.js';
import type { CodexHub } from './rpc/hub.js';
export interface CodexCatalogDeps {
    acquire(cwd?: string): Promise<{
        readonly hub: Pick<CodexHub, 'call'>;
        readonly release: () => void;
    }>;
    cwd(): string;
    lastUsed?(): Readonly<Record<string, number>>;
    snapshotKey?(): string | undefined;
}
/** Metadata only. Absence of preview text is not proof of an empty thread. */
export declare function codexSessionSummary(value: unknown, lastUsed?: Readonly<Record<string, number>>): SessionSummary | undefined;
/** Summary items contain text and images, never needing a tool-body read. */
export declare function codexPreviewEntries(turns: readonly unknown[], limit?: number): PreviewEntry[];
export declare function createCodexCatalog(deps: CodexCatalogDeps): SessionCatalog;
//# sourceMappingURL=catalog.d.ts.map
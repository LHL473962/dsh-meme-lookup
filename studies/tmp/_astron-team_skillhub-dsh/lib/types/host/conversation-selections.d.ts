import type { ConversationSearchContext } from './search-tool.js';
export interface SelectionScope {
    sessionId: string;
    cwd: string;
    sourceRevision: string;
}
export interface SelectionSnapshot {
    namespace: string;
    slug: string;
    version: string;
    versionId: number;
    fingerprint: string;
}
type Candidate = SelectionScope & {
    callId: string;
    namespace: string;
    slug: string;
    version: string;
};
type Verified = {
    detailToken: string;
    snapshot: SelectionSnapshot;
};
/** Host-only references: opening a detail does not make it an acknowledged selection. */
export declare class ConversationSelections {
    private readonly records;
    clear(): void;
    add(context: ConversationSearchContext & {
        sourceRevision: string;
    }, coordinate: Pick<SelectionSnapshot, 'namespace' | 'slug' | 'version'>): string;
    read(reference: string, scope: SelectionScope): Readonly<Candidate>;
    private lookup;
    stage(reference: string, scope: SelectionScope, detailToken: string, snapshot: SelectionSnapshot): string;
    acknowledge(reference: string, scope: SelectionScope, detailToken: string): boolean;
    /** Installation adapters must use this exact snapshot and revalidate it before committing. */
    resolve(reference: string, scope: SelectionScope): {
        selectionRef: string;
        detailToken: string;
        snapshot: SelectionSnapshot;
    };
    /** A direct install verifies a search candidate without pretending its detail was displayed. */
    resolveForInstall(reference: string, scope: SelectionScope, verify: (candidate: Readonly<Candidate>) => Promise<Verified>): Promise<Verified>;
    private put;
    private stale;
}
export {};

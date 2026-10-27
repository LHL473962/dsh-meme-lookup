import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol';
import type { CatalogContext, InstalledSkillList, NativeOperation } from '../host/types.js';
import type { InstallResult } from './install-result.js';
export interface ReceiptReads {
    sessionGeneration: string;
    context(): Promise<RemoteResult<CatalogContext>>;
    operation(id: string, host: string): Promise<RemoteResult<NativeOperation | null>>;
    installed(revision: string, signal: AbortSignal): Promise<RemoteResult<InstalledSkillList>>;
    /** Captures the exact controller-owned Session generation, not just its id. */
    assertCurrent(): void;
}
/** Project identity can change while the controller retains the same AgentContext object. */
export declare function receiptSessionGuard(current: () => {
    scope: object | undefined;
    cwd: string | undefined;
}): () => void;
export declare function matchesReceipt(operation: NativeOperation | null | undefined, result: InstallResult): boolean;
/** Durable receipts authorize only a fresh read, never revive expired selections or write references. */
export declare function resolveReceiptContext(reads: ReceiptReads, result: InstallResult, signal: AbortSignal): Promise<CatalogContext>;
export declare function readReceiptInventory(reads: ReceiptReads, result: InstallResult, expected: CatalogContext, signal: AbortSignal): Promise<InstalledSkillList>;

import type { InstalledSkillList, NativeOperation } from '../host/types.js';
import type { InstallResult } from './install-result.js';
/** A historical receipt only matches inventory in its original scope and exact version. */
export declare function receiptInventoryIssue(result: Pick<InstallResult, 'namespace' | 'slug' | 'version' | 'targetLabel'>, inventory: InstalledSkillList | undefined, failed: boolean): string | null;
/** Keep actionable uncertainty visible without forcing technical history open. */
export declare function receiptPresentation(operation: Pick<NativeOperation, 'phase' | 'warningCount' | 'recovery' | 'resultDetails'> | null | undefined, failed: boolean, inventoryPending: boolean, inventoryIssue: string | null): {
    label: string;
    tone: 'warning' | 'pending' | 'success';
    message: string;
};

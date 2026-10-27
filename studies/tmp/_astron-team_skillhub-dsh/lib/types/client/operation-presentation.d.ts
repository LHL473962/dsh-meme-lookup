import type { NativeOperation } from '../host/types.js';
/** Only a verified successful receipt without warnings may disappear behind a summary. */
export declare function canCollapseHistory(operation: Pick<NativeOperation, 'phase' | 'warningCount' | 'resultDetails'> | null | undefined, queryFailed: boolean): boolean;

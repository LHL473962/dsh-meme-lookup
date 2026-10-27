import type { SessionSource } from './list.js';
import type { SessionSummary } from './types.js';
export declare function readListingSnapshot(source: SessionSource): readonly SessionSummary[] | undefined;
export declare function beginListingSnapshot(source: SessionSource): (rows: readonly SessionSummary[]) => void;
//# sourceMappingURL=snapshot.d.ts.map
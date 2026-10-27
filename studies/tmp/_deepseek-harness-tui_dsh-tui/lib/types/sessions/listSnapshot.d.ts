import type { SessionSummary } from '../adapter/ports/channel-session.js';
/** Undefined is unknown; an empty snapshot is a successful empty listing. */
export declare function readListingSnapshot(key: string): readonly SessionSummary[] | undefined;
/** Capture ordering before async work, including across distinct Context proxies. */
export declare function beginListingSnapshot(key: string): (rows: readonly SessionSummary[]) => void;
//# sourceMappingURL=listSnapshot.d.ts.map
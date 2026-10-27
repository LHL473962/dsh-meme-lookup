/** Backend-neutral background-job formatting shared by the job stores, the
 *  transcript card, the `/jobs` panel and the status-line chip. */
import type { BackgroundJobState } from '../adapter/ports/channel-view.js';
/** `3s` under a minute, `3m12s` under an hour, `1h02m` beyond — transcript-card compact. */
export declare function formatJobDuration(job: Pick<BackgroundJobState, 'startedAt' | 'finishedAt'>, now?: number): string;
//# sourceMappingURL=job-format.d.ts.map
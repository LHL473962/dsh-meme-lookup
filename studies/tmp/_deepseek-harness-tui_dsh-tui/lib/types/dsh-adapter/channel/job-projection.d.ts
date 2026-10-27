import type { Agent } from '@deepseek-ai/dsh-agent';
import { BackgroundJobStore, type JobsRuntime } from '../jobs.js';
import type { ChannelOwner } from './owner.js';
import type { ChannelState, JobControl } from './types.js';
/**
 * Current-binding background-job projection. The registry can publish every
 * owner's changes, so callbacks must prove their attachment and Channel owner
 * are still current before they read a service or mutate projected rows.
 */
export declare function createJobProjection(getState: () => Pick<ChannelState, 'backgroundJobs' | 'rows' | 'emit'>, deps: {
    owner: Pick<ChannelOwner, 'current' | 'own'>;
    notify(text: string, options?: {
        color?: 'success' | 'error' | 'warning';
        timeoutMs?: number;
    }): unknown;
    rowIds: {
        value: number;
    };
    agent(): Agent;
    steer(text: string): void;
    /** The bound session's durable log, for seeding the hold ledger when a
     *  binding takes over a session that already has a call in flight. */
    history?(): readonly unknown[];
}): {
    store: BackgroundJobStore;
    control: JobControl;
    attach: (jobs: JobsRuntime | undefined, ownService?: (dispose: () => void) => void) => void;
    dropRows: () => void;
    reset: () => void;
    reanchor: () => void;
    onSessionEvent: (event: unknown) => void;
};
//# sourceMappingURL=job-projection.d.ts.map
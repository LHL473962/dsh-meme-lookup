import type { SessionSummary } from '../../adapter/ports/channel-session.js';
import type { ChannelActionDelegates } from './action-readiness.js';
import type { ChannelOwner } from './owner.js';
type ListSessions = ChannelActionDelegates['listSessions'];
type Listener = {
    enriched?: Parameters<ListSessions>[0];
    partial?: Parameters<ListSessions>[1];
};
/** Share a pending background read with the browser, including progress that
 * arrived before it opened. Completed reads still refresh on the next open. */
export declare function createSessionListing(deps: {
    owner: Pick<ChannelOwner, 'own'>;
    capture(): () => boolean;
    read(current: () => boolean, onEnriched: NonNullable<Listener['enriched']>, onPartial: NonNullable<Listener['partial']>): ReturnType<ListSessions>;
}): {
    listSessions: (onEnriched?: (summary: SessionSummary) => void, onPartial?: (rows: readonly SessionSummary[]) => void) => Promise<readonly SessionSummary[]>;
    invalidate: () => void;
};
export {};
//# sourceMappingURL=session-listing.d.ts.map
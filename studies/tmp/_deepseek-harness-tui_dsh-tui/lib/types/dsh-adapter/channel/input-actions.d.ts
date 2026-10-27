import type { AgentSession } from '../../agent/session.js';
import type { ChannelState, ComposerImageRef } from './types.js';
export interface InputConvergence {
    cancelInFlight: boolean;
    interruptSeq: number;
    /** Cause of the abort currently converging, written by whoever fires the
     *  cancel and read to decide whether a queued-input drop is still needed
     *  (a 'user' cancel kept the backend queue; an 'interrupt' drops it). */
    cancelCause?: 'user' | 'interrupt';
    /** True while an interrupt cancel's receipt has not settled yet: rows
     *  docked in that window sit outside the receipt's queue snapshot. */
    interruptReceiptPending?: boolean;
    /** The docked-row ids parked while the current receipt was in flight.
     *  Its snapshot predates them, so it cannot vouch for their backend
     *  copies; they are un-docked (with the unconfirmed notice) when it
     *  settles. Owned by the pending request; undefined when none is. */
    uncoveredDockIds?: string[];
    /** Docked-row ids whose vouching interrupt receipt has not settled yet.
     *  They still render as docked, but edit / re-send / swap are held: a
     *  late failed/unknown/still_queued answer can only revoke rows still on
     *  the pending list, so anything already delivered, edited out or
     *  swapped under a new id would double with the backend copy that
     *  receipt says may still run. A confirmed receipt graduates its rows;
     *  every other answer revokes them. Owned by the pending request;
     *  undefined when none is. */
    provisionalDockIds?: string[];
}
export declare function createInputActions(getState: () => Pick<ChannelState, 'agentId' | 'pending' | 'cancelPending' | 'emit' | 'notify' | 'backendCapabilities'>, getSession: () => AgentSession, owner: {
    assertActive(): void;
}, input: InputConvergence, composer: {
    includeLegacyImageRefs(text: string, images: readonly ComposerImageRef[]): readonly ComposerImageRef[];
}, dispatchUserText: (text: string, placement: 'steer' | 'followup', images?: readonly ComposerImageRef[]) => void, runLocalCommand: (command: string, includeInContext: boolean) => Promise<void>, 
/** Move the used session to the front of the `/resume` MRU (DSH session
 *  history); a backend whose sessions that list cannot open passes a no-op. */
touch?: (sessionId: string) => void): Pick<ChannelState, 'submit' | 'steer' | 'removePending' | 'cancel' | 'interruptAndDeliver' | 'interruptAndDock' | 'deliverDocked' | 'swapDockedForDraft'>;
//# sourceMappingURL=input-actions.d.ts.map
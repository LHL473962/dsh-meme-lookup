import type { ContextOccupancy } from '../../adapter/ports/channel-view.js';
import type { ComposerImageRef, PendingMessage } from './types.js';
/** Small mutable cells for Channel-local warning and pending-message state. */
export declare function createContextBookkeeping(state: () => {
    /** The channel's single occupancy reading (projection first, sample
     *  fallback) — the honest numerator for the context-low warning. */
    contextOccupancy: ContextOccupancy | undefined;
    pending: PendingMessage[];
    emit(): void;
}, notify: (text: string, options: {
    color: 'warning';
    timeoutMs: number;
}) => unknown, lowContextText: (percent: number) => string, warningBufferTokens: number): {
    warning: {
        value: boolean;
    };
    resetContextWarning: () => void;
    checkContextWarning: () => void;
    trackPending: (message: {
        id: string;
        text: string;
        images?: readonly ComposerImageRef[];
    }, placement: PendingMessage["placement"]) => void;
    untrackPending: (messageId: string) => void;
};
//# sourceMappingURL=context-bookkeeping.d.ts.map
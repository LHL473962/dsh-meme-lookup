/** In-process renderer capability, deliberately separate from JSON snapshots.
 * Every returned executable handle captures the same channel lifetime. No
 * handle can resolve a later registration or bypass policy through a factory.
 */
import { type AdapterMode } from '../kernel/runtime.js';
import { type ChannelUi } from './ui-policy.js';
export interface ChannelUiLease {
    assertActive(): void;
    own(dispose: () => void): () => void;
}
/** What every read of an ended Channel UI lifetime throws. */
export declare const CHANNEL_UI_LIFETIME_ENDED = "dsh-tui: Channel UI lifetime has ended";
export declare function createChannelUiLease(isCurrent: () => boolean): ChannelUiLease & {
    dispose(): void;
};
/** The same factory is used by the kernel and bare production composition. */
export declare function createChannelUi(channel: ChannelUi, mode: AdapterMode, lease: ChannelUiLease): ChannelUi;
//# sourceMappingURL=ui.d.ts.map
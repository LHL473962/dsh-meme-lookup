/**
 * Channel state module (P4 channel split).
 *
 * Reads the live Channel's mutable reactive state and returns a frozen,
 * JSON-ish state snapshot. This module only projects; it never mutates.
 */
import type { Channel } from '../../dsh-adapter/channel.js';
import type { HostChannelStateSnapshot } from '../ports/channel.js';
/** Project the live Channel state into a serializable host-internal snapshot. */
export declare function projectChannelState(channel: Channel): HostChannelStateSnapshot;
//# sourceMappingURL=state.d.ts.map
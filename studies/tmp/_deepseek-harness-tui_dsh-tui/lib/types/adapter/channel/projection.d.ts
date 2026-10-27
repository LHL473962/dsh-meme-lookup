/**
 * Channel projection module (P4 channel split).
 *
 * This is the pure projection half of the live Channel: it maps the legacy
 * Channel/ChannelState surface into a serializable host-internal projection
 * used by the Kernel Channel Port. It deliberately strips functions, handles,
 * secrets and renderer-only objects from the snapshot.
 */
import type { Channel, ChatRow } from '../../dsh-adapter/channel.js';
import type { HostChannelProjectionSnapshot, HostChannelRowProjection } from '../ports/channel.js';
/** Project the current channel transcript rows into a JSON-safe view. */
export declare function projectChannelRows(rows: readonly ChatRow[]): readonly HostChannelRowProjection[];
/** Project the live Channel into the serializable renderer projection. */
export declare function projectChannelSnapshot(channel: Channel): HostChannelProjectionSnapshot;
//# sourceMappingURL=projection.d.ts.map
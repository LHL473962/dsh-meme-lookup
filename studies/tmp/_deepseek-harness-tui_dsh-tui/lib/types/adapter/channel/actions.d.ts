/**
 * Channel actions module (P4 channel split).
 *
 * This is the action half of the live Channel: a thin adapter over the
 * public Channel mutation methods. The Kernel HostFacade wraps these methods
 * with the unified shadow-policy enforcement before any caller can invoke
 * them, so this module never performs its own shadow check.
 *
 * The internal `CHANNEL_SPLIT_TOKEN` is required to prevent arbitrary TUI
 * code from importing this split builder directly and bypassing the
 * HostFacade shadow gate.
 */
import type { Channel } from '../../dsh-adapter/channel.js';
import type { HostChannelActionsPort } from '../ports/channel.js';
/** Build the host-internal action surface over one live Channel. */
export declare function createChannelActions(channel: Channel, token: symbol): HostChannelActionsPort;
//# sourceMappingURL=actions.d.ts.map
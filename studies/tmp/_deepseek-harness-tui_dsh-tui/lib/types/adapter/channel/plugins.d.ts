/**
 * Channel plugins module (P4 channel split).
 *
 * Projects the plugin-visible seams that hang off the live Channel into a
 * small host-internal Port: external plugin commands, plugin scenes and
 * settings sections. It never exposes plugin registration or permission
 * evaluation; those stay in Standard/Kernel.
 *
 * The internal `CHANNEL_SPLIT_TOKEN` is required so this split builder cannot
 * be invoked outside the Kernel/driver path and bypass the HostFacade shadow
 * gate.
 */
import type { Channel } from '../../dsh-adapter/channel.js';
import type { HostChannelPluginsPort } from '../ports/channel.js';
/** Build the host-internal plugin-facing surface over one live Channel. */
export declare function createChannelPlugins(channel: Channel, token: symbol): HostChannelPluginsPort;
//# sourceMappingURL=plugins.d.ts.map
/** Production assembly for the in-process Channel renderer capability. */
import type { ChannelState } from './channel.js';
import type { ChannelUi } from '../adapter/channel/ui-policy.js';
import type { AdapterMode } from '../adapter/kernel/runtime.js';
export declare function mountChannelUi(ctx: unknown, channel: ChannelState, pluginHost: unknown, mode: AdapterMode, 
/** Look the plugin host up per probe (late row); absent = `pluginHost`. */
resolvePluginHost?: () => unknown): {
    channel: ChannelUi;
    dispose(): void;
};
//# sourceMappingURL=channel-ui.d.ts.map
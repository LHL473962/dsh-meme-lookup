/** Internal command composition follows the same production UI dispatcher.
 * A bare createChannel embedder intentionally keeps its direct local API.
 */
import type { ChannelUi } from '../../adapter/channel/ui-policy.js';
import type { ChannelState } from './types.js';
export declare function bindChannelCommands(state: ChannelState, commands: ChannelUi): void;
export declare function channelCommands(state: ChannelState): ChannelUi | ChannelState;
//# sourceMappingURL=commands.d.ts.map
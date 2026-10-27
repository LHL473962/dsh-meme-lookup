import { channelDriver } from '../../upstream/channel-driver.js';
import { CHANNEL_FEATURES } from '../../channel/features.js';
export const channelSlice = Object.freeze({
    id: 'channel',
    capability: 'host.channel',
    driver: channelDriver,
    standardDeclarations: Object.freeze([...CHANNEL_FEATURES]),
});

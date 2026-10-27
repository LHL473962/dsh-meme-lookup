import type { ChannelOwner } from './owner.js';
import type { ChannelUi } from '../../adapter/ports/channel-ui.js';
import type { NotificationItem } from './types.js';
/** Own expiry and explicit dismissal in the same bounded notification scope. */
export declare function createChannelNotifications(state: () => {
    notifications: NotificationItem[];
    emit(): void;
}, owner: ChannelOwner): ChannelUi['notify'];
//# sourceMappingURL=notifications.d.ts.map
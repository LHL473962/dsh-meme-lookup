import React from 'react';
import type { BackendChannelsHost, ChannelUi } from '../../adapter/ports/channel-ui.js';
import type { QuestionStore } from '../../channel/questions.js';
import type { ChannelPickerRow } from '../../components/ChannelPicker.js';
import type { ChatOverlayAction } from '../chatOverlay.js';
export declare function useBackendChannels({ channel, host, questionStore, dispatchOverlay, onRestartFreshSession, runOAuthLogin }: {
    channel: ChannelUi;
    host: BackendChannelsHost | undefined;
    questionStore: QuestionStore;
    dispatchOverlay: React.Dispatch<ChatOverlayAction>;
    onRestartFreshSession: ((notice: string) => void) | undefined;
    runOAuthLogin: typeof import('../../dsh-adapter/providerWizard.js').runOAuthLogin;
}): {
    rows: readonly ChannelPickerRow[];
    open: () => void;
    pick: (index: number) => void;
    setMode: (id: string, name: string) => Promise<boolean>;
    login: () => boolean;
};
//# sourceMappingURL=useBackendChannels.d.ts.map
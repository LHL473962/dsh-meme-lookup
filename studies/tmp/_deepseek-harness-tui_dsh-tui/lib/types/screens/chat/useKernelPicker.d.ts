import React from 'react';
import type { ChannelUi } from '../../adapter/ports/channel-ui.js';
import { type KernelEntry, type KernelOption, type KernelStatus } from '../../components/kernelCatalog.js';
import type { KernelBackendId } from '../../kernelPrefs.js';
import type { ChatOverlayAction } from '../chatOverlay.js';
export declare function useKernelPicker({ channel, kernelVersion, kernelEntries, launchpadShown, onProbeKernels, onSwitchBackend, canInstallSdk, dispatchOverlay }: {
    channel: ChannelUi;
    kernelVersion: string | undefined;
    /** The host's registry projection, in picker order (P0: the UI renders the
     *  entry list it is handed and never imports the registry). */
    kernelEntries: readonly KernelEntry[];
    launchpadShown: boolean;
    onProbeKernels: (() => Promise<Record<string, KernelStatus>>) | undefined;
    onSwitchBackend: ((id: KernelBackendId) => void) | undefined;
    /** The host wires the SDK install wizard (resolve target / start pnpm).
     *  Absent = no install path: the dim row keeps its dead-end reason. */
    canInstallSdk: boolean;
    dispatchOverlay: React.Dispatch<ChatOverlayAction>;
}): {
    currentId: string;
    options: readonly KernelOption[];
    open: (index?: number) => void;
    pick: (index: number) => void;
    pickById: (id: string) => Promise<void>;
    reprobe: () => void;
};
//# sourceMappingURL=useKernelPicker.d.ts.map
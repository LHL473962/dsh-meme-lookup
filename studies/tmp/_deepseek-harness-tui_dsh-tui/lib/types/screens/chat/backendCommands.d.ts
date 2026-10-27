import type { BackendChannelsHost, BackendModesHost } from '../../adapter/ports/channel-ui.js';
import type { BackendModeOption } from '../../adapter/ports/channel-view.js';
import type { ChatOverlay } from '../chatOverlay.js';
export declare function channelMapLines(snapshot: ReturnType<BackendChannelsHost['snapshot']>): string[];
export declare function parseMcpCommand(rawInput: string): {
    kind: 'status';
} | {
    kind: 'usage';
} | {
    kind: 'reconnect';
    name: string;
} | {
    kind: 'toggle';
    name: string;
    enabled: boolean;
};
export declare function backendPermissionCommand(snapshot: ReturnType<BackendModesHost['snapshot']> | undefined, rawInput: string, fallbackName: string): {
    kind: 'status';
    lines: readonly string[];
} | {
    kind: 'picker';
    overlay: Extract<ChatOverlay, {
        kind: 'mode';
    }>;
} | {
    kind: 'set';
    mode: BackendModeOption;
} | {
    kind: 'unknown';
    id: string;
} | undefined;
export declare function backendModeStatus(snapshot: ReturnType<BackendModesHost['snapshot']> | undefined, onOpen: () => void): {
    id: string;
    name: string;
    onOpen: () => void;
} | undefined;
//# sourceMappingURL=backendCommands.d.ts.map
import { type SidePanelSplit } from './dimensions.js';
import type { SidePanelKeyFlags, SidePanelRuntime } from './types.js';
export type { SidePanelKeyFlags } from './types.js';
export type SidePanelFocus = 'chat' | 'panel';
export interface UseSidePanelOptions {
    /** Content width after PageMargin (what Chat's useTerminalSize reports). */
    readonly columns: number;
    readonly fullscreen: boolean;
    /** Fullscreen draft editor covers the whole page: force collapsed. */
    readonly editorOpen: boolean;
}
export interface SidePanelKeyEventLike {
    stopImmediatePropagation?: () => void;
}
export interface SidePanelController {
    /** Resolved split, or null when the chat takes the full width. */
    readonly geometry: SidePanelSplit | null;
    readonly split: boolean;
    readonly chatColumns: number;
    readonly panelColumns: number;
    /** Whether a split COULD render right now (setting + width + mode). */
    readonly splitAvailable: boolean;
    readonly open: boolean;
    readonly zoom: boolean;
    readonly focus: SidePanelFocus;
    readonly activePanelId: string | undefined;
    readonly enabledPanelIds: readonly string[];
    /** 键盘分发与 Panel 注册的接缝（PanelHost / usePanelInput 用）。 */
    readonly runtime: SidePanelRuntime;
    focusChat: () => void;
    focusPanel: () => void;
    /** Ctrl+B smart three-state: closed → open+focus; chat → panel; panel → close. */
    toggleSmart: () => void;
    /** /panel toggle: plain open/close (focus returns to chat on close). */
    toggleOpen: () => void;
    toggleZoom: () => void;
    nudge: (deltaColumns: number) => void;
    /** Set the visible chat width in cells, leaving zoom and preserving focus. */
    resize: (chatColumns: number) => void;
    openPanel: (id: string, opts?: {
        readonly focus?: boolean;
    }) => void;
    /** /panel command dispatcher; false = unknown argument. */
    command: (raw: string) => boolean;
    /** Keyboard entry point (see the priority contract in the file header). */
    handleKey: (input: string, key: SidePanelKeyFlags, event?: SidePanelKeyEventLike) => boolean;
}
export declare function useSidePanel(options: UseSidePanelOptions): SidePanelController;
//# sourceMappingURL=useSidePanel.d.ts.map
/** React shell surfaces for the compact novel workbench drawer and Settings evidence card. */
import type { PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots';
import type { PresetSetupController } from './setup-store.ts';
import type { NovelWorkbenchController } from './workbench-store.ts';
/**
 * Contain focus in a non-modal drawer, close it with Escape, and restore its invoking control.
 *
 * @param drawer Drawer element receiving fallback focus.
 * @param initialFocus Preferred element focused after open.
 * @param returnFocus Invoking control restored after close.
 * @param close Close action used by the Escape key.
 * @returns A disposer that removes the key listener and restores focus.
 */
export declare function installDrawerKeyboardScope(drawer: HTMLElement, initialFocus: HTMLElement, returnFocus: HTMLElement | undefined, close: () => void): () => void;
/**
 * Reserve the drawer's wide-screen column in the owning Harness frame.
 *
 * @param shellSeat Mounted marker or drawer inside the native shell overlay layer.
 * @returns A disposer that restores the frame's original layout.
 * @throws When the shell seat is not mounted inside a Harness shell overlay.
 */
export declare function installWorkbenchLayoutReservation(shellSeat: HTMLElement): () => void;
/** Controllers shared by the sidebar, overlay, and Plugin Configuration card. */
export interface NovelWorkbenchInjected {
    readonly workbenchController: NovelWorkbenchController;
    readonly setupController: PresetSetupController;
}
type NovelWorkbenchTriggerProps = PropsRuntime<'sidebar.footer.action'> & NovelWorkbenchInjected;
type NovelWorkbenchOverlayProps = PropsRuntime<'shell.overlay'> & NovelWorkbenchInjected;
/**
 * Render the discoverable sidebar action.
 *
 * @param props Sidebar width state and shared workbench controllers.
 * @returns A keyboard-operable DSH-native button.
 */
export declare function NovelWorkbenchTrigger({ wide, workbenchController, setupController, }: NovelWorkbenchTriggerProps): import("react").JSX.Element;
/**
 * Render the 400–440 px non-modal workbench in the root shell overlay slot.
 *
 * @param props Shared workbench and Preset setup controllers.
 * @returns The controlled drawer while open, otherwise null.
 */
export declare function NovelWorkbenchOverlay({ workbenchController, setupController }: NovelWorkbenchOverlayProps): import("react").JSX.Element | null;
/**
 * Subscribe the pure Plugin Configuration card to shared controller state.
 *
 * @param props Shared controllers owned by the client plugin fiber.
 * @returns One card contribution with live Host, Preset, Workspace, and project evidence.
 */
export declare function NovelPluginStatusCard({ workbenchController, setupController }: NovelWorkbenchInjected): import("react").JSX.Element;
export { NovelPluginCardBody, NovelWorkbenchBody } from './workbench-view.tsx';
export type { NovelPluginCardBodyProps, NovelWorkbenchBodyProps } from './workbench-view.tsx';

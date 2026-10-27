/** Browser entry for the bundle. */
import type { ClientConnectionRpc } from '@deepseek-ai/dsh-client-connection/client';
import type { ClientContext, ISessions } from '@deepseek-ai/dsh-client-runtime/client';
import { type PresetSetupPort } from './setup-store.ts';
import { type NovelWorkbenchPort } from './workbench-store.ts';
export { PresetSetupBody } from './setup-view.tsx';
export type { PresetSetupBodyProps } from './setup-view.tsx';
export { installDrawerKeyboardScope, installWorkbenchLayoutReservation, NovelPluginCardBody, NovelPluginStatusCard, NovelWorkbenchBody, NovelWorkbenchOverlay, NovelWorkbenchTrigger, } from './context-view.tsx';
export type { NovelPluginCardBodyProps, NovelWorkbenchBodyProps, NovelWorkbenchInjected, } from './context-view.tsx';
export { observeNovelContextSources } from './context-observer.ts';
export type { NovelContextSelectionSources } from './context-observer.ts';
export { PresetSetupController, PresetSetupDisconnectedError, } from './setup-store.ts';
export type { PresetSetupPort, PresetSetupState } from './setup-store.ts';
export { AI_NOVEL_PRESET_ID, initializationProposalPrompt, NovelWorkbenchController, NovelWorkbenchDisconnectedError, } from './workbench-store.ts';
export type { NovelApprovalAvailability, NovelInitializationDraft, NovelInitializationIdentity, NovelInitializationPhase, NovelInitializationPreview, NovelInitializationState, NovelPromptResult, NovelReadFeedback, NovelWorkbenchPort, NovelWorkbenchState, NovelWorkbenchTarget, } from './workbench-store.ts';
export { installNovelContextStyle, novelContextCss } from './setup-style.ts';
/** Required browser services. */
export declare const inject: string[];
/**
 * Adapt the generic Connection RPC caller to the closed preset setup interface.
 *
 * @param rpc Browser connection RPC caller.
 * @returns A validated setup port with no path-bearing operations.
 */
export declare function createPresetSetupPort(rpc: Pick<ClientConnectionRpc, 'call'>): PresetSetupPort;
/**
 * Adapt the generic Connection RPC caller to the path-free context read interface.
 *
 * @param rpc Browser connection RPC caller.
 * @returns A validated context port accepting only opaque Workspace identity and chapter number.
 */
export declare function createNovelContextPort(rpc: Pick<ClientConnectionRpc, 'call'>): Pick<NovelWorkbenchPort, 'read' | 'readAsset'>;
/**
 * Adapt Host reads and the current Session face to the workbench's closed port.
 *
 * @param rpc Browser connection RPC caller.
 * @param sessions Browser Session registry used only for ordinary prompt submission.
 * @returns A path-free port with no mutation RPC.
 */
export declare function createNovelWorkbenchPort(rpc: Pick<ClientConnectionRpc, 'call'>, sessions: Pick<ISessions, 'binding'>): NovelWorkbenchPort;
/**
 * Register the sidebar setup trigger and shell overlay over one shared controller.
 *
 * @param ctx Browser Cordis context.
 * @returns Nothing.
 */
export declare function apply(ctx: ClientContext): void;

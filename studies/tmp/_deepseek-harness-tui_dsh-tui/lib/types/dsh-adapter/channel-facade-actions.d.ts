/**
 * T1 Channel-facade action helpers.
 *
 * These helpers route production Channel notifications/submits through the
 * shadow-guarded `HostFacade.channel.actions` when available. In
 * passive/replay shadow modes they never fall back to the native Channel:
 * if the facade is missing or the shadow policy rejects the action, the call
 * is dropped instead of bypassing the guard.
 */
import type { AdapterRuntimeOptions } from '../adapter/kernel/runtime.js';
export interface ChannelFacadeNotifyOptions {
    readonly color?: 'error' | 'warning' | 'success';
    readonly timeoutMs?: number;
}
export type ChannelFacadeRuntime = AdapterRuntimeOptions;
export type ChannelFacadeActionOutcome = 'facade' | 'native' | 'dropped';
/** Route a notification through HostFacade.channel when safely possible. */
export declare function notifyViaChannelFacade(pluginHost: unknown, nativeChannel: {
    notify(text: string, options?: ChannelFacadeNotifyOptions): unknown;
}, runtime: ChannelFacadeRuntime, text: string, options?: ChannelFacadeNotifyOptions): ChannelFacadeActionOutcome;
/** Route a submit through HostFacade.channel when safely possible. */
export declare function submitViaChannelFacade(pluginHost: unknown, nativeChannel: {
    submit(text: string): void;
}, runtime: ChannelFacadeRuntime, text: string): ChannelFacadeActionOutcome;
//# sourceMappingURL=channel-facade-actions.d.ts.map
/**
 * T1 Channel-facade action helpers.
 *
 * These helpers route production Channel notifications/submits through the
 * shadow-guarded `HostFacade.channel.actions` when available. In
 * passive/replay shadow modes they never fall back to the native Channel:
 * if the facade is missing or the shadow policy rejects the action, the call
 * is dropped instead of bypassing the guard.
 */
import { getHostFacade } from './plugin-host.js';
function isShadowAdapterRuntime(runtime) {
    return runtime.mode === 'passive-shadow' || runtime.mode === 'replay-shadow';
}
/** Route a notification through HostFacade.channel when safely possible. */
export function notifyViaChannelFacade(pluginHost, nativeChannel, runtime, text, options) {
    const facade = getHostFacade(pluginHost);
    if (facade?.channel !== undefined) {
        try {
            facade.channel.actions.notify(text, options);
            return 'facade';
        }
        catch (error) {
            if (isShadowAdapterRuntime(runtime))
                return 'dropped';
            // Non-shadow: a facade that exists but throws is not a "not mounted"
            // condition; surface it instead of silently falling back to native.
            throw error;
        }
    }
    else if (isShadowAdapterRuntime(runtime)) {
        return 'dropped';
    }
    nativeChannel.notify(text, options);
    return 'native';
}
/** Route a submit through HostFacade.channel when safely possible. */
export function submitViaChannelFacade(pluginHost, nativeChannel, runtime, text) {
    const facade = getHostFacade(pluginHost);
    if (facade?.channel !== undefined) {
        try {
            facade.channel.actions.submit(text);
            return 'facade';
        }
        catch (error) {
            if (isShadowAdapterRuntime(runtime))
                return 'dropped';
            throw error;
        }
    }
    else if (isShadowAdapterRuntime(runtime)) {
        return 'dropped';
    }
    nativeChannel.submit(text);
    return 'native';
}

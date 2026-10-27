import { isLoopbackRequest } from "./loopback.js";
/**
 * Whether this request may enter the plugin's host routes.
 * @param ctx - host context; may expose remoteWebUiPairing.
 * @param request - the incoming HTTP request.
 * @returns true for loopback, or a live paired-device cookie.
 */
export function isPairedOrLoopbackAllowed(ctx, request) {
    if (isLoopbackRequest(request))
        return true;
    return lookupPairing(ctx)?.isPairedDevice(request) === true;
}
/**
 * The pairing service, or undefined when this composition does not expose it.
 *
 * Two lookups exist because the fence is shared with test harnesses that hand
 * over a bare object: a real cordis context resolves services through `get`, a
 * harness may carry the property directly. `get(name, false)` is the
 * non-strict form, so an unloaded service answers undefined rather than
 * throwing. Reading an un-injected service as a PROPERTY throws instead
 * (`cannot get property "remoteWebUiPairing" without inject`); a trust fence
 * must answer "not paired" in that case, never leak the error into the route
 * handler, where the host web server turns it into an empty-body 400 (#1942).
 */
function lookupPairing(ctx) {
    if (typeof ctx.get === 'function') {
        const viaGet = ctx.get('remoteWebUiPairing', false);
        return isPairingAccess(viaGet) ? viaGet : undefined;
    }
    try {
        const viaProperty = ctx.remoteWebUiPairing;
        return isPairingAccess(viaProperty) ? viaProperty : undefined;
    }
    catch {
        return undefined;
    }
}
function isPairingAccess(value) {
    return value !== undefined
        && value !== null
        && typeof value.isPairedDevice === 'function';
}

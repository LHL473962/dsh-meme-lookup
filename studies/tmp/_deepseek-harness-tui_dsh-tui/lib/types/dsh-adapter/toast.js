/**
 * Plugin-facing transient notifications — a fire-and-forget toast shown on
 * the host's existing notification surface (the same toasts the channel
 * itself uses for decision vetoes and command outcomes).
 *
 * Same split as the status/dialog seams: a cordis-free sink container the
 * host bridges onto `channel.notify`, plus a thin cordis service validating
 * untrusted text and rate-limiting per plugin activation.
 *
 * Deliberately NOT part of the effect ledger: a toast is a transient
 * display with no cleanup responsibility (it auto-expires), unlike keyed
 * status contributions or registered scenes/renderers.
 */
import { Service } from '@deepseek-ai/cordis';
import { cleanScalarText } from './sanitize.js';
import { activationFiber, compositionRoot, concreteService, requirePluginCaller } from './host-access.js';
import { assertCapabilityShadowPolicy, } from '../adapter/kernel/runtime.js';
import { adapterRuntimeFor } from '../adapter/kernel/runtime-context.js';
// Same caps as the channel's own toast-bound plugin text (NOTICE_CELLS).
const TEXT_CELLS = 200;
const TIMEOUT_DEFAULT_MS = 4000;
const TIMEOUT_MIN_MS = 500;
const TIMEOUT_MAX_MS = 12_000;
// Per-activation sliding window: a runaway loop must not own the screen.
const RATE_WINDOW_MS = 60_000;
const RATE_LIMIT = 20;
const COLORS = new Set(['success', 'warning', 'error']);
/** Cordis-free sink container. The host registers the only sink; plugin
 * deliveries before/after a sink exists are dropped (returned as false). */
export class TuiToastStore {
    sink;
    probeSinks = new Set();
    setSink(sink) {
        this.sink = sink;
    }
    /** Whether a real production sink (the host's channel.notify bridge) is
     * present. Used by the toast live probe to distinguish “host store exists”
     * from “real production delivery path is actually wired”. */
    hasSink() {
        return this.sink !== undefined;
    }
    /** Host-only probe sink registration. Probe sinks are independent of the
     * production sink, so a live probe never replaces or swallows production
     * toast delivery. */
    addProbeSink(sink) {
        this.probeSinks.add(sink);
        return () => {
            this.probeSinks.delete(sink);
        };
    }
    /** Deliver only to host-only probe sinks, leaving the production sink
     * completely untouched. Returns true when at least one probe sink received
     * the delivery. */
    deliverProbe(delivery) {
        let delivered = false;
        for (const sink of this.probeSinks) {
            sink(delivery);
            delivered = true;
        }
        return delivered;
    }
    deliver(delivery) {
        if (this.sink === undefined)
            return false;
        this.sink(delivery);
        return true;
    }
}
const hostToastStores = new WeakMap();
/**
 * `ctx.tuiToast` — plugin-facing transient notifications. Invalid input,
 * over-limit callers and sink-less hosts make `show` return `false` with a
 * logger warning instead of throwing: a toast must never take the TUI down.
 */
export class TuiToastRuntime extends Service {
    constructor(ctx) {
        super(ctx, 'tuiToast');
        compositionRoot(ctx);
        const state = { store: new TuiToastStore(), windows: new Map(), warned: new Set(), runtime: adapterRuntimeFor(ctx) };
        hostToastStores.set(this, state);
    }
    /**
     * Show one transient toast. `text` is scalar-only (string/number/boolean
     * coerced to string; anything else is refused — never rendered as
     * "[object Object]"); control characters are stripped and the text is
     * capped at 200 cells, exactly like host toast-bound plugin text.
     *
     * Returns `true` when the toast was delivered to a host sink. `false`
     * means refused (non-scalar text, unknown color) or dropped (no sink —
     * e.g. a headless composition — or the caller exceeded 20 toasts per
     * minute; the first drop logs a sticky warning per activation).
     */
    show(text, options = {}) {
        assertCapabilityShadowPolicy('host.toast.show', toastStateFor(this).runtime.mode, toastStateFor(this).runtime.slices);
        let caller;
        try {
            caller = requirePluginCaller(this.ctx, 'tuiToast.show', this);
        }
        catch {
            this.ctx.logger.warn('dsh-tui: tuiToast.show requires a live non-root plugin activation');
            return false;
        }
        const state = toastStateFor(this);
        if (typeof text !== 'string' && typeof text !== 'number' && typeof text !== 'boolean') {
            caller.logger.warn('dsh-tui: tuiToast.show rejected non-scalar text');
            return false;
        }
        const cleaned = cleanScalarText(text, TEXT_CELLS);
        if (cleaned === '') {
            caller.logger.warn('dsh-tui: tuiToast.show rejected empty text');
            return false;
        }
        let color;
        if (options.color !== undefined) {
            if (!COLORS.has(options.color)) {
                caller.logger.warn(`dsh-tui: tuiToast.show rejected unknown color "${String(options.color)}"`);
                return false;
            }
            color = options.color;
        }
        let timeoutMs = TIMEOUT_DEFAULT_MS;
        if (options.timeoutMs !== undefined) {
            if (options.timeoutMs <= 0) {
                // Sticky toasts are a host-only device; fall back, don't fail —
                // the plugin asked to be seen, not to park an indicator forever.
                caller.logger.warn('dsh-tui: tuiToast.show ignores sticky timeoutMs (host-only); using the 4000ms default');
            }
            else {
                timeoutMs = Math.min(TIMEOUT_MAX_MS, Math.max(TIMEOUT_MIN_MS, Math.floor(options.timeoutMs)));
            }
        }
        const owner = activationFiber(caller);
        if (owner === undefined) {
            caller.logger.warn('dsh-tui: tuiToast.show requires a live activation owner');
            return false;
        }
        const now = Date.now();
        const window = state.windows.get(owner) ?? [];
        while (window.length > 0 && now - window[0] >= RATE_WINDOW_MS)
            window.shift();
        if (window.length >= RATE_LIMIT) {
            if (!state.warned.has(owner)) {
                state.warned.add(owner);
                caller.logger.warn(`dsh-tui: tuiToast.show rate-limited an activation to ${RATE_LIMIT}/min; further toasts in this window are dropped silently`);
            }
            state.windows.set(owner, window);
            return false;
        }
        window.push(now);
        state.windows.set(owner, window);
        return state.store.deliver({ text: cleaned, ...(color === undefined ? {} : { color }), timeoutMs });
    }
}
function toastStateFor(runtime) {
    const state = hostToastStores.get(concreteService(runtime));
    if (state === undefined)
        throw new Error('tuiToast host store is unavailable');
    return state;
}
/** Host-only toast store accessor; not part of the package export map. */
export function getHostToastStore(runtime) {
    if (runtime === undefined)
        return undefined;
    try {
        return hostToastStores.get(concreteService(runtime))?.store;
    }
    catch {
        return undefined;
    }
}
export default TuiToastRuntime;

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
import { Context, Service } from '@deepseek-ai/cordis';
/** Sanitized toast request after runtime validation, ready for the host sink. */
export interface TuiToastDelivery {
    readonly text: string;
    readonly color?: 'success' | 'warning' | 'error';
    readonly timeoutMs: number;
}
/** Host-side consumer; bridged onto `channel.notify` by the TUI plugin row. */
export type TuiToastSink = (delivery: TuiToastDelivery) => void;
/** Plugin-facing options for {@link TuiToastRuntime.show}. */
export interface TuiToastOptions {
    /** Theme color key; omitted = neutral (dim). */
    readonly color?: 'success' | 'warning' | 'error';
    /** Auto-dismiss after this many ms. Clamped into [500, 12000]; plugins
     * cannot create sticky toasts (timeoutMs 0/negative falls back to the
     * 4000ms default) — a parked indicator is a host-only device (D-8). */
    readonly timeoutMs?: number;
}
/** Cordis-free sink container. The host registers the only sink; plugin
 * deliveries before/after a sink exists are dropped (returned as false). */
export declare class TuiToastStore {
    private sink;
    private readonly probeSinks;
    setSink(sink: TuiToastSink | undefined): void;
    /** Whether a real production sink (the host's channel.notify bridge) is
     * present. Used by the toast live probe to distinguish “host store exists”
     * from “real production delivery path is actually wired”. */
    hasSink(): boolean;
    /** Host-only probe sink registration. Probe sinks are independent of the
     * production sink, so a live probe never replaces or swallows production
     * toast delivery. */
    addProbeSink(sink: TuiToastSink): () => void;
    /** Deliver only to host-only probe sinks, leaving the production sink
     * completely untouched. Returns true when at least one probe sink received
     * the delivery. */
    deliverProbe(delivery: TuiToastDelivery): boolean;
    deliver(delivery: TuiToastDelivery): boolean;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        tuiToast: TuiToastRuntime;
    }
}
/**
 * `ctx.tuiToast` — plugin-facing transient notifications. Invalid input,
 * over-limit callers and sink-less hosts make `show` return `false` with a
 * logger warning instead of throwing: a toast must never take the TUI down.
 */
export declare class TuiToastRuntime extends Service {
    constructor(ctx: Context);
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
    show(text: string | number | boolean, options?: TuiToastOptions): boolean;
}
/** Host-only toast store accessor; not part of the package export map. */
export declare function getHostToastStore(runtime: TuiToastRuntime | undefined): TuiToastStore | undefined;
export default TuiToastRuntime;
//# sourceMappingURL=toast.d.ts.map
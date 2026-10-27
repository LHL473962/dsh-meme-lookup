/**
 * Managed plugin dialogs — the pi `ctx.ui.select/confirm/input` seam for
 * dsh-TUI. Plugins hand the HOST a declarative request; the TUI renders the
 * dialog in its own chrome (next to the approval panel), owns the keyboard,
 * and settles the plugin's promise with the user's answer. Plugins never
 * touch the TTY themselves.
 *
 * Split in two, mirroring QuestionStore/ApprovalStore:
 *
 * - {@link TuiDialogStore} — cordis-free queue + snapshot. The chat screen
 *   subscribes to it and renders the current dialog; tests can drive it
 *   without a cordis context.
 * - {@link TuiDialogRuntime} — the cordis service (`ctx.tuiDialogs`)
 *   plugins call. Validation of untrusted request data lives here.
 *
 * Queue semantics mirror the approval store: parallel plugin calls park
 * FIFO and surface one at a time. A request settles exactly once — user
 * answer, Esc cancel, caller AbortSignal, caller timeout, or service
 * teardown (`cancelled` outcomes map to `undefined`/`false` returns).
 */
import { Context, Service } from '@deepseek-ai/cordis';
/** Option of a select dialog. `id` is what the promise resolves with. */
export interface TuiDialogSelectOption {
    id: string;
    label: string;
    description?: string;
}
/** What the chat screen renders while a dialog is pending. */
export type TuiDialogSnapshot = {
    readonly key: string;
    readonly kind: 'select';
    readonly title: string;
    readonly options: readonly TuiDialogSelectOption[];
} | {
    readonly key: string;
    readonly kind: 'confirm';
    readonly title: string;
    readonly message?: string;
    readonly confirmLabel: string;
    readonly cancelLabel: string;
} | {
    readonly key: string;
    readonly kind: 'input';
    readonly title: string;
    readonly placeholder?: string;
    readonly initial: string;
};
/** Common request options. */
export interface TuiDialogBase {
    /** Dialog title (rendered bold). Control chars are stripped. */
    title: string;
    /** Cancels the request when fired — the pi `signal` option. */
    signal?: AbortSignal;
    /** Auto-cancel after this many ms. Guards against a wedged flow when no
     *  TUI consumer is present (headless embedders). */
    timeoutMs?: number;
}
export interface TuiDialogSelectRequest extends TuiDialogBase {
    options: readonly TuiDialogSelectOption[];
}
export interface TuiDialogConfirmRequest extends TuiDialogBase {
    message?: string;
    /** Empty/absent labels fall back to the host's localized defaults. */
    confirmLabel?: string;
    cancelLabel?: string;
}
export interface TuiDialogInputRequest extends TuiDialogBase {
    placeholder?: string;
    initial?: string;
}
/** Settled value of the active dialog: the select id, the confirm boolean,
 *  or the input text. `undefined` means cancelled. */
export type TuiDialogAnswer = string | boolean | undefined;
/** Distributive Omit: `Omit` over a union collapses to the shared members
 *  only, which would strip kind-specific fields from the ask() input. */
type WithoutKey<T> = T extends unknown ? Omit<T, 'key'> : never;
/** The documented bound of the resolved input text; the panel enforces it
 *  on every edit path (typing AND paste) so the promise never resolves with
 *  a larger value. */
export declare const INPUT_CELLS = 500;
/** Bound a request that omits both signal and timeout. */
export declare const DIALOG_DEFAULT_TIMEOUT_MS = 30000;
/**
 * Cordis-free dialog queue. `ask` parks a request; the UI drains one at a
 * time via the snapshot and settles through {@link decide}/{@link cancel}.
 */
export declare class TuiDialogStore {
    private readonly listeners;
    private readonly queue;
    private active;
    /** Park a request. The snapshot argument must already be sanitized. */
    ask(snapshot: WithoutKey<TuiDialogSnapshot>, signal?: AbortSignal, timeoutMs?: number, owner?: Context, bindOwnerEffect?: (disposer: () => unknown, onRegistered: (cleanup: () => unknown) => void) => boolean): Promise<TuiDialogAnswer>;
    /** The dialog the UI should render right now, if any. */
    getSnapshot(): TuiDialogSnapshot | null;
    /**
     * Settle the active dialog with the user's answer. The caller passes the
     * key of the snapshot IT rendered; a mismatched key is a stale callback
     * and ignored. This is not paranoia: ConPTY can deliver one Enter as a
     * same-batch CR+LF pair, firing the old panel's handler twice before
     * React unmounts it — an unkeyed decide would settle the active dialog
     * AND the successor the first call just promoted (one Enter answering two
     * consecutive dialogs).
     */
    decide(key: string, value: TuiDialogAnswer): void;
    /** Cancel the active dialog (Esc). Keyed like {@link decide}: a stale
     *  panel's Esc must not close the successor it never rendered. */
    cancel(key: string): void;
    /** Settle everything queued + active (teardown): all resolve cancelled. */
    settleAll(): void;
    subscribe(listener: () => void): () => void;
    private advance;
    private emit;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        tuiDialogs: TuiDialogRuntime;
    }
}
/**
 * `ctx.tuiDialogs` — plugin-facing managed dialogs. Every method validates
 * its request (untrusted data on the render path) and resolves with the
 * cancelled value (`undefined`/`false`) rather than throwing when the
 * request is malformed — a dialog must never take the plugin or the TUI
 * down; callers get a logger warning instead.
 */
export declare class TuiDialogRuntime extends Service {
    constructor(ctx: Context);
    /** Cordis traceable services normally provide the caller through `this.ctx`;
     * the explicit overloads below make ownership unambiguous for embedders and
     * tests that retain the service instance directly. */
    private callContext;
    private timeoutOf;
    /** Pick one of `options`; resolves the option id, or undefined on cancel. */
    select(request: TuiDialogSelectRequest): Promise<string | undefined>;
    select(owner: Context, request: TuiDialogSelectRequest): Promise<string | undefined>;
    /** Yes/no question; resolves the boolean, false on cancel. */
    confirm(request: TuiDialogConfirmRequest): Promise<boolean>;
    confirm(owner: Context, request: TuiDialogConfirmRequest): Promise<boolean>;
    /** Free-text input; resolves the text, or undefined on cancel. */
    input(request: TuiDialogInputRequest): Promise<string | undefined>;
    input(owner: Context, request: TuiDialogInputRequest): Promise<string | undefined>;
}
export declare function getHostDialogStore(runtime: TuiDialogRuntime | undefined): TuiDialogStore | undefined;
export default TuiDialogRuntime;
//# sourceMappingURL=dialogs.d.ts.map
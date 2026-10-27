/**
 * Keyed status contributions above the prompt.
 *
 * `set(key, text)` remains pi's scalar `ctx.ui.setStatus` seam: the host
 * sanitizes and joins every text contribution into one line. `registerView`
 * is the bounded rich companion for compact, pointer-only surfaces that need
 * host React and themed cells (for example a progress card). It deliberately
 * receives no input, channel, or raw-terminal capability. `setField` is the
 * footer sibling: one keyed text cell admitted into the prompt footer's
 * existing left/right groups, with the same lifecycle, ownership, token, and
 * ledger rules as `set()`.
 *
 * Same split as the dialogs seam: a cordis-free store the chat screen
 * subscribes to, and a thin cordis service validating untrusted input.
 */
import type React from 'react';
import { Context, Service } from '@deepseek-ai/cordis';
/** One rendered contribution. */
export interface TuiStatusEntry {
    readonly key: string;
    readonly text: string;
}
/** Maximum height a rich status contribution may request. */
export type TuiStatusViewMaxRows = 1 | 2 | 3;
type TuiStatusViewForbiddenBoxProps = 'ref' | 'tabIndex' | 'autoFocus' | 'onContextMenu' | 'onFocus' | 'onFocusCapture' | 'onBlur' | 'onBlurCapture' | 'onKeyDown' | 'onKeyDownCapture' | 'onWheel';
type TuiStatusViewBoxProps = Omit<React.ComponentProps<typeof import('../ui.js').Box>, TuiStatusViewForbiddenBoxProps>;
type TuiStatusViewTextProps = Omit<React.ComponentProps<typeof import('../ui.js').Text>, 'ref'>;
type TuiStatusViewImageProps = React.ComponentProps<typeof import('../ui.js').Image>;
/** Pointer-only host kit passed to rich status components. `Box` keeps local
 * click, hover, and captured-drag handlers, but cannot take focus, keyboard,
 * context-menu, wheel, or ref props. Raw-terminal APIs are absent. */
export interface TuiStatusViewUi {
    readonly Box: React.ComponentType<TuiStatusViewBoxProps>;
    readonly Image: React.ComponentType<TuiStatusViewImageProps>;
    readonly Text: React.ComponentType<TuiStatusViewTextProps>;
    readonly useTerminalSize: typeof import('../ui.js').useTerminalSize;
}
/** Props for a rich status component. Hooks and elements must use the host
 * React instance, following the same single-React rule as plugin scenes. */
export interface TuiStatusViewProps {
    readonly React: typeof React;
    readonly ui: TuiStatusViewUi;
}
/** Cleanup handle returned for an admitted rich status registration. */
export type TuiStatusViewDisposer = () => void;
/** One compact status view rendered above the prompt. Keyboard input is not
 * exposed; pointer interaction is available through `Box` click/hover/drag
 * handlers and should be paired with a slash command or separately registered
 * `tuiShortcuts` action. */
export interface TuiStatusViewDescriptor {
    readonly key: string;
    /** Defaults to one row; the host clips every view at three rows. */
    readonly maxRows?: TuiStatusViewMaxRows;
    readonly component: React.ComponentType<TuiStatusViewProps>;
}
/** Host-side normalized registration. Kept out of the plugin export shim. */
export interface TuiStatusViewEntry {
    readonly key: string;
    readonly maxRows: TuiStatusViewMaxRows;
    readonly component: React.ComponentType<TuiStatusViewProps>;
    /** Remounts the error boundary after a dispose + same-key re-registration. */
    readonly registrationId: number;
}
/** Where a plugin footer field joins the footer: the left group's tail, the
 *  right group's head, or the right group's tail. `right-tail` is the row's
 *  right edge in the split layout only: `statusBar.compact` (the default)
 *  merges both groups into one left-aligned chain, where the slots order that
 *  chain and the ctx chip / trailing free space stay to the field's right. */
export type TuiStatusFieldSlot = 'left-tail' | 'right-head' | 'right-tail';
/** Semantic theme tone for a footer field. Literal colours are refused so a
 *  plugin cannot paint a one-off cell that ignores the active theme. */
export type TuiStatusFieldTone = 'dim' | 'accent' | 'success' | 'warning' | 'error';
/** Options for `tuiStatus.setField`. Every key is optional; on update an
 *  omitted key keeps that field's previous value (a fresh key starts from the
 *  defaults documented below). */
export interface TuiStatusFieldOptions {
    /** Default `'left-tail'`. */
    readonly slot?: TuiStatusFieldSlot;
    /** Default `'dim'`. */
    readonly tone?: TuiStatusFieldTone;
    /** Hard text cap in terminal cells: default 16, clamped to 1…32. */
    readonly maxCells?: number;
    /** Hide the field below this terminal width: default 0, clamped to 0…400. */
    readonly minColumns?: number;
    /** Supplemental-row text shown while the pointer rests on the field,
     *  capped at 160 cells. Declaring `onClick` requires it. */
    readonly detail?: string;
    /** Pointer click in fullscreen (mouse tracking) only. Declaring it without
     *  a non-empty `detail` is refused: a clickable cell owes an explanation. */
    readonly onClick?: () => void;
}
/** Host-side normalized field. `onClick` is the host-WRAPPED handler (errors
 *  are logged and reported to the UI); this type stays inside the adapter. */
export interface TuiStatusFieldEntry {
    readonly key: string;
    readonly text: string;
    readonly slot: TuiStatusFieldSlot;
    readonly tone: TuiStatusFieldTone;
    readonly maxCells: number;
    readonly minColumns: number;
    readonly detail?: string;
    readonly onClick?: () => void;
}
/** Host-side admission record: the frozen entry, the token + owner a disposer
 *  checks, and the unwrapped click so an options-less update can reuse it. */
export interface TuiStatusFieldRecord {
    readonly entry: TuiStatusFieldEntry;
    readonly token: number;
    readonly owner: object;
    readonly rawOnClick?: () => void;
}
/** Cordis-free text + view store. Render order is first-set/register order
 * (Map insertion order), so plugin contributions do not jump on updates. */
export declare class TuiStatusStore {
    private readonly onViewError?;
    private readonly listeners;
    private readonly entries;
    private readonly views;
    private readonly fields;
    private snapshot;
    private viewSnapshot;
    private fieldSnapshot;
    private onFieldError;
    constructor(onViewError?: ((key: string, error: Error) => void) | undefined);
    /** Set or clear (undefined/empty) one key. */
    set(key: string, text: string | undefined, token?: number, owner?: object): void;
    /** Current contributions, first-set first (stable between changes). */
    getSnapshot(): readonly TuiStatusEntry[];
    /** Current rich contributions, first-registration first and referentially
     * stable between mutations for `useSyncExternalStore`. */
    getViewSnapshot(): readonly TuiStatusViewEntry[];
    /** Host runtime uses this to enforce that one activation cannot rewrite or
     * clear another activation's keyed contribution. */
    ownerOf(key: string): object | undefined;
    viewOwnerOf(key: string): object | undefined;
    addView(view: TuiStatusViewEntry, token: number, owner: object): void;
    clearViewIf(key: string, token: number, owner?: object): boolean;
    /** Called only by the host-side error boundary. */
    reportViewError(key: string, error: Error): void;
    /** Current footer fields, first-set first and referentially stable between
     *  mutations for `useSyncExternalStore`. */
    getFieldSnapshot(): readonly TuiStatusFieldEntry[];
    /** Store (or overwrite) one admitted field. Slot/option merging already
     *  happened in the service; the store only records normalized entries. */
    setField(entry: TuiStatusFieldEntry, token: number, owner: object, rawOnClick?: () => void): void;
    /** The full admission record for `key` (read by the service to merge an
     *  update onto the previous options and to check ownership). */
    fieldEntry(key: string): TuiStatusFieldRecord | undefined;
    fieldCount(): number;
    /** How many footer fields one activation currently owns (cap enforcement). */
    fieldsOwnedBy(owner: object): number;
    /** Clear `key` only while it still holds this token AND owner. */
    clearFieldIf(key: string, token: number, owner?: object): boolean;
    /** UI-side handler for a plugin click that threw; the service logs first. */
    setFieldErrorHandler(handler?: (key: string, error: Error) => void): void;
    reportFieldError(key: string, error: Error): void;
    /** Clear `key` only while it still holds the write tagged `token` — a
     *  stale disposer must not wipe a newer contribution (even one with
     *  identical text). Returns true when this call actually cleared. */
    clearIf(key: string, token: number, owner?: object): boolean;
    /** Drop everything (teardown). */
    clear(): void;
    subscribe(listener: () => void): () => void;
    private emit;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        tuiStatus: TuiStatusRuntime;
    }
}
/**
 * `ctx.tuiStatus` — plugin-facing status contributions. Invalid keys and
 * oversized text are rejected with a logger warning instead of throwing:
 * a status contribution must never take the TUI down.
 */
export declare class TuiStatusRuntime extends Service {
    constructor(ctx: Context);
    /**
     * Set (or clear with `undefined`) the contribution for `key`. Keys are
     * plugin-namespaced by convention (`my-plugin`, `my-plugin:detail`);
     * control chars are stripped and text is capped at 200 cells. Text is
     * scalar-only: string/number/boolean are coerced to string, anything else
     * is refused with a warning (never rendered as "[object Object]", never
     * silently treated as a clear).
     *
     * Returns a disposer that clears the contribution IF the key still holds
     * exactly this write (a later set — even of identical text — wins over a
     * stale disposer). The host also removes that disposer from the caller's
     * Cordis effect list when it is invoked explicitly. Clearing with
     * `undefined` or empty text happens immediately and returns a no-op without
     * registering an owner effect.
     *
     * The optional trailing `identity` (the plugin's own ctx) only feeds the
     * effect ledger's pluginId — omitting it records `undeclared`, never a
     * guess (C-060 honest identity).
     */
    set(key: string, text: string | number | boolean | undefined, identity?: Context): () => void;
    /**
     * Insert (or update/clear) one keyed TEXT field in the prompt footer's
     * existing left/right groups — no new row, no plugin component. The field
     * keeps the same admission contract as `set()`: plugin caller, activation
     * ownership, token-based disposers, effect-ledger records, never throws.
     *
     * Unlike `set()`, footer fields are capped (six total, two per activation)
     * and each cell is truncated by the host to `maxCells` (default 16, at most
     * 32) so the row's flex shrinking always has a definite bound. `detail` and
     * `onClick` are optional; a click without a detail line is refused (the
     * footer must never promise an action it cannot explain on hover).
     *
     * Passing `undefined` (or text that sanitizes to nothing) CLEARS the field;
     * a stale disposer cannot clear a newer write for the same key.
     */
    setField(key: string, text: string | number | boolean | undefined, options?: TuiStatusFieldOptions, identity?: Context): () => void;
    /**
     * Register a compact React view above the prompt. The component receives
     * the host's React plus a pointer-only UI kit; it owns its live data via an
     * external store and is clipped by the host to `maxRows` (one by default,
     * three at most). Registrations share the text key namespace, preserve
     * first-registration order, and consume a six-row aggregate budget.
     *
     * Successful registrations return a cleanup-aware disposer. Refused
     * registrations warn and return `undefined`, so feature-detecting callers
     * can distinguish admission from rejection. The optional identity has the
     * same attribution-only meaning as `set()`.
     */
    registerView(descriptor: TuiStatusViewDescriptor, identity?: Context): TuiStatusViewDisposer | undefined;
    /**
     * Subscribe to status-line changes. Kept on the plugin-visible service so
     * the shadow-policy gate covers this subscription effect too.
     */
    subscribe(listener: () => void): () => void;
}
export declare function getHostStatusStore(runtime: TuiStatusRuntime | undefined): TuiStatusStore | undefined;
export default TuiStatusRuntime;
//# sourceMappingURL=status.d.ts.map
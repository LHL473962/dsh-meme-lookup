import React from 'react';
import type { PointerEvent } from '../ink/events/pointer-event.js';
/** Tooltip content: a fixed string or a getter resolved at show time. */
export type TooltipContent = string | (() => string);
export type TooltipOptions = {
    /** Dwell before the tooltip appears. Default 600ms. */
    delayMs?: number;
};
/** Hover props returned by {@link useTooltip}; spread onto a Box. */
export type TooltipHoverProps = {
    onMouseEnter: (event?: PointerEvent) => void;
    onMouseLeave: () => void;
};
/**
 * Per-attachment owner: identifies which element's timer is pending and
 * which element owns the shown tooltip (so one element's leave can never
 * hide another's tooltip).
 */
type TooltipOwner = {
    timer: ReturnType<typeof setTimeout> | null;
};
type TooltipState = {
    owner: TooltipOwner;
    anchorCol: number;
    anchorRow: number;
    content: string;
};
/** Subscribe to tooltip show/hide; returns an unsubscribe function. */
export declare function subscribeTooltip(listener: () => void): () => void;
/** Stable snapshot for useSyncExternalStore (identity kept until changed). */
export declare function getTooltipSnapshot(): TooltipState | null;
/** Hide shown content and invalidate every pending dwell timer. */
export declare function clearTooltip(): void;
/**
 * Hover props that pop a tooltip with the full content after a dwell.
 *
 * The pointer position (screen col/row) is taken from the PointerEvent the
 * renderer hands to `onMouseEnter` — the runtime always passes one even
 * though the prop type is `() => void`, which is why the handler's parameter
 * is optional (a `() => void` prop accepts a function with only optional
 * parameters).
 */
export declare function useTooltip(content: TooltipContent, opts?: TooltipOptions): TooltipHoverProps;
/**
 * Convenience wrapper for list rows built from data (a component boundary
 * makes the hook call legal per item). Renders a plain Box carrying the
 * hover props around `children`.
 */
export declare function TooltipTarget({ content, children, }: {
    content: TooltipContent;
    children: React.ReactNode;
}): React.ReactNode;
/**
 * The singleton floating layer: subscribes to the tooltip store and renders
 * the rounded card above the anchor row (below it when there is no room),
 * horizontally clamped inside the terminal. Mount once, LAST in the tree so
 * it paints over everything else. Terminal resize hides the tooltip — its
 * anchor is screen geometry that just went stale.
 */
export declare function TooltipLayer({ invalidationKey, subscribeInvalidation, }?: {
    /** Changes when a modal/screen geometry transition makes the anchor stale. */
    invalidationKey?: unknown;
    /** Scroll/viewport subscription; every notification invalidates the anchor. */
    subscribeInvalidation?: (listener: () => void) => () => void;
}): React.ReactNode;
export {};
//# sourceMappingURL=Tooltip.d.ts.map
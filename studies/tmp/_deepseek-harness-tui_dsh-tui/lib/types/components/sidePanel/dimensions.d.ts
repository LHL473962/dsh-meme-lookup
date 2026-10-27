/**
 * Side-panel geometry: the single source of truth for 'can we split, and
 * if so how wide is each column'. Pure functions only — the verify scripts
 * assert these tables directly at boundary widths.
 *
 * Anchors (side-panel design doc §4.2):
 * - CHAT_MIN_COLUMNS keeps the 2-col transcript gutter
 *   (RAIL_MIN_TERMINAL_WIDTH = 60 in ink/timeline-rail.ts) plus tool-card
 *   indentation readable;
 * - PANEL_MIN_COLUMNS is the narrowest width at which the Jobs panel
 *   variant stays legible;
 * - everything is derived from those minimums — never a hard-coded
 *   'columns < 100' style threshold.
 *
 * Widths are ALWAYS numeric (Math.floor): ink resolves % against the
 * padding-inclusive parent box, so a percentage column would lie (see
 * PageMargin.tsx's content-box comment).
 */
export declare const CHAT_MIN_COLUMNS = 64;
export declare const PANEL_MIN_COLUMNS = 28;
export declare const DIVIDER_COLUMNS = 1;
/** Chat fraction of the content width when the user has not resized. */
export declare const DEFAULT_RATIO = 0.68;
/** What zoom ASKS for (chat fraction); the chat column never goes below
 *  CHAT_MIN_COLUMNS, so the achieved ratio is usually larger. */
export declare const ZOOM_TARGET_RATIO = 0.2;
/** Keyboard resize step (columns) for the panel-focused +/- bindings. */
export declare const RESIZE_STEP_COLUMNS = 4;
/** Smallest content width at which a split keeps both sides usable. */
export declare function canSplit(columns: number): boolean;
/** Feasible chat-fraction range for a content width (both ends inclusive). */
export declare function ratioRange(columns: number): {
    readonly min: number;
    readonly max: number;
};
/** Clamp a stored ratio into the feasible range for this width. */
export declare function clampRatio(columns: number, ratio: number): number;
export interface SidePanelSplit {
    readonly chat: number;
    readonly panel: number;
}
/** Split geometry for a content width and chat fraction. */
export declare function resolveSplit(columns: number, ratio: number): SidePanelSplit;
/** Zoom geometry: the panel takes over; chat keeps at least CHAT_MIN_COLUMNS. */
export declare function resolveZoom(columns: number): SidePanelSplit;
export interface SidePanelGeometryInput {
    readonly columns: number;
    readonly open: boolean;
    readonly zoom: boolean;
    readonly ratio: number;
}
/**
 * Resolve the effective layout. null means 'no split' (chat takes the
 * full content width); callers render exactly as today in that case.
 */
export declare function resolveSidePanelGeometry(input: SidePanelGeometryInput): SidePanelSplit | null;
/** Keyboard resize: shift the chat fraction by deltaColumns worth of
 *  width, clamped into the feasible range for this terminal. */
export declare function nudgeRatio(columns: number, ratio: number, deltaColumns: number): number;
//# sourceMappingURL=dimensions.d.ts.map
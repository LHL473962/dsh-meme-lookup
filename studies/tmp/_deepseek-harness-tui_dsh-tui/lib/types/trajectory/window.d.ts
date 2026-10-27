/**
 * Ledger windowing shared by the fullscreen scene and the side panel: both
 * paint exactly one viewport's worth of rows and keep the focused row
 * visible, so a ten-thousand-row session costs the same frame as a ten-row
 * one. Properties (verify-trajectory-xl):
 *
 * - the window is rows tall (or as tall as the list allows);
 * - the focused row sits inside it, centered while room allows;
 * - it never starts before 0 nor past the last full page;
 * - an empty list windows to (0, rows) and paints nothing.
 */
/**
 * The cursor-centered ledger window.
 *
 * @param count - Length of the (possibly filtered) row list.
 * @param cursor - Focused row index (clamped here; callers may hold a
 *   stale cursor for one frame after a filter narrows the list).
 * @param rows - Viewport row budget (>= 1).
 * @returns start = first painted row index, end = one past the last
 *   (may exceed count; slicing on end is always safe).
 */
export declare function ledgerWindow(count: number, cursor: number, rows: number): {
    start: number;
    end: number;
};
//# sourceMappingURL=window.d.ts.map
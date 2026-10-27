import type { ScrollBoxHandle } from '../ui.js';
/** Page immediately: keyboard navigation must not leave queued wheel motion. */
export declare function pagePreview(scroll: ScrollBoxHandle | null, direction: -1 | 1): void;
export interface PreviewRowView {
    /** Display rows to paint, each at most `cells` wide, in order. */
    readonly rows: readonly string[];
    /** Source rows that did not fit under the budget (0 = nothing cut). */
    readonly omitted: number;
}
/**
 * Wrap `text` to `cells` display cells and keep at most `maxRows` rows,
 * reserving the last row for the omitted marker when anything is cut.
 *
 * @param text - the backend text (may contain newlines, wide chars, ANSI).
 * @param cells - content width in display cells (the row's real width).
 * @param maxRows - rows this block may occupy, marker included (≥1).
 */
export declare function clipPreviewRows(text: string, cells: number, maxRows: number): PreviewRowView;
//# sourceMappingURL=previewRows.d.ts.map
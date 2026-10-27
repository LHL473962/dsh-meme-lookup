/**
 * Terminal-cell geometry for a typeset formula. Pure: no rasterization.
 *
 * MathJax reports a formula's size in ex. A formula starts at one base scale
 * tied to the terminal's physical cell height (so every formula reads at the
 * same size, like text), shrinks uniformly only when it would exceed the
 * width or height it may occupy, and is never enlarged. The canvas is padded,
 * never stretched, to a whole number of cells.
 */
import type { TerminalCellSize } from '../ink/terminal-image.js';
/** Pixels per ex at the base scale, as a fraction of the cell height. */
export declare const BASE_EX_TO_CELL_HEIGHT = 0.5;
/**
 * Display formulas set larger than the body text, like LaTeX (settings
 * `mathImageScale`): at one ex per 0.72 cell heights the glyph strokes get
 * roughly 45% more device pixels, which is what a terminal-drawn ink mask
 * needs to read as clean rather than thin. Inline formulas keep the base
 * scale — their single row of cells clamps the resolution anyway.
 */
export declare const LARGE_DISPLAY_EX_TO_CELL_HEIGHT = 0.72;
/** The next step up: about 80% more pixels than the base scale. */
export declare const XLARGE_DISPLAY_EX_TO_CELL_HEIGHT = 0.9;
/**
 * Below this fraction of the base scale the formula is unreadable as an
 * image; the caller keeps the Unicode rendering instead of shrinking further.
 */
export declare const MIN_SCALE_FRACTION = 0.5;
export interface FormulaSize {
    readonly widthEx: number;
    readonly heightEx: number;
}
export interface FormulaConstraints {
    readonly cellSize: TerminalCellSize;
    /** Pixels per ex as a fraction of the cell height; defaults to the base scale. */
    readonly baseExToCellHeight?: number;
    readonly maxColumns: number;
    readonly maxRows: number;
    /** Transparent margin around the ink, in device-independent pixels. */
    readonly bleed: number;
    /** Largest canvas edge and RGBA byte size the raster may use. */
    readonly maxEdge: number;
    readonly maxBytes: number;
}
export interface FormulaLayoutPlan {
    readonly columns: number;
    readonly rows: number;
    /** Canvas size in device pixels (cells × cell size × deviceScale). */
    readonly canvasWidth: number;
    readonly canvasHeight: number;
    /** Ink box size in device pixels, centered in the canvas. */
    readonly contentWidth: number;
    readonly contentHeight: number;
    readonly pixelsPerEx: number;
    readonly deviceScale: 1 | 2;
}
export type FormulaLayoutFailure = 'invalid-dimensions' | 'too-small' | 'raster-limit';
export declare function planFormulaLayout(size: FormulaSize, constraints: FormulaConstraints): FormulaLayoutPlan | FormulaLayoutFailure;
//# sourceMappingURL=layout.d.ts.map
import { type TerminalCellSize, type TerminalImageSource } from '../ink/terminal-image.js';
/** Same budget as the Unicode renderer: longer input is a paste, not math. */
export declare const MATH_SOURCE_LIMIT = 4096;
export type MathFailureCode = 'empty' | 'input-too-long' | 'tex-error' | 'invalid-dimensions' | 'too-small' | 'raster-limit' | 'empty-raster' | 'clipped-raster' | 'backend-unavailable';
export interface MathRenderRequest {
    /** TeX without delimiters. */
    readonly tex: string;
    readonly display: boolean;
    /** Ink color as `#rrggbb` (the theme's text color). */
    readonly color: string;
    readonly cellSize: TerminalCellSize;
    /** Largest cell box the formula may occupy; it shrinks to fit, never grows. */
    readonly maxColumns: number;
    readonly maxRows: number;
    /**
     * Pixels per ex as a fraction of the cell height. Display formulas pass
     * {@link DISPLAY_EX_TO_CELL_HEIGHT} so they are set larger than the body
     * text; inline formulas keep the base scale.
     */
    readonly baseExToCellHeight?: number;
}
export interface MathRaster {
    /** Stable identity of this raster (formula, color, geometry). */
    readonly key: string;
    readonly source: TerminalImageSource;
    readonly columns: number;
    readonly rows: number;
    /** Half-open pixel box of visible ink inside the canvas. */
    readonly inkBounds: {
        readonly left: number;
        readonly top: number;
        readonly right: number;
        readonly bottom: number;
    };
}
export type MathRenderResult = {
    readonly ok: true;
    readonly raster: MathRaster;
} | {
    readonly ok: false;
    readonly failure: MathFailureCode;
};
/** Cache counters, for tests and debug output. */
export declare const mathRenderStats: {
    vectorHits: number;
    vectorMisses: number;
    rasterHits: number;
    rasterMisses: number;
};
/** Formula renders still running (tests wait for 0 before reading the screen). */
export declare function mathRendersInFlight(): number;
/**
 * The settled result for this request if one is cached, without rendering.
 * Lets a remounted view (scrolled back into the viewport) paint its image on
 * the first frame instead of flashing the Unicode fallback.
 */
export declare function peekMathRaster(request: MathRenderRequest): MathRenderResult | undefined;
/**
 * Typeset and rasterize one formula. Results (including failures) are cached
 * by formula, color and geometry; concurrent requests for the same key share
 * one render.
 */
export declare function renderMathRaster(request: MathRenderRequest): Promise<MathRenderResult>;
/** Drop every cached vector and raster (tests; a future debug command). */
export declare function clearMathRenderCaches(): void;
//# sourceMappingURL=renderer.d.ts.map
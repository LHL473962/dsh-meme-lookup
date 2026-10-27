import type { TerminalImageSource } from './terminal-image.js';
/**
 * Paint decision for one transparent-raster pixel: 0.25·255 = 63.75 keeps the
 * historical "below 25% never paints" bias, 160 (= 62.5%·255 + 1) makes
 * everything above the band solid (≥75% always paints by contract), and the
 * band between resolves by position so constant mid coverage alternates in a
 * checkerboard. Exported for the mask regression (gradient/const fills).
 */
export declare function sixelCoveragePaints(alpha: number, x: number, y: number): boolean;
/** The pre-dither decision (single 25% threshold), kept for the mask
 * regression's before/after comparison. It doubles as the line-art policy:
 * rasters that mark themselves `lineArt` paint every pixel at or above the
 * same 25% coverage solid, with no positional dither — thin strokes (fraction
 * bars, radical overlines, superscripts) live in the 25%–62.5% band, and the
 * Bayer checkerboard there reads as speckled, faded ink. */
export declare function sixelCoveragePaintsThreshold(alpha: number): boolean;
export interface SixelCrop {
    readonly left: number;
    readonly top: number;
    readonly width: number;
    readonly height: number;
}
export interface SixelEncodeRequest {
    readonly source: TerminalImageSource;
    readonly width: number;
    readonly height: number;
    /**
     * Colour the transparent pixels composite onto. Required unless {@link ink}
     * is set: Sixel has no alpha of its own, so anything that is not a
     * single-colour ink mask has to be blended onto a real colour first.
     */
    readonly background?: string;
    /**
     * Emit the raster transparent (the DCS background select already means "no
     * action") and promote coverage to a hard mask, so only covered pixels are
     * painted and whatever the terminal shows behind them stays visible.
     */
    readonly transparent?: boolean;
    /**
     * Line art (typeset formulas, diagrams): with {@link transparent} the mask
     * uses the plain 25% coverage threshold — no ordered dither — so hairline
     * strokes stay solid. Photographs and sprites keep the dithered mask.
     */
    readonly lineArt?: boolean;
    readonly presentation?: 'preview' | 'transcript';
    readonly crop?: SixelCrop;
}
export interface SixelWorkerRequest {
    readonly assetKey: string;
    readonly request: Omit<SixelEncodeRequest, 'source'> & {
        readonly source?: TerminalImageSource;
    };
}
export interface SixelWorkerResponse {
    readonly raster?: SixelRaster;
    readonly missing?: boolean;
    readonly preparedKeys?: string[];
    readonly quantized?: boolean;
}
export interface SixelRaster {
    readonly width: number;
    readonly height: number;
    readonly data: string;
}
/** CPU-heavy work: called in the image worker, never in the frame painter. */
export declare function encodeSixel(request: SixelEncodeRequest): Promise<SixelRaster>;
/** Worker-local LRU: scrolling reuses resized/quantized pixels, not just sources. */
export declare class SixelEncoderCache {
    private readonly images;
    private bytes;
    render({ assetKey, request }: SixelWorkerRequest): Promise<SixelWorkerResponse>;
}
//# sourceMappingURL=sixel-codec.d.ts.map
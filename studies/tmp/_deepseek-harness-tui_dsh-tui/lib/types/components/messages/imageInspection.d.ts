import type { TranscriptImage } from '../../dsh-adapter/transcript-images.js';
import type { TerminalCellSize, TerminalImageSource } from '../../ink/terminal-image.js';
export interface ImageDimensions {
    readonly width: number;
    readonly height: number;
}
export interface ImageCenter {
    readonly x: number;
    readonly y: number;
}
export declare const IMAGE_ORIGINAL_MAX_BYTES: number;
export declare const IMAGE_ZOOM_LEVELS: readonly [1, 2, 4, 8];
/** Shrink the cell viewport, never the original pixels, when budgets apply. */
export declare function inspectionCells(columns: number, rows: number, cell: TerminalCellSize): readonly [number, number];
export declare function inspectionRegion(image: ImageDimensions, viewport: ImageDimensions, zoom: number, center: ImageCenter): {
    left: number;
    top: number;
    width: number;
    height: number;
};
/** One preview owns one encoded original; no full-resolution JS pixel cache. */
export declare class ImageInspectionSession {
    private readonly image;
    private original;
    private dimensions;
    private readonly lifetime;
    constructor(image: TranscriptImage);
    private read;
    metadata(): Promise<ImageDimensions>;
    render(viewport: ImageDimensions, zoom: number, center: ImageCenter, signal: AbortSignal): Promise<TerminalImageSource>;
    dispose(): void;
}
//# sourceMappingURL=imageInspection.d.ts.map
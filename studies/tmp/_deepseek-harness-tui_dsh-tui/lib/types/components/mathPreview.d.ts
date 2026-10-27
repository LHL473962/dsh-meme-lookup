import type { TerminalImageSource } from '../ink/terminal-image.js';
import type { MathRenderRequest } from '../math/renderer.js';
/** What a click on a formula image hands to the preview host. */
export interface MathPreviewRequest {
    /** The formula's TeX without delimiters; the card shows it as its title. */
    readonly tex: string;
    /** The request that produced the raster currently on screen. */
    readonly request: MathRenderRequest;
    /** Those pixels, used as-is when a sharper raster cannot be produced. */
    readonly source: TerminalImageSource;
}
export type MathPreviewOpener = (request: MathPreviewRequest) => void;
/** Published by the transcript host; cleared when it unmounts. */
export declare function setMathPreviewOpener(next: MathPreviewOpener | undefined): void;
export declare function getMathPreviewOpener(): MathPreviewOpener | undefined;
export declare function subscribeMathPreviewOpener(listener: () => void): () => void;
/** The host's opener, or undefined when nothing can show a preview card. */
export declare function useMathPreviewOpener(): MathPreviewOpener | undefined;
/**
 * RGBA raster → PNG bytes, the form the image preview card decodes. Sharp is
 * already a runtime dependency (Sixel encoding uses it) and is optional, so a
 * missing build rejects rather than returning a broken byte string.
 */
export declare function rasterToPng(source: TerminalImageSource): Promise<Uint8Array>;
//# sourceMappingURL=mathPreview.d.ts.map
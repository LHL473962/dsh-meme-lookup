import type { TerminalCellSize } from '../terminal-image.js';
interface TerminalImages {
    subscribe(listener: () => void): () => void;
    getSnapshot(): boolean;
    getCellSize?(): TerminalCellSize | undefined;
    getProtocol?(): TerminalImageProtocolName | undefined;
    request(): () => void;
}
/** The graphics protocol the renderer paints images with. */
export type TerminalImageProtocolName = 'kitty' | 'sixel';
/**
 * The protocol images are painted with, or undefined without graphics.
 *
 * Kitty provides persistent placements; Sixel paints rasters into the
 * renderer-managed transcript surface. Both may host inline media as long as
 * the placement joins the normal image lifecycle (a `presentation` of
 * `'transcript'` or `'preview'`), which is the real capability boundary.
 */
export declare function useTerminalImageProtocol(): TerminalImageProtocolName | undefined;
/** Only measured pixels qualify for an original-pixel (100%) image view. */
export declare function useTerminalImageCellSize(): TerminalCellSize | undefined;
export declare const TerminalImagesContext: import("react").Context<TerminalImages>;
/** Request the renderer's capability probe before reading or decoding pixels. */
export declare function useTerminalImages(requested?: boolean): boolean;
export {};
//# sourceMappingURL=use-terminal-images.d.ts.map
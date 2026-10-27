import { type TerminalCellSize, type TerminalImagePlacement, type TerminalImageSource } from './terminal-image.js';
/** Pixel rectangle of the uploaded raster to show (Kitty `x,y,w,h`). */
export type KittySourceRect = {
    readonly x: number;
    readonly y: number;
    readonly width: number;
    readonly height: number;
};
export interface KittyGraphicsManagerOptions {
    /** Deterministic seed used by protocol tests; production chooses a random range. */
    readonly firstImageId?: number;
    /** Physical pixels per cell; defaults to a conventional 8×16 cell. */
    readonly cellSize?: TerminalCellSize;
    /** Clock for the re-upload failure window; protocol tests pin it. */
    readonly now?: () => number;
    /** Disable zlib for terminals with an unsafe graphics decompressor. */
    readonly compress?: boolean;
}
/**
 * Reconcile renderer image requests with Kitty image/placement state.
 *
 * Pixel content owns an image id while each DOM node owns a placement id.
 * Equal immutable RGBA content is uploaded once and can back several nodes;
 * geometry changes replace only that node's placement without flicker. An
 * image no node places stays uploaded (dormant) within the retention budget,
 * so content that scrolls back into view is re-placed, not re-sent.
 */
export declare class KittyGraphicsManager {
    private readonly images;
    private readonly placements;
    /**
     * Ids given up by a re-upload. The ENOENT that triggered it may be stale
     * (the id was re-sent in between), so the terminal can still hold data
     * under the old id; it is deleted on the next frame (or at exit).
     */
    private readonly retiredImageIds;
    private readonly contentHashes;
    private nextImageId;
    private nextPlacementId;
    private cellSize;
    private pass;
    private readonly now;
    private compress;
    constructor(options?: KittyGraphicsManagerOptions);
    /** Choose the upload encoding before enabling terminal images. */
    setCompression(enabled: boolean): void;
    /** Update the physical cell ratio used by future image variants. */
    setCellSize(cellSize: TerminalCellSize): boolean;
    /** Decoded bytes of the upload canvas, calculated before allocation. */
    readonly rasterBytes: (placement: TerminalImagePlacement) => number;
    reconcile(placements: readonly TerminalImagePlacement[]): string;
    /**
     * Forget images no node placed this pass once they are unusable (fitted for
     * another cell geometry) or past the retention budget, oldest first.
     */
    private evictDormant;
    /**
     * Handle a Kitty graphics reply the renderer did not ask for. ENOENT for
     * one of our images means the terminal evicted its data (its own quota is
     * smaller than our retention budget): upload it again and re-place every
     * node showing it on the next frame. A second ENOENT within
     * REUPLOAD_FAILURE_WINDOW_MS of that re-upload means the terminal refuses
     * the image outright, so it is left as is (never an upload loop); a new
     * content or size variant is a new image and tries again. The re-upload
     * takes a fresh image id: every placement of the old id may still answer
     * ENOENT, and those late replies must not count as the re-upload failing.
     * Returns whether a repaint is needed.
     */
    handleResponse(imageId: number, status: string): boolean;
    /**
     * A clear/screen swap invalidated terminal-side data; resend next frame.
     * The terminal state an abandoned image was judged against is gone too, so
     * it gets a fresh ENOENT budget; one clear still buys at most one retry.
     */
    invalidateAll(): void;
    /** Delete every image owned by this renderer and forget their ids. */
    deleteAll(): string;
    private imageFor;
    private contentHash;
    private allocateImageId;
    private allocatePlacementId;
}
/** Direct RGBA split into base64 chunks, optionally compressed with zlib. */
export declare function transmitKittyRgba(imageId: number, source: TerminalImageSource, compress?: boolean): string;
export declare function kittyPlacement(imageId: number, placementId: number, x: number, y: number, columns: number, rows: number, zIndex?: number, source?: KittySourceRect): string;
export declare function deleteKittyPlacement(imageId: number, placementId: number): string;
export declare function deleteKittyImage(imageId: number): string;
export declare function kittyCommand(control: string, payload?: string): string;
//# sourceMappingURL=kitty-graphics.d.ts.map
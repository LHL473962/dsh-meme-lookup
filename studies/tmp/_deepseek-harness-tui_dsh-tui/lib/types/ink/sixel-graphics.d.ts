import type { SixelEncodeRequest, SixelRaster } from './sixel-codec.js';
import { type TerminalCellSize, type TerminalImagePlacement } from './terminal-image.js';
import { type Screen } from './screen.js';
import type { Diff } from './frame.js';
type Encoder = (request: SixelEncodeRequest) => Promise<SixelRaster>;
/** Viewport-owned pixels. Encoding is shared; placement/erasure is per DOM node. */
export declare class SixelGraphicsManager {
    private readonly onReady;
    private readonly encoder?;
    private cell;
    private readonly ids;
    private nextId;
    private readonly cache;
    private cachedBytes;
    private readyBytes;
    private active;
    private pending;
    private readonly frame;
    private desired;
    private displayed;
    private nextDisplay;
    /** Rects kept on screen this frame (replacement pending or covered). */
    private readonly held;
    private readonly repaint;
    private worker;
    private workerKeys;
    private workerReject;
    private disposed;
    private dirty;
    private columns;
    private rows;
    private displayModeSet;
    private readonly cursorOffsets;
    /** WT leaves the cursor at the last sixel band's row and the initial column. */
    cursorAfterPaint: {
        row: number;
        col: number;
    } | undefined;
    constructor(onReady: () => void, encoder?: Encoder | undefined);
    get hasImage(): boolean;
    setDisplayMode(enabled: boolean): void;
    setCellSize(cell: TerminalCellSize): boolean;
    beginFrame(columns: number, rows: number): void;
    readonly prepare: (placement: TerminalImagePlacement) => boolean;
    private variant;
    /**
     * Reconcile ALL old rectangles before diffing, with only one baseline copy.
     *
     * A rect is erased only when this frame replaces it (a ready raster at a new
     * key/geometry, erased and drawn in the same write) or drops it entirely.
     * Rects whose replacement is still being encoded, or which a later paint
     * covers, are held: erasing them without drawing a replacement in the same
     * frame is exactly the black flash seen while scrolling and the vanishing
     * image under an overlay. {@link paint} folds the held rects back into
     * `displayed`, and the frame that finally replaces one forces a repaint
     * through the `held` marker.
     *
     * A held rect that an overlay PARTLY covers still has to give up the covered
     * cells: its pixels outlive cell writes (a background-only space cell diffs
     * as unchanged, so the frame never rewrites it) and would show through the
     * overlay. Those sub-rects are erased with the placement's surface color.
     */
    reconcile(screen: Screen, previous: Screen, placements?: readonly TerminalImagePlacement[]): {
        erase: string;
        baseline: Screen;
    };
    /** Unchanged images have zero transport cost, including unrelated text ticks. */
    paint(diff: Diff): string;
    invalidateAll(): void;
    clear(): string;
    dispose(): string;
    private erase;
    private isUncovered;
    private textDamage;
    private drain;
    private complete;
    private encodeInWorker;
}
export {};
//# sourceMappingURL=sixel-graphics.d.ts.map
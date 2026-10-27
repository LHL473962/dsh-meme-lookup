import type { DOMElement } from './dom.js';
import type { Rectangle } from './layout/geometry.js';
/** Hard bounds for one decoded image admitted to the terminal renderer. */
export declare const TERMINAL_IMAGE_MAX_EDGE = 1024;
export declare const TERMINAL_IMAGE_MAX_BYTES: number;
/** Explicit large previews may use a longer edge, but not an unbounded square. */
export declare const TERMINAL_IMAGE_PREVIEW_MAX_EDGE = 2048;
export declare const TERMINAL_IMAGE_PREVIEW_MAX_BYTES: number;
/** Maximum decoded RGBA bytes represented by placements in one frame. */
export declare const TERMINAL_IMAGE_MAX_FRAME_BYTES: number;
/**
 * Cell-box cap for one placement (a 128×128 grid). Pixel payload is bounded
 * separately by MAX_EDGE / MAX_BYTES / MAX_FRAME_BYTES; this only bounds the
 * screen area one image may claim, so a modal preview can fill a large
 * transcript while thumbnails and status views keep their own small boxes.
 */
export declare const TERMINAL_IMAGE_MAX_CELLS: number;
export declare const TERMINAL_IMAGE_MAX_PLACEMENTS = 64;
export declare const SIXEL_MAX_ENCODED_BYTES: number;
export declare const SIXEL_THUMBNAIL_FRAME_BYTES: number;
export declare const SIXEL_CACHE_BYTES: number;
export declare const SIXEL_CACHE_ENTRIES = 64;
/** Pixel dimensions of one terminal cell. */
export interface TerminalCellSize {
    readonly width: number;
    readonly height: number;
}
/** Conventional monospace cell used when XTWINOPS pixel queries are absent. */
export declare const DEFAULT_TERMINAL_CELL_SIZE: TerminalCellSize;
/**
 * Immutable decoded image data accepted by the host image primitive.
 *
 * The renderer hashes `data` once per buffer and caches the digest by buffer
 * identity, so an in-place rewrite of the same buffer is never detected.
 * Callers must not mutate or refill `data` after passing it to `<Image>`;
 * changed pixels require a new `Uint8Array` (and therefore a new source
 * snapshot).
 */
export interface TerminalImageSource {
    /** Immutable row-major sRGB pixels, four bytes per pixel in RGBA order. */
    readonly data: Uint8Array;
    readonly width: number;
    readonly height: number;
}
/** One laid-out image request collected from the current Ink frame. */
export interface TerminalImagePlacement {
    readonly node: DOMElement;
    readonly x: number;
    readonly y: number;
    readonly columns: number;
    readonly rows: number;
    readonly source: TerminalImageSource;
    readonly presentation?: 'preview' | 'transcript';
    /** Visible terminal cells, while x/y/columns/rows retain the full layout box. */
    readonly clip?: {
        readonly x: number;
        readonly y: number;
        readonly columns: number;
        readonly rows: number;
    };
    readonly background?: string;
    /**
     * Float on the terminal: the raster paints only its covered pixels and
     * leaves the rest untouched, instead of compositing onto a backing colour.
     * Sixel cannot express partial alpha, so coverage is promoted to a hard
     * mask at encode time. Formulas and artwork with transparent margins use
     * this.
     */
    readonly transparent?: boolean;
    /**
     * The raster is line art (typeset formulas, diagrams): under the transparent
     * Sixel mask its coverage is promoted with the plain 25% threshold instead
     * of the ordered dither, so hairline strokes stay solid. Photographs and
     * sprites keep the dithered mask.
     */
    readonly lineArt?: boolean;
    /** False while a protocol-specific raster is pending or unavailable. */
    readonly graphicsReady?: boolean;
    /** Later paint operations cover part of this raster's visible cells. */
    readonly occluded?: boolean;
    /**
     * Later paint operations cover every visible cell of this raster, so it is
     * unreachable and must be erased rather than kept (a blank `opaque` overlay
     * would otherwise be pierced by the pixels beneath it). Partial coverage
     * sets {@link occluded} only.
     */
    readonly occludedFully?: boolean;
    /**
     * The later paint operations that cover PART of this raster, in absolute
     * screen cells. A protocol whose pixels outlive cell writes must erase these
     * rects itself: with Sixel, a background-only space cell over the raster has
     * the same style as the image's own backing cell, so the frame diff emits no
     * write for it and the old pixels keep showing through the overlay (the white
     * block between "100%" and "原像素" in a preview tooltip).
     */
    readonly coveredRects?: readonly Rectangle[];
}
/**
 * Normalize terminal-reported cell pixels before they reach allocation math.
 * The upper bound rejects corrupt or injected XTWINOPS replies; real terminal
 * cells remain far below it, including HiDPI displays.
 */
export declare function normalizeTerminalCellSize(value: TerminalCellSize | undefined): TerminalCellSize;
/** Prefer a direct cell report, then derive it from text-area pixels. */
export declare function resolveTerminalCellSize(cell: TerminalCellSize | undefined, window: TerminalCellSize | undefined, columns: number, rows: number): TerminalCellSize | undefined;
/** Compute the fitted canvas size without allocating pixels, for frame admission. */
export declare function terminalImagePixelSize(columns: number, rows: number, cellSize?: TerminalCellSize, presentation?: TerminalImagePlacement['presentation']): readonly [number, number];
/**
 * Fit an RGBA source into the cell rectangle's physical pixel box, preserving
 * its aspect ratio with transparent letterboxing. Enlarge or downsample here:
 * terminals that do not upscale Kitty payloads need the box's own pixels to
 * fill the reserved cells. Oversized boxes still obey the allocation budget.
 */
export declare function fitTerminalImageSource(source: TerminalImageSource, columns: number, rows: number, cellSize?: TerminalCellSize, presentation?: TerminalImagePlacement['presentation']): TerminalImageSource;
/** Validate an untrusted decoded source without copying its pixel buffer. */
export declare function isTerminalImageSource(value: unknown, presentation?: TerminalImagePlacement['presentation']): value is TerminalImageSource;
/** Recover and validate a source stored as primitive Ink host attributes. */
export declare function terminalImageSourceFromAttributes(attributes: Readonly<Record<string, unknown>>): TerminalImageSource | undefined;
//# sourceMappingURL=terminal-image.d.ts.map
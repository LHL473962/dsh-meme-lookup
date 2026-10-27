import { type Rectangle } from './layout/geometry.js';
import { type Screen, type StylePool } from './screen.js';
import type { DOMElement } from './dom.js';
import { type TerminalImagePlacement, type TerminalImageSource } from './terminal-image.js';
/**
 * A grapheme cluster with precomputed terminal width, styleId, and hyperlink.
 * Built once per unique line (cached via charCache), so the per-char hot loop
 * is just property reads + setCellAt — no stringWidth, no style interning,
 * no hyperlink extraction per frame.
 *
 * styleId is safe to cache: StylePool is session-lived (never reset).
 * hyperlink is stored as a string (not interned ID) since hyperlinkPool
 * resets every 5 min; setCellAt interns it per-frame (cheap Map.get).
 */
type ClusteredChar = {
    value: string;
    width: number;
    styleId: number;
    hyperlink: string | undefined;
};
/**
 * Bounded cache of line → clustered characters. Enforces all three guards
 * (line-length threshold, entry count, byte budget) at insertion time, so
 * no caller can accidentally grow it unboundedly.
 */
export declare class CharCache {
    /**
     * LRU of line → clustered characters. A full clear on overflow
     * (the original behavior) thrashes during long-session streaming: the
     * mounted window's static lines alone approach the char budget, so the
     * streaming row's per-frame new keys tip it over every frame or two,
     * nuking the cache and forcing ~1800 line re-tokenizations per frame
     * (measured ~100ms/frame at a 175-row session). Evicting oldest-first
     * keeps the hot mounted lines resident while streaming churn falls out
     * the back. Recency is refreshed on hit (delete + re-insert) so lines
     * read every frame are never evicted by one-shot churn.
     */
    private map;
    private chars;
    /**
     * Return the cached clustered characters for a line, if present, and
     * refresh the entry's recency.
     * @param line - the line to look up.
     * @returns the cached characters, or undefined on a miss.
     */
    get(line: string): ClusteredChar[] | undefined;
    /**
     * Cache clustered characters for a line, enforcing the cache bounds by
     * evicting least-recently-used entries (never a full clear).
     * @param line - the line key.
     * @param characters - the clustered characters to cache.
     */
    set(line: string, characters: ClusteredChar[]): void;
    /** Retained-key character total, exposed for diagnostics/tests. */
    get retainedChars(): number;
    /** Number of cached line entries. */
    get size(): number;
}
/**
 * Collects write/blit/clear/clip operations from the render tree, then
 * applies them to a Screen buffer in get(). The Screen is what gets
 * diffed against the previous frame to produce terminal updates.
 */
type Options = {
    width: number;
    height: number;
    stylePool: StylePool;
    /**
     * Screen to render into. Will be reset before use.
     * For double-buffering, pass a reusable screen. Otherwise create a new one.
     */
    screen: Screen;
    /** Paint image fallbacks as blank backing cells and collect placements. */
    terminalImages?: boolean;
    imageReady?: (placement: TerminalImagePlacement) => boolean;
    /** Protocol-specific decoded raster size, measured before allocation. */
    imageRasterBytes?: (placement: TerminalImagePlacement) => number;
    /**
     * True when the active protocol paints rasters OVER the cell grid (Sixel)
     * instead of behind it (Kitty). Image-owned cells must then carry the
     * surface background: the raster covers them anyway, and terminal-default
     * blanks would show as black holes wherever a raster fails to cover a cell
     * (aspect rounding, suppressed/occluded placements).
     */
    opaqueImageBacking?: boolean;
    /** Image requests from the diff baseline, reused by clean subtree blits. */
    previousImages?: readonly TerminalImagePlacement[];
};
/** A queued paint operation: write, clip, unclip, blit, clear, shade, noSelect, or shift. */
export type Operation = WriteOperation | ClipOperation | UnclipOperation | BlitOperation | ClearOperation | ShadeOperation | NoSelectOperation | CopyRegionOperation | SoftWrapRowOperation | {
    type: 'selectionPane';
    region: Rectangle;
    id: string;
    viewport: boolean;
} | {
    type: 'selectionOcclusion';
    region: Rectangle;
    keep: ReadonlySet<string>;
    source?: Screen;
    below?: Set<string>;
} | ShiftOperation;
/**
 * Restyle the cells already in the region at this point of the paint
 * order: a modal layer's backdrop. Applied in sequence like a write, so
 * everything painted earlier (the transcript beneath) is shaded and
 * everything painted later (the card on top) is not.
 */
type ShadeOperation = {
    type: 'shade';
    region: Rectangle;
};
export type SoftWrapFlag = boolean | 'gap';
type WriteOperation = {
    type: 'write';
    x: number;
    y: number;
    text: string;
    /** Prepared physical lines, reused by unchanged Text nodes across scrolls. */
    lines?: readonly string[];
    /**
     * Per-line soft-wrap flags, parallel to text.split('\n'). softWrap[i]=true
     * means line i is a continuation of line i-1 (the `\n` before it was
     * inserted by word-wrap, not in the source). Index 0 is always false.
     * Undefined means the producer didn't track wrapping (e.g. fills,
     * raw-ansi): the rows it paints are marked "not a continuation", since it
     * replaced whatever was there — see the write case in `get()`.
     * 'gap' marks a continuation whose separator space was elided because
     * line i-1 exactly filled the width; copy re-inserts it.
     */
    softWrap?: SoftWrapFlag[];
};
type ClipOperation = {
    type: 'clip';
    clip: Clip;
};
/** A rectangular clip region; undefined on an axis means unbounded. */
export type Clip = {
    x1: number | undefined;
    x2: number | undefined;
    y1: number | undefined;
    y2: number | undefined;
};
type UnclipOperation = {
    type: 'unclip';
};
type BlitOperation = {
    type: 'blit';
    src: Screen;
    x: number;
    y: number;
    width: number;
    height: number;
};
type ShiftOperation = {
    type: 'shift';
    top: number;
    bottom: number;
    n: number;
    /**
     * Optional column scope: when set, the model-side shift touches only this
     * slice of each row. The TERMINAL-side DECSTBM scroll still moves whole
     * rows (ANSI has no column-scoped hardware scroll) — log-update simulates
     * that on the previous frame full-width, and the frame diff repairs the
     * columns outside the slice. Undefined = legacy full-width shift.
     */
    columnX?: number;
    columnWidth?: number;
};
type ClearOperation = {
    type: 'clear';
    region: Rectangle;
    /**
     * Set when the clear is for an absolute-positioned node's old bounds.
     * Absolute nodes overlay normal-flow siblings, so their stale paint is
     * what an earlier sibling's clean-subtree blit wrongly restores from
     * prevScreen. Normal-flow siblings' clears don't have this problem —
     * their old position can't have been painted on top of a sibling.
     */
    fromAbsolute?: boolean;
};
type NoSelectOperation = {
    type: 'noSelect';
    region: Rectangle;
};
/** Row `y` continues the row above; negative contentEnd restores a separator. */
type SoftWrapRowOperation = {
    type: 'softWrapRow';
    x: number;
    y: number;
    contentEnd: number;
};
/** A region that copies as `text` (see Screen.copyRegion); paints nothing. */
type CopyRegionOperation = {
    type: 'copyRegion';
    region: Rectangle;
    text: string;
    id: number;
};
/**
 * Collects write/blit/clear/clip operations from the render tree, then
 * applies them to a Screen buffer in get(). The Screen is what gets
 * diffed against the previous frame to produce terminal updates.
 */
export default class Output {
    /** Screen width in columns. */
    width: number;
    /** Screen height in rows. */
    height: number;
    private readonly stylePool;
    private screen;
    terminalImagesEnabled: boolean;
    opaqueImageBacking: boolean;
    private imageReady;
    private imageRasterBytes;
    private readonly operations;
    private readonly imagePlacements;
    private readonly imageNodes;
    private readonly imageBackingEnds;
    private readonly imageClips;
    private imageDecodedBytes;
    private previousImages;
    private charCache;
    /**
     * LRU of line → recorded packed cell run, mirroring charCache's bounds.
     * The main-screen architecture repaints every settled line each frame;
     * the recorded run replays as raw two-word stores (no interning, no
     * packing, no guard branches) — the long-session streaming fix. Runs are
     * validated against the screen they were interned on and die with it.
     */
    private packedLines;
    private packedChars;
    /** Stable owner handle passed to writeLineToScreen (no per-call closure). */
    private readonly packedOwner;
    /** Insert into the packed-lines LRU, evicting oldest entries on budget. */
    private setPackedLine;
    /**
     * Streaming-tail slot, shared by every writeLineToScreen call of this
     * Output (only one line grows per frame during streaming). Survives reset()
     * like charCache - it is keyed by strict line extension, so stale entries
     * can never produce a wrong hit.
     */
    private streamingSlot;
    constructor(options: Options);
    /**
     * Reuse this Output for a new frame. Zeroes the screen buffer, clears
     * the operation list (backing storage is retained), and caps charCache
     * growth. Preserving charCache across frames is the main win — most
     * lines don't change between renders, so tokenize + grapheme clustering
     * becomes a cache hit.
     * @param width - the new screen width in columns.
     * @param height - the new screen height in rows.
     * @param screen - the screen buffer to render into.
     */
    reset(width: number, height: number, screen: Screen, terminalImages?: boolean, previousImages?: readonly TerminalImagePlacement[], imageReady?: (placement: TerminalImagePlacement) => boolean, opaqueImageBacking?: boolean, imageRasterBytes?: (placement: TerminalImagePlacement) => number): void;
    /**
     * Copy cells from a source screen region (blit = block image transfer).
     * @param src - the source screen.
     * @param x - the destination left column.
     * @param y - the destination top row.
     * @param width - the region width in columns.
     * @param height - the region height in rows.
     */
    blit(src: Screen, x: number, y: number, width: number, height: number): void;
    /**
     * Shift full-width rows within [top, bottom] by n. n > 0 = up. Mirrors
     * what DECSTBM + SU/SD does to the terminal. Paired with blit() to reuse
     * prevScreen content during pure scroll, avoiding full child re-render.
     * @param top - the first row of the shift region.
     * @param bottom - the last row of the shift region.
     * @param n - the shift amount; positive moves content up.
     */
    shift(top: number, bottom: number, n: number, columnX?: number, columnWidth?: number): void;
    /**
     * Clear a region by writing empty cells. Used when a node shrinks to
     * ensure stale content from the previous frame is removed.
     * @param region - the region to clear.
     * @param fromAbsolute - whether the clear is for an absolute-positioned node's old bounds.
     */
    clear(region: Rectangle, fromAbsolute?: boolean): void;
    /**
     * Shade the cells painted so far inside `region` (see ShadeOperation).
     * Idempotent per cell, so a clean subtree blitted back from prevScreen
     * with last frame's shade is not shaded twice.
     * @param region - the backdrop node's rect.
     */
    shade(region: Rectangle): void;
    /**
     * Mark a region as non-selectable (excluded from fullscreen text
     * selection copy + highlight). Used by <NoSelect> to fence off
     * gutters (line numbers, diff sigils). Applied AFTER blit/write so
     * the mark wins regardless of what's blitted into the region.
     * @param region - the region to mark.
     */
    /** Mark row `y` as a wrap continuation (see Styles.softWrapContinuation). */
    softWrapRow(y: number, contentEnd: number, x?: number): void;
    selectionPane(region: Rectangle, id: string, viewport?: boolean): void;
    /** A later opaque surface hides both pane ownership and earlier gutters. */
    selectionOcclusion(region: Rectangle, keep: ReadonlySet<string>, source?: Screen): void;
    noSelect(region: Rectangle): void;
    /**
     * Record a fully visible, frame-budgeted image request. Rejected placements
     * keep their cell fallback, so terminal graphics never escape a clip or
     * create an unbounded decoded-data upload burst.
     */
    image(node: DOMElement, x: number, y: number, columns: number, rows: number, source: TerminalImageSource, background?: string): boolean;
    /**
     * Reuse images inside a clean subtree whose cells came from prevScreen.
     * Returns false when any former placement no longer fits this frame, so
     * the painter can descend and restore that image's text fallback instead
     * of blitting its old blank backing cells.
     */
    reuseImages(node: DOMElement): boolean;
    /** Whether this node owned a terminal placement in the previous frame. */
    hadPreviousImage(node: DOMElement): boolean;
    /** Whether a baseline placement overlaps a screen region. */
    hasPreviousImageInRegion(x: number, y: number, width: number, height: number): boolean;
    /** Current frame's immutable-by-convention terminal image requests. */
    getImages(): readonly TerminalImagePlacement[];
    /** Pixel ownership is determined by paint order, not just final text values. */
    imageBacking(node: DOMElement): void;
    /**
     * The admitted placement's backing colour, or undefined when the raster
     * composites transparently: its cells are then blanks, not a painted
     * surface, so whatever the terminal shows behind the UI stays visible.
     */
    imagePlacementBackground(node: DOMElement): string | undefined;
    /**
     * Queue a text write at a position, split across lines on newlines.
     * @param x - the left column.
     * @param y - the top row.
     * @param text - the text to write.
     * @param softWrap - per-line soft-wrap flags parallel to text.split('\n').
     * @param lines - optional pre-split physical lines, exactly text.split('\n').
     */
    write(x: number, y: number, text: string, softWrap?: SoftWrapFlag[], lines?: readonly string[]): void;
    /** Whether a rectangle can contribute cells under the current paint clip. */
    isRectVisible(x: number, y: number, width: number, height: number): boolean;
    /**
     * Push a clip region; subsequent writes are restricted to it.
     * @param clip - the clip region to apply.
     */
    clip(clip: Clip): void;
    /** Pop the most recent clip region. */
    unclip(): void;
    /**
     * Apply all queued operations to the screen buffer and return it.
     * @returns the rendered screen, diffable against the previous frame.
     */
    get(): Screen;
}
export {};
//# sourceMappingURL=output.d.ts.map
import React from 'react';
import { type WhaleLayerPose } from './whaleLayers.js';
/**
 * The DeepSeek pixel whale from the hand-drawn Excel art (whale_frames.zip):
 * a 40×25 sprite in six true-color tones (deep-navy outline, DeepSeek-blue
 * body, ice-blue belly, white mouth, pink heart, gray sleep-Z). Rendered
 * with the half-block technique — each terminal cell packs two vertical
 * pixels into one `▀`/`▄` glyph (foreground = upper pixel, background =
 * lower), so the whale shows at 40 columns × 13 rows with visually square
 * pixels.
 */
type Rgb = readonly [number, number, number];
/**
 * Half-block row encoder for true-color letter-grid sprites (the pixel
 * whale's frames): `pixel(x, y)` returns the color of sprite cell (x, y)
 * or `undefined` for transparent.
 *
 * Render one sprite to ANSI rows (one per sprite row pair). Consecutive
 * cells sharing one style are run-length encoded; every row spans the full
 * sprite width (transparent cells write plain spaces, so the blank cells of
 * a diff region are re-output and overwrite whatever the previous frame
 * painted there), and each row closes with an erase-to-EOL: the text
 * pipeline may trim trailing whitespace, and the erase guarantees the
 * terminal itself clears every cell past the row's last glyph — no ghost
 * pixels can survive a frame switch.
 */
export declare function renderCellRows(width: number, height: number, pixel: (x: number, y: number) => Rgb | undefined): string[];
/**
 * Render one letter-grid frame to ANSI rows under its own palette — the
 * thin adapter over {@link renderCellRows} the whale frames use.
 */
export declare function renderSpriteRows(sprite: readonly string[], palette: Record<string, Rgb | undefined>): string[];
/** Render one composed pose (body + action layers) to ANSI rows, cached. */
export declare function layeredWhaleRows(pose: WhaleLayerPose): string[];
/** Index of the `standard` frame — the settled header's static pose. */
export declare const STANDARD_FRAME_INDEX = 0;
/**
 * One whale pose as an Ink component: 13 rows × 40 columns, never
 * shrinking. Pass `frameIndex` from the opening sequence while animating, or
 * STANDARD_FRAME_INDEX for the static header whale. `width` pins the box
 * width so the neighbouring text column never shifts when frames widen
 * (the tail-wag frames reach 4 columns further right than standard).
 */
export declare function WhaleArt({ frameIndex, pose, width, }: {
    frameIndex?: number;
    /** Layered pose (parallel actions composited); wins over `frameIndex`. */
    pose?: WhaleLayerPose;
    width?: number;
}): React.ReactNode;
export {};
//# sourceMappingURL=Whale.d.ts.map
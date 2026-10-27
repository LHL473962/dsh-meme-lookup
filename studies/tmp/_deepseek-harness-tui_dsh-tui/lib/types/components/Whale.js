import { jsx as _jsx } from "react/jsx-runtime";
import { backgroundOpenCode, foregroundOpenCode } from '../ink/colorize.js';
import { Box, Text } from '../ui.js';
import { WHALE_FRAMES } from './whaleFrames.js';
import { composeWhaleGrid, poseKey } from './whaleLayers.js';
/** Sprite palette: D outline · B body · L belly · W mouth · H heart · Z sleep-Z · `.` transparent. */
const PALETTE = {
    D: [20, 38, 96],
    B: [78, 111, 255],
    L: [190, 225, 255],
    W: [255, 255, 255],
    H: [204, 51, 153],
    Z: [128, 128, 128],
};
const fg = (rgb) => foregroundOpenCode(`rgb(${rgb[0]},${rgb[1]},${rgb[2]})`);
const bg = (rgb) => backgroundOpenCode(`rgb(${rgb[0]},${rgb[1]},${rgb[2]})`);
const RESET = '\x1b[0m';
/** Erase from the cursor to the end of the physical line (default colors). */
const ERASE_TO_EOL = '\x1b[K';
/** Reset the background plane to the terminal default (fg keeps its SGR). */
const BG_DEFAULT = '\x1b[49m';
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
export function renderCellRows(width, height, pixel) {
    const rows = [];
    for (let y = 0; y < height; y += 2) {
        let out = '';
        let current = '';
        for (let x = 0; x < width; x++) {
            const up = pixel(x, y);
            const lo = pixel(x, y + 1);
            let seq;
            let ch;
            if (up !== undefined && lo !== undefined) {
                seq = fg(up) + bg(lo);
                ch = '▀';
            }
            else if (up !== undefined) {
                // Half-filled cell: the empty half must show the terminal's default
                // background, and SGR persists across cells — a bg left over from
                // the previous cell would paint a phantom pixel into the empty half
                // (the contour noise of the sprite). Reset it explicitly.
                const color = fg(up);
                seq = color === '' ? '' : color + BG_DEFAULT;
                ch = '▀';
            }
            else if (lo !== undefined) {
                const color = fg(lo);
                seq = color === '' ? '' : color + BG_DEFAULT;
                ch = '▄';
            }
            else {
                seq = '';
                ch = ' ';
            }
            if (seq !== current) {
                out += seq === '' ? RESET : seq;
                current = seq;
            }
            out += ch;
        }
        // Always close the row's style — a row ending on a colored cell would
        // otherwise leak its SGR into the line's remaining padding — then append
        // the erase pass (see the doc above).
        let row = out;
        if (foregroundOpenCode('ansi:white') !== '' && !row.endsWith(RESET))
            row += RESET;
        rows.push(row + ERASE_TO_EOL);
    }
    return rows;
}
/**
 * Render one letter-grid frame to ANSI rows under its own palette — the
 * thin adapter over {@link renderCellRows} the whale frames use.
 */
export function renderSpriteRows(sprite, palette) {
    const width = sprite.reduce((max, row) => Math.max(max, row.length), 0);
    return renderCellRows(width, sprite.length, (x, y) => palette[sprite[y]?.[x] ?? '']);
}
/** Pre-rendered ANSI rows for every whale frame, computed once at module load. */
const RENDERED = WHALE_FRAMES.map(frame => renderSpriteRows(frame.rows, PALETTE));
/**
 * Layered-pose render cache: composed grids are pure functions of the pose,
 * and idle ticks repaint the same handful of poses thousands of times.
 */
const LAYERED_CACHE = new Map();
/** Render one composed pose (body + action layers) to ANSI rows, cached. */
export function layeredWhaleRows(pose) {
    const key = poseKey(pose);
    const cached = LAYERED_CACHE.get(key);
    if (cached !== undefined)
        return cached;
    const rows = renderSpriteRows(composeWhaleGrid(pose).map(row => row.join('')), PALETTE);
    LAYERED_CACHE.set(key, rows);
    return rows;
}
/** Index of the `standard` frame — the settled header's static pose. */
export const STANDARD_FRAME_INDEX = 0;
/**
 * One whale pose as an Ink component: 13 rows × 40 columns, never
 * shrinking. Pass `frameIndex` from the opening sequence while animating, or
 * STANDARD_FRAME_INDEX for the static header whale. `width` pins the box
 * width so the neighbouring text column never shifts when frames widen
 * (the tail-wag frames reach 4 columns further right than standard).
 */
export function WhaleArt({ frameIndex = STANDARD_FRAME_INDEX, pose, width, }) {
    const rows = pose !== undefined ? layeredWhaleRows(pose) : RENDERED[frameIndex] ?? RENDERED[STANDARD_FRAME_INDEX];
    return (_jsx(Box, { flexDirection: "column", flexShrink: 0, width: width, children: rows.map((row, index) => (_jsx(Text, { wrap: "truncate-end", children: row }, index))) }));
}

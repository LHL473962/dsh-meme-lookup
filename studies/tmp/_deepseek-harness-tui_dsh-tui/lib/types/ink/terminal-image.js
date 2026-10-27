/** Hard bounds for one decoded image admitted to the terminal renderer. */
export const TERMINAL_IMAGE_MAX_EDGE = 1024;
export const TERMINAL_IMAGE_MAX_BYTES = 4 * 1024 * 1024;
/** Explicit large previews may use a longer edge, but not an unbounded square. */
export const TERMINAL_IMAGE_PREVIEW_MAX_EDGE = 2048;
export const TERMINAL_IMAGE_PREVIEW_MAX_BYTES = 8 * 1024 * 1024;
/** Maximum decoded RGBA bytes represented by placements in one frame. */
export const TERMINAL_IMAGE_MAX_FRAME_BYTES = 16 * 1024 * 1024;
/**
 * Cell-box cap for one placement (a 128×128 grid). Pixel payload is bounded
 * separately by MAX_EDGE / MAX_BYTES / MAX_FRAME_BYTES; this only bounds the
 * screen area one image may claim, so a modal preview can fill a large
 * transcript while thumbnails and status views keep their own small boxes.
 */
export const TERMINAL_IMAGE_MAX_CELLS = 128 * 128;
export const TERMINAL_IMAGE_MAX_PLACEMENTS = 64;
export const SIXEL_MAX_ENCODED_BYTES = 4 * 1024 * 1024;
export const SIXEL_THUMBNAIL_FRAME_BYTES = 1024 * 1024;
export const SIXEL_CACHE_BYTES = 16 * 1024 * 1024;
export const SIXEL_CACHE_ENTRIES = 64;
/** Conventional monospace cell used when XTWINOPS pixel queries are absent. */
export const DEFAULT_TERMINAL_CELL_SIZE = Object.freeze({
    width: 8,
    height: 16,
});
/**
 * Normalize terminal-reported cell pixels before they reach allocation math.
 * The upper bound rejects corrupt or injected XTWINOPS replies; real terminal
 * cells remain far below it, including HiDPI displays.
 */
export function normalizeTerminalCellSize(value) {
    return plausibleTerminalCellSize(value) ?? DEFAULT_TERMINAL_CELL_SIZE;
}
/** Prefer a direct cell report, then derive it from text-area pixels. */
export function resolveTerminalCellSize(cell, window, columns, rows) {
    const direct = plausibleTerminalCellSize(cell);
    if (direct !== undefined)
        return direct;
    if (window === undefined ||
        !Number.isFinite(window.width) ||
        !Number.isFinite(window.height) ||
        columns <= 0 ||
        rows <= 0) {
        return undefined;
    }
    return plausibleTerminalCellSize({
        width: window.width / columns,
        height: window.height / rows,
    });
}
function plausibleTerminalCellSize(value) {
    if (value === undefined ||
        !Number.isFinite(value.width) ||
        !Number.isFinite(value.height) ||
        value.width < 1 ||
        value.height < 1 ||
        value.width > 512 ||
        value.height > 512) {
        return undefined;
    }
    return { width: Math.round(value.width), height: Math.round(value.height) };
}
/** Compute the fitted canvas size without allocating pixels, for frame admission. */
export function terminalImagePixelSize(columns, rows, cellSize = DEFAULT_TERMINAL_CELL_SIZE, presentation) {
    const cell = normalizeTerminalCellSize(cellSize);
    const safeColumns = Math.max(1, Math.floor(columns));
    const safeRows = Math.max(1, Math.floor(rows));
    // Keep an affordable physical box exact. Over budget, shrink uniformly
    // and round each edge by at most one pixel; exact-ratio integer multiples
    // can otherwise discard most of the budget at a boundary (e.g. 1034x1040).
    return boundedPixelBox(safeColumns * cell.width, safeRows * cell.height, presentation === 'preview' ? TERMINAL_IMAGE_PREVIEW_MAX_BYTES : TERMINAL_IMAGE_MAX_BYTES);
}
/**
 * Fit an RGBA source into the cell rectangle's physical pixel box, preserving
 * its aspect ratio with transparent letterboxing. Enlarge or downsample here:
 * terminals that do not upscale Kitty payloads need the box's own pixels to
 * fill the reserved cells. Oversized boxes still obey the allocation budget.
 */
export function fitTerminalImageSource(source, columns, rows, cellSize = DEFAULT_TERMINAL_CELL_SIZE, presentation) {
    const [canvasWidth, canvasHeight] = terminalImagePixelSize(columns, rows, cellSize, presentation);
    const canvasScale = Math.min(canvasWidth / source.width, canvasHeight / source.height);
    const fittedWidth = Math.max(1, Math.min(canvasWidth, Math.round(source.width * canvasScale)));
    const fittedHeight = Math.max(1, Math.min(canvasHeight, Math.round(source.height * canvasScale)));
    if (fittedWidth === source.width &&
        fittedHeight === source.height &&
        canvasWidth === source.width &&
        canvasHeight === source.height) {
        return source;
    }
    const content = fittedWidth === source.width && fittedHeight === source.height
        ? source.data
        : resizeRgba(source, fittedWidth, fittedHeight);
    if (canvasWidth === fittedWidth && canvasHeight === fittedHeight) {
        return { data: content, width: fittedWidth, height: fittedHeight };
    }
    const data = new Uint8Array(canvasWidth * canvasHeight * 4);
    const left = Math.floor((canvasWidth - fittedWidth) / 2);
    const top = Math.floor((canvasHeight - fittedHeight) / 2);
    const sourceStride = fittedWidth * 4;
    for (let row = 0; row < fittedHeight; row++) {
        const sourceStart = row * sourceStride;
        const targetStart = ((top + row) * canvasWidth + left) * 4;
        data.set(content.subarray(sourceStart, sourceStart + sourceStride), targetStart);
    }
    return { data, width: canvasWidth, height: canvasHeight };
}
function boundedPixelBox(width, height, maxBytes) {
    const maxPixels = maxBytes / 4;
    const scale = Math.min(1, Math.sqrt(maxPixels / (width * height)));
    return [
        Math.max(1, Math.floor(width * scale)),
        Math.max(1, Math.floor(height * scale)),
    ];
}
/** Premultiplied-alpha bilinear resize avoids dark fringes at transparency. */
function resizeRgba(source, width, height) {
    const output = new Uint8Array(width * height * 4);
    const xScale = source.width / width;
    const yScale = source.height / height;
    for (let y = 0; y < height; y++) {
        const sourceY = (y + 0.5) * yScale - 0.5;
        const rawY0 = Math.floor(sourceY);
        const y0 = Math.max(0, Math.min(source.height - 1, rawY0));
        const y1 = Math.max(0, Math.min(source.height - 1, rawY0 + 1));
        const yWeight = sourceY - rawY0;
        for (let x = 0; x < width; x++) {
            const sourceX = (x + 0.5) * xScale - 0.5;
            const rawX0 = Math.floor(sourceX);
            const x0 = Math.max(0, Math.min(source.width - 1, rawX0));
            const x1 = Math.max(0, Math.min(source.width - 1, rawX0 + 1));
            const xWeight = sourceX - rawX0;
            const weight00 = (1 - xWeight) * (1 - yWeight);
            const weight10 = xWeight * (1 - yWeight);
            const weight01 = (1 - xWeight) * yWeight;
            const weight11 = xWeight * yWeight;
            const offset00 = (y0 * source.width + x0) * 4;
            const offset10 = (y0 * source.width + x1) * 4;
            const offset01 = (y1 * source.width + x0) * 4;
            const offset11 = (y1 * source.width + x1) * 4;
            const alpha00 = source.data[offset00 + 3];
            const alpha10 = source.data[offset10 + 3];
            const alpha01 = source.data[offset01 + 3];
            const alpha11 = source.data[offset11 + 3];
            const alpha = alpha00 * weight00 +
                alpha10 * weight10 +
                alpha01 * weight01 +
                alpha11 * weight11;
            const red = source.data[offset00] * alpha00 * weight00 +
                source.data[offset10] * alpha10 * weight10 +
                source.data[offset01] * alpha01 * weight01 +
                source.data[offset11] * alpha11 * weight11;
            const green = source.data[offset00 + 1] * alpha00 * weight00 +
                source.data[offset10 + 1] * alpha10 * weight10 +
                source.data[offset01 + 1] * alpha01 * weight01 +
                source.data[offset11 + 1] * alpha11 * weight11;
            const blue = source.data[offset00 + 2] * alpha00 * weight00 +
                source.data[offset10 + 2] * alpha10 * weight10 +
                source.data[offset01 + 2] * alpha01 * weight01 +
                source.data[offset11 + 2] * alpha11 * weight11;
            const target = (y * width + x) * 4;
            if (alpha > 0) {
                output[target] = Math.round(red / alpha);
                output[target + 1] = Math.round(green / alpha);
                output[target + 2] = Math.round(blue / alpha);
            }
            output[target + 3] = Math.round(alpha);
        }
    }
    return output;
}
/** Validate an untrusted decoded source without copying its pixel buffer. */
export function isTerminalImageSource(value, presentation) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return false;
    }
    const source = value;
    const maxEdge = presentation === 'preview' ? TERMINAL_IMAGE_PREVIEW_MAX_EDGE : TERMINAL_IMAGE_MAX_EDGE;
    const maxBytes = presentation === 'preview' ? TERMINAL_IMAGE_PREVIEW_MAX_BYTES : TERMINAL_IMAGE_MAX_BYTES;
    if (!(source.data instanceof Uint8Array) ||
        !Number.isSafeInteger(source.width) ||
        !Number.isSafeInteger(source.height) ||
        source.width <= 0 ||
        source.height <= 0 ||
        source.width > maxEdge ||
        source.height > maxEdge) {
        return false;
    }
    const bytes = source.width * source.height * 4;
    return bytes <= maxBytes && source.data.byteLength === bytes;
}
/** Recover and validate a source stored as primitive Ink host attributes. */
export function terminalImageSourceFromAttributes(attributes) {
    const source = {
        data: attributes['imageData'],
        width: attributes['imageWidth'],
        height: attributes['imageHeight'],
    };
    const presentation = attributes['imagePresentation'] === 'preview' ? 'preview' : undefined;
    return isTerminalImageSource(source, presentation) ? source : undefined;
}

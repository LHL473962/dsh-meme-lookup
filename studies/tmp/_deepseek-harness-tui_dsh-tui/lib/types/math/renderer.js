import { loadSharp } from '../dsh-adapter/sharp.js';
import { TERMINAL_IMAGE_MAX_BYTES, TERMINAL_IMAGE_MAX_EDGE, } from '../ink/terminal-image.js';
import { planFormulaLayout } from './layout.js';
/** Same budget as the Unicode renderer: longer input is a paste, not math. */
export const MATH_SOURCE_LIMIT = 4096;
/**
 * Transparent margins tried in turn, in CSS pixels. Glyph overhang (italic
 * tails, radicals, big fences) can exceed the box MathJax reports; a raster
 * whose ink still touches the canvas edge at the largest margin is rejected
 * rather than shown clipped.
 */
const BLEED_STEPS = [1, 2, 4, 8, 16, 32];
/** LRU bounded by entry count and by the summed weight of its values. */
class WeightedLru {
    maxEntries;
    maxWeight;
    weigh;
    map = new Map();
    weight = 0;
    constructor(maxEntries, maxWeight, weigh) {
        this.maxEntries = maxEntries;
        this.maxWeight = maxWeight;
        this.weigh = weigh;
    }
    get(key) {
        const value = this.map.get(key);
        if (value === undefined)
            return undefined;
        this.map.delete(key);
        this.map.set(key, value);
        return value;
    }
    set(key, value) {
        const previous = this.map.get(key);
        if (previous !== undefined) {
            this.weight -= this.weigh(previous);
            this.map.delete(key);
        }
        this.map.set(key, value);
        this.weight += this.weigh(value);
        while (this.map.size > this.maxEntries || this.weight > this.maxWeight) {
            const oldest = this.map.keys().next();
            if (oldest.done === true)
                break;
            this.weight -= this.weigh(this.map.get(oldest.value));
            this.map.delete(oldest.value);
        }
    }
    clear() {
        this.map.clear();
        this.weight = 0;
    }
    get size() {
        return this.map.size;
    }
}
const vectors = new WeightedLru(256, 8 * 1024 * 1024, value => 'svg' in value ? value.svg.length * 2 : 64);
const rasters = new WeightedLru(128, 64 * 1024 * 1024, value => value.ok ? value.raster.source.data.byteLength : 64);
const inflight = new Map();
/** Cache counters, for tests and debug output. */
export const mathRenderStats = { vectorHits: 0, vectorMisses: 0, rasterHits: 0, rasterMisses: 0 };
/** Formula renders still running (tests wait for 0 before reading the screen). */
export function mathRendersInFlight() {
    return inflight.size;
}
let converter;
function loadConverter() {
    converter ??= import('@dsh-tui-vendor/mathjax-tex-svg')
        .then(module => module.createTexToSvg())
        .catch(() => undefined);
    return converter;
}
async function typeset(tex, display) {
    const key = `${display ? 'D' : 'T'}\u0000${tex}`;
    const cached = vectors.get(key);
    if (cached !== undefined) {
        mathRenderStats.vectorHits += 1;
        return cached;
    }
    mathRenderStats.vectorMisses += 1;
    const engine = await loadConverter();
    if (engine === undefined)
        return { failure: 'backend-unavailable' };
    let result;
    try {
        const { svg, widthEx, heightEx, verticalAlignEx } = engine.convert(tex, display);
        result = { svg, widthEx, heightEx, verticalAlignEx };
    }
    catch {
        result = { failure: 'tex-error' };
    }
    vectors.set(key, result);
    return result;
}
/** Only a plain hex color may reach the SVG handed to the rasterizer. */
function normalizeColor(color) {
    return /^#[0-9a-f]{6}$/i.test(color) ? color.toLowerCase() : '#808080';
}
/** Rewrite the root `<svg>` size to device pixels and its ink to `color`. */
function sizedSvg(svg, plan, color) {
    const headEnd = svg.indexOf('>');
    const head = svg
        .slice(0, headEnd)
        .replace(/\swidth="[^"]*"/, ` width="${plan.contentWidth.toFixed(3)}"`)
        .replace(/\sheight="[^"]*"/, ` height="${plan.contentHeight.toFixed(3)}"`)
        .replace(/\sstyle="[^"]*"/, '');
    return (head + svg.slice(headEnd)).replaceAll('currentColor', color);
}
/** Half-open box of pixels with any alpha, or undefined when fully transparent. */
function inkBoundsOf(data, width, height) {
    let left = width;
    let top = height;
    let right = 0;
    let bottom = 0;
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            if (data[(y * width + x) * 4 + 3] === 0)
                continue;
            if (x < left)
                left = x;
            if (x >= right)
                right = x + 1;
            if (y < top)
                top = y;
            if (y >= bottom)
                bottom = y + 1;
        }
    }
    return right === 0 ? undefined : { left, top, right, bottom };
}
async function rasterize(vector, request, color, key) {
    const sharp = await loadSharp();
    if (sharp === undefined)
        return { ok: false, failure: 'backend-unavailable' };
    for (const bleed of BLEED_STEPS) {
        const plan = planFormulaLayout(vector, {
            cellSize: request.cellSize,
            maxColumns: request.maxColumns,
            maxRows: request.maxRows,
            ...(request.baseExToCellHeight === undefined ? {} : { baseExToCellHeight: request.baseExToCellHeight }),
            bleed,
            maxEdge: TERMINAL_IMAGE_MAX_EDGE,
            maxBytes: TERMINAL_IMAGE_MAX_BYTES,
        });
        if (typeof plan === 'string')
            return { ok: false, failure: plan };
        let ink;
        try {
            ink = await sharp(Buffer.from(sizedSvg(vector.svg, plan, color)))
                .ensureAlpha()
                .raw()
                .toBuffer({ resolveWithObject: true });
        }
        catch {
            return { ok: false, failure: 'backend-unavailable' };
        }
        const { width, height } = ink.info;
        if (width > plan.canvasWidth || height > plan.canvasHeight)
            continue;
        // Center the ink box in the whole-cell canvas; the rest stays transparent.
        const canvas = new Uint8Array(plan.canvasWidth * plan.canvasHeight * 4);
        const offsetX = Math.floor((plan.canvasWidth - width) / 2);
        const offsetY = Math.floor((plan.canvasHeight - height) / 2);
        for (let y = 0; y < height; y++) {
            canvas.set(ink.data.subarray(y * width * 4, (y + 1) * width * 4), ((offsetY + y) * plan.canvasWidth + offsetX) * 4);
        }
        const bounds = inkBoundsOf(canvas, plan.canvasWidth, plan.canvasHeight);
        if (bounds === undefined)
            return { ok: false, failure: 'empty-raster' };
        const touchesEdge = bounds.left === 0 || bounds.top === 0 ||
            bounds.right === plan.canvasWidth || bounds.bottom === plan.canvasHeight;
        if (touchesEdge)
            continue;
        return {
            ok: true,
            raster: {
                key,
                source: { data: canvas, width: plan.canvasWidth, height: plan.canvasHeight },
                columns: plan.columns,
                rows: plan.rows,
                inkBounds: bounds,
            },
        };
    }
    return { ok: false, failure: 'clipped-raster' };
}
/** Normalize a request and derive its cache key (formula, color, geometry). */
function prepare(request) {
    const tex = request.tex.trim();
    if (tex === '')
        return { failure: 'empty' };
    if (tex.length > MATH_SOURCE_LIMIT)
        return { failure: 'input-too-long' };
    const color = normalizeColor(request.color);
    const key = [
        request.display ? 'D' : 'T',
        color,
        request.cellSize.width,
        request.cellSize.height,
        request.maxColumns,
        request.maxRows,
        request.baseExToCellHeight ?? '',
        tex,
    ].join('\u0000');
    return { key, tex, color };
}
/**
 * The settled result for this request if one is cached, without rendering.
 * Lets a remounted view (scrolled back into the viewport) paint its image on
 * the first frame instead of flashing the Unicode fallback.
 */
export function peekMathRaster(request) {
    const prepared = prepare(request);
    if ('failure' in prepared)
        return { ok: false, failure: prepared.failure };
    return rasters.get(prepared.key);
}
/**
 * Typeset and rasterize one formula. Results (including failures) are cached
 * by formula, color and geometry; concurrent requests for the same key share
 * one render.
 */
export function renderMathRaster(request) {
    const prepared = prepare(request);
    if ('failure' in prepared)
        return Promise.resolve({ ok: false, failure: prepared.failure });
    const { key, tex, color } = prepared;
    const cached = rasters.get(key);
    if (cached !== undefined) {
        mathRenderStats.rasterHits += 1;
        return Promise.resolve(cached);
    }
    const pending = inflight.get(key);
    if (pending !== undefined)
        return pending;
    mathRenderStats.rasterMisses += 1;
    const render = (async () => {
        const vector = await typeset(tex, request.display);
        if ('failure' in vector)
            return { ok: false, failure: vector.failure };
        return rasterize(vector, request, color, key);
    })()
        .catch(() => ({ ok: false, failure: 'backend-unavailable' }))
        .then(result => {
        inflight.delete(key);
        rasters.set(key, result);
        return result;
    });
    inflight.set(key, render);
    return render;
}
/** Drop every cached vector and raster (tests; a future debug command). */
export function clearMathRenderCaches() {
    vectors.clear();
    rasters.clear();
    mathRenderStats.vectorHits = 0;
    mathRenderStats.vectorMisses = 0;
    mathRenderStats.rasterHits = 0;
    mathRenderStats.rasterMisses = 0;
}

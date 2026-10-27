/** Shared atomic geometry for capability-backed composer image tokens. */
export const COMPOSER_IMAGE_TOKEN = /\[Image #\d+\]/gu;
/** Every `[Image #N]` in `text`, in order. */
export function imageTokenSpans(text) {
    const spans = [];
    for (const match of text.matchAll(COMPOSER_IMAGE_TOKEN)) {
        const start = match.index ?? 0;
        spans.push({ start, end: start + match[0].length, token: match[0] });
    }
    return spans;
}
/** The span whose interior (exclusive of both edges) contains `offset`. */
export function imageTokenAround(spans, offset) {
    return spans.find(span => span.start < offset && offset < span.end);
}
/**
 * A caret never rests inside a staged token: an offset in a span's interior
 * moves to the edge `prefer` names — `'start'` (the token becomes the caret
 * cluster), `'end'`, or whichever is nearer.
 */
export function snapOffImageToken(spans, offset, prefer) {
    const span = imageTokenAround(spans, offset);
    if (span === undefined)
        return offset;
    if (prefer === 'start')
        return span.start;
    if (prefer === 'end')
        return span.end;
    return offset - span.start < span.end - offset ? span.start : span.end;
}
/** Expand a deletion or selection to include every staged token it touches. */
export function expandImageTokenRange(spans, start, end) {
    return {
        start: snapOffImageToken(spans, start, 'start'),
        end: snapOffImageToken(spans, end, 'end'),
    };
}

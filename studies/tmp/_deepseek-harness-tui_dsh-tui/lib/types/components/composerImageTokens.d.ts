/** Shared atomic geometry for capability-backed composer image tokens. */
export declare const COMPOSER_IMAGE_TOKEN: RegExp;
/** One `[Image #N]` occurrence: [start, end) offsets into the draft. */
export interface ImageTokenSpan {
    readonly start: number;
    readonly end: number;
    readonly token: string;
}
/** Every `[Image #N]` in `text`, in order. */
export declare function imageTokenSpans(text: string): ImageTokenSpan[];
/** The span whose interior (exclusive of both edges) contains `offset`. */
export declare function imageTokenAround(spans: readonly ImageTokenSpan[], offset: number): ImageTokenSpan | undefined;
/**
 * A caret never rests inside a staged token: an offset in a span's interior
 * moves to the edge `prefer` names — `'start'` (the token becomes the caret
 * cluster), `'end'`, or whichever is nearer.
 */
export declare function snapOffImageToken(spans: readonly ImageTokenSpan[], offset: number, prefer: 'start' | 'end' | 'nearest'): number;
/** Expand a deletion or selection to include every staged token it touches. */
export declare function expandImageTokenRange(spans: readonly ImageTokenSpan[], start: number, end: number): {
    start: number;
    end: number;
};
//# sourceMappingURL=composerImageTokens.d.ts.map
/**
 * Intrinsic image dimensions from the encoded bytes alone — no decode, no
 * dependencies. Backend-neutral (D15): the composer's staging gate
 * (`src/utils/imageResize.ts`, which adds the sharp-backed re-encode on top)
 * and the backends that admit pasted images both measure with this, and a
 * backend must not reach into `src/utils/` (B-3's boundary rule). The sharp
 * dependency stays on the host side, so this module is a pure leaf.
 *
 * Formats the probe cannot identify return null and MUST be forced through
 * an actual decode for measurement — never read as "small enough".
 */
/** Pixel dimensions read from an encoded image's header. */
export interface ImageSizeProbe {
    readonly width: number;
    readonly height: number;
}
/**
 * The image media type the encoded bytes actually are, from the magic
 * bytes alone (the same signatures {@link probeImageSize} dispatches on):
 * PNG, JPEG, WebP (RIFF/WEBP) or GIF; anything else is undefined and the
 * caller keeps its own label (those bytes take the decode-or-refuse path
 * anyway). Used to keep a renamed file from travelling under a label its
 * content contradicts.
 */
export declare function sniffImageMediaType(bytes: Uint8Array): 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif' | undefined;
/**
 * Measure intrinsic pixel dimensions from the encoded bytes alone — no
 * decode, no dependencies. Recognizes PNG / JPEG / WebP (VP8X, VP8,
 * VP8L) / GIF; anything else returns null, which callers MUST treat as
 * "unknown, force a real decode" — never as "small enough".
 */
export declare function probeImageSize(bytes: Uint8Array): ImageSizeProbe | null;
//# sourceMappingURL=image-size.d.ts.map
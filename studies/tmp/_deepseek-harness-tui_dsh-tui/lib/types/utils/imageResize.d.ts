import { probeImageSize, sniffImageMediaType } from '../backends/shared/image-size.js';
import type { ImageSizeProbe } from '../backends/shared/image-size.js';
export { probeImageSize, sniffImageMediaType };
export type { ImageSizeProbe };
/** The admission limits that matter for resampling decisions. */
export interface ResizeLimits {
    /** Maximum intrinsic width AND height, per side, in pixels. */
    readonly maxImageDimension: number;
    /** Maximum width × height in pixels. */
    readonly maxImagePixels: number;
}
/** Whether a measured image already satisfies the dimension/pixel caps. */
export declare function withinDimensionLimits(size: ImageSizeProbe, limits: ResizeLimits): boolean;
/**
 * Target dimensions that bring an oversized image inside `limits` while
 * preserving the aspect ratio: scale down by the largest of the three
 * required factors (per-side, per-side, total-pixels).
 */
export declare function downscaleTarget(size: ImageSizeProbe, limits: ResizeLimits): ImageSizeProbe;
export type AdaptOutcome = {
    readonly kind: 'unchanged';
} | {
    readonly kind: 'adapted';
    readonly data: Uint8Array;
    /** Media type of the produced bytes (equals the source's when accepted). */
    readonly mediaType: string;
    readonly width: number;
    readonly height: number;
    /** The source exceeded the caps and was resampled. */
    readonly resized: boolean;
    /** An alpha channel was composited onto {@link OPAQUE_BACKGROUND}. */
    readonly flattened: boolean;
} | {
    /** Nothing could be produced. Only `sharp-missing` is a degradation a
     * caller may tolerate (the optional dependency is absent, so nothing could
     * be measured at all); every other reason is a definite refusal that must
     * be reported instead of handed to the store. */
    readonly kind: 'unavailable';
    readonly reason: 'sharp-missing' | 'decode-failed' | 'animated-unsupported';
    readonly detail: string;
};
/**
 * Produce bytes the profile can admit, and report what had to change.
 *
 * Both triggers are size-independent by design: a media type the profile does
 * not accept is converted even when it fits the pixel caps (a small PNG must
 * not be refused while a large one succeeds), and an image the byte probe
 * cannot measure is decoded so its real dimensions decide. The probe still
 * short-circuits the common case — bytes it proves to be inside the caps in an
 * accepted format are returned untouched, with no encoder loaded.
 *
 * A bitmap paste is converted before any of that: BMP is a format the byte
 * probe cannot measure and libvips cannot decode at all, so a WeChat or X11
 * clipboard copy used to be refused as "unsupported image format" however
 * valid it was. {@link bmpToPng} is dependency-free, so the conversion also
 * covers deployments without sharp.
 *
 * Aspect ratio is preserved by {@link downscaleTarget}. An animated source is
 * REFUSED whenever this gate would have to touch its bytes: re-encoding a
 * multi-page image here cannot promise frames, delays and loop survive, and
 * silently returning a still is a data loss the store's own refusal (the
 * behaviour without this gate) never inflicted. Animated images that need no
 * change pass through untouched.
 */
export declare function adaptImageForAdmission(bytes: Uint8Array, sourceMediaType: string, limits: ResizeLimits, acceptedMediaTypes: readonly string[]): Promise<AdaptOutcome>;
//# sourceMappingURL=imageResize.d.ts.map
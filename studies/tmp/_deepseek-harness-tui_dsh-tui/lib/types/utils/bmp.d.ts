/**
 * Dependency-free BMP → PNG conversion for clipboard screenshots. WSLg (and
 * some X11 owners) expose a Windows bitmap copy as `image/bmp`, a format the
 * attachment profile does not accept and that `sharp`'s prebuilt libvips
 * cannot decode. Only the shapes a screenshot tool produces are handled:
 * uncompressed 24/32-bit pixels (BI_RGB, BI_BITFIELDS, BI_ALPHABITFIELDS),
 * bottom-up or top-down. Anything else returns null and the caller keeps its
 * "format unsupported" path.
 */
/**
 * Whether the bytes open like a bitmap: a `BM` file, or a headerless DIB —
 * the shape an X11 or Windows clipboard owner hands over. Structural only;
 * {@link bmpToPng} still does the real validation, so a false positive costs
 * one refused conversion and nothing else.
 */
export declare function looksLikeBitmap(bytes: Uint8Array): boolean;
/**
 * Convert BMP bytes (a `BM` file, or a headerless DIB) to PNG.
 * @param bmp - Raw clipboard bytes.
 * @returns PNG bytes, or null when the bitmap is malformed or uses an
 *   unsupported layout (palettes, RLE, 16-bit, OS/2 core header).
 */
export declare function bmpToPng(bmp: Buffer): Promise<Buffer | null>;
//# sourceMappingURL=bmp.d.ts.map
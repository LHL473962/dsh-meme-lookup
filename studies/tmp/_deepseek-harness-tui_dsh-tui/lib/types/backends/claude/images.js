import { claudeText } from './text.js';
import { probeImageSize } from '../shared/image-size.js';
import { rec } from './narrow.js';
/** What a Claude message may carry (see the module comment). */
export const CLAUDE_IMAGE_LIMITS = Object.freeze({
    mediaTypes: Object.freeze(['image/png', 'image/jpeg', 'image/gif', 'image/webp']),
    maxImageBytes: 5 * 1024 * 1024,
    maxImagesPerMessage: 20,
    maxMessageImageBytes: 20 * 1024 * 1024,
    maxImageDimension: 2000,
    maxImagePixels: 4_000_000,
});
const isAccepted = (mediaType) => mediaType !== undefined && CLAUDE_IMAGE_LIMITS.mediaTypes.includes(mediaType);
/**
 * The image blocks of one message, in order: every staged image read back
 * and checked against the limits once more (a limit change, a foreign
 * facade). Throws a user-facing sentence when one cannot be sent — never a
 * message silently missing an image.
 */
export async function claudeImageBlocks(images, limits = CLAUDE_IMAGE_LIMITS) {
    if (images.length > limits.maxImagesPerMessage)
        throw new Error(claudeText('claude-images-too-many', { n: limits.maxImagesPerMessage }));
    const blocks = [];
    let total = 0;
    for (const image of images) {
        const label = image.name ?? image.id;
        if (!isAccepted(image.mediaType) || !limits.mediaTypes.includes(image.mediaType))
            throw new Error(claudeText('claude-image-type-refused', { name: label, type: image.mediaType ?? '?' }));
        let data;
        try {
            data = await image.read();
        }
        catch (error) {
            throw new Error(claudeText('claude-image-unreadable', { name: label, err: error instanceof Error ? error.message : String(error) }));
        }
        if (data.byteLength > limits.maxImageBytes)
            throw new Error(claudeText('claude-image-too-large', { name: label, mb: Math.round(limits.maxImageBytes / (1024 * 1024)) }));
        total += data.byteLength;
        if (total > limits.maxMessageImageBytes)
            throw new Error(claudeText('claude-images-too-large', { mb: Math.round(limits.maxMessageImageBytes / (1024 * 1024)) }));
        blocks.push({ type: 'image', source: { type: 'base64', media_type: image.mediaType, data: Buffer.from(data.buffer, data.byteOffset, data.byteLength).toString('base64') } });
    }
    return blocks;
}
/** Base64 characters decoded to probe an image's size (a multiple of 4: ≈ 64 KiB). */
const PROBE_CHARS = 87_384;
/** The decoded byte length of a base64 string (no decoding). */
function decodedLength(data) {
    const padding = data.endsWith('==') ? 2 : data.endsWith('=') ? 1 : 0;
    return Math.max(0, Math.floor(data.length * 3 / 4) - padding);
}
/**
 * A lazy facade over one base64 image the transcript holds: the size is
 * probed on first access (a decoded prefix; the whole image only when the
 * prefix does not reach the size header), the bytes decoded on `read()`.
 */
export function base64ImageFacade(id, mediaType, data) {
    let size;
    const measure = () => {
        if (size !== undefined)
            return size;
        const head = Buffer.from(data.slice(0, PROBE_CHARS), 'base64');
        size = probeImageSize(head) ?? (data.length > PROBE_CHARS ? probeImageSize(Buffer.from(data, 'base64')) : null);
        return size;
    };
    return {
        id,
        mediaType,
        bytes: decodedLength(data),
        // A size the probe cannot read lays out square (the preview still loads).
        get width() { return measure()?.width ?? 1; },
        get height() { return measure()?.height ?? 1; },
        read: () => Promise.resolve(new Uint8Array(Buffer.from(data, 'base64'))),
    };
}
/** The base64 image blocks of a user message's content, as lazy facades
 *  (`<idPrefix>#<n>`); other sources (URLs, files) are not shown. */
export function transcriptImages(content, idPrefix) {
    if (!Array.isArray(content))
        return [];
    const images = [];
    content.forEach((raw, index) => {
        const block = rec(raw);
        const source = rec(block?.source);
        if (block?.type !== 'image' || source?.type !== 'base64')
            return;
        const data = source.data;
        const mediaType = source.media_type;
        if (typeof data !== 'string' || data === '' || typeof mediaType !== 'string')
            return;
        images.push(base64ImageFacade(`${idPrefix}#${index}`, mediaType, data));
    });
    return images;
}

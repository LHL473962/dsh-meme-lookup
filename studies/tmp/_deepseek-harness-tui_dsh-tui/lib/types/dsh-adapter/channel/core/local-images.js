/**
 * Image staging for a session that takes images without the DSH attachments
 * service. A backend that declares the `images` capability (the Claude
 * backend sends images as base64 blocks of the message itself) gets the
 * composer's pasted images and `@`-mentioned image files staged here, with
 * the bytes held in memory and never written anywhere. The backend's declared
 * limits apply through the same limit model the DSH store uses
 * (`imageLimits`: media types, per-image and per-message bytes, image count,
 * per-side and total pixel caps) and the same ingress adaptation
 * (`adaptImageForAdmission`: an unaccepted format is converted, an oversize
 * image resampled, when sharp is available).
 *
 * The staged reference has the DSH shape (`ImageAttachmentRef`), so the
 * composer, the `@` expansion and the input pipeline treat it exactly as a
 * stored attachment; its id is local (`local-<sha256 prefix>`, content-
 * addressed). The facade a transcript row shows reads the same bytes back.
 *
 * Bounded: at most {@link LOCAL_IMAGE_LIMIT} images and
 * {@link LOCAL_IMAGE_BYTES} bytes, the oldest dropped first. A facade whose
 * bytes were dropped reports itself unavailable (the row shows the
 * placeholder); it never holds bytes of its own.
 */
import { createHash } from 'node:crypto';
import { adaptImageForAdmission, probeImageSize, sniffImageMediaType, withinDimensionLimits } from '../../../utils/imageResize.js';
/** Images kept in memory at most (oldest dropped first). */
export const LOCAL_IMAGE_LIMIT = 64;
/** Bytes kept in memory at most (oldest dropped first). */
export const LOCAL_IMAGE_BYTES = 96 * 1024 * 1024;
const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif'];
/** Create the store over the limits of the bound session (read per call). */
export function createLocalImageStore(limits) {
    const images = new Map();
    const facades = new Map();
    let total = 0;
    const imageLimits = () => {
        const view = limits();
        return {
            maxImageBytes: view.maxImageBytes,
            maxImagesPerMessage: view.maxImagesPerMessage,
            maxMessageImageBytes: view.maxMessageImageBytes,
            maxImageDimension: view.maxImageDimension,
            maxImagePixels: view.maxImagePixels,
            mediaTypes: IMAGE_TYPES.filter(type => view.mediaTypes.includes(type)),
        };
    };
    const evict = () => {
        for (const [id, entry] of images) {
            if (images.size <= LOCAL_IMAGE_LIMIT && total <= LOCAL_IMAGE_BYTES)
                break;
            images.delete(id);
            facades.delete(id);
            total -= entry.data.byteLength;
        }
    };
    const facade = (ref) => {
        const id = String(ref.attachmentId);
        const known = facades.get(id);
        if (known !== undefined)
            return known;
        const view = {
            id,
            width: ref.width,
            height: ref.height,
            ...(ref.name === undefined ? {} : { name: ref.name }),
            mediaType: ref.mediaType,
            bytes: ref.bytes,
            read: () => {
                const stored = images.get(id);
                return stored === undefined
                    ? Promise.reject(new Error('the image is no longer held in memory'))
                    : Promise.resolve(stored.data);
            },
        };
        facades.set(id, view);
        return view;
    };
    return {
        get imageLimits() { return imageLimits(); },
        async saveImage(input) {
            const caps = imageLimits();
            let data = input.data;
            let mediaType = input.mediaType;
            // The content wins over the label: a paste or @-mention declares a
            // media type from the filename, and a renamed file would otherwise be
            // sent to the backend under a type its bytes contradict. The sniff
            // reads magic bytes only (no decode, no re-encode), so a mislabeled
            // image keeps its bytes, animation included. Content it cannot identify
            // takes the decode-or-refuse path below with the declared label.
            const sniffed = sniffImageMediaType(data);
            if (sniffed !== undefined && sniffed !== mediaType)
                mediaType = sniffed;
            const dimensions = { maxImageDimension: caps.maxImageDimension, maxImagePixels: caps.maxImagePixels };
            let size = probeImageSize(data);
            let originalDimensions;
            const accepted = caps.mediaTypes.includes(mediaType);
            if (!accepted || size === null || !withinDimensionLimits(size, dimensions)) {
                const outcome = await adaptImageForAdmission(data, mediaType, dimensions, caps.mediaTypes);
                if (outcome.kind === 'adapted') {
                    if (size !== null && outcome.resized)
                        originalDimensions = { width: size.width, height: size.height };
                    data = outcome.data;
                    mediaType = outcome.mediaType;
                    size = { width: outcome.width, height: outcome.height };
                }
                else if (outcome.kind === 'unavailable') {
                    if (!accepted)
                        throw new Error(`${mediaType} images are not accepted by this backend and could not be converted (${outcome.detail})`);
                    if (size === null)
                        throw new Error(`the image could not be measured (${outcome.detail})`);
                    // An accepted format the gate could not resample: the backend's
                    // own downscaling is the backstop (its hard caps are larger).
                }
            }
            if (size === null)
                throw new Error('the image could not be measured');
            if (!caps.mediaTypes.includes(mediaType))
                throw new Error(`${mediaType} images are not accepted by this backend`);
            if (data.byteLength > caps.maxImageBytes)
                throw new Error('the image exceeds the backend\'s per-image size limit');
            const attachmentId = `local-${createHash('sha256').update(data).digest('hex').slice(0, 32)}`;
            const ref = {
                attachmentId,
                mediaType,
                bytes: data.byteLength,
                width: size.width,
                height: size.height,
                ...(input.name === undefined ? {} : { name: input.name }),
                ...(originalDimensions === undefined ? {} : { originalDimensions }),
            };
            const known = images.get(attachmentId);
            if (known !== undefined) {
                // Content-addressed: the same bytes again move to the newest slot.
                images.delete(attachmentId);
                images.set(attachmentId, known);
                return known.ref;
            }
            images.set(attachmentId, { data, ref });
            total += data.byteLength;
            evict();
            return ref;
        },
        facade(attachment) {
            return images.has(String(attachment.attachmentId)) ? facade(attachment) : undefined;
        },
        bytes: attachmentId => images.get(attachmentId)?.data,
    };
}

/**
 * Source paths of images staged in this process, by attachment id, so the
 * transcript projection of an image the user just sent shows the same path
 * as its composer preview did. Bounded FIFO; a restart forgets everything.
 */
const rememberedImagePaths = new Map();
const REMEMBERED_IMAGE_PATHS_MAX = 256;
export function rememberImagePath(attachmentId, path) {
    rememberedImagePaths.delete(attachmentId);
    rememberedImagePaths.set(attachmentId, path);
    while (rememberedImagePaths.size > REMEMBERED_IMAGE_PATHS_MAX) {
        const oldest = rememberedImagePaths.keys().next().value;
        if (oldest === undefined)
            break;
        rememberedImagePaths.delete(oldest);
    }
}
/**
 * Project durable image blocks without leaking the DSH attachment service
 * into UI code. The returned reader resolves the service at call time so a
 * late-mounted attachment provider still works.
 */
export function transcriptImagesOf(content, resolveAttachments) {
    const images = [];
    const visit = (blocks) => {
        if (!Array.isArray(blocks))
            return;
        for (const block of blocks) {
            if (typeof block !== 'object' || block === null)
                continue;
            if (block.type === 'tool-result') {
                visit(block.content);
                continue;
            }
            if (block.type !== 'image')
                continue;
            const image = transcriptImageFromAttachment(block.attachment, resolveAttachments);
            if (image !== undefined)
                images.push(image);
        }
    };
    visit(content);
    return images;
}
/**
 * Build the UI facade for one durable image reference. Shared by the
 * transcript projection and the staged-composer path, so both hand the UI
 * the same lazily-read shape (and the same per-object decode cache key).
 */
export function transcriptImageFromAttachment(value, resolveAttachments) {
    const attachment = validAttachment(value);
    if (attachment === undefined)
        return undefined;
    const id = String(attachment.attachmentId);
    const path = rememberedImagePaths.get(id);
    return {
        id,
        width: attachment.width,
        height: attachment.height,
        ...(attachment.name === undefined ? {} : { name: attachment.name }),
        mediaType: attachment.mediaType,
        ...(positiveInteger(attachment.bytes) ? { bytes: attachment.bytes } : {}),
        ...(path === undefined ? {} : { path }),
        async read(signal) {
            const reader = resolveAttachments();
            if (typeof reader?.readImage !== 'function') {
                throw new Error('image attachments are unavailable in this profile');
            }
            const stored = await reader.readImage(attachment, signal);
            if (!(stored?.data instanceof Uint8Array)) {
                throw new Error('attachment store returned invalid image data');
            }
            return stored.data;
        },
    };
}
function validAttachment(value) {
    if (typeof value !== 'object' || value === null)
        return undefined;
    const attachment = value;
    if (typeof attachment.attachmentId !== 'string' ||
        attachment.attachmentId === '' ||
        typeof attachment.mediaType !== 'string' ||
        !/^image\/[a-z0-9.+-]+$/u.test(attachment.mediaType) ||
        !positiveInteger(attachment.width) ||
        !positiveInteger(attachment.height)) {
        return undefined;
    }
    if (attachment.name !== undefined && typeof attachment.name !== 'string') {
        return undefined;
    }
    return attachment;
}
function positiveInteger(value) {
    return typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
}

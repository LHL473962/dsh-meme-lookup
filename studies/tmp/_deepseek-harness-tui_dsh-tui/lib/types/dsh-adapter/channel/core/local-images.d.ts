import type { TranscriptImage } from '../../../adapter/ports/channel-view.js';
import type { ImageLimitsView } from '../../../agent/capabilities.js';
import type { MentionAttachments, MentionImageBlock } from '../types.js';
type ImageRef = MentionImageBlock['attachment'];
/** Images kept in memory at most (oldest dropped first). */
export declare const LOCAL_IMAGE_LIMIT = 64;
/** Bytes kept in memory at most (oldest dropped first). */
export declare const LOCAL_IMAGE_BYTES: number;
/** The local store: the attachments subset the composer and `@` expansion
 *  use, plus the facades rows show. */
export interface LocalImageStore extends MentionAttachments {
    /** The lazily-read facade of a staged image (one object per id). */
    facade(attachment: ImageRef): TranscriptImage | undefined;
    /** The staged bytes, while kept. */
    bytes(attachmentId: string): Uint8Array | undefined;
}
/** Create the store over the limits of the bound session (read per call). */
export declare function createLocalImageStore(limits: () => ImageLimitsView): LocalImageStore;
export {};
//# sourceMappingURL=local-images.d.ts.map
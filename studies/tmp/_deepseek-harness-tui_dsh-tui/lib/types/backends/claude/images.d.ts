/**
 * Image input for Claude sessions: the limits the composer stages
 * images under (the `images` capability), the base64 image blocks a user
 * message carries after its text, and the lazy facades a transcript image
 * block replays as.
 *
 * Limits (the Anthropic Messages API): PNG / JPEG / GIF / WebP, at most
 * 5 MiB per image after the composer's downsample path; a message carries
 * at most 20 images (the API's dimension cap tightens to 2000 px per side
 * beyond 20) and 20 MiB of image bytes (≈ 27 MB of base64, under the 32 MB
 * request cap); images are resampled into 2000 px per side / 4 MP — the API
 * scales larger ones down anyway.
 *
 * Replay: `getSessionMessages` returns the base64 blocks as sent. A facade
 * keeps the base64 string the transcript already holds and decodes nothing
 * until asked: its size is probed from a short decoded prefix on first
 * access, its bytes decoded on `read()` — no pixels in the projection.
 */
import type { TranscriptImage } from '../../agent/index.js';
import type { ImageLimitsView } from '../../agent/capabilities.js';
import type { ImageRef } from '../../agent/events.js';
/** What a Claude message may carry (see the module comment). */
export declare const CLAUDE_IMAGE_LIMITS: ImageLimitsView;
/** One base64 image block as the Messages API takes it. */
export interface ClaudeImageBlock {
    readonly type: 'image';
    readonly source: {
        readonly type: 'base64';
        readonly media_type: 'image/png' | 'image/jpeg' | 'image/gif' | 'image/webp';
        readonly data: string;
    };
}
/**
 * The image blocks of one message, in order: every staged image read back
 * and checked against the limits once more (a limit change, a foreign
 * facade). Throws a user-facing sentence when one cannot be sent — never a
 * message silently missing an image.
 */
export declare function claudeImageBlocks(images: readonly TranscriptImage[], limits?: ImageLimitsView): Promise<ClaudeImageBlock[]>;
/**
 * A lazy facade over one base64 image the transcript holds: the size is
 * probed on first access (a decoded prefix; the whole image only when the
 * prefix does not reach the size header), the bytes decoded on `read()`.
 */
export declare function base64ImageFacade(id: string, mediaType: string, data: string): TranscriptImage;
/** The base64 image blocks of a user message's content, as lazy facades
 *  (`<idPrefix>#<n>`); other sources (URLs, files) are not shown. */
export declare function transcriptImages(content: unknown, idPrefix: string): ImageRef[];
//# sourceMappingURL=images.d.ts.map
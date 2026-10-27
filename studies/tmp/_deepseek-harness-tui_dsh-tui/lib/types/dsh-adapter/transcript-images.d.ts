import type { ContentBlock } from '@deepseek-ai/dsh-llm';
import type { TranscriptImage } from '../adapter/ports/channel-view.js';
export type { TranscriptImage };
export declare function rememberImagePath(attachmentId: string, path: string): void;
/**
 * Project durable image blocks without leaking the DSH attachment service
 * into UI code. The returned reader resolves the service at call time so a
 * late-mounted attachment provider still works.
 */
export declare function transcriptImagesOf(content: readonly ContentBlock[] | undefined, resolveAttachments: () => unknown): readonly TranscriptImage[];
/**
 * Build the UI facade for one durable image reference. Shared by the
 * transcript projection and the staged-composer path, so both hand the UI
 * the same lazily-read shape (and the same per-object decode cache key).
 */
export declare function transcriptImageFromAttachment(value: unknown, resolveAttachments: () => unknown): TranscriptImage | undefined;
//# sourceMappingURL=transcript-images.d.ts.map
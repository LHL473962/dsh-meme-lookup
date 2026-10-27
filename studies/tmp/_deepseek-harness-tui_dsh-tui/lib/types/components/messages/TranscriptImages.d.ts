import React from 'react';
import type { TerminalImageSource } from '../../ink/terminal-image.js';
import type { TranscriptImage } from '../../dsh-adapter/transcript-images.js';
/** Full-resolution (bounded) decode for the modal preview overlay. */
export declare const loadTranscriptImageFull: (image: TranscriptImage, signal?: AbortSignal) => Promise<TerminalImageSource>;
/** Display label for one transcript image: sanitized name, or the generic
 *  localized fallback. Shared by thumbnails and the preview overlay. */
export declare function transcriptImageLabel(image: TranscriptImage): string;
/** Bounded image gallery shared by user, assistant, and tool-result rows. */
export declare function TranscriptImages({ images, indent, onPreview, suppressGraphics, }: {
    readonly images: readonly TranscriptImage[];
    readonly indent?: number;
    /** Present = thumbnails are clickable and open the shared preview overlay. */
    readonly onPreview?: (image: TranscriptImage) => void;
    /** Keep fallback geometry/click targets but yield the global terminal-image
     * frame budget to the modal full preview. */
    readonly suppressGraphics?: boolean;
}): React.ReactNode;
/** @internal Focused regression scripts clear the process-local LRUs. */
export declare function clearTranscriptImageCacheForTests(): void;
//# sourceMappingURL=TranscriptImages.d.ts.map
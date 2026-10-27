import type { TranscriptImage } from '../../dsh-adapter/transcript-images.js';
/** Only called by an explicit open action. Keep exact bytes in OS temp storage
 * after closing the TUI, since an external viewer may read the file later. */
export declare function exportOriginalImage(image: TranscriptImage, signal?: AbortSignal): Promise<string>;
//# sourceMappingURL=originalImage.d.ts.map
import type { TerminalImageSource } from '../../ink/terminal-image.js';
import type { TranscriptImage } from '../../dsh-adapter/transcript-images.js';
export declare function scheduleImageDecode<T>(signal: AbortSignal, work: () => Promise<T>, priority: boolean): Promise<T>;
/** Bounded LRU keyed by durable facade identity, with shared cancellation. */
export declare function makeDecodeTier(maxPixels: number, limit: number, maxDecodedPixels?: number): {
    load: (image: TranscriptImage, signal?: AbortSignal) => Promise<TerminalImageSource>;
    clear: () => void;
};
//# sourceMappingURL=transcriptImageDecode.d.ts.map
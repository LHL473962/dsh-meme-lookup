import type { TranscriptImage } from '../../dsh-adapter/transcript-images.js';
import type { TerminalCellSize, TerminalImageSource } from '../../ink/terminal-image.js';
import type { DragEvent } from '../../ink/events/drag-event.js';
export declare function useImageInspection(image: TranscriptImage, available: boolean, columns: number, rows: number, cell: TerminalCellSize | undefined, zoom: number): {
    source: TerminalImageSource | undefined;
    failed: boolean;
    pan: (x: number, y: number) => void;
    drag: (event: DragEvent) => void;
};
//# sourceMappingURL=useImageInspection.d.ts.map
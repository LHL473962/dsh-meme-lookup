import React from 'react';
import type { TranscriptImage } from '../dsh-adapter/transcript-images.js';
/**
 * The shared modal image preview: one centered card over a click-catcher
 * over the visible part of its parent, used by the composer's `[Image #N]`
 * tokens and the transcript thumbnails. Chat mounts it inside the
 * transcript row, so the prompt, status rows and sticky header stay visible
 * and untouched; only while the fullscreen draft editor is open does it sit
 * at the root and cover the whole screen. The card is sized from the
 * region the caller reports (the transcript viewport), refined by the
 * parent's visible cell box on later commits; it renders on the layer's
 * first frame.
 *
 * The card's title sits in its top border, centered: `Image #N — PNG ·
 * 361×379 · 19.0 KB · name.png`. The card is at least as wide as its
 * title, so a small image never squeezes the file name; when even the
 * region is too narrow, the name is shortened in its middle first and
 * dropped from the title last. Images staged from a file or the clipboard
 * in this process show their source path on the card's bottom row, head
 * and tail kept and the middle elided. Controls sit below the image;
 * Esc and a click outside close (Chat's key chain and the catcher).
 * Catcher and card are sibling absolute nodes — see the comment at the
 * card for why the card is not the catcher's child. The layer only paints
 * themed cells — terminal graphics stay inside the host `Image` primitive,
 * which keeps its own capability fallback.
 */
export declare function ImagePreviewOverlay({ image, onClose, region, title, navigation, }: {
    readonly image: TranscriptImage;
    readonly onClose: () => void;
    /**
     * Cell box of the region the layer fills, known to the caller before the
     * first paint (Chat passes the transcript viewport). The card renders at
     * this size on its first frame; without it the first frame falls back to
     * the terminal size. Either way the parent's visible box refines it on
     * the next commit.
     */
    readonly region?: {
        readonly columns: number;
        readonly rows: number;
    };
    /** Leading title text, e.g. the composer token `Image #2`. Defaults to
     *  the generic image label. */
    readonly title?: string;
    readonly navigation?: {
        readonly index: number;
        readonly total: number;
        readonly onPrevious: () => void;
        readonly onNext: () => void;
    };
}): React.ReactNode;
//# sourceMappingURL=ImagePreviewOverlay.d.ts.map
import React, { type ReactNode } from 'react';
import type { TerminalImageSource } from '../terminal-image.js';
export interface ImageProps {
    /**
     * Decoded immutable RGBA snapshot. Allocate a new buffer when pixels change;
     * invalid or oversized sources use the fallback.
     */
    readonly source?: TerminalImageSource;
    /** Width reserved in terminal columns. */
    readonly width: number;
    /** Height reserved in terminal rows. */
    readonly height: number;
    /** Text alternative. Use an empty string for a decorative image. */
    readonly alt: string;
    /**
     * What a fullscreen copy yields for this image, e.g. a formula's source.
     * Without it the image's cells are left out of copied text.
     */
    readonly copyText?: string;
    /** Opt into Sixel for a modal or scrollable transcript. Default keeps Kitty only. */
    readonly presentation?: 'preview' | 'transcript';
    /**
     * Float on whatever the terminal shows behind the image: the raster is
     * emitted without a backing colour and its coverage becomes a hard mask
     * (Sixel has no partial alpha). Formulas and artwork with transparent
     * margins use this; photographs and anything sitting on a painted surface
     * leave it unset and composite onto that surface instead.
     */
    readonly transparent?: boolean;
    /**
     * Line art (typeset formulas, diagrams): with `transparent`, the Sixel mask
     * paints any pixel at or above 25% coverage solid instead of ordered
     * dithering the 25%–62.5% band, so hairline strokes stay continuous.
     * Photographs and sprites leave it unset.
     */
    readonly lineArt?: boolean;
    /** Same-size terminal-cell fallback rendered when graphics are unavailable. */
    readonly children?: ReactNode;
}
/**
 * A renderer-owned terminal image with a deterministic cell fallback.
 *
 * The component never emits protocol bytes itself. It contributes a normal
 * Yoga leaf; the Ink host decides after layout whether to paint its fallback
 * children or attach a terminal-graphics placement over the same cells.
 */
export default function Image({ source, width, height, alt, copyText, presentation, transparent, lineArt, children, }: ImageProps): React.ReactNode;
//# sourceMappingURL=Image.d.ts.map
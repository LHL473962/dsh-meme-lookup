import { type DOMElement } from './dom.js';
import type { Frame } from './frame.js';
import type { TerminalImagePlacement } from './terminal-image.js';
import { type StylePool } from './screen.js';
/** Options controlling one renderer pass over the DOM tree. */
export type RenderOptions = {
    frontFrame: Frame;
    backFrame: Frame;
    isTTY: boolean;
    terminalWidth: number;
    terminalRows: number;
    altScreen: boolean;
    /** Whether terminal graphics are active for this paint pass. */
    terminalImages?: boolean;
    imageReady?: (placement: TerminalImagePlacement) => boolean;
    imageRasterBytes?: (placement: TerminalImagePlacement) => number;
    /**
     * True when rasters paint over the cell grid (Sixel): image-owned cells
     * carry the surface background instead of terminal-default blanks. See
     * Output's `opaqueImageBacking`.
     */
    opaqueImageBacking?: boolean;
    prevFrameContaminated: boolean;
};
/** Renders the DOM tree into a frame for the given options. */
export type Renderer = (options: RenderOptions) => Frame;
/**
 * Create the renderer function for a root DOM node. The returned renderer
 * reuses an Output across frames so its character cache persists.
 * @param node - the root DOM node to render.
 * @param stylePool - the style pool used for all frames.
 * @returns a function that renders one frame from the given options.
 */
export default function createRenderer(node: DOMElement, stylePool: StylePool): Renderer;
//# sourceMappingURL=renderer.d.ts.map
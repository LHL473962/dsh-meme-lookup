import React from 'react';
import type { Theme } from '../../theme.js';
type DividerProps = {
    /**
     * Width of the divider in characters.
     * Defaults to the available layout width.
     */
    width?: number;
    /**
     * Theme color for the divider.
     * If not provided, dimColor is used.
     */
    color?: keyof Theme;
    /**
     * Character to use for the divider line.
     * @default '─'
     */
    char?: string;
    /**
     * Padding to subtract from the width (e.g., for indentation).
     * @default 0
     */
    padding?: number;
    /**
     * Title shown in the middle of the divider.
     * May contain ANSI codes (e.g., chalk-styled text).
     */
    title?: string;
    /**
     * Full-bleed: extend the rule into the page margins to the terminal
     * edges (page-level structural hairline — the page-margin convention:
     * TEXT stays inside the content column, structural lines bleed). Use for
     * screen-level dividers only; dividers inside cards, panels, or the
     * transcript stay at content width. No-op outside PageMargin.
     */
    bleed?: boolean;
};
/**
 * A horizontal divider line, optionally with a title in the middle
 * in the dsh-TUI visual language.
 *
 * The rule fills the width Yoga actually grants it: the Box is measured
 * after layout (SearchBox pattern — a resize re-layouts without any prop
 * change, so measure on every commit) and the terminal column count only
 * seeds the first frame. A full-terminal-width rule nested in a narrower
 * container (e.g., the transcript beside the 2-column timeline rail)
 * would otherwise wrap onto a second row.
 *
 * Because the rendered rule width feeds back into the width Yoga grants
 * the Box, the measurement negotiation is bounded per terminal-width
 * generation (MAX_APPLIED_MEASUREMENTS below): a non-converging layout
 * degrades to a frozen, truncated rule instead of tripping React's max
 * update depth (error #185, a hard process crash).
 *
 * @example
 * // ─────────── Title ───────────
 * <Divider title="Title" />
 */
export declare function Divider({ width, color, char, padding, title, bleed, }: DividerProps): React.ReactNode;
export {};
//# sourceMappingURL=Divider.d.ts.map
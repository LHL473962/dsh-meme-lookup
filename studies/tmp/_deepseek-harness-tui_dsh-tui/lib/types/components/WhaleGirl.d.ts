import React from 'react';
import type { TerminalImageSource } from '../ink/terminal-image.js';
/**
 * The maid portrait (鲸鱼娘) that can stand in for the header's pixel whale
 * (settings `dsh-tui.whaleGirl`): the author-designed 30×30 true-color
 * sprite in `whaleGirlSprite.ts`, rendered with the same half-block
 * technique as the whale — one `▀`/`▄` cell packs two sprite rows, so the
 * portrait shows at 30 columns × 15 rows. A static portrait by design: the
 * whale's idle planner and click-hearts stay whale-only, so `dsh-tui.whaleIdle`
 * has nothing to animate here (documented with the setting).
 */
/** Pre-rendered ANSI rows, computed once at module load. */
export declare const WHALE_GIRL_ROWS: readonly string[];
/**
 * The portrait's center column when it fills the whale's 40-column box
 * (indented (40−30)/2 = 5, so the art spans columns 5..34 → center 19.5).
 * The welcome tagline centers on this instead of `WHALE_CENTER` in maid
 * mode, keeping the caption under the art it belongs to.
 */
export declare const WHALE_GIRL_CENTER = 19.5;
/**
 * The maid portrait as an Ink component: 15 rows × 30 columns. `width` pins
 * the box (the header passes the whale's 40-column box so the neighbouring
 * text column never shifts) and centers the portrait inside it; without it
 * the component is exactly the portrait's own 30 columns (the star modal).
 */
export declare function WhaleGirlArt({ width }: {
    width?: number;
}): React.ReactNode;
/** The same heart-pose portrait used by the Star celebration, rendered as cells when image protocols are absent. */
export declare function WhaleGirlHappyArt({ source, width }: {
    source?: TerminalImageSource;
    width?: number;
}): React.ReactNode;
//# sourceMappingURL=WhaleGirl.d.ts.map
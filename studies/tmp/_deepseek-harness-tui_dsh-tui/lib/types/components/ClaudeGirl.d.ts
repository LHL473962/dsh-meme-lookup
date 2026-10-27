import React from 'react';
/**
 * The Claude girl portrait（Claude 娘）that stands in for the header's pixel
 * whale while the claude brand is active (`branding.ts` — the cc kernel):
 * a 30×30 true-color sprite in `claudeGirlSprite.ts`, rendered with the same
 * half-block technique as the whale and the whale girl — one `▀`/`▄` cell
 * packs two sprite rows, so the portrait shows at 30 columns × 15 rows.
 * A static portrait by design: the whale's idle planner and click-hearts
 * stay whale-only, exactly like the whale-girl mode.
 */
/** Pre-rendered ANSI rows, computed once at module load. */
export declare const CLAUDE_GIRL_ROWS: readonly string[];
/**
 * The portrait's center column when it fills the whale's 40-column box
 * (indented (40−30)/2 = 5, so the art spans columns 5..34 → center 19.5 —
 * same metrics as the whale girl, both sprites are 30 columns).
 */
export declare const CLAUDE_GIRL_CENTER = 19.5;
/**
 * The Claude girl as an Ink component: 15 rows × 30 columns. `width` pins
 * the box (the header passes the whale's 40-column box so the neighbouring
 * text column never shifts) and centers the portrait inside it.
 */
export declare function ClaudeGirlArt({ width }: {
    width?: number;
}): React.ReactNode;
//# sourceMappingURL=ClaudeGirl.d.ts.map
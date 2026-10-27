import React from 'react';
type Props = {
    isError: boolean;
    isUnresolved: boolean;
    shouldAnimate: boolean;
    /** Raw tool id (bash/read/edit/…) — picks the category color for a settled dot. */
    toolName?: string;
};
/**
 * The status dot on tool-call rows. State shapes the glyph, the tool
 * category picks the settled color: blinking `●` while running (attention),
 * a smaller category-colored `•` once settled (quiet), and a red `✗` on
 * error — a glyph swap, not just a hue, so failures read at a glance
 * (Codex-style category colors; every color is a theme token).
 */
export declare function ToolUseLoader({ isError, isUnresolved, shouldAnimate, toolName, }: Props): React.ReactNode;
export {};
//# sourceMappingURL=ToolUseLoader.d.ts.map
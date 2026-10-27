import React from 'react';
import type { WaveBand } from '../../dsh-adapter/types.js';
/**
 * Column budget for the mini wake at a given terminal width.
 *
 * It is the first thing to go on a narrow terminal: the status line's own
 * fields (model, tps, branch, cwd) are what a user reads constantly, and a
 * decoration that squeezes them is a decoration that has overstayed.
 *
 * @param columns - Terminal width in cells.
 * @returns Glyph count, or 0 when the strip should not render at all.
 */
export declare function miniWakeWidth(columns: number): number;
export declare function MiniWake({ band, hint, working, onOpen, hoverHint, }: {
    /** The session projected onto {@link miniWakeWidth} columns. */
    band: WaveBand;
    /**
     * Key hint shown once beside the strip, until the trajectory has been
     * opened for the first time. Absent afterwards.
     */
    hint?: string;
    working: boolean;
    /**
     * Open the trajectory scene. The strip is the conversation's permanent
     * pointer at that second view, so pointing AT it and clicking is the
     * gesture the affordance implies — the key chord stays as the alternative,
     * not the only way in.
     */
    onOpen?: () => void;
    /** Key chord revealed while the pointer rests on the strip (the first-run
     *  hint has already retired by then). */
    hoverHint?: string;
}): React.ReactNode;
//# sourceMappingURL=MiniWake.d.ts.map
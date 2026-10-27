import React from 'react';
import type { ToolFileDiff } from '../dsh-adapter/channel.js';
export { chalkFromToken } from '../terminal-utils/syntaxTheme.js';
export { parseAnsiRuns, highlightLines } from '../terminal-utils/syntaxRuns.js';
import type { ToolBackground } from '../tuiDisplayPrefs.js';
export declare function SplitDiffView({ diffs, width, maxRows, verbose, toolBackground, reveal, }: {
    readonly diffs: readonly ToolFileDiff[];
    /** Content width available to the whole two-pane block (divider included). */
    readonly width: number;
    /** Row budget when not verbose; overflow folds into one hint row. */
    readonly maxRows: number;
    readonly verbose: boolean;
    readonly toolBackground?: ToolBackground;
    /**
     * Smooth-streaming participation (the card owning this view computes
     * eligibility): when present, the capped row list reveals line-by-line at
     * the shared ~30fps cadence instead of painting as one block. The `+N
     * lines` fold hint stays rendered throughout — it describes the cap, not
     * the reveal.
     */
    readonly reveal?: {
        readonly key: string;
    };
}): React.ReactNode;
//# sourceMappingURL=SplitDiffView.d.ts.map
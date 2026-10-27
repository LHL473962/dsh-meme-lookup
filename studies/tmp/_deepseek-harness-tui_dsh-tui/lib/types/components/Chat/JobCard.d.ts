import React from 'react';
import type { JobRow } from '../../dsh-adapter/channel.js';
import type { BackgroundJobOutputLine } from '../../adapter/ports/channel-view.js';
/**
 * Producer progress as the design system's bar: `n/m` draws a 5-cell
 * sub-cell-accurate `ProgressBar` (same primitive the rest of the TUI uses)
 * plus the raw counter; any other shape passes through verbatim. Exported for
 * the /jobs panel so both surfaces read the same.
 */
export declare function JobProgress({ progress }: {
    progress: string;
}): React.ReactNode;
/** One rendered waterfall row: a wrapped piece of an output line, or a gap
 *  banner standing on its own row. */
interface WaterfallRow {
    key: string;
    text: string;
    gap?: true;
}
/**
 * The waterfall window: every entry is WRAPPED at the card width FIRST, then
 * the last `budget` VISUAL rows are kept. A 400-cell JSON line therefore
 * shows its ending folded over the rows instead of a clipped head — and the
 * window still costs a constant number of rows, which is what the
 * transcript's virtualization measures.
 */
export declare function jobOutputRows(entries: readonly BackgroundJobOutputLine[], width: number, budget: number): WaterfallRow[];
/** Command content shares normalization and wrapping with the full jobs panel. */
export declare function jobCommandRows(text: string, width: number, expanded: boolean): string[];
/** The renderer draws the continuous section edge across all content rows. */
export declare function JobSection({ rows, color, onToggle, children }: {
    rows: readonly string[];
    color: 'accent' | 'success';
    onToggle?: () => void;
    children?: React.ReactNode;
}): React.ReactNode;
/** Transcript job card: command folding is independent of the fixed output tail. */
export declare function JobCard({ job, marginTopOnTurn, onClick, onWatchOutput, expanded, onToggle }: {
    job: JobRow;
    marginTopOnTurn: boolean;
    onClick?(): void;
    expanded?: boolean;
    onToggle?: () => void;
    onWatchOutput?: (id: string) => () => void;
}): React.ReactNode;
export {};
//# sourceMappingURL=JobCard.d.ts.map
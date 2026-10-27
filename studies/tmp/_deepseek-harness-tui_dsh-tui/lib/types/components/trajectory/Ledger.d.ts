import React from 'react';
import type { ClickEvent } from '../../ink/events/click-event.js';
import type { TrajNode } from '../../dsh-adapter/types.js';
export declare function Ledger({ rows, start, height, cursor, width, tick, arrivalTick, arrivalFrom, onRowClick, }: {
    /** The (possibly filtered) ledger. */
    rows: readonly TrajNode[];
    /** Index of the first visible row. */
    start: number;
    /** Visible row count. */
    height: number;
    /** Focused row index into `rows`. */
    cursor: number;
    /** Terminal width in cells. */
    width: number;
    tick: number;
    /** Tick at which the most recent rows arrived. */
    arrivalTick: number;
    /** Rows at or after this index are the ones that just arrived. */
    arrivalFrom: number;
    /**
     * Mouse pick (fullscreen): reports the clicked row's absolute index — the
     * scene jumps the cursor to it (same semantics as the keyboard jumps).
     * Hover on a non-focused row shows a dim `▸` pointer — light indication,
     * no background wash (the ledger is content, not a menu).
     */
    onRowClick?: (index: number, event: ClickEvent) => void;
}): React.ReactNode;
//# sourceMappingURL=Ledger.d.ts.map
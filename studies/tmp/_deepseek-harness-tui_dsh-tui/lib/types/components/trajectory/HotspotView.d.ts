import React from 'react';
import type { HotspotRow, HotspotSort, TrajAggregate } from '../../dsh-adapter/types.js';
/** Flatten the three sections into the single list the cursor walks. */
export declare function hotspotRows(agg: TrajAggregate): HotspotRow[];
export declare function HotspotView({ agg, sort, width, height, cursor, tick, switchTick, onRowClick, }: {
    agg: TrajAggregate;
    sort: HotspotSort;
    width: number;
    height: number;
    cursor: number;
    tick: number;
    switchTick: number;
    /**
     * Mouse pick (fullscreen): reports the clicked row's cursor index — the
     * scene jumps back to the timeline positioned on the group's first member
     * (same path as the keyboard Enter). Hover shows a dim `▸` pointer.
     */
    onRowClick?: (cursorIndex: number) => void;
}): React.ReactNode;
//# sourceMappingURL=HotspotView.d.ts.map
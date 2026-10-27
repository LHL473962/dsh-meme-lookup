import React from 'react';
import type { ActivityView } from '../dsh-adapter/activity-store.js';
import type { ContextOccupancy } from '../adapter/ports/channel-view.js';
/**
 * Context-pressure percentage (0–100) from the channel's SINGLE occupancy
 * reading (see `dsh-adapter/context-occupancy.ts`), or undefined when unknown —
 * shared by the spinner-line and status-line placements of the
 * working-activity line (pi working-activity style: amber ≥ 80%, red ≥ 95%).
 */
export declare function contextPressurePct(occupancy: ContextOccupancy | undefined): number | undefined;
/**
 * The working-activity line, rendered either in the spinner slot (while a
 * turn runs — alongside the random-verb spinner) or on the status bar
 * (the turn-summary card once idle). pi working-activity style: an animated
 * indicator frame, an ice-blue shimmer sweep over the line, an amber/red
 * `⚠ ctx N%` pressure prefix, and a trailing token suffix for the spinner
 * placement. Done summaries render statically in the brand mist blue.
 */
/** The fields the line renders, from the working-activity plugin's projection. */
export interface ActivityLineValue {
    readonly phase: ActivityView['phase'];
    readonly line: string;
}
export declare function ActivityLine({ activity, activityFrames, warnPct, warnDanger, suffix, }: {
    activity: ActivityLineValue;
    activityFrames: string | undefined;
    warnPct?: number;
    warnDanger?: boolean;
    suffix?: string;
}): React.ReactNode;
//# sourceMappingURL=ActivityLine.d.ts.map
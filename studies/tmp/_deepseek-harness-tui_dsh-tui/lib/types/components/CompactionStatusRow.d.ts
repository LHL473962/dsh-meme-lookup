import React from 'react';
import type { CompactionStatus } from '../adapter/ports/channel-view.js';
/**
 * The in-flight compaction row, in the same slot as the working spinner.
 *
 * A `/compact` runs for tens of seconds (measured on real sessions: median
 * ~25s, p90 ~70s) and the old transient toast covered the first four of them,
 * leaving the screen indistinguishable from idle. This row stays for the whole
 * bracket, counts up, and shows the summarizer's own output as it streams
 * (`compaction.outputChars`) — the one honest progress signal a compaction has,
 * since the host exposes no proportional one.
 *
 * Its leading indicator follows the spinner slot: the `/activity` preset while
 * the working-activity line owns that slot (a running turn shows the preset, so
 * the compaction must not answer with a different glyph), the classic dot
 * otherwise.
 */
export declare function CompactionStatusRow({ compaction, activityPreset, }: {
    compaction: CompactionStatus;
    /** `/activity` preset name to draw the indicator with; undefined keeps the
     *  classic dot family. */
    activityPreset?: string;
}): React.ReactNode;
//# sourceMappingURL=CompactionStatusRow.d.ts.map
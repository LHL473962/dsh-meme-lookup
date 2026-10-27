import React from 'react';
import type { TurnUsageSummary } from '../adapter/ports/channel-view.js';
/**
 * The turn ledger as display segments: tokens in/out, the cache split (only
 * when the backend reported cache tokens — an unreported cache is absent,
 * not zero), duration, the model when asked for and noted, retries, and a
 * marker on an interrupted or failed turn whose ledger is partial. Shared by
 * the transcript row and the /tokens and /status reports so the three read
 * the same.
 */
export declare function turnUsageParts(usage: TurnUsageSummary, options?: {
    readonly model?: boolean;
}): string[];
/**
 * The quiet right-aligned line that closes a turn. It hugs the right margin
 * one notch dimmer than the thinking timer, and names the model only when it
 * changed since the previous turn (`noteModel`, decided at projection time).
 * Formatting happens at render time so a language switch relabels history;
 * the payload itself is immutable, which is what the per-row memo compares.
 */
export declare function TurnUsageRow({ usage }: {
    usage: TurnUsageSummary;
}): React.ReactNode;
//# sourceMappingURL=TurnUsageRow.d.ts.map
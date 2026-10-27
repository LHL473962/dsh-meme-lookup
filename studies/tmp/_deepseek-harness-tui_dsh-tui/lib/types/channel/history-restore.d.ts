import type { ChatRow } from '../adapter/ports/channel-view.js';
import type { AgentEvent } from '../agent/events.js';
import { type ProjectionState } from './projection.js';
/** Whether the durable record can restore a row (the fold predicate). */
export declare function anchoredRow(row: ChatRow): boolean;
/** Restore folded rows from a durable record; returns the rows restored. */
export declare function restoreFoldedRows(rows: ChatRow[], record: readonly AgentEvent[]): number;
/** Paint an older history slice into fresh rows (settled, no live effects). */
export declare function projectHistorySlice(events: readonly AgentEvent[], thinkingFold: ProjectionState['thinkingFold']): ChatRow[];
/**
 * Put older rows ahead of the transcript: restored (never folded again),
 * not fresh (no reveal animation), ids below every row already there.
 * Returns the rows prepended.
 */
export declare function prependHistoryRows(rows: ChatRow[], older: readonly ChatRow[]): number;
//# sourceMappingURL=history-restore.d.ts.map
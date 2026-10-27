/**
 * The replay seed of a resumed thread (docs/codex-backend-design.md §5.12):
 * the newest page of turns, which `thread/resume` returns in full when asked
 * (`initialTurnsPage` with `itemsView: 'full'`, C0 V4), oldest first through
 * the shared replay. A single asynchronously prefetched page makes the
 * transcript capability synchronous; live numbering is never touched by it.
 */
import type { SessionCapabilities } from '../../../agent/capabilities.js';
import type { AgentEvent, AgentEventOf } from '../../../agent/events.js';
import { type Rec } from '../narrow.js';
import type { CodexHub } from '../rpc/hub.js';
import { type ItemContext } from '../translate/items.js';
/** Turns the first page replays. */
export declare const HISTORY_PAGE_TURNS = 20;
/** The `initialTurnsPage` request of `thread/resume`. */
export declare const INITIAL_TURNS_PAGE: {
    readonly limit: 20;
    readonly sortDirection: "desc";
    readonly itemsView: "full";
};
/** The resume answer's first page as events (advancing `ctx`), and the
 *  cursor of the next older page. */
export declare function replayResumePage(response: Rec, ctx: ItemContext): {
    readonly events: readonly AgentEvent[];
    readonly olderCursor?: string;
};
export interface CodexTranscriptHistory {
    takeInitial(): readonly AgentEvent[];
    readonly capability: NonNullable<SessionCapabilities['transcript']>;
    /** Replace the paging snapshot; the caller owns live/backfill numbering. */
    reset(response: Rec): void;
    /** Capture completed native facts, not deltas or optimistic tool state. */
    notification(method: string, params: Rec): void;
    /** Native order, including a ready prefetch page (fork/rewind lookup). */
    readonly turns: readonly Rec[];
    /** Find the turn immediately before the turn containing an item anchor. */
    previousTurnId(anchor: string): string | undefined;
    close(): void;
}
export interface CodexTranscriptHistoryDeps {
    readonly hub: Pick<CodexHub, 'call'>;
    readonly threadId: string;
    readonly cwd: string;
    readonly response: Rec;
    /** Only initial replay advances the live translator context. */
    readonly ctx: ItemContext;
    readonly notice?: (event: AgentEventOf<'notice'>) => void;
}
/** A synchronous bounded record over native full items, with one older page
 * ready ahead of the user. No I/O, decoding, or live seq changes on older(). */
export declare function createCodexTranscriptHistory(deps: CodexTranscriptHistoryDeps): CodexTranscriptHistory;
//# sourceMappingURL=history.d.ts.map
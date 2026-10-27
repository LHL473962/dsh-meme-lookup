import type { SubagentOutputLine, SubagentState } from '../../dsh-adapter/subagents.js';
import type { SubagentTranscriptView, ToolRow } from '../../adapter/ports/channel-view.js';
import type { SubagentTranscriptWindow } from '../../agent/capabilities.js';
import type { AgentEvent } from '../../agent/events.js';
import type { AgentMessageView } from './agentTeam.js';
/** One folded leaf of the child's transcript: thinking (a real body, or
 *  the honest "body unavailable" marker a signature/count-only block
 *  degrades to), text and tool cards — the vocabulary the shared leaf
 *  renderers paint, so a child row reads exactly like a main one. */
export type TranscriptLeaf = {
    kind: 'thinking';
    key: string;
    text: string;
} | {
    kind: 'thinking-unavailable';
    key: string;
    tokens: number | undefined;
} | {
    kind: 'text';
    key: string;
    text: string;
} | {
    kind: 'tool';
    key: string;
    tool: ToolRow;
} | {
    kind: 'agent-message';
    key: string;
    message: AgentMessageView;
};
/** Presentations that never earn a duplicate card here either (the main
 *  projector's rule): a nested delegation renders as the subagent card, a
 *  todo write lives in the todo panel, a question in its dialog. */
export declare const TRANSCRIPT_SUPPRESSED_CARDS: ReadonlySet<string>;
/** Where one history page sits among the pages, for placing the agent
 *  message feed: `olderPagesRemain` = the page is not the oldest one, so
 *  messages observed before its first event belong to an older page;
 *  `before` = the start of the newer page already folded (that page holds
 *  the messages from there on). */
export interface TranscriptPagePlacement {
    readonly olderPagesRemain?: boolean;
    readonly before?: number;
    /** Collects the tool results whose call this page does not hold (the
     *  call sits on an older page), keyed by call id. */
    readonly orphans?: Map<string, ToolResultEvent>;
}
type ToolResultEvent = Extract<AgentEvent, {
    type: 'tool.result';
}>;
/** Fold one history page's lane events into leaf rows (oldest first;
 *  `into` may already hold the older pages' rows). A tool result whose
 *  call is not on this page goes to `page.orphans` (or is dropped without
 *  one) until the older page with the call is folded; consecutive blocks
 *  of one API message join (the store splits a message into per-block
 *  entries sharing the anchor).
 *
 *  `messages` (the agent↔agent feed for THIS child, newest last) is
 *  interleaved by observedAt: each is flushed as an `agent-message` leaf
 *  before the first event observed at/after it. Only the messages that
 *  fall inside this page's span are placed (see TranscriptPagePlacement),
 *  so loading an older page never repeats one. Returns the lower bound of
 *  the span this page took — the `before` for the next older page. */
export declare function foldTranscriptLeaves(events: readonly AgentEvent[], into: TranscriptLeaf[], messages?: readonly AgentMessageView[], page?: TranscriptPagePlacement): number;
/** The transcript page's load state. `ready` keeps its rows while a newer
 *  page reloads (settlement) and while an older window prepends. */
export type TranscriptState = {
    status: 'idle';
} | {
    status: 'loading';
} | {
    status: 'unavailable';
} | ReadyTranscript;
/** A loaded transcript. `messagesFrom` is where the placed agent messages
 *  start (the next older page takes the ones before it); `orphanResults`
 *  are results on the loaded pages whose call is on a page not loaded yet. */
export interface ReadyTranscript {
    readonly status: 'ready';
    readonly agentId: string;
    readonly leaves: TranscriptLeaf[];
    readonly parentAgentId: string | null;
    readonly hasOlder: boolean;
    readonly skippedFromStart: number;
    /** Native opaque paging cursor, when the source does not expose a count. */
    readonly sourceCursor?: string;
    readonly loadingOlder: boolean;
    readonly messagesFrom: number;
    readonly orphanResults: ReadonlyMap<string, ToolResultEvent>;
}
/** The newest page of a child's transcript, folded. */
export declare function foldNewestPage(agentId: string, page: SubagentTranscriptView, messages: readonly AgentMessageView[]): ReadyTranscript;
/** One older page folded in front of a loaded transcript: its agent
 *  messages are the ones before the loaded span, and the results the newer
 *  pages held for its calls settle those calls' cards. */
export declare function foldOlderPage(current: ReadyTranscript, page: SubagentTranscriptView, messages: readonly AgentMessageView[]): ReadyTranscript;
/** One load-older window (messages; matches the backend's newest page). */
export declare const TRANSCRIPT_OLDER_CHUNK = 400;
/** The retained output window both stores keep (channel/activity.ts and
 *  dsh-adapter/subagents.ts): a tail at this size is a WINDOW, and the
 *  output page says so when no transcript source can show the rest. */
export declare const OUTPUT_WINDOW_CAP = 160;
/** A live tail line as the transcript page renders it below the history. */
export type LiveLeaf = {
    kind: 'live';
    line: SubagentOutputLine;
};
/** Render keys must be unique per row: the store's block-per-entry split can
 *  repeat one anchor inside a page (a text, a tool and another text of one
 *  message), so a repeated key gets an ordinal suffix; a leaf is never
 *  dropped for its key. The first occurrence keeps its key, later ones are
 *  copied. */
export declare function uniqueRenderKeys(leaves: readonly TranscriptLeaf[]): TranscriptLeaf[];
/** Prepend one older page's folded leaves. The store splits one API message
 *  into per-block entries sharing the anchor, so a block can only be cut
 *  across pages at the boundary: the older page's last leaf against the
 *  current list's first. Those two merge when they share the key and the
 *  text/thinking kind (the fold already joined everything consecutive
 *  within a page). Every other leaf keeps its own row in the older page's
 *  order: a different kind under the same key is kept, and a tool between
 *  two text parts of one message stays between them. No current leaf is
 *  mutated. */
export declare function prependOlderLeaves(fresh: readonly TranscriptLeaf[], current: readonly TranscriptLeaf[]): TranscriptLeaf[];
/** Merge the channel's live window into the folded history: tool records
 *  pair by call id (live status/previews win while the disk has not
 *  recorded the result; a call the history never saw appends as live),
 *  and text/thinking tail lines the loaded history already paints are
 *  suppressed — a settled block's lines are identical on both sides — so
 *  history and live neither double a row nor drop a tail. */
export declare function mergeLiveWindow(leaves: readonly TranscriptLeaf[], subagent: SubagentState, hasHistory: boolean): (TranscriptLeaf | LiveLeaf)[];
export type TranscriptLoader = (agentId: string, window?: SubagentTranscriptWindow) => Promise<SubagentTranscriptView | null>;
/**
 * The paged history of one child: loads the newest page while `active`,
 * reloads once when `reloadKey` changes (settlement makes the disk copy
 * final), and prepends older windows on demand.
 *
 * The loader and the message feed ride refs: the channel UI proxy mints a
 * fresh loader per read, and a reload must key on what changed (the child,
 * activation, settlement), not on a churning identity. An older window is
 * dropped when the state it was requested for is gone (the view switched
 * to another agent, or a reload moved the newest page under it).
 */
export declare function useSubagentTranscript(loadTranscript: TranscriptLoader | undefined, agentId: string, active: boolean, reloadKey: unknown, messages: readonly AgentMessageView[]): {
    readonly transcript: TranscriptState;
    loadOlder(): void;
};
export {};
//# sourceMappingURL=subagentTranscript.d.ts.map
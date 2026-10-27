import type { SessionTreeData, TreeNode, TreeEntry } from '../adapter/ports/channel-session.js';
export type { SessionTreeData, TreeNode, TreeEntry, TreeEntryKind, SessionTreeMeta, SessionRewindFacts, TurnRange } from '../adapter/ports/channel-session.js';
/**
 * Session family tree — the model behind the /tree screen
 * (pi's Session Tree ported to DSH's cross-session fork model).
 *
 * DSH sessions are linear event logs; a rewind forks a NEW session whose
 * header records `parentSession` + `seedLength` (the inherited prefix). The
 * tree stitches the whole family back together: each session contributes its
 * OWN entries (events at seq >= seedLength when the parent is known), a fork
 * attaches at the parent's last entry with seq <= seedLength-1, and the
 * parent's own tail past that point is the abandoned "main" branch.
 *
 * Pure module: no Ink, no channel state — channel.ts gathers the logs, this
 * file shapes them. Rendering lives in screens/SessionTree.tsx.
 *
 * @module @deepseek-harness-tui/dsh-tui/sessionTree
 */
import type { SessionEvent } from '@deepseek-ai/dsh-session';
/** Filter modes cycled in the tree screen (pi parity, minus labels). */
export type TreeFilter = 'default' | 'no-tools' | 'user-only' | 'all';
export declare const TREE_FILTERS: readonly TreeFilter[];
/** One family member's log, as channel.buildSessionTree gathered it. */
export interface FamilySession {
    readonly id: string;
    readonly createdAt: number;
    readonly parentSession?: string;
    readonly seedLength?: number;
    /** This log's events (inherited seed prefix + own events), in log order.
     *  A coverage-skipped read starts at the first seq no ancestor displays —
     *  possibly mid-log — with only rare session/title events below the
     *  cutoff. Never trust events[0].seq === 0. */
    readonly events: readonly SessionEvent[];
    /** True for the live session (events from memory, not persistence). */
    readonly live: boolean;
    /** True when the log could not be read — structure-only node, no entries. */
    readonly unreadable?: boolean;
    /** True when the log was never read because the tree's event/scan budget
     *  was already spent — structure-only placeholder, distinct from
     *  unreadable (the log is fine; the browse budget is not). */
    readonly unloaded?: boolean;
    /** True when `events` reaches the log's tip. Live memory logs always
     *  qualify (the tail window trims the HEAD only); bounded reads of dead
     *  branches slice the tail off when the event budget runs out. The
     *  branch-adopt target (tipBoundary) and the drop-turn confirm warning are
     *  only safe to derive when this holds — otherwise the unseen tail could
     *  hold content the UX claims does not exist. */
    readonly tailComplete?: boolean;
}
/** What dropping a user-message pick's turn removes (the confirm warning). */
export interface DropTurnInfo {
    /** Own entries of the session inside the dropped turn. */
    readonly droppedEntries: number;
    /** Every own entry of the session sits inside the dropped turn, and the
     *  loaded log reaches the tip — so the fork will show NONE of this
     *  branch's own content. (The user's "click the branch message → lose the
     *  whole branch" trap: a branch whose own content is one turn.) */
    readonly coversBranch: boolean;
}
/**
 * Confirm-time preview for a USER-message pick: how much of its branch the
 * drop removes. Undefined for non-user entries (they keep through their
 * step) and whenever the turn cannot be located in the loaded events.
 */
export declare function droppedTurnInfo(data: SessionTreeData, entry: TreeEntry): DropTurnInfo | undefined;
/** One flattened, render-ready row with its tree-drawing geometry. */
export interface FlatNode {
    readonly node: TreeNode;
    /** Tree-parent node id (null for roots) — cursor preservation walks this.
     *  Set by flattenTree and NEVER rewritten by filterTree (rows are shared
     *  across filter passes; a rewritten hop would skip ancestors). */
    readonly parentId: string | null;
    /** Indentation level (each level = 3 chars), pi's rules. */
    indent: number;
    /** Whether to draw a connector (├─/└─) — parent has multiple children. */
    showConnector: boolean;
    /** Under a connector: true = last sibling (└─). */
    isLast: boolean;
    /** Ancestor branch points: position (indent level) + whether │ continues. */
    gutters: readonly GutterInfo[];
    /** Root under a virtual branching root (multiple roots). */
    isVirtualRootChild: boolean;
    /** True when this pass produced multiple roots (screen shifts display). */
    multipleRoots: boolean;
}
export interface GutterInfo {
    position: number;
    show: boolean;
}
/**
 * Coalesce runs of same-type assistant/chunk deltas into single synthetic
 * events for REPLAY only. A streamed pre-V3 turn logs one event per token
 * (~100k events in long sessions); replaying them one at a time costs
 * per-chunk string growth on every row (quadratic in the turn's length).
 * Merging is outcome-identical: ensureStreaming/ensureReasoning only read
 * chunk.type and the concatenated text, and the row's seq comes from the
 * run's FIRST chunk (the fork boundary rewindToNode derives from it). Parts
 * join once — no quadratic concat. Live events never go through this.
 *
 * Pre-V3 durable logs only: 0.1.5 removed `assistant/chunk` from the event
 * union (V3 embeds the compacted stream in `assistant/message.stream`), so
 * the merger works on the widened structural shape — runtime payloads from
 * raw pre-V3 logs remain typed as SessionEvent by the reader.
 *
 * (Moved from channel.ts: the transcript replay and the tree extraction
 * share it.)
 */
export declare function coalesceReplayEvents(events: readonly SessionEvent[]): SessionEvent[];
/**
 * Fork boundary for rewinding to the entry at `seq`: the seq just before its
 * enclosing turn/start (DSH logs `turn/start → user/message → … → turn/end`,
 * so a message's own seq sits inside an open turn and fork would reject it).
 * This is the DROP-THE-TURN boundary — used for user messages (the turn is
 * dropped, its prompt returns to the input) and as the fallback for entries
 * of a still-open turn. Falls back to `seq` itself when no enclosing
 * turn/start exists (bookkeeping between turns).
 */
export declare function turnBoundary(events: readonly SessionEvent[], seq: number): number;
/** Where rewinding to a tree entry lands — see rewindTarget. */
export interface RewindTarget {
    /** Inclusive seed boundary (a seq into the FULL contiguous log). */
    readonly boundary: number;
    /**
     * Set when the boundary cuts a turn in the middle: the fork must append a
     * synthetic turn/end for this turn number (the exact shape a real user
     * cancellation writes). Undefined when the seed already ends turn-closed.
     */
    readonly closeTurn?: number;
}
/**
 * Rewind target for a tree entry — pi's navigateTree semantics mapped onto
 * DSH's turn-closed fork constraint (the seed must not end inside an open
 * turn). Callers must pass the FULL session log (seq === array index).
 *
 *  - user message → DROP its turn: the seq just before the enclosing
 *    turn/start (turnBoundary); the turn's prompt returns to the input for
 *    re-editing. -1 when that turn is the log's own first turn.
 *  - any other entry inside a CLOSED turn (assistant/tool/notice/interrupt)
 *    → KEEP through the entry's enclosing STEP: the boundary is that step's
 *    step/end, with closeTurn set. DSH agentic turns are marathons (one
 *    prompt → N steps → thousands of events), so turn-granular keeping is
 *    useless mid-turn — picking a bash call of step 2 in a 6-step turn must
 *    not retain steps 3-6. The step is the finest SAFE cut: a step closes
 *    with every tool call answered, so the replayed context never dangles a
 *    tool_call the API would reject. When no step/end follows the entry
 *    inside its turn (no-step turns, or the entry sits past the last step),
 *    the boundary is the turn/end as before (no closeTurn).
 *  - entry between turns (a compact checkpoint) → its own seq.
 *  - entry inside the still-OPEN last turn → a closed step ahead of it is
 *    still a valid mid-turn cut (closeTurn set; the open tail drops); with no
 *    step/end ahead the turn cannot be kept at all, so it falls back to
 *    dropping the turn (turnBoundary) and restoring its prompt.
 */
export declare function rewindTarget(events: readonly SessionEvent[], seq: number): RewindTarget;
/**
 * Fork target for a tree entry — pi's `/fork` semantics: the picked entry is
 * KEPT (a fork branches the conversation; it does not re-edit the past).
 *
 *  - user message → keep THROUGH the message itself: the boundary is the
 *    entry's own seq and the turn's reply drops. The cut ends inside the
 *    still-open turn, so closeTurn carries the enclosing turn's number for
 *    the synthetic turn/end (the same shape a real interrupt writes). A
 *    between-turns plugin message (a compact checkpoint) is already
 *    turn-closed — no closer.
 *  - any other entry → identical to rewindTarget (keep through the
 *    entry's enclosing step / turn end).
 *
 * Unlike a rewind pick, a turn-0 user message forks fine (boundary = its own
 * seq, never -1), and nothing returns to the input for re-editing.
 */
export declare function forkTarget(events: readonly SessionEvent[], seq: number): RewindTarget;
/**
 * Tail window of an over-budget LIVE session's events, aligned to whole
 * turns. Recent turns are the likely rewind targets, so the budget keeps
 * the tail — but a slice can open mid-turn, and entries of a partial turn
 * make broken rows: when that partial turn is the log's OWN first turn its
 * rewind boundary is -1 ("cannot rewind to the very first message"), yet
 * the slice hides the turn/start@0 that firstTurn marking keys on — the
 * row would confirm and then fail inside rewindToNode. So: align to the
 * first whole turn inside the window. When the window holds no turn/start
 * at all, the log's LAST turn alone overflows the budget — retry over the
 * log before that turn: its earlier complete turns are perfectly good
 * rewind targets and must not vanish behind one giant turn. Only when the
 * oversized turn IS the log's own first turn does the window drop to empty
 * — no complete turn in view means no safe rewind target to show. Entries
 * dropped here stay rewindable through the real session; the slice only
 * narrows what the tree displays.
 */
export declare function liveTailWindow(events: readonly SessionEvent[], remaining: number): readonly SessionEvent[];
/** The turn's first human-typed text (the prompt rewind restores for editing). */
export declare function turnUserText(events: readonly SessionEvent[], seq: number): string;
/**
 * One session's displayable entries, in seq order. Mirrors renderEvent's
 * choices (channel.ts): human user messages only, compaction checkpoints as
 * compact rows, assistant text (chunk-only text from aborted turns kept with
 * an `aborted` label), tool cards minus ask_user_question, interrupts and
 * failed turns. Bookkeeping events (turn/step markers, titles, requests,
 * `session/end-seed`, activity frames…) never become entries.
 */
export declare function extractEntries(sessionId: string, events: readonly SessionEvent[]): TreeEntry[];
/**
 * Assemble the family tree. Roots are sessions with no parentSession (or a
 * parent missing from the family — a deleted log; the orphan's self-contained
 * prefix keeps its history whole). Fork chains attach at the last entry with
 * seq <= seedLength-1, walking UP the ancestor chain when the direct parent
 * no longer displays that entry (seed-prefix trimming — the fork point lives
 * in the shared prefix an ancestor shows); the anchored session's own tail
 * past the anchor stays the first (main) branch. Sessions with no own
 * entries get one placeholder node so the fork structure stays visible.
 */
export declare function buildSessionTree(sessions: readonly FamilySession[], liveSessionId: string, truncated?: boolean): SessionTreeData;
/**
 * Flatten the tree into render rows, pi-style: the subtree containing the
 * active leaf sorts first at every branch point; single-child chains keep
 * their indent, branch points indent +1 (plus the first generation after a
 * branch); gutters record where ancestor │ lines continue.
 */
export declare function flattenTree(roots: readonly TreeNode[], activeLeafId: string | null): FlatNode[];
/**
 * Filter + search the flattened tree, then recompute the tree drawing over
 * the visible rows (each visible node re-hangs under its nearest visible
 * ancestor, so hidden intermediates don't drift the indent). The active leaf
 * always survives filtering (pi keeps the current position visible).
 */
export declare function filterTree(flat: readonly FlatNode[], activeLeafId: string | null, filter: TreeFilter, query: string): FlatNode[];
/**
 * Index of `targetId` in `visible`, walking the FULL list's parent chain when
 * the exact node was filtered out; falls back to the last visible row
 * (pi's findNearestVisibleIndex).
 */
export declare function nearestVisibleIndex(visible: readonly FlatNode[], full: readonly FlatNode[], targetId: string | null): number;
//# sourceMappingURL=sessionTree.d.ts.map
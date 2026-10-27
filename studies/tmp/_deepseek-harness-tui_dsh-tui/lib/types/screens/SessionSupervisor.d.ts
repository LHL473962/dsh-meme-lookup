import React from 'react';
import { SpinnerGlyph } from '../components/Spinner/SpinnerGlyph.js';
import type { PermissionPanelDecision, PermissionPanelOutcome, PermissionPanelSnapshot } from '../channel/permissions.js';
import type { TuiWorkspaceTarget } from '../workspaces.js';
import type { ChannelUi as Channel } from '../adapter/channel/ui-policy.js';
import type { ResumeResult } from '../adapter/ports/channel-view.js';
import { SupervisorLiveState, sessionMatchesQuery } from './sessionSupervisor/model.js';
export { sessionMatchesQuery };
/**
 * The unified session screen — `/resume`, `/agentview`, `/home` and the 🏠
 * button all land here.
 *
 * Those were three screens over one domain, which is why they kept needing
 * patches to agree with each other. This is the single surface: the workspace
 * rail on the left (the durable ledger a person manages — add, rename,
 * remove), the sessions of the selected workspace on the right, and every
 * session's LIVE state on its own row.
 *
 * The runtime it presents is a single model, and the screen is where that
 * model becomes visible:
 *
 * - This terminal hosts many sessions at once. A row that is `working` keeps
 *   working when you leave it — switching changes what you are looking at, it
 *   does not stop anything. The parked rows stay in the list with a live
 *   glyph, so "where did my other session go" has an answer on screen.
 * - A session held by another TUI terminal is shown as OCCUPIED (red, with the
 *   holder's pid) and cannot be entered. Two processes driving one
 *   append-only session log would interleave its events, so the screen refuses
 *   rather than races; the entry becomes available on its own once that
 *   process exits, because occupancy is proven by liveness rather than by a
 *   flag someone has to remember to clear.
 *
 * @param props - Channel, home directory, the opening/新 actions, and the live
 *   state + occupancy lookups the screen renders from.
 * @returns The screen, or null while the host has no channel to read.
 */
export declare function SessionSupervisor({ channel, home, onClose, onOpenSession, onNewSession, onStopSession, approval, onApprove, liveStateOf, }: {
    channel: Channel;
    /** Home directory, for collapsing paths to `~`. */
    home: string;
    /** Leave the screen and show the conversation. */
    onClose(): void;
    /** Mount a persisted session (the channel's unified resume path). */
    onOpenSession(sessionId: string): Promise<ResumeResult>;
    /** Start a fresh session in the workspace at `path`. */
    onNewSession(target: TuiWorkspaceTarget): Promise<boolean>;
    /** Stop a background session of this terminal; false when it is not ours. */
    onStopSession(sessionId: string): Promise<boolean>;
    /**
     * The parked approval ask (any session's), so a background session's
     * permission prompt is answerable without leaving this screen — the one
     * thing a parked session cannot wait indefinitely for.
     */
    approval: PermissionPanelSnapshot | null;
    onApprove(outcome: PermissionPanelOutcome, decision: PermissionPanelDecision): void;
    /**
     * This terminal's live state for a session, or undefined when it has none.
     * Read from the channel's agent-view projection so the list agrees with the
     * overview's own rows by construction.
     */
    liveStateOf(sessionId: string): SupervisorLiveState | undefined;
}): React.ReactNode;
/**
 * Scroll anchor for the rail: the first entry index to show.
 *
 * A pure helper (exported for the headless regression) because the rail's
 * window has to hold the focused row without re-shuffling under a stationary
 * cursor — the same anchoring rule the session list uses.
 *
 * `focus` is a plain entry index: the rail's rows ARE the ledger, so the cursor
 * and the selection are one position and the window math takes that position
 * directly. It used to be offset by the `+` row that led the rail, which is
 * gone — a workspace joins the ledger by being a terminal's launch directory.
 *
 * `capacity` is a count of ENTRIES, not of terminal rows. It used to be handed
 * the row count, which is wrong for this list in a way that hides the cursor:
 * each entry is {@link WORKSPACE_ROW_LINES} rows tall, so treating rows as
 * entries made the window believe it could show twice as many workspaces as it
 * can, and the focused entry was simply clipped away by `overflow="hidden"`
 * while the user navigated it blind.
 */
export declare function railWindowTop(focus: number, entryCount: number, capacity: number): number;
/** Re-exported so a regression can drive the spinner without importing ink. */
export { SpinnerGlyph };
//# sourceMappingURL=SessionSupervisor.d.ts.map
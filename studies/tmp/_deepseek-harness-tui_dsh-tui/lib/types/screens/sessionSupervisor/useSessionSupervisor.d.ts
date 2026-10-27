/**
 * Data, derived state and actions for the unified session screen.
 *
 * The screen keeps only assembly and key routing; everything that answers "what
 * is on screen and what does an action do" lives here. That is what makes the
 * two panes presentational and the derivations reachable from a regression.
 *
 * Two ownership rules must not be duplicated anywhere else:
 * - the cursor is ONE fact; every index is derived from it, so movement,
 *   rendering and Enter can never disagree;
 * - occupancy is re-read from the ledger on this screen own pulse and never
 *   captured from the parent render.
 */
import React from 'react';
import type { SessionSummary } from '../../dsh-adapter/sessions/index.js';
import type { TuiWorkspaceEntry, TuiWorkspaceTarget } from '../../workspaces.js';
import type { ChannelUi as Channel } from '../../adapter/channel/ui-policy.js';
import type { ResumeResult } from '../../adapter/ports/channel-view.js';
import { SupervisorLiveState, RailEntry } from './model.js';
/** Everything the screen owns that the model needs to read. */
export interface SessionSupervisorInput {
    readonly channel: Channel;
    /** Home directory, for collapsing paths to `~`. */
    readonly home: string;
    /** Mount a persisted session (the channel unified resume path). */
    onOpenSession(sessionId: string): Promise<ResumeResult>;
    /** Start a fresh session in the workspace at `path`. */
    onNewSession(target: TuiWorkspaceTarget): Promise<boolean>;
    /** Stop a background session of this terminal; false when it is not ours. */
    onStopSession(sessionId: string): Promise<boolean>;
    /** This terminal live state for a session, or undefined when it has none. */
    liveStateOf(sessionId: string): SupervisorLiveState | undefined;
    readonly columns: number;
    readonly rows: number;
}
/**
 * Derive the whole screen model.
 * @param input - Channel, home, the opening/stop actions and the live lookup.
 * @returns Every value the screen renders from, plus the action callbacks.
 */
export declare function useSessionSupervisor(input: SessionSupervisorInput): {
    dshBackend: boolean;
    archiveSessions: boolean;
    sessionRename: {
        id: string;
        draft: string;
    } | undefined;
    setSessionRename: React.Dispatch<React.SetStateAction<{
        id: string;
        draft: string;
    } | undefined>>;
    confirmDelete: string | undefined;
    setConfirmDelete: React.Dispatch<React.SetStateAction<string | undefined>>;
    renameSession: (sessionId: string, title: string) => void;
    deleteSession: (session: SessionSummary) => void;
    entries: readonly RailEntry[];
    sessions: readonly SessionSummary[];
    loading: boolean;
    refreshing: boolean;
    notice: {
        text: string;
        tone: "info" | "error";
    } | undefined;
    setNotice: React.Dispatch<React.SetStateAction<{
        text: string;
        tone: "info" | "error";
    } | undefined>>;
    query: string;
    setQuery: React.Dispatch<React.SetStateAction<string>>;
    holderOf: (sessionId: string) => number | undefined;
    listedSessions: readonly SessionSummary[];
    railEntries: readonly RailEntry[];
    countOf: (entry: RailEntry) => number;
    railFocus: number;
    setRailFocus: React.Dispatch<React.SetStateAction<number>>;
    setFocusSessionId: (id: string | undefined) => void;
    activePane: "list" | "rail";
    pins: ReadonlySet<string>;
    menu: {
        path: string;
        col: number;
        row: number;
        item: number;
    } | undefined;
    setMenu: React.Dispatch<React.SetStateAction<{
        path: string;
        col: number;
        row: number;
        item: number;
    } | undefined>>;
    rename: {
        path: string;
        draft: string;
    } | undefined;
    setRename: React.Dispatch<React.SetStateAction<{
        path: string;
        draft: string;
    } | undefined>>;
    confirmRemove: string | undefined;
    setConfirmRemove: React.Dispatch<React.SetStateAction<string | undefined>>;
    railRef: React.RefObject<number>;
    menuRef: React.RefObject<{
        path: string;
        col: number;
        row: number;
        item: number;
    } | undefined>;
    queryRef: React.RefObject<string>;
    now: number;
    reload: () => Promise<void>;
    selected: RailEntry | undefined;
    visibleSessions: SessionSummary[];
    sessionIndex: number;
    cardFocused: boolean;
    sessionAt: (index: number) => SessionSummary | undefined;
    activateList: () => void;
    activateRail: () => void;
    railWidth: number;
    railVisible: boolean;
    sessionWidth: number;
    railEntryCapacity: number;
    sessionListHeight: number;
    noticeRows: string[];
    persistPin: (id: string, pinned: boolean) => void;
    selectEntry: (entry: RailEntry) => void;
    openSession: (session: SessionSummary) => void;
    newSessionIn: (entry: TuiWorkspaceEntry) => void;
    renameEntry: (path: string, title: string) => void;
    removeEntry: (path: string) => void;
    stopSession: (session: SessionSummary) => void;
    closeMenu: () => void;
    activateMenu: (entry: RailEntry, item: number) => void;
    moveRail: (by: 1 | -1) => void;
    moveSession: (by: 1 | -1) => void;
    focusedSession: SessionSummary | undefined;
};
//# sourceMappingURL=useSessionSupervisor.d.ts.map
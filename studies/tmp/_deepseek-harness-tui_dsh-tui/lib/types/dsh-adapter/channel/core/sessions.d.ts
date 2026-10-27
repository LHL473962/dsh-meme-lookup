/**
 * Session lifecycle actions the core serves for a session no extension
 * claims: the session browser's catalog (listing, preview, rename, delete,
 * the launcher's last-session marker), `/resume`, `/fork` and the double-Esc
 * rewind. They are backed by the backend's offline `SessionCatalog`, its
 * `openSession` and the bound session's `fork` / `rewind` capabilities. A
 * missing backing is an explicit `capability-unavailable-backend`, never a
 * silent no-op.
 *
 * Within one backend per process: the catalog lists the bound backend's
 * sessions and a resume opens one of them; switching backends inside one
 * running TUI is not offered (a launch-time choice, `--backend`).
 */
import type { SessionCatalog } from '../../../agent/backend.js';
import type { AgentSession } from '../../../agent/session.js';
import type { ChannelActionDelegates } from '../action-readiness.js';
import type { ChannelOwner } from '../owner.js';
import type { ChannelLaunchOptions } from '../state.js';
import type { TuiRewindMode } from '../../../adapter/ports/channel-session.js';
import type { ChannelState, ChatRow, ResumeResult } from '../types.js';
export declare function createCoreSessionActions(deps: {
    owner: Pick<ChannelOwner, 'current' | 'own'>;
    session(): AgentSession;
    state: () => ChannelState;
    notify: ChannelState['notify'];
    unavailable(name: string): void;
    catalog: SessionCatalog | undefined;
    prefs: ChannelLaunchOptions['sessionPrefs'];
    resumeCommand: ChannelLaunchOptions['resumeCommand'];
    /** The core `/resume` transaction (session-switch.ts). */
    resume(sessionId: string, kind: 'resume' | 'rewind'): Promise<ResumeResult>;
    /** Whether `/resume` is offered (the backend's `open` and catalog). */
    canOpen: boolean;
}): {
    delegates: Partial<ChannelActionDelegates>;
    promptRewind: (row: ChatRow) => Promise<{
        modes: readonly TuiRewindMode[];
    } | "cancel" | null>;
};
//# sourceMappingURL=sessions.d.ts.map
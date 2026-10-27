/**
 * Session-level facts a backend reports through its typed capabilities: its
 * native permission mode, reasoning effort, own slash commands, subscription
 * usage, and the context / MCP reports the synchronous `/context` and `/mcp`
 * read. The shared projector owns the transcript; these are the facts it
 * leaves to the channel. A composition whose extension maintains these facts
 * itself (DSH) never installs the observer (`ownsSessionFacts`).
 */
import type { LocalCommand } from '../../../adapter/ports/channel-catalog.js';
import type { AgentEvent } from '../../../agent/events.js';
import type { AgentSession } from '../../../agent/session.js';
import type { ChannelState } from '../types.js';
/** The built-in commands a capability snapshot serves, in catalog order. A
 *  snapshot serving every built-in keeps the catalog itself (identity).
 *  `permission` is not a LOCAL_COMMANDS name: it appears only when the
 *  snapshot appended it for the session's typed `modes` capability (see
 *  channel/capabilities.ts), and then rides as BACKEND_PERMISSION_COMMAND.
 *  `channel` follows the same ride-along for the typed `channels`
 *  capability (BACKEND_CHANNEL_COMMAND), `goal` for `goals`
 *  (BACKEND_GOAL_COMMAND). */
export declare function localCommandsFor(names: readonly string[]): readonly LocalCommand[];
export declare function createSessionControls(deps: {
    state: () => ChannelState;
    /** The user-facing backend name the backend's own commands are tagged with. */
    backendLabel(): string;
}): {
    seed: (session: AgentSession, current: () => boolean) => void;
    observe: (batch: readonly AgentEvent[], session: AgentSession, current: () => boolean) => void;
    reset: () => void;
    refreshCommandList: () => void;
    /** Re-resolve the channel model display now (the /channel switch path). */
    refreshModelDisplay: (session: AgentSession) => void;
    /** The last MCP report, refreshing it for next time (`/mcp` is synchronous). */
    mcpReport(session: AgentSession, current: () => boolean): string[] | undefined;
    /** The server names of the last report (undefined before one). */
    mcpServers: () => readonly string[] | undefined;
};
export type SessionControls = ReturnType<typeof createSessionControls>;
//# sourceMappingURL=session-controls.d.ts.map
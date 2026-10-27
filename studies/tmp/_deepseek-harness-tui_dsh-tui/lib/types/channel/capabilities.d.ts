/**
 * The UI's capability snapshot of a bound session (`ChannelUi.backendCapabilities`):
 * plain readonly data derived once per binding from the session's typed
 * capabilities. The composition root says whether the session is a DSH
 * session (only the DSH directory may look at `native.dsh`); a DSH session
 * supports everything the TUI offers today, any other session exactly what
 * its capabilities declare.
 */
import type { ChannelCapabilities } from '../adapter/ports/channel-view.js';
import type { SessionCapabilities } from '../agent/capabilities.js';
/** Build the snapshot for one bound session. */
export declare function channelCapabilities(input: {
    readonly backendId: string;
    readonly backendLabel: string;
    readonly capabilities: SessionCapabilities;
    /** The session carries the DSH specialists' escape hatch. */
    readonly dsh: boolean;
    /** The channel can reopen this backend's persisted sessions (its catalog
     *  and `open` are wired); DSH sessions always can. */
    readonly resume?: boolean;
    /** The backend catalog's optional, non-destructive removal semantics. */
    readonly deleteAction?: 'archive';
}): ChannelCapabilities;
//# sourceMappingURL=capabilities.d.ts.map
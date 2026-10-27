import React from 'react';
import type { ChannelUi as Channel } from '../adapter/channel/ui-policy.js';
/**
 * The session family tree — `/tree` as a screen of its own (pi's Session
 * Tree over DSH's cross-session fork model).
 *
 * The tree shows every branch the conversation ever took: each rewind fork
 * is stitched back onto the message it diverged from, the live path is
 * marked with `•`, and every other branch stays reachable. Picking a node
 * offers the ways DSH can act on it — rewind (drop the turn, edit its
 * prompt), fork (keep the entry, branch here), adopt (switch to a dead
 * branch whole).
 *
 * Interaction is mouse-first but keyboard-complete: hovering a row shows its
 * full text in the preview pane, clicking it opens the action menu, and the
 * same actions sit on Enter / Ctrl+F / Ctrl+B for the keyboard path. The
 * confirm seat stands between every high-risk action and the fork.
 */
export declare function SessionTree({ channel, currentSessionId, onClose, onRestoreText, }: {
    channel: Channel;
    /** Live session id at open time (adopt-live refusal, menu labels). */
    currentSessionId: string;
    onClose: () => void;
    /** The dropped turn's prompt goes back into the input for re-editing. */
    onRestoreText: (text: string) => void;
}): React.ReactNode;
//# sourceMappingURL=SessionTree.d.ts.map
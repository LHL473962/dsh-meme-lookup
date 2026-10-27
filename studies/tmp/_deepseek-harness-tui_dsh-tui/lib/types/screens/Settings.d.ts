import React from 'react';
import type { ChannelUi as Channel } from '../adapter/channel/ui-policy.js';
import type { TuiStatusFieldEntry } from '../dsh-adapter/status.js';
/**
 * The settings screen — `/settings` as a screen of its own (issue #165).
 *
 * The TUI owns only presentation here: plugin-declared sections from the
 * `tuiSettingsSections` seam render as editable forms; every write goes back
 * through the dsh settings service (revision-fenced `mutate` path ops) or the
 * credentials seam (secret fields, blank-until-typed).
 *
 * Edits auto-save: toggling a boolean/select writes on the spot, confirming a
 * text draft writes on Enter, and Esc just leaves — there is no save key and
 * nothing to discard. The SettingsForm still stages drafts under the hood (its
 * snapshot save keeps rapid successive edits serialized; see
 * settingsEditor.ts), so the brief in-flight window and a failed save keep
 * their `*` / badge feedback.
 */
export declare function Settings({ channel, onClose, statusFields, }: {
    channel: Channel;
    onClose: () => void;
    /** Live plugin footer fields (`tuiStatus.setField`) the picker enumerates.
     *  Chat already subscribes to the same store and hands the snapshot down. */
    statusFields?: readonly TuiStatusFieldEntry[];
}): React.ReactNode;
//# sourceMappingURL=Settings.d.ts.map
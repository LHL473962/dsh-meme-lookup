import React from 'react';
import type { LoadedContext } from '../dsh-adapter/channel.js';
/**
 * The startup context panel: a collapsed one-line summary of what a
 * fresh conversation will load for the current agent (system prompt
 * sections, workspace instruction files, dynamic context, skill catalog,
 * tools), expandable to the grouped details with Ctrl+P. The `/context`
 * local command still prints the same details as a transcript report.
 * The panel renders only while the transcript is still empty — the first
 * message's rows take over. Renders nothing for an empty snapshot.
 * @param context - the channel's loaded-context snapshot.
 * @param open - whether the grouped details are shown.
 * @param onToggle - flips `open`; fired by the Ctrl+P keybinding.
 */
export declare function LoadedContextPanel({ context, open, onToggle, }: {
    context: LoadedContext;
    open: boolean;
    onToggle: () => void;
}): React.ReactNode;
//# sourceMappingURL=LoadedContextPanel.d.ts.map
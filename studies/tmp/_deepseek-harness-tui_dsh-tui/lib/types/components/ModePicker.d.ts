import React from 'react';
import type { BackendModeOption } from '../dsh-adapter/channel.js';
/**
 * `/permission` picker over a backend's native permission modes (the typed
 * `modes` capability). Same visual family as the DSH preset picker
 * (PermissionsPicker): one Pane + Select + hint line, the roster swapped
 * for the backend's own mode list. The list is rendered verbatim —
 * whatever `modes.list()` offers (including a session-start bypass
 * opt-in) is what the user may pick; the TUI adds no filtering of its own.
 */
export declare function ModePicker({ modes, focusIndex, currentId, onPick, }: {
    modes: readonly BackendModeOption[];
    focusIndex: number;
    /** The live mode id, for the selected-row checkmark. */
    currentId: string | undefined;
    /** Mouse pick (fullscreen): clicked row's absolute index (Chat applies
     *  the same code path as the keyboard Enter). */
    onPick?: (index: number) => void;
}): React.ReactNode;
//# sourceMappingURL=ModePicker.d.ts.map
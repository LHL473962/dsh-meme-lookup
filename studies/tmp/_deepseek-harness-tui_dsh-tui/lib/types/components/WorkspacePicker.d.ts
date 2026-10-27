import React from 'react';
import type { TuiWorkspaceTarget } from '../workspaces.js';
/** `/workspace` target picker contributed by local and optional providers. */
export declare function WorkspacePicker({ targets, focusIndex, currentCwd, onPick, }: {
    targets: readonly TuiWorkspaceTarget[];
    focusIndex: number;
    currentCwd: string;
    /** Mouse pick (fullscreen): reports the clicked row's absolute index —
     *  Chat applies it with the same code path as the keyboard Enter. */
    onPick?: (index: number) => void;
}): React.ReactNode;
//# sourceMappingURL=WorkspacePicker.d.ts.map
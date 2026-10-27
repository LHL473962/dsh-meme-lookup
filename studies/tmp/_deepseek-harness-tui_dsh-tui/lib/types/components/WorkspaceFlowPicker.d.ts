import React from 'react';
import type { TuiWorkspaceChoice } from '../workspaces.js';
/** Generic nested choice surface returned by a workspace provider command. */
export declare function WorkspaceFlowPicker({ title, choices, focusIndex, busy, input, onPick, }: {
    title: string;
    choices: readonly TuiWorkspaceChoice[];
    focusIndex: number;
    busy?: boolean;
    input?: {
        value: string;
        cursor: number;
        placeholder?: string;
    } | null;
    /** Mouse pick (fullscreen): reports the clicked row's absolute index —
     *  Chat applies it with the same code path as the keyboard Enter. Rows
     *  are inert while busy (keyboard is swallowed too) and while the inline
     *  text input owns the interaction. */
    onPick?: (index: number) => void;
}): React.ReactNode;
//# sourceMappingURL=WorkspaceFlowPicker.d.ts.map
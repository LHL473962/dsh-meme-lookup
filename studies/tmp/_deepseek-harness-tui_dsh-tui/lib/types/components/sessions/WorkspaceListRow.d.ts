import React from 'react';
import type { ClickEvent } from '../../ink/events/click-event.js';
import type { WorkspaceGroup } from '../../sessions/view.js';
/** One two-line working-directory choice in the /resume browser. */
export declare function WorkspaceListRow({ workspace, all, totalProjects, totalSessions, width, focused, selected, home, now, onClick, }: {
    workspace?: WorkspaceGroup;
    all?: boolean;
    totalProjects: number;
    totalSessions: number;
    width: number;
    focused: boolean;
    selected: boolean;
    home: string;
    now: number;
    onClick?(event: ClickEvent): void;
}): React.ReactNode;
//# sourceMappingURL=WorkspaceListRow.d.ts.map
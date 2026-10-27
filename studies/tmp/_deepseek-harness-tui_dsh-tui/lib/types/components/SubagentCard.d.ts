import React from 'react';
import type { SubagentState } from '../dsh-adapter/subagents.js';
import type { ClickEvent } from '../ink/events/click-event.js';
import type { TeamMemberStatus } from './teamRoster.js';
export interface SubagentCardProps {
    subagent: SubagentState;
    focused?: boolean;
    onClick?(event: ClickEvent): void;
    variant?: 'default' | 'panel';
    /** Agent Teams: the row is this teammate — its name replaces the
     *  description and its member state replaces the run status. */
    teamMember?: {
        readonly name: string;
        readonly status: TeamMemberStatus;
    };
}
/** Status glyph and color of a team member (`·`-style in minimal UI). */
export declare function teamStatusGlyph(status: TeamMemberStatus, minimalUi: boolean): {
    readonly glyph: string;
    readonly color?: 'warning' | 'subtle' | 'error' | 'accent';
};
export declare function SubagentCard({ subagent, focused, onClick, variant, teamMember }: SubagentCardProps): React.ReactNode;
//# sourceMappingURL=SubagentCard.d.ts.map
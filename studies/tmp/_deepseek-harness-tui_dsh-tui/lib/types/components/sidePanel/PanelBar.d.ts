import React from 'react';
export type PanelBadgeLevel = 'info' | 'warning' | 'error';
export interface PanelBarTab {
    readonly id: string;
    readonly title: string;
    readonly icon?: string;
    readonly badge?: {
        readonly level: PanelBadgeLevel;
        readonly unread: number;
    } | null;
}
export interface PanelBarProps {
    readonly tabs: readonly PanelBarTab[];
    readonly activeId: string | undefined;
    readonly width: number;
    readonly focused: boolean;
    readonly canExpand?: boolean;
    readonly onExpand?: () => void;
    readonly onSelect?: (id: string) => void;
}
export declare function PanelBar({ tabs, activeId, width, focused, canExpand, onExpand, onSelect }: PanelBarProps): React.ReactNode;
//# sourceMappingURL=PanelBar.d.ts.map
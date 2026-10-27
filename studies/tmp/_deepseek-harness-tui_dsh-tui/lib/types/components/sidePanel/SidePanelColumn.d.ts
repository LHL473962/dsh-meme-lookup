/**
 * SidePanelColumn: PanelBar, the active panel surface and a one-row key hint.
 * The hint follows focus, and the rules brighten with the divider as one surface.
 * Tabs follow the enabled registration order and carry each panel's icon and badge.
 */
import React from 'react';
import type { ChannelUi } from '../../adapter/channel/ui-policy.js';
import type { SidePanelController } from './useSidePanel.js';
export interface SidePanelColumnProps {
    readonly width: number;
    readonly controller: SidePanelController;
    readonly channel: ChannelUi;
    readonly activity?: import('../../dsh-adapter/activity-store.js').ActivityView;
    readonly attention?: {
        readonly approvals: number;
        readonly questions: number;
    };
    /** 宿主提供的「全屏」出口（Chat 把活动面板切到整屏形态）。 */
    readonly onExpand?: (panelId: string) => void;
    /** 会话轨迹投影（轨迹 Panel 的数据源）。 */
    readonly trajectory?: import('../../dsh-adapter/trajectory/index.js').TrajBuild;
}
export declare function SidePanelColumn({ width, controller, channel, activity, attention, onExpand, trajectory }: SidePanelColumnProps): React.ReactNode;
//# sourceMappingURL=SidePanelColumn.d.ts.map
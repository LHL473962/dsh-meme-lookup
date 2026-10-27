/**
 * /panel 无参的面板选择器：Pane + Select 行列出「已启用 ∩ 已注册」的
 * 面板（内置与插件同席——图标、标题、badge 状态点都来自 PanelStore），
 * 当前活动面板带 current 标记。Enter 打开并聚焦，Esc 取消。
 */
import React from 'react';
import type { SidePanelController } from './useSidePanel.js';
export interface PanelPickerRow {
    readonly id: string;
    readonly title: string;
    readonly icon?: string;
    readonly badge?: {
        readonly level: 'info' | 'warning' | 'error';
        readonly unread: number;
    } | null;
}
export declare function usePanelPickerRows(controller: SidePanelController): readonly PanelPickerRow[];
export declare function PanelPicker({ rows, focusIndex, activeId, onPick, }: {
    readonly rows: readonly PanelPickerRow[];
    readonly focusIndex: number;
    readonly activeId: string | undefined;
    readonly onPick?: (index: number) => void;
}): React.ReactNode;
//# sourceMappingURL=PanelPicker.d.ts.map
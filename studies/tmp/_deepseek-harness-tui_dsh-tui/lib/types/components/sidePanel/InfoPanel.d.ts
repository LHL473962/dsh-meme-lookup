/**
 * InfoPanel — 侧栏「信息」面板：把当前会话的运行信息分组、紧凑地列出。
 *
 * 口径与状态栏完全一致：上下文占用（formatContextUsage + contextPressureStep
 * 阈值配色）、缓存命中（formatCacheHitRate）、TPS（tpsStats / speedColor）、
 * 花费（estimateSessionCostSnapshotCny 同一套门控）、模式名（modeDisplayName）、
 * cwd 展示折叠（formatProject）。本组件不推导任何新口径，只重排布局。
 *
 * 布局：键值两列，标签列定宽截断、值列悬挂缩进并 truncate——长 cwd /
 * 长标题在 28 列也不会把列挤爆。内容超高时 ScrollBox 滚动：滚轮由
 * ScrollBox 自带（位置路由），↑/↓ 经 usePanelInput（v2.1 键盘契约）。
 * visible=false 时不挂任何定时器 / 高频订阅（本面板本来就是纯读渲染）。
 */
import React from 'react';
import type { PanelProps } from './types.js';
export declare function InfoPanel({ width, height, focused, visible }: PanelProps): React.ReactNode;
//# sourceMappingURL=InfoPanel.d.ts.map
/**
 * PluginPanelAdapter（设计文档 §18.2/§18.5）：把插件注册的 Panel 组件
 * 接进 PanelHost。PanelHost 看到的仍是普通 PanelDefinition.component
 * （这里在注册时包好），插件组件拿到的是收窄后的
 * TuiPanelProps { React, ui, host, width, height, focused, visible, mode }。
 *
 * - ui：照 TuiStatusViewUi 的收窄法——Box 去掉 ref/tabIndex/focus/键盘/
 *   contextMenu（保留 click/hover/drag/onWheel），useTerminalSize 恒等于
 *   Panel 的 width/height，useAnimationTime 是唯一合法定时源。
 * - host：策展只读 snapshot（SidePanelRuntimeContext 的 channel/activity/
 *   attention 的结构拷贝，不含转录正文/凭证/文件内容）+ badge/scene/toast/
 *   storage/focus/onKey。
 * - onKey：走 usePanelInput 分发器（v2.1 键盘契约），仅 focused 期间投递；
 *   preventDefault() = 阻止宿主回退键（等价 handler 返回 true）。
 * - sendToChat：本阶段授权流程（panels.chat.attach）未落地——返回 false
 *   并 toast 一次（i18n 文案），不静默。
 */
import React from 'react';
import type { PanelProps } from './types.js';
import type { TuiPanelProps } from '../../dsh-adapter/panels.js';
export declare function makePluginPanelComponent(panelId: string, component: React.ComponentType<TuiPanelProps>): React.ComponentType<PanelProps>;
//# sourceMappingURL=pluginPanelAdapter.d.ts.map
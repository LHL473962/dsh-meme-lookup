/**
 * btw 侧栏面板：线程滚动 + Markdown + 底部 composer 连续追问。Esc 先退出
 * composer 编辑（草稿保留），列表层不消费 Esc，再交宿主回聊天；Tab 在列表
 * 与 composer 间切焦点；未消费的键交宿主（←/→ 切面板——编辑层里光标贴到
 * 行首/行尾后也让位）。
 *
 * badge 派生（镜像 jobs/agents 适配器）：面板不可见期间完成的新 answer
 * 增 info unread、失败 error level 计未读、运行中只亮点不计未读；进入
 * 面板（visible）即 markSeen 清 unread——仅开始生成不清旧未读。
 */
import React from 'react';
import type { PanelProps } from '../types.js';
export declare function BtwPanelAdapter({ width, height, focused, visible }: PanelProps): React.ReactNode;
//# sourceMappingURL=BtwPanelAdapter.d.ts.map
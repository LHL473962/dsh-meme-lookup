/**
 * BtwPanelFallback：btw 侧栏面板未启用时的 /btw 浮层。同一问答只在一处
 * 呈现，Chat 只在面板未启用时挂它。
 *
 * 内容是当前 session 的 btw 线程（只读：无 composer、无 attach）。键位：
 * Esc/Enter/Space 关闭（关闭即中止在途的一轮，由 Chat 接线）、↑/↓ 滚动、
 * c 复制；浮层打开时吞掉其余所有键。底部提示如何启用 btw 面板，不替用户
 * 改面板列表。
 */
import React from 'react';
import type { BtwThreadSnapshot } from './sidePanel/btw/threads.js';
export declare function BtwPanelFallback({ thread, onClose, onCopy, }: {
    readonly thread: BtwThreadSnapshot | undefined;
    readonly onClose: () => void;
    readonly onCopy: (answer: string) => void;
}): React.ReactNode;
//# sourceMappingURL=BtwPanel.d.ts.map
/**
 * BtwThreadScene（btw 面板的 ⤢ 全屏）：完整问题与 Markdown 长文、线程
 * 滚动、composer 追问。Esc 返回侧栏，面板状态原样（mountPolicy=enabled
 * 不卸载，thread 与 draft 都在线程 store）。
 *
 * 键层级：composer 编辑（Esc 收起草稿、↑ 上到标题）> 场景动作（↑/↓ 选轮、
 * s 送聊天/撤回、c 复制）> Esc 退出场景。选中态与侧栏面板同源（线程 store），
 * 两个形态的键位与落点逐条对齐。
 */
import React from 'react';
import type { ChannelUi } from '../../../adapter/channel/ui-policy.js';
export declare function BtwThreadScene({ channel, onClose, onFocusChat, }: {
    readonly channel: ChannelUi;
    readonly onClose: () => void;
    /** 送聊天之后把焦点交回主输入框（宿主没接时只关场景）。 */
    readonly onFocusChat?: (() => void) | undefined;
}): React.ReactNode;
//# sourceMappingURL=BtwThreadScene.d.ts.map
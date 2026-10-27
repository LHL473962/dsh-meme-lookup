/**
 * BtwThreadView：Q/A 轮次的滚动列表（面板 / 全屏场景 / 浮层 fallback
 * 共用）。Question 走用户侧视觉（accent 加粗，无行首箭头），Answer 走共享
 * Markdown；运行中显示本轮 spinner；失败或中止时保留已流出的部分答复，
 * 下面标出错误/已中止。
 *
 * 跟尾：默认跟随尾部；用户上滚后暂停 follow，
 * 出现「有新回答」跳尾提示（点击回底）。ScrollBox 的 sticky 位就是
 * follow 信号——上滚打破 sticky，scrollToBottom/贴底恢复。
 *
 * 消息区不是控件：点它跟点面板其它地方一样，只由宿主把列焦点交给面板
 * （见 BtwComposer 的点击注释），注入/复制的入口是选中轮 + `s`/`c`。
 * 选中只看标题那一行：反色只覆盖标题本身的字，终端光标也声明在那儿。
 * 选中轮滚出视口时只滚到「恰好露出这一行」：往上走贴视口顶、往下走贴视口底；
 * 已经在视口里就只挪高亮，不动滚动位置。
 */
import React from 'react';
import { type ScrollBoxHandle } from '../../../ui.js';
import type { BtwThreadSnapshot } from './threads.js';
export declare function BtwThreadView({ thread, width, height, 
/** 渲时钟的开关（面板不可见/场景失焦时停表）。 */
alive, 
/** 当前选中的轮（标题反色 + 光标声明）；undefined = 列表没有选中态。 */
selectedTurnId, 
/** 点标题行把选中挪到那一轮（继续冒泡，宿主照旧拿列焦点）。 */
onSelectTurn, 
/** 宿主（全屏场景/浮层）接管键盘滚动用的句柄透传。 */
scrollHandleRef, }: {
    readonly thread: BtwThreadSnapshot | undefined;
    readonly width: number;
    /** 滚动区行预算（含滚动区自身；跳尾提示一行另计）。 */
    readonly height: number;
    readonly alive: boolean;
    readonly selectedTurnId?: string | undefined;
    readonly onSelectTurn?: ((turnId: string) => void) | undefined;
    readonly scrollHandleRef?: {
        current: ScrollBoxHandle | null;
    };
}): React.ReactNode;
//# sourceMappingURL=BtwThreadView.d.ts.map
/**
 * BtwComposer：btw 线程的追问输入框。草稿存在线程 store 里（面板与全屏
 * 共享），Enter 发送，Esc 退出编辑焦点但保留草稿，失败或忙时草稿原样保留。
 * 没有 steer/queue：sideQuery 是一次旁路问答，不进父会话。
 *
 * 键处理是纯函数 btwComposerKey，面板（usePanelInput 分发）与全屏场景
 * （useInput）共用；组件本身受控渲染（text 在 store，caret 是各处自己的）。
 */
import React from 'react';
import type { SidePanelKeyFlags } from '../types.js';
/** 编辑态（text 来自线程 store；caret 属于当前 surface）。 */
export interface BtwComposerState {
    readonly text: string;
    readonly caret: number;
}
/** btwComposerKey 的结果：undefined 字段 = 无此动作；整体为 null = 键未消费。 */
export interface BtwComposerKeyResult {
    readonly state?: BtwComposerState;
    readonly submit?: boolean;
    /** Esc/Tab：退出编辑焦点（草稿保留），焦点回落线程列表/宿主。 */
    readonly exitFocus?: boolean;
}
/** 运行时补充键位（ink Key 实际携带；SidePanelKeyFlags 类型面未列）。 */
type BtwKeyFlags = SidePanelKeyFlags & {
    readonly tab?: boolean;
    readonly backspace?: boolean;
    readonly delete?: boolean;
    readonly home?: boolean;
    readonly end?: boolean;
    readonly return?: boolean;
};
/**
 * 单行 composer 的键语义。返回 null = 未消费（面板形态交宿主回退键，
 * 全屏形态交场景其余分支）；返回对象按 exitFocus > submit > 编辑 写回。
 * ←/→ 先移光标，贴到行首/行尾后返回未消费——面板形态据此切面板。
 * ↑ 让位给列表（选中轮，见 BtwPanelAdapter 的选中态）；↓ 在单行框里没有
 * 语义，吃掉即可，免得漏给主聊天去滚 transcript。
 */
export declare function btwComposerKey(state: BtwComposerState, input: string, key: BtwKeyFlags): BtwComposerKeyResult | null;
export declare function BtwComposer({ state, focused, busy, notice, onActivate, }: {
    readonly state: BtwComposerState;
    /** 编辑焦点（决定边框高亮与原生光标显示）。 */
    readonly focused: boolean;
    /** 线程在途：Enter 不发送，提示稍候。 */
    readonly busy: boolean;
    /** 提交失败/忙的本地提示（显示到下一次动作）。 */
    readonly notice?: {
        readonly text: string;
        readonly failure: boolean;
    } | undefined;
    /** 点击输入框进入编辑（默认箭头归导航，点进来才编辑）。 */
    readonly onActivate?: () => void;
}): React.ReactNode;
export {};
//# sourceMappingURL=BtwComposer.d.ts.map
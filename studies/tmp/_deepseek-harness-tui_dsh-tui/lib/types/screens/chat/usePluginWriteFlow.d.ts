/**
 * `/plugin` 的两个写入浮层共用的骨架（C-5 抽自 C-4 的安装六件套）。
 *
 * 两处浮层（`plugin-install` 与 `plugin-manage`）的**差异**只有三条：关掉浮层时
 * 要不要停掉已经交给服务的写入、Enter 该调流程的哪个方法、以及未预料到的异常用
 * 哪一行报。其余全是同一件事：
 *
 * - 异步步骤态住在 Chat 里（ref 是回调里的真源，state 只驱动重绘）——浮层只渲染它；
 * - 流程自己把每一行写进转录（按发起时的 binding 加栅栏），这里只保存「下一步问什么」；
 * - `busy` 表示正在跑一次写入/取消，此时除 Esc 外不接键；
 * - `done` 没有可问的：先把 `busy` 摘掉再收浮层，否则收尾清理会去取消一个已经结算的
 *   写入，并打出一行与刚发生的事矛盾的说明；
 * - 迟到的回答属于**已经不在场的那次流程**（取消 A、另起 B，A 的 inspect 才回来）：
 *   既不能改当前这次的状态，也不能替它收起浮层。
 *
 * 抽出来的理由是这两处必须**逐字同款**：栅栏与收尾的每一条都是踩过的坑
 * （C-4 的自审与两轮独立审查各修过其中一处），复制一份就等于给下一次修正留两个
 * 落点。行为面由 `verify-plugin-manager-chat.tsx` 的三段（无头 / 真面板 / 生产接线）
 * 兜住。
 */
import React from 'react';
import type { ChatOverlay, ChatOverlayAction } from '../chatOverlay.js';
/** 一次写入浮层的步骤态：流程、当前步骤、以及是否正有一次调用在飞。 */
export interface PluginWriteFlowView<Step, Flow> {
    readonly flow: Flow;
    readonly step: Step;
    readonly busy: boolean;
}
/**
 * 本骨架服务的浮层。两者都不带自己的字段：一次写入的「要做什么、服务怎么答、
 * 进度到哪」全在流程的步骤态与转录里，所以开浮层只要一个 kind。
 */
export type PluginWriteOverlayKind = 'plugin-install' | 'plugin-manage';
export interface PluginWriteFlowOptions<Step, Flow> {
    /** 这个骨架服务哪个浮层；只有它开着时收尾清理才生效。 */
    readonly overlayKind: PluginWriteOverlayKind;
    /** 当前浮层（`undefined` = 都没开）。 */
    readonly overlay: ChatOverlay | undefined;
    readonly dispatchOverlay: React.Dispatch<ChatOverlayAction>;
    /** 意外异常的落点：一行进转录（标题由调用方绑定，两处都是 `/plugin`）。 */
    readonly pushLocal: (lines: readonly string[]) => void;
    /** 流程还没问出第一步时占位用的步骤；`busy` 期间浮层不渲染它。 */
    readonly initialStep: Step;
    /**
     * 关掉浮层时必须停掉的在途写入。装链路有取消面（服务会回滚 profile），
     * manage 三个动作没有——服务不提供，写也是一次就结算的 profile 操作，
     * 所以那一侧不传这个回调：`undefined` 就是「关了浮层，写入照旧跑完」。
     */
    readonly cancelOnClose?: ((flow: Flow) => Promise<Step>) | undefined;
    /** 未预料到的 rejection 用哪一行报；流程自己已经兜住已知路径。 */
    readonly failureLine: (error: unknown) => string;
}
export interface PluginWriteFlow<Step, Flow> {
    /** 当前步骤态；浮层未开时为 `undefined`。 */
    readonly view: PluginWriteFlowView<Step, Flow> | undefined;
    /** 开浮层并跑 `flow.begin()`。 */
    readonly start: (flow: Flow, begin: Promise<Step>) => void;
    /** 把「下一个 promise」当作答案：置 `busy`、加栅栏、结算。 */
    readonly run: (next: Promise<Step>) => void;
    /** 收起浮层（不改流程状态）。 */
    readonly close: () => void;
}
export declare function usePluginWriteFlow<Step extends {
    readonly kind: string;
}, Flow extends {
    dispose(): void;
}>(options: PluginWriteFlowOptions<Step, Flow>): PluginWriteFlow<Step, Flow>;
//# sourceMappingURL=usePluginWriteFlow.d.ts.map
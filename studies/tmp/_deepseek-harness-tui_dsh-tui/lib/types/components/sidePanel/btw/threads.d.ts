export type BtwTurnPhase = 'queued' | 'running' | 'completed' | 'failed' | 'cancelled';
export interface BtwTurn {
    readonly turnId: string;
    /** 全局单调序（unread 的 seen-through 标尺）。 */
    readonly seq: number;
    readonly question: string;
    readonly answer: string;
    readonly phase: BtwTurnPhase;
    readonly error?: string;
    readonly startedAt?: number;
    readonly finishedAt?: number;
    /** 本次 ask 实际携带的上下文轮次（最近 N 且在预算内）。 */
    readonly includedContextTurnIds: readonly string[];
    /** 超出 N/字符预算被裁掉的更早完成轮数（UI 显示 omitted count）。 */
    readonly omittedOlderCount: number;
}
export interface BtwThreadSnapshot {
    readonly sessionId: string;
    readonly threadId: string;
    readonly createdAt: number;
    readonly generation: number;
    readonly turns: readonly BtwTurn[];
    readonly activeTurnId: string | null;
    readonly draft: string;
    /** 列表选中的轮（`s` 送聊天 / `c` 复制的对象）；null = 跟最后一条。
     *  与 draft 同理放在 store 里：面板与全屏场景共用同一份选中态。 */
    readonly selectedTurnId: string | null;
    /** seen-through 标尺之后的完成/失败轮（cancelled 不计：用户自己中止，
     * 不是没看到的新答案）。 */
    readonly unread: {
        readonly count: number;
        readonly error: boolean;
    };
    readonly version: number;
}
/** 最近 N 组问答：默认 4，可配范围 1–8（normalize 钳制）。 */
export declare const BTW_RECENT_TURNS_DEFAULT = 4;
export declare const BTW_RECENT_TURNS_MIN = 1;
export declare const BTW_RECENT_TURNS_MAX = 8;
/** 线程上下文总字符预算（问题+裁剪后答案）。 */
export declare const BTW_CONTEXT_CHAR_BUDGET = 24000;
/** 单条答案进入上下文时的裁剪上限。 */
export declare const BTW_ANSWER_CHAR_BUDGET = 8000;
/** 跨线程并发上限：超过显示忙，不隐式取消。 */
export declare const BTW_MAX_CONCURRENT_ASKS = 2;
/** submit 的 ask 门面 = channel.sideQuestion（一次无工具单答案旁路）。 */
export type BtwAskFacade = (question: string, options?: {
    readonly signal?: AbortSignal;
    readonly onText?: (delta: string) => void;
}) => Promise<{
    readonly answer: string | null;
    readonly error?: string;
}>;
export type BtwSubmitResult = {
    readonly ok: true;
    readonly turnId: string;
} | {
    readonly ok: false;
    readonly reason: 'empty' | 'busy' | 'congested';
};
/**
 * 有效选中轮：钉住的 id 还在就继续用它，否则跟最后一条（新轮到达自动跟尾、
 * 轮被清掉/换话题自动落回）。面板与全屏场景共用这一条解析，保证两个形态
 * 的选中语义逐字一致。
 */
export declare function effectiveSelectedTurnId(turns: readonly BtwTurn[], pinned: string | null): string | null;
/** 钳到 1–8；非有限值取默认 4。 */
export declare function normalizeRecentTurnsLimit(value: number | undefined): number;
export interface BtwContextSelection {
    /** 参与下一次 ask 的完成轮（旧→新）。 */
    readonly included: readonly BtwTurn[];
    readonly omittedOlderCount: number;
}
/**
 * 选出下一次 ask 携带的上下文：先取最近 N 组**完成**轮，再按字符预算
 * （单答案 8k 裁剪后计入、总计 24k）从最旧开始整轮丢弃；被丢的轮数
 * （窗口外 + 超预算）汇成 omittedOlderCount。纯函数。
 */
export declare function selectContextTurns(turns: readonly BtwTurn[], limit?: number, budgets?: {
    readonly total?: number;
    readonly perAnswer?: number;
}): BtwContextSelection;
declare class BtwThreadStore {
    private threads;
    private controllers;
    private listeners;
    private turnSeq;
    private threadSeq;
    subscribe: (listener: () => void) => (() => void);
    /** 当前 session 的线程快照（缺失 = 无线程；快照在两次更新间恒等）。 */
    get(sessionId: string): BtwThreadSnapshot | undefined;
    /**
     * 发起一轮追问：拼好线程上下文作为 question 整段交给 ask（一次
     * sideQuery 调用），流式增量与落定都经代际/相位守卫写回。同线程
     * 在途时 busy 拒绝；全局并发超上限 congested 拒绝（都不隐式取消）。
     */
    submit(sessionId: string, question: string, ask: BtwAskFacade, opts?: {
        readonly recentTurnsLimit?: number;
        readonly contextBudget?: number;
    }): BtwSubmitResult;
    /** 中止在途追问（相位立即转 cancelled；迟到的流/结果被守卫丢弃）。 */
    abortActive(sessionId: string): boolean;
    /**
     * 新话题：abort 在途、清 turns/draft/unread、换 thread id、generation+1。
     * 不影响其它 session 的线程，也不触发任何持久化。
     */
    newTopic(sessionId: string): boolean;
    setDraft(sessionId: string, text: string): void;
    /** 指定选中某一轮（点标题行；null = 回到跟最后一条）。 */
    select(sessionId: string, turnId: string | null): void;
    /** 当前选中轮（实时解析，不依赖渲染期快照）。 */
    selectedTurn(sessionId: string): BtwTurn | undefined;
    /**
     * ↑/↓ 移动选中：从当前有效选中出发、夹在两端（delta = ±1）。落点即钉住，
     * 所以移动之后不再跟尾；返回新选中轮（线程为空 = undefined）。
     */
    moveSelection(sessionId: string, delta: number): BtwTurn | undefined;
    /** 看到最新线程：把已落定轮全部记为已读（running 轮落定时再见分晓）。 */
    markSeen(sessionId: string): void;
    /** 测试/多夹具隔离用：清空全部线程状态。 */
    resetForTest(): void;
    private recordOf;
    private bump;
    private emit;
}
/** 进程级单例（与 jobsFocusStore 同款挂法）。 */
export declare const btwThreads: BtwThreadStore;
export {};
//# sourceMappingURL=threads.d.ts.map
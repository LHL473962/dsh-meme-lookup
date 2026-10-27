/**
 * subagentDetailMemory：Detail 场景的页码/滚动记忆。主屏 Agent View 盖过
 * Detail 时（Chat 的整屏 early-return）组件会卸载；从 Agent View 返回时
 * 按 agentId 恢复最后的页码与滚动位置。只保留最近 16 个代理。
 */
export interface SubagentDetailSnapshot {
    readonly page: string;
    readonly scrollTop: number;
}
export declare const subagentDetailMemory: {
    read(agentId: string): SubagentDetailSnapshot | undefined;
    /** 常规退出（返回 Dashboard / 关面板）不带走记忆：只有主屏 Agent View
     *  的往返才恢复页码与滚动，重新从 Dashboard 进入是全新一次浏览。 */
    clear(agentId: string): void;
    save(agentId: string, snapshot: SubagentDetailSnapshot): void;
};
//# sourceMappingURL=subagentDetailMemory.d.ts.map
/**
 * 本机使用统计（`~/.dsh-tui/usage.json`）：累计启动次数与累计在线时长，只服务
 * 开屏那句"里程碑求 star"。三条硬约束：
 *
 * 1. **绝不影响开屏**：文件缺失/损坏/字段类型不对一律当 0，读不到就重写；
 * 2. **一次进程只记一次**：`recordLaunch()` 有模块级闸门，LogoV2 反复挂载也只 +1；
 * 3. **崩溃不丢太多**：启动时记 `startedAt`，每 5 分钟兜底落盘一次，退出时再补最后一段
 *    （定时器 `unref()`，不拖着进程不退）。
 *
 * 里程碑是**一条有序阶梯**（次数与时长按"1 次 ≈ 1 小时"的体感交错），跨档时只报
 * 最高那一档，且每档只报一次——所以 `celebrated` 记的是"已报到第几档"。
 */
/** 一档里程碑：次数或时长（小时）二者取一。 */
export interface StarMilestone {
    /** 累计启动次数门槛。 */
    readonly launches?: number;
    /** 累计在线小时门槛。 */
    readonly hours?: number;
    /**
     * 这一档配不配"弹一次窗"。给**值得停下来看一眼**的档用（`24h` / `99h` /
     * `999 次`）——其余档只在开屏出那行标语 + 一条非阻塞提示，绝不拦路。
     * 弹窗一次只弹一档、只弹一次。（24h 是"第一次陪你一整天"，比 99h 早得多，
     * 用户实机反馈 99h 等太久。）
     */
    readonly modal?: boolean;
}
/**
 * 求 star 的里程碑阶梯（有序）。次数档：100 / 500 / **999** / 5000 / 10000；
 * 时长档：**24 / 50 / 99 / 200 / 500** 小时。两套按体感交错成一条线；
 * 其中 `24h`、`99h` 与 `999 次` 会**弹一次窗**（可关，只在开屏）。
 */
export declare const STAR_MILESTONES: readonly StarMilestone[];
/**
 * 这一档是不是"历史性时刻"（值得弹窗）。
 * @param index - `STAR_MILESTONES` 的下标。
 * @returns 该档是否配弹窗（未知下标一律 false）。
 */
export declare const isHistoricMilestone: (index: number) => boolean;
/** 本机累计用量。 */
export interface UsageStats {
    /** 累计启动次数。 */
    readonly launches: number;
    /** 累计在线毫秒。 */
    readonly totalMs: number;
    /** 已报到第几档里程碑（`STAR_MILESTONES` 的下标 +1；0 = 从没报过）。 */
    readonly celebrated: number;
}
/** 空账本（文件缺失/损坏时的回落）。 */
export declare const EMPTY_USAGE: UsageStats;
/**
 * 读取本机用量；任何异常与非法形状都回落成 0（开屏不许因为统计文件挂掉）。
 * @param dir - 数据目录（测试可注入）。
 * @returns 归一化后的用量。
 */
export declare function readUsage(dir?: string): UsageStats;
/**
 * 写回本机用量（先写临时文件再改名，避免半截文件）。
 * @param stats - 要落盘的用量。
 * @param dir - 数据目录（测试可注入）。
 * @returns 是否写成功（失败只是不记账，不影响任何功能）。
 */
export declare function writeUsage(stats: UsageStats, dir?: string): boolean;
/**
 * 该不该在这台机器上求一次 star，以及报到第几档。
 * @param stats - 当前用量。
 * @returns 未报过的、已达成的**最高**那一档的下标；没有则 `null`。
 */
export declare function pendingStarMilestone(stats: UsageStats): number | null;
/**
 * 开屏弹窗判定：启动时由 Chat 调一次——账本文件里未报过的最高一档若
 * 配弹窗（`99h` / `999 次`），返回其下标；其余情况（没有待报档、或待报档
 * 是只出标语行的普通档）一律 `null`。读**文件**而不是进程缓存：LogoV2
 * 的 `recordLaunch` 与本函数分属不同挂载层，文件是两者一致的真相源。
 * 弹窗真正展示时由调用方 `markStarAsked` 记账，本函数只读不写。
 * @param dir - 数据目录（测试可注入）。
 * @returns 配弹窗且已达成的档位下标；没有则 `null`。
 */
export declare function dueStarModal(dir?: string): number | null;
/**
 * 记一次启动：累计次数 +1、开始计时，并挂上兜底落盘与退出补记。
 * 同一进程里对同一目录重复调用只生效一次（LogoV2 反复挂载也只 +1）。
 * @param dir - 数据目录（测试可注入）。
 * @returns 记完之后的用量（开屏拿它判里程碑）。
 */
export declare function recordLaunch(dir?: string): UsageStats;
/**
 * 当前缓存的用量（没记过启动就是空账本）。
 * @param dir - 数据目录（测试可注入）。
 * @returns 该目录下的用量。
 */
export declare function usageSnapshot(dir?: string): UsageStats;
/**
 * 把某一档标记为"已求过"（开屏决定显示之后调用一次）。
 * @param index - `STAR_MILESTONES` 的下标。
 * @param dir - 数据目录（测试可注入）。
 */
export declare function markStarAsked(index: number, dir?: string): void;
//# sourceMappingURL=usageStats.d.ts.map
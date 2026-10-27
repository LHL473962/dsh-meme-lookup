import type { CompanionMood } from './mood.js';
type Rgb = readonly [number, number, number];
export interface DeepyFrame {
    readonly dur: number;
    readonly rows: readonly string[];
}
export interface DeepyAnimation {
    readonly key: string;
    readonly title: string;
    readonly frames: readonly DeepyFrame[];
    /** 全部帧的 dur 总和（循环周期）。 */
    readonly totalMs: number;
}
export interface DeepyKit {
    /** 素材包身份（'deepy' / 'whaleGirl'）：预渲染缓存按它分命名空间。 */
    readonly id: string;
    readonly columns: number;
    readonly rows: number;
    readonly palette: Record<string, Rgb | undefined>;
    readonly byKey: Readonly<Record<string, DeepyAnimation>>;
}
export declare const DEEPY_CELLS: Readonly<{
    columns: 42;
    rows: 15;
}>;
/** kit 加载缓存：null = 尚未尝试；undefined = 已尝试但素材缺失/校验
 *  失败（皮肤回退）；DeepyKit = 已加载。测试可直接改写以模拟缺失。 */
export interface SpriteKitCache {
    kit: DeepyKit | undefined | null;
}
export declare const deepyKitCache: SpriteKitCache;
export declare const whaleGirlKitCache: SpriteKitCache;
/** 按候选相对路径（相对本模块）依次尝试「读取 + parseKit 校验」，第一个
 *  通过校验的胜出并记入 cache；全部失败 → undefined。抽自 loadDeepyKit，
 *  deepy 与鲸娘共用。 */
export declare function loadSpriteKit(candidates: readonly string[], cache: SpriteKitCache, id: string): DeepyKit | undefined;
/** 加载并缓存 deepy 素材包；素材缺失或校验失败返回 undefined（皮肤回退）。 */
export declare function loadDeepyKit(): DeepyKit | undefined;
/** 鲸娘素材包（用户提供，assets/whaleGirl/frames.json：22 动画，与 deepy
 *  同 schema 的 42×30 字母格，构建见 scripts/build-whale-girl-kit.mjs）。 */
export declare function loadWhaleGirlKit(): DeepyKit | undefined;
/** mood → deepy 动画（素材包 README 的状态对应表；显示语义经
 *  CompanionPanel 的平滑层后映射到这里）。 */
export declare const DEEPY_MOOD_ANIMATION: Readonly<Record<CompanionMood, string>>;
/** 并行上下文 → 动画（官方表：conducting=2+ 子代理、building=3+ 会话、
 *  music=1 子代理或 2 会话、compacting=上下文压缩）。 */
export declare const DEEPY_CONTEXT_ANIMATION: Readonly<Record<string, string>>;
/** 互动/悬停/闪现 → 动画（官方表 reaction 档）：look=idle-look（东张西望，
 *  追踪面板内指针），notice=idle-spout（指针碰到宠物本体，开心喷水），
 *  waking=被吵醒（官方 trigger：睡眠中移动鼠标/来信号），carrying=顶箱子
 *  （gitBranch 变更闪现）。 */
export declare const DEEPY_INTERACTION_ANIMATION: Readonly<Record<string, string>>;
/** 通知气泡反应 → 动画：error 色 → 出错啦；success → 任务完成；
 *  warning → 需要你确认；无色（默认档）→ idle-look。 */
export declare const DEEPY_NOTIFICATION_REACTION: Readonly<Record<string, string>>;
/** idle 族的随机轮换池（官方表：空闲待机，后三个随机插播；idle-look 同时
 *  兼任悬停追踪档）。按 IDLE_ROTATE_MS 时间轮换，不跟信号边沿。 */
export declare const DEEPY_IDLE_ROTATION: readonly string[];
/** 显示语义（mood.ts 平滑层的输出）→ kit 动画键。注意 thinking/typing/
 *  notification/happy 是显示语义不是 CompanionMood——mood 表的键是
 *  waiting/thinking/working/responding/attention/celebrate，语义表必须单列。 */
export declare const DEEPY_SEMANTIC_ANIMATION: Readonly<Record<string, string>>;
/** 语义 → kit 动画键的统一查找；DEEPY_IDLE_ROTATION 的成员本身就是
 *  kit 键，不需要映射。 */
export declare function deepyAnimationFor(semantic: string): string;
/** elapsed 时刻应显示第几帧（按 dur 累加取模，确定性、可单测）。 */
export declare function frameAt(animation: DeepyAnimation, elapsedMs: number): number;
/** 一个动画全部帧的预渲染 ANSI 行（15 行/帧），惰性生成并缓存。多套
 *  素材包（deepy / whaleGirl）共用本缓存：键必须带 kit.id，否则同名
 *  动画会串包（鲸娘读到 deepy 的行，调色板错乱）。 */
export declare function renderedDeepyAnimation(kit: DeepyKit, key: string): readonly string[][] | undefined;
/** 测试接缝：清掉加载与渲染缓存（deepy 与 whaleGirl 一起复位）。 */
export declare function resetDeepyCacheForTests(): void;
export {};
//# sourceMappingURL=deepy.d.ts.map
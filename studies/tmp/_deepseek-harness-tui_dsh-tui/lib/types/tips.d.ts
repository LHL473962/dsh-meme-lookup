/**
 * 精简 Tips 池 —— 启动首屏轮换（LogoV2）与 `/tips` 命令面板共用。
 *
 * 设计约定：
 * - 每条 tip 一句话，中文 ≤ 约 60 字符、英文 ≤ 约 100 字符，首屏单行可读
 *   （窄终端自动截断）；
 * - 文案只讲"用户能立刻用上"的操作，不讲实现细节；
 * - id 稳定（面板按 id 去重/排序），group 用于 `/tips` 面板分组展示；
 * - 与 docs/user-guide.md 同源：文档是详版，这里是精版，覆盖全部功能面。
 */
export type TipGroup = 'keys' | 'commands' | 'workflow' | 'display' | 'pitfalls';
export interface Tip {
    id: string;
    group: TipGroup;
    zh: string;
    en: string;
}
export declare const TIP_GROUP_LABELS: Record<TipGroup, {
    zh: string;
    en: string;
}>;
export declare const TIPS: readonly Tip[];
/**
 * 启动随机轮换选择：每次启动随机取一条，让首屏每次都有新鲜感。
 * random 可注入以便测试固定（默认 Math.random）。
 */
export declare function pickRandomTip(random?: () => number): Tip;
/** 按分组取 tips（/tips 面板展示用，保持 TIPS 内顺序）。 */
export declare function tipsByGroup(group: TipGroup): Tip[];
//# sourceMappingURL=tips.d.ts.map
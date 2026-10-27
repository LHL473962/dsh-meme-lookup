/**
 * 开屏的两个彩蛋——都只改**文字**，字体轮换、鲸鱼动画、窄终端阶梯一律照旧：
 *
 * ① 节日换词：本地日期命中整天窗口时，把下排词换成 `HAPPINESS` / `MERRY` /
 *    `NEW YEAR`（上排仍是 `DEEPSEEK`）。字距由 `withTagline` 按新词重解，
 *    所以换词不会把两行搞成不等宽。
 * ② 小概率求 star：每次 mount 掷一次（默认 1/20），命中就把底部欢迎语换成
 *    一句带仓库链接的话。链接走 `createHyperlink`，不支持 OSC 8 的终端自动
 *    退化成纯文本 URL；命中概率与终端能力都是可注入的测试缝。
 */
import type { UsageStats } from '../usageStats.js';
/** 一个节日彩蛋：当天要用的上下两排词。 */
export interface SplashEgg {
    /** 稳定 id（回归按 id 命中）。 */
    readonly id: string;
    /** 上排词。 */
    readonly top: string;
    /** 下排词。 */
    readonly bottom: string;
}
/**
 * 当天是不是彩蛋日。
 * @param now - 注入的当前时间（测试缝；生产用 `new Date()`）。
 * @returns 命中的彩蛋（含当天要用的词对）；没命中返回 `null`（照常画 `HARNESS`）。
 */
export declare function pickSplashEgg(now?: Date): SplashEgg | null;
/** 求 star 标语指向的仓库。 */
export declare const SPLASH_STAR_URL = "https://github.com/ccch1mneyyy/dsh-TUI";
/** 求 star 彩蛋的三行结构（标题 / 数字 / 求星）。 */
export interface SplashStarLine {
    /** 标题行：替换平时的欢迎语（本次会话 star 过后换成"捡到星星"版）。 */
    readonly title: string;
    /** 数字行：本机实测累计值。 */
    readonly stats: string;
    /**
     * 求星行（`Star` 上是 OSC 8 链接），已拼好；**终端不支持超链接时为
     * `null`**——那行会退化成裸 URL，长 30+ 列会把整块撑破，宁可不显示。
     */
    readonly ask: string | null;
    /** 整块里**最宽一行**的可见宽度：居中缩进必须按它算。 */
    readonly width: number;
}
/**
 * 组装求 star 彩蛋。文案走 i18n 字典（中英齐全），`{{hours}}`/`{{launches}}`
 * 换成本机**实测**的累计值，`{{key}}` 换成生效中的快捷键显示。
 * @param options - `usage` 是本机累计用量；`supportsHyperlinks` 是终端能力的测试缝；
 *   `keyHint` 是快捷键显示（如 `Alt+S`）；`caught` 表示本次会话已经 star 过。
 * @returns 三行文案与最宽行可见宽度。
 */
export declare function splashStarLine(options: {
    usage: UsageStats;
    supportsHyperlinks?: boolean;
    keyHint?: string;
    caught?: boolean;
}): SplashStarLine;
//# sourceMappingURL=splashEggs.d.ts.map
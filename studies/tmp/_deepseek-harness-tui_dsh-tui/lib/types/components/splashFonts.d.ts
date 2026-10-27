/**
 * 开屏大字字体表。每款字体 = 一张 5 行点阵表 + 自己的度量。
 *
 * `bold` 是基准款；`square` / `dot` / `bevel` / `wide` / `stencil` 由它**机械变换**
 * 而来（同一副骨架，只换笔画处理），所以改基准款会同步影响这几款——这是有意的：
 * 家族感来自共用骨架。`classic`（老的 5 列空心字）与 `slab`（PR #1058 的实心横笔
 * 设计，作者 zdjmrq）是独立设计，各自成表。
 *
 * 契约（`scripts/verify-splash-layout.ts` / `verify-splash-eggs.tsx` 逐款钉死）：
 * - 每款 5 行；每个字形、每个 fallback 行的显示宽度都等于 `glyphWidth`；
 * - 两行标题画出来的列数必须**相等**（靠 tagline 的字距 + `bottomIndent` 撑）；
 *   例外：声明了 `uniformKerning` 的字体（shadow）放弃等宽契约——两行同字距，
 *   下排由渲染层按半差居中（等宽契约在 10 列字身上最紧只能解出 5/7 字距，
 *   字间空 7-9 列，用户反馈「间隔太宽」）；
 * - 缺字走 `fallback` 而不是抛错，且不改变字身宽度。
 *
 * 选择：设置项 `dsh-tui.splashFont` 取 `daily`（默认，按本地日期轮换）或某款 id；
 * `normalizeSplashFont` 是唯一的归一化入口（非法值一律回落 `daily`）。面板选项
 * 由注册表直接推（含中英标签），所以加一款字体不需要第二份清单。
 *
 * 字形覆盖三层：正常词 `DEEPSEEK`/`HARNESS`、节日彩蛋词用到的 `I M Y W`
 * （`splashEggs.ts` 的日期表）、以及 claude 品牌词 `CLAUDE`/`CODE` 用到的
 * `C L U O`（`branding.ts` 的按内核换品牌）。
 */
import type { SplashFontId, SplashFontSetting } from '../adapter/ports/channel-display.js';
import { type Brand } from '../branding.js';
import type { SplashEgg } from './splashEggs.js';
export type { SplashFontId, SplashFontSetting } from '../adapter/ports/channel-display.js';
import type { Rgb } from './bigfont.js';
/** 透明格用 `·` 表示。 */
export type GlyphRows = readonly string[];
/** 字形表：字符 → 5 行。 */
export type GlyphTable = Readonly<Record<string, GlyphRows>>;
/** 一款开屏大字字体。 */
export interface SplashFont {
    /** 稳定 id（设置项 `dsh-tui.splashFont` 用；取值域见端口的 `SplashFontId`）。 */
    readonly id: SplashFontId;
    /** 一句中文说明，给设置面板/预览用（面板的 zh 侧）。 */
    readonly label: string;
    /** 同一句的英文（面板的 en 侧；`label` 只服务 zh）。 */
    readonly labelEn: string;
    /** 字身宽度（列）。 */
    readonly glyphWidth: number;
    readonly glyphs: GlyphTable;
    readonly fallback: GlyphRows;
    /**
     * 可选：这款字体的词对一律两行同用这个字距（`shadow` 用）。等宽 + 居中
     * 契约在整数字距下解 8 字 vs 7 字的词对时有 `8·bk = g + 9·tk` 的硬关系
     * （g 是字身宽度）——10 列字身最紧只能解出 5/7，字间空得能走人。声明后
     * `withTagline` 不再进求解器：两行同字距、`bottomIndent` 恒 0，下排由
     * 渲染层按半差居中（LogoV2 的金字塔路径，同品牌 uniform 档）。
     */
    readonly uniformKerning?: number;
    /** 两行标题各自的画法与字距。 */
    readonly tagline: {
        readonly top: string;
        readonly bottom: string;
        readonly topKerning: number;
        readonly bottomKerning: number;
        /** 下排左缩进：字距撑不到等宽时用它把下排居中（能等宽时为 0）。 */
        readonly bottomIndent: number;
    };
    /**
     * 可选：这款字体自己的起止配色（不给就由 `LogoV2` 按主题/品牌解析——
     * 半立体款的金属明暗两档就是在那里随主题 accent 派生的）。内置款不再
     * 静态设置；字段保留给运行时扩展（如 cc-bridge 类插件原地写 `palette`
     * 接管两行渐变）。
     */
    readonly palette?: {
        readonly from: Rgb;
        readonly to: Rgb;
    };
}
/**
 * 换一副标题词（品牌词/节日彩蛋用）：字形、字身宽度、id 都不变，只按新词
 * 重解字距。布局阈值（`resolveSplashLayout`）与渲染都读字体自己的 `tagline`，
 * 所以派生对象可以直接顶替原字体——窄终端阶梯一行都不用改。
 * @param font - 基准字体。
 * @param top - 上排词。
 * @param bottom - 下排词。
 * @param options - `wide`：取中间档可行解（等宽契约的舒展档）；
 *   `uniform`：两行同字距（品牌词用——等宽契约靠两行字距互补达成，
 *   字数差大的词对间隙观感不一致；同字距后对齐由渲染层按形态处理）。
 * @returns 换词后的字体描述符。
 */
export declare function withTagline(font: SplashFont, top: string, bottom: string, options?: {
    readonly wide?: boolean;
    readonly uniform?: boolean;
}): SplashFont;
/** 品牌与节日换词后的实际标题，供布局预算与 Logo 渲染共同使用。 */
export declare function resolveSplashTitleFont(font: SplashFont, brand?: Brand, egg?: SplashEgg | null): SplashFont;
/** 轮换池（渲染侧只读这一份；表的书写顺序即轮换顺序）。 */
export declare const SPLASH_FONTS: readonly SplashFont[];
/** 设置项 `dsh-tui.splashFont` 的默认值：按本地日期轮换。 */
export declare const SPLASH_FONT_DAILY = "daily";
/**
 * 值是否是合法设置（`daily` 或注册表里的 id）。
 * @param value - 不可信来源的值（cordis.yml / settings 用户层）。
 */
export declare function isSplashFontSetting(value: unknown): value is SplashFontSetting;
/**
 * 归一化不可信来源的设置值：合法值原样通过，其余回落 `daily`（默认行为）。
 * 不退回"某一款"是刻意的——写错的 id 若悄悄变成某款字体，用户会以为设置生效了。
 * @param value - 不可信来源的值；`undefined`（未设置）也走默认。
 */
export declare function normalizeSplashFont(value: unknown): SplashFontSetting;
/**
 * 设置值 → `LogoV2` 的 `fontId` 缝：`daily` 交回按天轮换（`undefined`），其余
 * 原样交给注册表。**不要**把设置值直接塞进 `fontId`——`splashFontById('daily')`
 * 取不到会静默退回基准款，用户看到的就是"轮换变成了加粗"。
 * @param setting - 归一化后的设置值。
 * @returns 要 pin 的字体 id；`undefined` 表示按天轮换。
 */
export declare function splashFontIdOf(setting: SplashFontSetting): string | undefined;
/** 一款字体在 `/settings` 里的选项（面板字段的形状子集）。 */
export interface SplashFontOption {
    readonly value: SplashFontSetting;
    readonly label: string;
    readonly descriptions: {
        readonly zh: string;
    };
}
/**
 * `/settings` 的字体选项：`daily` 在前，其余按轮换顺序跟着注册表走——加一款字体
 * 就自动出现在面板里，不漏项。标签的 en 侧取 `labelEn`、zh 侧取 `label`。
 */
export declare const SPLASH_FONT_OPTIONS: readonly SplashFontOption[];
/** 找不到 id 时退回基准款（设置项写错不该让开屏挂掉）。 */
export declare const DEFAULT_SPLASH_FONT: SplashFont;
/**
 * 按 id 取字体；未知 id 退回 `DEFAULT_SPLASH_FONT`。
 * @param id - 字体 id（设置项 `dsh-tui.splashFont` 的值）。
 * @returns 对应字体，未知时是基准款。
 */
export declare function splashFontById(id: string): SplashFont;
/**
 * 按**本地日期**轮换：同一天内恒定、隔天换一款，且与启动时刻无关（可复现）。
 *
 * CI 确定性缝：**无参**调用（生产与挂件夹具的「按天轮换」路径）先看
 * `DSH_TUI_SPLASH_FONT`——合法 id 就钉住那一款。CI 全 workflow 设 `bold`
 * （`.github/workflows/ci.yml`）：挂真 Chat/LogoV2 的回归不再随日期变头部
 * 几何——宽体字身轮到那天鲸鱼被阶梯撤掉、文字列位移，断言失配，每 9 天
 * 红一次的 flake 最难查。**显式传日期的调用不受影响**（轮换契约自身的
 * 回归照按注入日期算）；要测 daily 路径的脚本自己删掉这个 env
 * （`verify-splash-font-setting.mjs`）。
 * @param date - 注入的当前时间（测试缝；生产用 `new Date()`）。
 * @returns 当天的字体（或 `DSH_TUI_SPLASH_FONT` 钉住的那款）。
 */
export declare function pickSplashFont(date?: Date): SplashFont;
//# sourceMappingURL=splashFonts.d.ts.map
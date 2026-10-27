import type { SplashFont } from './splashFonts.js';
/**
 * 块体大字的行数：上排 5 + 空 1 + 下排 5。
 *
 * 导出是给回归钉的：`portrait` 立绘槽高（`splashArtRows.ts` 的
 * `PORTRAIT_ART_ROWS`）**等于这个数**——`LogoV2` 把娘立绘钳在与文字列等高的
 * 槽里（`textColumnRows` = 两排大字 + 空行），落地页是 `chrome="minimal"`，
 * 槽高就是大字块的行数。两处一漂移，预算就重新和渲染分叉。
 */
export declare const BIG_TITLE_ROWS = 11;
/** 输入框卡片占的行数：边框 2 + 输入 1（第三版：参数行移出框外）。 */
export declare const CARD_ROWS = 3;
/** 框下参数行的行数（模型/思考深度/模式/权限全空时整行不画）。 */
export declare const PARAM_ROWS = 1;
/** 该尺寸下渲染哪一档。 */
export type LaunchpadStage = 'full' | 'no-tip' | 'no-hints' | 'no-art' | 'input-only';
/** 一屏落地页在该尺寸下要渲染哪些部件。 */
export interface LaunchpadLayout {
    /** 整块撤的顺序档位。 */
    readonly stage: LaunchpadStage;
    /** 渲染像素鲸鱼 / 女仆娘立绘（宽轴决定；窄了不画，免得被裁）。 */
    readonly showWhale: boolean;
    /** 渲染 DEEPSEEK / HARNESS 块体大字。 */
    readonly showBigTitle: boolean;
    /** 大字放不下、立绘也放不下：退化成一行纯文字标题。 */
    readonly showPlainTitle: boolean;
    /** 头部整块是否渲染。 */
    readonly showHero: boolean;
    /** 键帽按钮行（框下成组行的第二行，右对齐）。 */
    readonly showHints: boolean;
    /** 居中 Tips 行（成组行的第三行）。 */
    readonly showTip: boolean;
    /**
     * 参数行与入口行之间的呼吸留白行数（0 或 1）：默认 1；矮屏阶梯里排在
     * Tips 之后、键帽行之前被撤掉。参数行缺席时恒 0（没有可隔开的两行）。
     */
    readonly hintsGapRows: number;
    /**
     * 词标与输入框之间的呼吸留白行数（1 或 2，第六版默认 2——刻意的呼吸感，
     * 不是遗漏）：矮屏阶梯里先于 Tips 行被撤回紧档 1。
     */
    readonly heroGapRows: number;
    /**
     * 入口行与 Tips 行之间的呼吸留白行数（1 或 2，第六版默认 2）：矮屏阶梯
     * 里先于 Tips 行被撤回紧档 1（Tips 行本身更晚才整行撤掉）。
     */
    readonly tipGapRows: number;
    /** 双角铭牌行（永远画：它是这一屏的底边锚点）。 */
    readonly showCorners: boolean;
    /** 输入框卡片占的行数（边框 2 + 输入 1，恒 3）。 */
    readonly cardRows: number;
    /** 头部本体占的行数（不含 LogoV2 根盒的 marginTop）。 */
    readonly heroRows: number;
    /** 内容总行数——测试用来钉死这一档真的放得下。 */
    readonly totalRows: number;
}
/**
 * @param columns - 内容区列数。
 * @param rows - 内容区行数。
 * @param options - whale / whaleGirl 对应设置项；font 是当天那款字体（字身宽度
 *   不同，宽轴阈值也跟着不同）；params 是框下有没有参数行（模型/思考深度/模式/
 *   权限全拿不到时为 false，成组行矮一行）；`artRows` 是**当天真正上场的立绘**
 *   占的行数（`splashArtRows.ts` 解，缺省按像素鲸鱼 13 行）；`cornerRows` 是
 *   右下角铭牌自身的行数（第一行 + 内核数，缺省按老口径 2 行）。
 * @returns 该尺寸下要渲染的部件。
 */
export declare function resolveLaunchpadLayout(columns: number, rows: number, options: {
    whale: boolean;
    whaleGirl?: boolean;
    font: SplashFont;
    params?: boolean;
    artRows?: number;
    cornerRows?: number;
}): LaunchpadLayout;
//# sourceMappingURL=launchpadLayout.d.ts.map
/** 三幕时间轴（ms）：扫光全长、字样启动（波至中段）、字样渐亮、渐隐起止。边框扫光与输入行字样徽标共用。 */
export declare const IGNITION_TIMELINE: {
    readonly sweepMs: 1000;
    readonly labelStartMs: 600;
    readonly labelBrightenMs: 160;
    readonly fadeStartMs: 1500;
    readonly fadeEndMs: 2000;
};
/**
 * Effort ignition motion math — the keepers of the waveform (crest, easings,
 * sampling, blending) are pure and dependency-free; only {@link ignitionColors}
 * touches the palette, turning the `ignition` / `ignitionDim` theme keys into
 * the RGB pair the math consumes.
 *
 * Waveform semantics ported from Codex CLI's effort_ignition(_styles).rs
 * (openai/codex PR #34365) and revalidated in a dsh-TUI integration: a
 * cosine-bell travelling wave produces per-column colours only — a renderer
 * that keeps glyphs constant and changes colours per frame stays SGR-only
 * by construction.
 *
 * Consumers ride the FOREGROUND channel (a constant block glyph under a
 * varying fg colour): pure-background cells never reached the terminal in
 * the fullscreen log-update pipeline, while foreground is the channel every
 * live element already rides.
 */
import { type RGBColor } from '../components/Spinner/spinnerUtils.js';
import { type ThemeName } from '../theme.js';
/** 扫光全长（ms），仅用于把墙钟时间折算成动画秒数，不创建任何定时器。 */
export declare const SWEEP_TOTAL_MS = 1000;
/** The ignition colour pair the wave, `❯` prefix and tier badge share. */
export type IgnitionColors = {
    /** Crest colour: the wave at full strength. */
    ignition: RGBColor;
    /** Resting end the wave fades into (formerly the hardcoded band colour). */
    ignitionDim: RGBColor;
};
/**
 * The active palette's ignition pair. A palette without the keys keeps the
 * pre-theme pair for its background lightness, so light/dark still differ.
 * 品牌在档时品牌对直接接管（与 `usedSegmentColor` 同一口径：切后端整屏换色，
 * 与当前主题声明了什么无关）。
 * @param themeName - Theme to resolve (built-in, `auto`, or user theme name).
 */
export declare function ignitionColors(themeName: ThemeName): IgnitionColors;
/**
 * 充能色对（前缀强调用）：从带底色调暗端到全值，与波共用 ignition。
 */
export declare function accentRamp(colors: IgnitionColors): {
    dim: RGBColor;
    full: RGBColor;
};
/** 余弦钟形：`crest(0)=1`、`crest(±1)=0`、之外为 0（负距离同样静默——
 * 现有调用方都传 `Math.abs`，这里兜底防未来调用方拿到全强度）。 */
export declare function crest(distance: number): number;
/** ease-out cubic：`1-(1-p)³`，两端 clamp。 */
export declare function easeOutCubic(progress: number): number;
/** ease-in-out cubic：前半 `4p³`、后半镜像，两端 clamp。 */
export declare function easeInOutCubic(progress: number): number;
/** 线性混色（t=0 → a，t=1 → b，不 clamp）。 */
export declare function blend(a: RGBColor, b: RGBColor, t: number): RGBColor;
/**
 * 扫光某一时刻的整行颜色。
 *
 * @param options.elapsedMs - 距触发的时间；达到 {@link SWEEP_TOTAL_MS}
 *   后整行返回空数组（无波，行恢复本底）。
 * @param options.width - 行列数（终端宽）。
 * @param options.colors - 主题点火色对（{@link ignitionColors}）。
 * @returns 逐列颜色（`rgb(r,g,b)` 字符串）；无波的列为 `undefined`，
 *   渲染层应输出本底色，保持行宽恒定。
 */
export declare function ignitionLineColors(options: {
    elapsedMs: number;
    width: number;
    colors: IgnitionColors;
}): ReadonlyArray<string | undefined>;
/**
 * 顶档切入判定：从「已有档位」变为「另一档位」且新档位是档位表末位
 * 最高档。冷启动恢复偏好、单档表、档位表未知都不触发。
 */
export declare function entersTopTier(previous: string | undefined, current: string | undefined, levels: readonly string[] | undefined): boolean;
/** 充能时长（ms）与充能进度（钳 [0,1]，负 elapsed 钳 0）。 */
export declare const CHARGE_MS = 150;
export declare function chargeProgress(elapsedMs: number): number;
//# sourceMappingURL=effortIgnition.d.ts.map
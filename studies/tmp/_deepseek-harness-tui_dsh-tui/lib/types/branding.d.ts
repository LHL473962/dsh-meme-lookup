/**
 * 品牌档案：开屏与主题按当前后端展示。
 *
 * 默认 `deepseek`（雾蓝 + `DEEPSEEK`/`HARNESS` + 鲸鱼/鲸鱼娘）；当会话绑在
 * Claude 后端（`backendCapabilities.backendId === 'claude'`，见
 * `backends/claude/`）时切到 `claude`（橙色 + `CLAUDE`/`CODE` + Claude 娘，
 * 立绘见 `assets/claude-girl/`）；Codex 后端切到 `codex`（薰衣草紫 +
 * `CODEX`/`HARNESS` + 标语 "Build anything with Codex"，立绘槽固定淡紫恶
 * 魔精灵 `assets/codex-girl/`——点击切红色按钮变体几秒，图像协议不可用时
 * 回落字符画）。启动页与对话页的主题跟着换：ThemeProvider 在品牌未被显式
 * 锁定时把默认档替换成该品牌的主题对（显式 `DSH_TUI_THEME` / 会话内
 * `/theme` 手选永远优先）。
 *
 * 手动档：设置项 `dsh-tui.brand`（`auto` | `deepseek` | `claude` |
 * `codex`，默认 `auto` = 跟后端自动切，`/settings` 可实时改）。
 * `DSH_TUI_BRAND` 环境变量优先级最高（预览/测试缝）。
 *
 * 后端在一个进程内不变（切内核 = 重启进程走 `kernel.json` 记忆），所以品牌
 * 实际上是 boot 时定死的；但读取仍走 `backendCapabilities`（在 ui-policy
 * 的 reactive 清单里），未来进程内热切也不用改这里。
 */
/** One backend look: splash words, tagline, and (when branded) a theme pair. */
export type Brand = 'deepseek' | 'claude' | 'codex';
export type { BrandSetting } from './adapter/ports/channel-display.js';
import type { BrandSetting } from './adapter/ports/channel-display.js';
import type { ThemeName } from './theme.js';
/** 设置项的合法值表（注册与归一化共用一份）。 */
export declare const BRAND_SETTING_VALUES: readonly BrandSetting[];
/**
 * 归一化不可信来源的设置值：合法值原样通过，其余（含未设置）回落 `auto`。
 */
export declare function normalizeBrandSetting(value: unknown): BrandSetting;
/**
 * 后端 id → 品牌档：`claude` → claude；`codex` → 仅标题；`dsh`、未知与
 * `acp:*` 外部代理一律回落默认品牌（未来某代理想要自己的品牌再单加）。
 * @param backendId - `channel.backendCapabilities.backendId`。
 */
export declare function brandOfBackend(backendId: string | undefined): Brand;
/**
 * 合成当前品牌：`DSH_TUI_BRAND`（测试缝，最高）> 设置项显式锁定 > 后端自动。
 * @param setting - 归一化后的设置值（`auto` = 跟后端）。
 * @param backendId - 当前后端 id。
 */
export declare function resolveBrand(setting: BrandSetting | undefined, backendId: string | undefined): Brand;
/** 一副开屏标题词：两行大字 + 窄终端纯文字档。 */
export interface BrandSplashWords {
    readonly top: string;
    readonly bottom: string;
    readonly plain: string;
}
/** 各品牌的开屏标题词（大字重解字距见 `splashFonts.withTagline`）。 */
export declare const BRAND_SPLASH_WORDS: Readonly<Record<Brand, BrandSplashWords>>;
/** claude 品牌按终端深浅落的两套内置主题（theme.ts 注册：墨黑 / 暖纸张，
 *  共用同一套陶土橙强调色——切明暗不丢品牌识别）。 */
export declare const CLAUDE_BRAND_THEMES: Readonly<{
    dark: 'claude-dark';
    light: 'claude-paper';
}>;
/** codex 品牌双主题（theme.ts 注册）：黑白基底 + 薰衣草紫点缀（用户定稿
 *  「Codex Lavender」方案——90% 黑白灰、8% 紫、2% 功能色；紫只做点睛）。
 *  深底 `codex-lavender`（#A69BE8 主色）、浅底 `codex-paper`（#8A7ED9
 *  深化主色），同一套紫强调色，切明暗不丢品牌识别。 */
export declare const CODEX_BRAND_THEMES: Readonly<{
    dark: 'codex-lavender';
    light: 'codex-paper';
}>;
/** 带品牌主题的档位 → 主题对（ThemeProvider 的品牌默认档查这里；deepseek
 *  用系统默认 light/dark，不在表内）。 */
export declare const BRAND_THEMES: Readonly<Partial<Record<Brand, {
    readonly dark: string;
    readonly light: string;
}>>>;
/**
 * 品牌默认档的落位：浅色档 → 该品牌主题对的浅色版，深色档 → 深色版；`deepseek`
 * 没有品牌主题对（用系统默认 light/dark），返回 `undefined`，调用方沿用解析档。
 *
 * 判据是**解析后色板的明暗**（`isLightThemeActive`），不是主题名的字面量：浅色
 * 内置名不止 `light` 一个（`pink-day`、`claude-paper`、`codex-paper`），自定义与
 * 运行时主题更是任意名字——只认 `'light'` 会让持久化选了 `pink-day` 的用户在品牌
 * 后端下看到深色版。
 * @param brand - 当前品牌档（`resolveBrand` 的结果）。
 * @param themeName - 品牌覆盖前的解析档（ThemeProvider 的 `active`，含 `auto`）。
 */
export declare function brandThemeFor(brand: Brand, themeName: ThemeName): string | undefined;
/** 开屏欢迎语（品牌档；deepseek 沿用 i18n 的 `logo-tagline`）。英文两行以
 *  `\n` 分隔，渲染层按行拆开居中。 */
export declare const BRAND_TAGLINE: Readonly<Record<Brand, {
    readonly zh: string;
    readonly en: string;
}>>;
/** `/settings` 里 `dsh-tui.brand` 的选项（结构与 `SPLASH_FONT_OPTIONS` 同形）。 */
export declare const BRAND_SETTING_OPTIONS: readonly {
    readonly value: BrandSetting;
    readonly label: string;
    readonly descriptions: {
        readonly zh: string;
    };
}[];
/** 更新当前品牌（值不变时无操作）。 */
export declare function setActiveBrand(brand: Brand): void;
/** 当前品牌（`setActiveBrand` 之前是默认档 `deepseek`）。 */
export declare function getActiveBrand(): Brand;
/** 订阅品牌变化（`useSyncExternalStore` 的订阅缝）。 */
export declare function subscribeActiveBrand(listener: () => void): () => void;
//# sourceMappingURL=branding.d.ts.map
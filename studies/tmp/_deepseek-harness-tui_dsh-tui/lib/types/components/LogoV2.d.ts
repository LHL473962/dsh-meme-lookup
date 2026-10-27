import React from 'react';
import { type Tip } from '../tips.js';
import { type UpstreamDriftSummary } from '../dsh-adapter/contract.js';
import { type Brand } from '../branding.js';
import { type SplashEgg } from './splashEggs.js';
import type { SplashImageBox } from './splashArtRows.js';
import { type WhaleIntroId } from './whaleFrames.js';
/**
 * The header splash: one layout, two phases. The **opening** (~1.7–3.5s,
 * once) plays one of three whale intros — the classic blink + spout +
 * tail-wag combo, the heart pass, or the sleep-Z float — rolled on every
 * mount (see `pickOpeningSequence`): randomly at startup, and again
 * randomly on each `/deepseek` easter-egg replay — and runs the shimmer
 * sweeps; the **settled** header is the same tree frozen at t=0 — whale
 * on the standard pose, sweep highlights parked off-screen, clock
 * unsubscribed, zero timers.
 *
 * Layout: the 13-row pixel whale beside a text column of matching height —
 * the `✦ dsh-TUI` wordmark with version, the `DEEPSEEK`/`HARNESS` tagline in
 * the 5-row block font (brand-blue → ice gradient, a blank row between the
 * two words, both stretched to the same width — see `splashFonts.ts` for the
 * eight faces and the per-face kerning), the model/effort and
 * cwd in plain text (no brand-color highlight), the startup tip, and below
 * the whale the welcome tagline, centered under the art, in ice
 * blue. Narrow terminals climb down the `resolveSplashLayout` ladder —
 * whale + big text, then the big text alone, then the whale alone, then one
 * plain title line. The face rotates by local date (`pickSplashFont`), so a
 * given day always shows the same one.
 *
 * Two easter eggs sit on top of that layout without changing it (both live in
 * `splashEggs.ts`): the holiday word pair swaps the two big-text words on its
 * date (`MERRY` on 12/25, …), and a 1-in-20 roll replaces the welcome tagline
 * with a clickable "star us on GitHub" line whose indent is recomputed from
 * its own width.
 */
export declare function LogoV2({ model, effort, cwd, skipIntro, intro, tip, fontId, whale, whaleIdle, whaleGirl, brand, starred, starReveal, onStarClick, working, drift, egg, starChance, align, chrome, arrangement, companionSkin, mascotBox, }: {
    /** 模型/effort/工作目录只画在 full 形态里；minimal（落地页）不传也行。 */
    model?: string;
    effort?: string | undefined;
    cwd?: string;
    /** Test seam: mount straight into the settled header (probes skip the intro). */
    skipIntro?: boolean;
    /** Test seam: pin the intro animation instead of rolling one at startup. */
    intro?: WhaleIntroId;
    /** Big-text face id (settings `dsh-tui.splashFont`); undefined → the
     * date-rotated `pickSplashFont()`. */
    fontId?: string | undefined;
    /** Test seam: pin the startup tip line (probes need a deterministic tip). */
    tip?: Tip;
    /** Test seam: pin the holiday word pair instead of reading the local date
     * (`null` forces the normal words; `undefined` — production — rolls by
     * date). See `splashEggs.ts`. */
    egg?: SplashEgg | null;
    /** Test seam: pin the star tagline's chance (1 forces the egg, 0 suppresses
     * it; production rolls `SPLASH_STAR_CHANCE` once per mount). */
    starChance?: number;
    /** Show the pixel whale art (settings `dsh-tui.whale`); off → text-only header. */
    whale?: boolean;
    /** Swap the header's pixel whale for the maid portrait (settings
     * `dsh-tui.whaleGirl`; off by default). The portrait renders FIRST as a
     * real raster through the terminal image protocols (Kitty/Sixel —
     * `maidPortrait.tsx`), keeping the art's full fidelity; when the terminal
     * cannot (inline mode, unsupported protocol, decode failure) the
     * character-art maid (`WhaleGirl.tsx`, the author's placeholder to be
     * replaced with better art) takes the slot. Both forms are static, so
     * `whaleIdle` only animates the whale. */
    whaleGirl?: boolean;
    /** 品牌档（当前后端 → `brandOfProvider`，见 `branding.ts`）：claude 时
     * 大字词换 `CLAUDE`/`CODE`、配色换橙阶、立绘槽固定 Claude 娘（不看
     * whaleGirl 设置——鲸鱼与鲸鱼娘是 DeepSeek 品牌资产）。测试缝：缺省
     * `deepseek`，行为与品牌化之前逐字节一致。 */
    brand?: Brand;
    /** 本次会话已经 star 过：彩蛋标题换成「捡到一颗小星星啦」，不再重复求。 */
    starred?: boolean;
    /** 彩蛋渐显的测试缝：`instant` 时三行一次画全（静态渲染夹具用；真机不传）。 */
    starReveal?: 'instant';
    /** 求 star 标语那一行被点击时执行（一键 star，与 `/star` / `Alt+S` 同一个
     * 动作）。不传则那一行不可点——只有它出现时才有这个交互。 */
    onStarClick?: () => void;
    /** Welcome-phase idle whale behaviors — fin flutters, tail thumps,
     * sleep after inactivity (settings `dsh-tui.whaleIdle`; on by default —
     * an explicit `false` keeps the settled header timer-free). Click-hearts
     * work regardless, until the freeze. */
    whaleIdle?: boolean;
    /** Whether an agent turn is active. The FIRST active turn permanently
     * freezes the whale to the static standard frame (the idle planner and
     * click-hearts are welcome-phase features); sustained !working before
     * that lets it fall asleep. */
    working?: boolean;
    /** Test seam: pin/suppress the upstream-drift notice (`null` forces it off;
     * `undefined` — the production default — auto-detects the install). */
    drift?: UpstreamDriftSummary | null;
    /**
     * 排版对齐，默认 `start` = 转录区顶部那一版（逐字节不变）：
     *
     * - `start`  —— 并排行**占满整行**（`width="100%"`），欢迎语靠
     *   `welcomePad` 对齐到鲸鱼的视觉中线。转录区顶部要的正是这个：它左对齐在
     *   内容列上，下面的消息行也跟着左对齐。
     * - `center` —— 落地页要的那一版：**整块按内容宽度居中**（并排行不再是
     *   100% 宽，根盒 `alignItems="center"`），欢迎语交给外层居中、不再自己
     *   加缩进。缩进那套是"左对齐时把标语钉在鲸鱼下方"的解，居中的版面上
     *   再用一次就整体右移了。
     *
     * 内容完全同源（鲸鱼、字体、彩蛋、提示、漂移告警都走同一套代码），只有
     * 对齐交给父级。
     */
    align?: 'start' | 'center';
    /**
     * 装饰密度，默认 full = 转录区顶部那一版（逐字节不变）：词标 + 版本、
     * 模型/effort、工作目录、启动提示、漂移告警、欢迎语一应俱全。
     *
     * - full    —— 对话页开屏的信息密度（「我在哪、用的哪个模型」的答案）。
     * - minimal —— 落地页那一版（opencode 式留白）：只留立绘与块体
     *   DEEPSEEK/HARNESS 大字，其余信息行一概不画；欢迎语平时也不画
     *   （落地页的版面契约里它整行删除），只有求 star 里程碑标语出现时才
     *   画那几行——里程碑的露出不因落地页改版而丢。
     *
     * 内容与交互（字体、彩蛋、点击爱心/女仆娘、idle 规划器）两条 chrome
     * 完全同源，差异只在文字列的密度。
     */
    chrome?: 'full' | 'minimal';
    /**
     * 立绘与词标的排布：`row`（默认，转录区开屏形态：图在左、字在右）或
     * `column`（落地页形态：图在上、字在下，两者各自水平居中）。
     * 用户实测反馈「logo 和标题一定要居中」——并排时是**整组**居中，词标仍然
     * 偏在右半边；上下排布让两块各自落在中轴上，居中这件事不再有歧义。
     */
    arrangement?: 'row' | 'column';
    /** 测试缝：钉住启动页吉祥物皮肤（undefined——生产——读 companion.skin；
     *  'whale'/未知 = 维持原鲸鱼/女仆娘路径，见 SplashMascot.tsx）。 */
    companionSkin?: string;
    /** 落地页传入与高度预算相同的紧凑图片槽。 */
    mascotBox?: SplashImageBox;
}): React.ReactNode;
//# sourceMappingURL=LogoV2.d.ts.map
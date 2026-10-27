import React from 'react';
import type { TerminalImageSource } from '../ink/terminal-image.js';
/**
 * The maid portrait (鲸鱼娘) for `dsh-tui.whaleGirl` and the star modal —
 * the author-designed 464×464 pixel art shipped at `assets/whale-girl/`,
 * rendered FIRST as a real raster through the terminal image protocols
 * (Kitty graphics / Sixel): full fidelity, anti-aliased curves, the whole
 * palette. The chain degrades per surface when images cannot show — the
 * header falls back to the character-art maid (`WhaleGirl.tsx`, the
 * author's placeholder), the star modal to the animated pixel whale — so
 * the setting never leaves the header worse than the whale it replaces.
 */
/** 一套立绘资产：`assets/` 下的目录 + `normal`/`happy` 两张变体。 */
export interface PortraitAssets {
    readonly dir: string;
    readonly normal: string;
    readonly happy: string;
}
/** 鲸鱼娘（DeepSeek 品牌，settings `dsh-tui.whaleGirl`）。 */
export declare const MAID_ASSETS: PortraitAssets;
/** Claude 娘（claude 品牌，见 `branding.ts`）：取自 cc-bridge 的开发期占位
 * 素材（1024×1024 透明底×2）。授权注记：那边的 assets/README 标注授权未
 * 确认——本仓库自用没问题，再分发前需确认或替换。 */
export declare const CLAUDE_GIRL_ASSETS: PortraitAssets;
/** 恶魔精灵（codex 品牌，见 `branding.ts`）：用户提供的淡紫像素立绘 ×2
 * （628×628 透明底，Lanczos 自 1254² 重采样）——常态 = 淡紫恶魔精灵头像，
 * 点击后切「按下红色按钮的紫月龙裔少女」几秒（与鲸鱼娘/claude 娘同一套
 * reactMaid 交互）。 */
export declare const CODEX_GIRL_ASSETS: PortraitAssets;
/** 品牌档 → 立绘资产集（LogoV2 的立绘槽选这一份；deepseek 走鲸鱼娘）。 */
export declare function portraitAssetsOf(brand: 'deepseek' | 'claude' | 'codex'): PortraitAssets;
/** 一台机器上的两张立绘都解好、并补齐到**同一像素画布**上——几何完全一致，
 *  换图时宿主是「擦旧 + 画新」一次写入，不会留残影。 */
export interface MaidPortraits {
    readonly normal: TerminalImageSource;
    readonly happy: TerminalImageSource;
}
/**
 * 解码一套立绘的两张变体（每套缓存一次）。两张都裁掉透明边后**居中补到
 * 同一张透明画布**（取两者较大的宽高）——所以它们的像素尺寸与单元格盒
 * 完全一致。资产候选同时覆盖两种目录深度：`lib/types/components`（发布
 * 形态）比 `src/components`（仓库形态）深一层。
 * @param assets - 资产集（默认鲸鱼娘；claude 品牌传 `CLAUDE_GIRL_ASSETS`）。
 * @returns 两张 RGBA 源；任一张缺失/解码失败时整体 `undefined`。
 */
export declare function loadMaidPortraits(assets?: PortraitAssets): Promise<MaidPortraits | undefined>;
/**
 * 两张立绘，终端图像能力确认后解码（一次把两张都备好，点击换图不等待）。
 * @param enabled - `useTerminalImages()` 的结果；为假时根本不解码。
 * @param assets - 资产集（默认鲸鱼娘；claude 品牌传 `CLAUDE_GIRL_ASSETS`）。
 * @returns 两张 RGBA 源；未就绪/不可用时为 `undefined`。
 */
export declare function useMaidPortraits(enabled: boolean, assets?: PortraitAssets): MaidPortraits | undefined;
/**
 * The portrait's center column inside the whale's 40-column slot: the
 * aspect-fit image spans columns 5..34 (center 19.5). The welcome tagline
 * centers on this instead of `WHALE_CENTER` while the portrait shows.
 */
export declare const MAID_BOX_CENTER = 19.5;
/**
 * The portrait as an Ink component: a `width × height` cell box (aspect-fit
 * from the real cell metrics so pixels stay square), centered horizontally
 * by the caller's slot. `presentation` follows the surface — `'transcript'`
 * opts into Sixel for the scrollable header, `'preview'` for modal cards —
 * and the portrait always floats `transparent`: her trimmed silhouette sits
 * on whatever the terminal shows, with no backing rectangle behind it.
 */
export declare function MaidPortrait({ source, maxColumns, maxRows, presentation, }: {
    /** Decoded RGBA snapshot; `undefined` keeps the caller's fallback. */
    readonly source?: TerminalImageSource;
    /** Cell budget (the header passes the whale's 40-column slot). */
    readonly maxColumns: number;
    readonly maxRows: number;
    readonly presentation: 'transcript' | 'preview';
}): React.ReactNode;
//# sourceMappingURL=maidPortrait.d.ts.map
import type { Brand } from '../branding.js';
/** 启动页立绘槽的占行：鲸鱼自然高度、portrait 的 minimal 等高盒、吉祥物的侧栏默认盒。 */
export declare const WHALE_ART_ROWS = 13;
export declare const PORTRAIT_ART_ROWS = 11;
export declare const MASCOT_ART_ROWS = 15;
export type SplashArtForm = 'whale' | 'portrait' | 'mascot';
export interface SplashImageBox {
    readonly columns: number;
    readonly rows: number;
}
/** 与 LogoV2 的默认品牌及 mascot → portrait → whale 分支一致。 */
export declare function resolveSplashArtForm(input: {
    readonly brand: Brand | undefined;
    readonly whaleGirl: boolean;
    readonly mascotSkin: string | undefined;
}): SplashArtForm;
export declare function splashArtRows(form: SplashArtForm, imageBox?: SplashImageBox): number;
/**
 * 启动页图片按原生画布占位：只缩小、不预留放大后用不上的空间。
 * 同一个稳定画布用于全部动画帧；不按 alpha 包围盒逐帧裁剪。
 */
export declare function fitSplashImageBox(source: {
    readonly width: number;
    readonly height: number;
}, cell: {
    readonly width: number;
    readonly height: number;
}, limit: SplashImageBox): SplashImageBox;
//# sourceMappingURL=splashArtRows.d.ts.map
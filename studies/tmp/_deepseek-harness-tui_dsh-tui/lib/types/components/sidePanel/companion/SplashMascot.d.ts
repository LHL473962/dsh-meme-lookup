/**
 * 启动页吉祥物（LogoV2 艺术槽，2026-10 复用轮）。
 *
 * 吉祥物跟随 companion.skin：deepy → 字母格动画；whaleGirl → 鲸娘动画
 * （经 WhaleGirlSkin 内部的图像协议自适应：kitty/sixel 走 img/ 帧管线，
 * 无协议回退字母格帧包——首帧字母格同步可画，图像异步解码完成后替换，
 * 绝不让启动帧等 IO）。whale 皮肤不进本组件（LogoV2 维持原分层鲸路径）。
 *
 * 动画/互动语义与侧栏宠物同源（零复制），但按 2026-10 用户拍板收窄：
 * 启动页是瞬时门面——**不做空闲轮换**，稳态恒播单一 idle 动画（循环）；
 * 点击 = poke（左/右半判定，播 poke-left/right 头段；鲸娘在 poke 后接一段
 * smile-hearts 爱心——同面板「亲昵互动」语义，deepy 帧包无爱心键故只 poke）；
 * 连点 = 900ms 内 ≥3 次触发 tickle（复用 mood.ts 的 TICKLE_WINDOW_MS/
 * TICKLE_MIN_CLICKS 判定）；播完自然回稳态 idle。不做拖拽。
 * active=false（第一个任务后冻结，照鲸鱼的 whaleFrozen 契约）或卸载后零
 * 时钟：定格 idle 帧 0，interval 清空。
 *
 * 欢迎语/求星标语不在本组件——按 2026-10 用户拍板保持原「艺术下方居中」
 * 渲染路径（LogoV2 底部块，welcomePad 缩进）。
 */
import React from 'react';
import { type SplashImageBox } from '../../splashArtRows.js';
export type SplashMascotSkin = 'deepy' | 'whaleGirl';
/** 读 companion.skin（LogoV2 的测试缝 prop 优先）；非吉祥物皮肤返回
 *  undefined（LogoV2 走原鲸鱼/女仆娘路径，零改动）。 */
export declare function useSplashMascotSkin(pinned?: string): SplashMascotSkin | undefined;
/** 图片原生尺寸的紧凑槽；仅启动页使用，协议/像元/素材未就绪时保持原回退。 */
export declare function useSplashMascotBox(skin: SplashMascotSkin | undefined, compact: boolean): SplashImageBox | undefined;
/** 启动页吉祥物本体：按 skin 渲染动画，点击交互（poke/连点）在内层盒。 */
export declare function SplashMascot({ skin, active, imageBox }: {
    readonly skin: SplashMascotSkin;
    readonly imageBox?: SplashImageBox;
    /** 动画许可：false（冻结/落地页 whaleIdle=false）时定格 idle 帧 0、零时钟。 */
    readonly active: boolean;
}): React.ReactNode;
//# sourceMappingURL=SplashMascot.d.ts.map
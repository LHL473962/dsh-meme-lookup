/**
 * Companion 皮肤接口与注册表（设计分文档 §3 + v2.1）：皮肤拿到的是
 * CompanionPose（多层语义 + nativeWhalePose）与渲染上下文；皮肤只实现
 * 自己理解的语义子集，未支持的姿态退化而不是报错。
 *
 * 用户的 deepy 是默认皮肤（DEEPY_MOOD_ANIMATION 逐心情整段动画）；
 * WhaleGirlSkin 用用户提供的鲸娘素材包（assets/whaleGirl，映射表与 deepy
 * 同源，仅 smile-hearts / thumbs-up 两键独有）；WhaleSkin 复用开屏分层
 * 规划器的 nativeWhalePose（与 splash 帧级一致）。
 * 插件皮肤（纯数据帧表，分文档 §6）留到 Phase 7，注册表先把接缝定好：
 * 皮肤 = id + cells + render(pose, ctx)，自定义皮肤走同一接口进入。
 */
import React from 'react';
import type { SplashImageBox } from '../../splashArtRows.js';
import type { I18nKey } from '../../../i18n.js';
import type { TerminalImageSource } from '../../../ink/terminal-image.js';
import type { CompanionMood } from './mood.js';
import type { CompanionPose } from './pose.js';
export interface CompanionSkinRenderInput {
    readonly pose: CompanionPose;
    /** 当前心情进入的时刻（动画从 0 计 elapsed 的起点）。 */
    readonly moodSince: number;
    readonly now: number;
    /** 可用宽度（皮肤永不超宽：宽度不足由 Panel 决定用不用 small）。 */
    readonly width: number;
    /** 当前应播的动画键——CompanionPanel 的平滑层+互动层裁决结果，取
     *  deepy 规范键词汇表（即素材包 20 键：'typing' / 'poke-left' /
     *  'tickle' / 'idle-look' / 'notification' …），任何皮肤都能对互动
     *  做反应；互动覆盖期间 moodSince = 覆盖开始时刻（elapsed 从头播）。
     *  旧调用方（缺省）皮肤退回 pose.mood 分层，属皮肤接口「未支持即
     *  退化」契约。 */
    readonly animationSemantic?: string;
    /** 启动页专属紧凑图片槽；侧栏不传，保持原来的固定几何。 */
    readonly imageBox?: SplashImageBox;
}
export interface CompanionSkin {
    readonly id: string;
    readonly titleKey?: I18nKey;
    readonly title?: string;
    /** 固定占位（列×行），永不随帧变化（§16.6 列宽不变硬约束）。 */
    readonly cells: {
        readonly columns: number;
        readonly rows: number;
    };
    readonly graphics: 'none' | 'optional' | 'required';
    /** 本皮肤对 animationSemantic（deepy 规范键）的声明式落点表：规范键
     *  → 自家动画键；未列出的键同名直通（自家 kit 键集相同即可）。皮肤
     *  解析不出落点（semanticMap 缺 + 自家 kit 也没有同名键）→ 退回 mood
     *  层（pose.mood/pose.heart），不报错。像素鲸这类无帧表皮肤不声明，
     *  维持原样忽略。 */
    readonly semanticMap?: Readonly<Record<string, string>>;
    render(input: CompanionSkinRenderInput): React.ReactNode;
}
/** deepy 小鲸鱼（默认）：语义/心情 → 动画，elapsed → frameAt 确定性选帧。 */
export declare const DeepySkin: CompanionSkin;
/** 图像轨单元格盒列数：15 行预算 × 像元比 × 帧宽高比，钳在 cells.columns
 * （超出时调用方按 contain 收行）。导出供回归锁「cells 常量 == 常见像元比
 * 下的实际图宽」（空气墙契约：盒宽=图宽）。 */
export declare function whaleGirlImageBoxColumns(cell: {
    readonly width: number;
    readonly height: number;
}, frameRatio: number): number;
/** 鲸娘语义表：deepy 的语义/上下文/互动/通知反应表 key 同名直通，仅
 *  notice（悬停本体）→ smile-hearts、happy（庆祝）→ thumbs-up 两处覆盖。
 *  回归用它做全语义覆盖检查；运行时 CompanionPanel 把裁决出的
 *  animationSemantic 交给每个皮肤的 render（WhaleGirlSkin.semanticMap
 *  即本表），互动/通知反应因此同样能到非 deepy 皮肤。 */
export declare const WHALE_GIRL_SEMANTIC_ANIMATION: Readonly<Record<string, string>>;
/** pose → 鲸娘动画键（纯函数，回归直接测）：亲昵互动（爱心 pass，
 *  CompanionPanel 在点击宠物 / Enter 戳一戳时 arm）优先于心情。 */
export declare function whaleGirlAnimationKey(mood: CompanionMood, heart: number): string;
/** 鲸娘动画键裁决（字母格与图像两条路径共用）：semanticMap 映射 >
 *  爱心 pass > 心情层，与 whaleGirlAnimationKey 的优先级一致。每个候选
 *  都要过 hasKey（在素材包里、没解码失败过），不过就沿链往下：semantic
 *  → heart → mood → idle；全部不可用返回 undefined，由调用方退字母格
 *  或保持上一帧。导出供回归直接测这条链。 */
export declare function resolveWhaleGirlAnimationKey(pose: CompanionPose, animationSemantic: string | undefined, hasKey: (key: string) => boolean): string | undefined;
export declare const WhaleGirlSkin: CompanionSkin;
interface WhaleGirlImageTiming {
    readonly dur: number;
    readonly file: string;
}
interface WhaleGirlImageAnimation {
    readonly key: string;
    readonly frames: readonly WhaleGirlImageTiming[];
    /** 全部帧 dur 总和（循环周期）。 */
    readonly totalMs: number;
}
interface WhaleGirlImageKit {
    /** img/ 目录的绝对路径（帧 PNG 解码用）。 */
    readonly dir: string;
    /** idle 首帧 PNG 头部声明的稳定画布，不等待像素解码。 */
    readonly canvas?: {
        readonly width: number;
        readonly height: number;
    };
    readonly byKey: Readonly<Record<string, WhaleGirlImageAnimation>>;
}
/** 惰性加载 + 缓存图像 timings；缺失/校验失败返回 undefined（退字母格）。 */
export declare function loadWhaleGirlImageKit(): WhaleGirlImageKit | undefined;
/** elapsed 时刻应显示第几帧：dur 累加取模，与 deepy.frameAt 同语义
 *  （确定性、可单测；回归里与 frameAt 逐 elapsed 比对）。 */
export declare function whaleGirlImageFrameIndexAt(animation: WhaleGirlImageAnimation, elapsedMs: number): number;
/** 订阅缓存写入/驱逐（uSES 的 subscribe 面；回归直接用它观测 revision）。 */
export declare function subscribeDecodedImageCache(listener: () => void): () => void;
/** 预热键集：面板可见且动画时钟在走时，把常用互动键（idle + poke
 *  左/右 + smile-hearts）提前异步解码进 LRU，换键时少等一次解码。
 *  导出供回归检查。 */
export declare const WHALE_GIRL_PREHEAT_KEYS: readonly string[];
/** 测试观测点：当前进程已解码了哪些动画（惰性解码断言用）。 */
export declare function whaleGirlDecodedAnimationKeys(): readonly string[];
/** 测试接缝：LRU 迭代序（= 最近使用序）。 */
export declare function decodedImageAnimationOrderForTests(): readonly string[];
/** 测试接缝：注入假帧，制造 32MiB 驱逐压力（不触发真实解码）。 */
export declare function injectDecodedAnimationForTests(key: string, frames: readonly TerminalImageSource[]): void;
/** 测试观测点：解码发起总次数。 */
export declare function whaleGirlDecodeRequestCountForTests(): number;
/** 测试接缝：登记解码失败键（模拟坏 PNG，不动真实资产）。 */
export declare function injectFailedAnimationForTests(key: string): void;
/** 测试接缝：清图像层缓存（timings kit + 已解码动画 + 失败集合 + 字母开窗渲染）。 */
export declare function resetWhaleGirlImageCacheForTests(): void;
/** 鲸娘图像路径的帧缓存 hook：activeKey 为 undefined（面板不可见/无
 *  动画）时不做任何事；命中缓存同步返回，未命中异步解码完成后返回。
 *  缓存 revision 是解码 effect 的依赖：键没变但被预热或别的实例挤出
 *  缓存时，effect 重跑并重新解码。每次 commit 后刷新当前键的 LRU 位置。
 *  导出供回归在真渲染器下测试。 */
export declare function useDecodedWhaleGirlFrames(activeKey: string | undefined, kit: WhaleGirlImageKit | undefined): readonly TerminalImageSource[] | undefined;
/** 保持上一帧的 hook：render 把本次候选图像交进来，没有候选时返回上一
 *  次已提交的图像。「上一帧」和「是否显示过」只在 commit 后的 layout
 *  effect 里写，被放弃的 concurrent render 不会改动它们。保持期间返回
 *  同一个元素引用，逐 tick 重渲染不会重画子树。返回 [要显示的节点,
 *  是否显示过]；节点为 undefined 表示从未显示过（调用方画字母格）。
 *  导出供回归在 ConcurrentRoot 下测试。 */
export declare function useHeldCommittedImage(candidate: React.ReactNode): readonly [committed: React.ReactNode, everCommitted: boolean];
/** 现有像素鲸鱼：直接消费 nativeWhalePose（与开屏 splash 同一规划器、
 *  同一帧表、同一 LAYERED_CACHE）。 */
export declare const WhaleSkin: CompanionSkin;
/** 按 id 取皮肤；未知 id 回退默认（DeepySkin）。 */
export declare function resolveCompanionSkin(id: string | undefined): CompanionSkin;
/** 自定义皮肤注册接缝（用户自定义 / 插件皮肤的进入点；描述符校验
 *  规则随 Phase 7 的插件皮肤一起落地）。 */
export declare function registerCompanionSkin(skin: CompanionSkin): void;
export {};
//# sourceMappingURL=skins.d.ts.map
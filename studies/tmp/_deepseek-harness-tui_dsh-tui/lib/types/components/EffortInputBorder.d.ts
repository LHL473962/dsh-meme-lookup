/**
 * EffortInputBorder — 输入框层上的三幕点焰叠加（对齐 Codex 的完整
 * 语义：光扫过、档位字样浮现、整体渐隐）。
 *
 * 输入框只有顶/底两条横边框（round、无左右）——本组件自绘这两行，
 * **同步**承载动画；档位字样由输入行尾的 EffortTierBadge 短暂显示
 * （见 PromptInput），动画全程行数恒定。切到最高思考强度档时：
 *
 *   1. 扫光 [0, 1s)——一段高亮彩色光带沿顶/底边框同步自左向右扫过
 *      （wave 波形逐列变色），期间输入框完全正常可用；
 *   2. 档位字样 [600ms, ~1.1s)——光带行至中段时，输入行居中浮现
 *      档名大写（由暗渐亮加粗、间距聚拢，见 EffortTierBadge）；
 *   3. 渐隐 [1.5s, 2s)——字样连同光色一起向主题色淡出，末帧归零：
 *      静止时顶/底边框就是原主题色，内容区无任何附加物。
 *
 * glyph 变化仅限字样行的出现/让位（一次性）；其余帧间变化全部是既
 * 有 `─` 的前景色。触发判定在渲染期做（props-变化-调整模式）；从
 * 「已有档位」切到档位表末位最高档才触发，冷启动恢复偏好/单档表/
 * 无档位表/无共享时钟均不触发。时钟复用 Ink core 共享时钟，仅动画
 * 窗口订阅（keepAlive），播完回到零开销静止边框。
 */
import React from 'react';
import type { Color } from '../ink/styles.js';
import type { Theme } from '../theme.js';
/** A static chip on the top border row used for the session label. */
export interface InputBorderLabel {
    /** Visible text (already width-truncated by the caller). */
    text: string;
    /** Chip background (theme token or raw color). */
    color: keyof Theme | Color;
    /** Chip foreground (theme token or raw color). */
    ink: keyof Theme | Color;
}
export declare function EffortInputBorder({ effort, levels, columns, idleColor, topRightLabel, children, }: {
    /** 当前思考强度档 id；`undefined` 表示路线未声明。 */
    effort: string | undefined;
    /** 当前路线的档位表（低→高，末位为最高档）；未知时传 `undefined`。 */
    levels: readonly string[] | undefined;
    columns: number;
    /** 静止边框色（主题 token 名，如 'promptBorder' / 'planMode'）。 */
    idleColor: keyof Theme | Color;
    /** 顶边框右侧的静态标签 chip（会话名标签）；undefined = 不显示。 */
    topRightLabel?: InputBorderLabel;
    children: React.ReactNode;
}): React.ReactNode;
//# sourceMappingURL=EffortInputBorder.d.ts.map
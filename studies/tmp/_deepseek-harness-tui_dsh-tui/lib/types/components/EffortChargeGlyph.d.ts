/**
 * EffortChargeGlyph — 输入提示前缀 `❯ ` 的最高档强调与充能。
 *
 * 思考强度处于当前路线最高档期间，前缀换为点火强调色（加粗，与点焰波
 * 共用主题 ignition——同一瞬间前缀与波同色）；切到最高档的瞬间做一次
 * 150ms「充能」渐变（accentRamp 的暗端 → 全值）。冷启动已在最高档时
 * 不充能（充能只属于切换瞬间），离开最高档恢复原样的 dim 行为。
 *
 * 触发判定在渲染期做（React 官方的「props 变化即调整 state」模式，
 * 与 EffortInputBorder 同一模式）——放 effect 会晚一帧，effort 变化
 * 的首帧以全亮闪现、下一帧才跌回暗端重来。充能只动颜色，glyph 恒为
 * `❯ `，SGR-only 规则天然成立。
 *
 * 时钟复用 Ink core 共享时钟，且只在充能未满的那 150ms 内订阅；稳态
 * 零定时器、零重渲染，前缀色取记忆化常量。
 */
import React from 'react';
export declare function EffortChargeGlyph({ effort, levels, working, }: {
    /** 当前思考强度档 id；`undefined` 表示路线未声明。 */
    effort: string | undefined;
    /** 当前路线的档位表（低→高，末位为最高档）。 */
    levels: readonly string[] | undefined;
    /** 模型工作中时前缀照旧压暗（既有语义）。 */
    working: boolean;
}): React.ReactNode;
//# sourceMappingURL=EffortChargeGlyph.d.ts.map
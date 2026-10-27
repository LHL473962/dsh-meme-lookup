import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
import { useContext, useEffect, useReducer, useState } from 'react';
import { Box, Text, useTheme } from '../ui.js';
import { ClockContext } from '../ink/components/ClockContext.js';
import { stringWidth } from '../ink/stringWidth.js';
import { IGNITION_TIMELINE, ignitionColors, ignitionLineColors } from '../trajectory/effortIgnition.js';
/** 边框行（顶/底共用同一色段序列——同步变色）。顶行可在右圆角前插入
 *  一个静态标签 chip（会话名），占用的列数从色段序列里扣掉，行宽不变。 */
function BorderRow({ left, right, runs, idleColor, label, }) {
    const labelWidth = label === undefined ? 0 : stringWidth(` ${label.text} `);
    // chip 与右圆角之间的留白（边框线格数）：视觉上不让标签贴死 ╮。
    const labelGap = label === undefined ? 0 : 2;
    // 裁剪色段序列到剩余列数（label 行与底行的列数一致，总宽不变）。
    // 色段保留左侧部分，右侧让位给 chip + 留白（右上角布局）。
    let budget = Math.max(0, runs.reduce((sum, run) => sum + run.glyph.length, 0) - labelWidth - labelGap);
    const clipped = [];
    for (const run of runs) {
        if (budget <= 0)
            break;
        const take = Math.min(run.glyph.length, budget);
        if (take > 0)
            clipped.push({ glyph: run.glyph.slice(0, take), color: run.color });
        budget -= take;
    }
    return (_jsx(Box, { width: "100%", height: 1, flexShrink: 0, overflow: "hidden", children: _jsxs(Text, { wrap: "truncate-end", children: [_jsx(Text, { color: idleColor, children: left }), clipped.map((run, i) => (_jsx(Text, { color: run.color, children: run.glyph }, i))), label !== undefined && (_jsx(Text, { backgroundColor: label.color, color: label.ink, children: ` ${label.text} ` })), label !== undefined && _jsx(Text, { color: idleColor, children: '─'.repeat(labelGap) }), _jsx(Text, { color: idleColor, children: right })] }) }));
}
export function EffortInputBorder({ effort, levels, columns, idleColor, topRightLabel, children, }) {
    const clock = useContext(ClockContext);
    // 扫光色取自当前主题（ignition / ignitionDim），与 ─ 底色的取用方式一致；
    // 缺键的旧主题回落到点火专属的蓝白对。
    const [themeName] = useTheme();
    const [overlay, setOverlay] = useState(null);
    const [prevEffort, setPrevEffort] = useState(effort);
    const [, forceRender] = useReducer((tick) => tick + 1, 0);
    // 渲染期触发：effort 变化的首帧就以新状态渲染（effect 会晚一帧）。
    if (effort !== prevEffort) {
        setPrevEffort(effort);
        if (clock !== null &&
            effort !== undefined &&
            levels !== undefined &&
            levels.length > 1 &&
            effort === levels[levels.length - 1]) {
            setOverlay({ label: effort.toUpperCase(), startedAtMs: clock.now() });
        }
    }
    // 仅动画窗口订阅共享时钟；静止边框零定时器零重渲染。
    const elapsedMs = overlay === null ? Infinity : Math.max(0, (clock?.now() ?? Date.now()) - overlay.startedAtMs);
    useEffect(() => {
        if (overlay === null || clock === null)
            return;
        return clock.subscribe(() => forceRender(), /* keepAlive */ true);
    }, [overlay, clock]);
    useEffect(() => {
        if (overlay !== null && elapsedMs >= IGNITION_TIMELINE.fadeEndMs)
            setOverlay(null);
    }, [overlay, elapsedMs]);
    const midWidth = Math.max(0, columns - 2);
    const sweepColors = overlay !== null && elapsedMs < IGNITION_TIMELINE.sweepMs && midWidth > 0
        ? ignitionLineColors({ elapsedMs, width: midWidth, colors: ignitionColors(themeName) })
        : [];
    // 顶/底共用的色段序列（同步）：扫光列取波形色，其余列回主题色。
    const runs = [];
    for (let index = 0; index < midWidth; index++) {
        const color = sweepColors[index] ?? idleColor;
        const last = runs[runs.length - 1];
        if (last !== undefined && last.color === color)
            last.glyph += '─';
        else
            runs.push({ glyph: '─', color });
    }
    return (_jsxs(Box, { flexDirection: "column", alignItems: "flex-start", justifyContent: "flex-start", width: "100%", flexShrink: 0, children: [_jsx(BorderRow, { left: "\u256D", right: "\u256E", runs: runs, idleColor: idleColor, label: topRightLabel }), _jsx(Box, { flexShrink: 0, children: children }), _jsx(BorderRow, { left: "\u2570", right: "\u256F", runs: runs, idleColor: idleColor })] }));
}

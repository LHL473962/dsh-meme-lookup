import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Box, Text, useAnimationFrame, useTerminalSize } from '../../ui.js';
import { t } from '../../i18n.js';
import { resolvePreset } from '../activityFrames.js';
import { toolNameColor } from '../messages/AssistantToolUseMessage.js';
import { stringWidth } from '../../ink/stringWidth.js';
import { isMinimalUiMode } from '../../minimalUiMode.js';
/** The waterfall window is a Kimi Code style constant-height region. */
const WATERFALL_ROWS = 3;
/** Card left padding + the `│ ` gutter prefix. */
const WATERFALL_GUTTER = 4;
function duration(ms = 0) {
    const seconds = Math.floor(ms / 1000);
    return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m${seconds % 60}s`;
}
function tokens(row) {
    const total = row.tokens?.total ?? ((row.tokens?.input ?? 0) + (row.tokens?.output ?? 0) || 0);
    return total > 0 ? `${total} tok` : '- tok';
}
function status(row) {
    const minimalUi = isMinimalUiMode();
    if (row.status === 'completed')
        return { glyph: minimalUi ? '✓' : '🟢', label: t('subagent-status-completed'), color: minimalUi ? undefined : 'success' };
    if (row.status === 'failed')
        return { glyph: minimalUi ? '×' : '🔴', label: t('subagent-status-failed'), color: minimalUi ? undefined : 'error' };
    if (row.status === 'cancelled')
        return { glyph: minimalUi ? '×' : '🔴', label: t('subagent-status-cancelled'), color: minimalUi ? undefined : 'error' };
    // No end was ever reported (the run's process is gone): settled, unknown.
    if (row.status === 'unknown')
        return { glyph: minimalUi ? '·' : '⚪', label: t('subagent-status-unknown'), color: minimalUi ? undefined : 'subtle' };
    return { glyph: minimalUi ? '·' : '🟡', label: t('subagent-status-running'), color: minimalUi ? undefined : 'warning' };
}
/** Hard single-line clip by display width — a wrapped waterfall row would
 * break the constant-height window. */
function clipLine(text, maxWidth) {
    if (maxWidth <= 1)
        return '';
    let width = 0;
    let index = 0;
    while (index < text.length) {
        // Advance by the next full code point so wide glyphs (CJK, emoji) are
        // never split in half.
        const next = text.codePointAt(index);
        const char = String.fromCodePoint(next);
        const charWidth = stringWidth(char);
        if (width + charWidth > maxWidth - 1)
            break;
        width += charWidth;
        index += char.length;
    }
    return index < text.length ? `${text.slice(0, index)}…` : text;
}
/**
 * Borderless, fixed-height activity card embedded directly in the transcript
 * (Kimi Code visual language). Running: header + one-line current tool + a
 * constant 3-row waterfall (each row hard-clipped to one terminal line so
 * the card height never changes). Settled: folds to the header line alone
 * (failure keeps one error line). The running glyph reuses the user's
 * working-activity preset (`/activity`), so the indicator follows the same
 * setting as the main spinner.
 */
export function SubagentMessage({ subagent, marginTopOnTurn, activityFrames, onClick, onOpenView }) {
    const settled = subagent.status === 'completed' || subagent.status === 'failed' || subagent.status === 'cancelled' || subagent.status === 'unknown';
    // 动画订阅仅限运行中的卡片：settled 后传 null 退出共享 clock（keepAlive
    // 归零 → interval 清除），否则历史里的每张完成卡片都以 120ms 永久驱动
    // React commit。viewportRef 必须挂到根节点——useTerminalViewport 初始
    // isVisible:true，ref 不挂就永远不修正（虚拟化滚出视口的卡片继续动画）。
    const [viewportRef, time] = useAnimationFrame(settled ? null : 120);
    const { columns } = useTerminalSize();
    const info = status(subagent);
    const [hovered, setHovered] = React.useState(false);
    const clickable = onClick !== undefined;
    const elapsed = subagent.completedAt ? subagent.durationMs : Date.now() - subagent.startedAt;
    const lastRunning = [...subagent.toolCalls].reverse().find(tool => tool.status === 'running');
    const previousDone = lastRunning
        ? subagent.toolCalls[subagent.toolCalls.indexOf(lastRunning) - 1]
        : subagent.toolCalls[subagent.toolCalls.length - 1];
    const preset = React.useMemo(() => resolvePreset(activityFrames), [activityFrames]);
    const activity = settled ? [] : subagent.outputLines.slice(-WATERFALL_ROWS);
    const runningGlyph = preset.frames[Math.floor(time / preset.intervalMs) % preset.frames.length] ?? '·';
    const rowWidth = Math.max(20, (columns ?? 80) - WATERFALL_GUTTER);
    // 点击打开详情场景；hover 不刷整行背景（转录视觉保持安静），只把状态
    // glyph 提亮为品牌色作为可点指示。
    return _jsxs(Box, { flexDirection: "column", marginTop: marginTopOnTurn ? 1 : 0, paddingLeft: 2, ref: viewportRef, onClick: onClick, onMouseEnter: clickable ? () => setHovered(true) : undefined, onMouseLeave: clickable ? () => setHovered(false) : undefined, children: [_jsxs(Box, { flexDirection: "row", gap: 1, children: [_jsx(Text, { color: hovered && clickable ? 'accent' : info.color, children: settled ? info.glyph : ` ${runningGlyph}` }), _jsx(Text, { bold: true, color: hovered && clickable ? 'accent' : undefined, children: `${t('subagent-card-prefix')}${subagent.description}` }), _jsx(Text, { dimColor: true, children: "\u00B7" }), _jsx(Text, { children: subagent.model ?? subagent.provider ?? 'default' }), subagent.effort && _jsxs(_Fragment, { children: [_jsx(Text, { dimColor: true, children: "\u00B7" }), _jsx(Text, { dimColor: true, children: subagent.effort })] }), _jsx(Text, { dimColor: true, children: "\u00B7" }), _jsx(Text, { dimColor: true, children: duration(elapsed) }), _jsx(Text, { dimColor: true, children: "\u00B7" }), _jsx(Text, { dimColor: true, children: tokens(subagent) }), _jsx(Text, { dimColor: true, children: "\u00B7" }), _jsxs(Text, { dimColor: true, children: [subagent.toolCalls.length, " tools"] }), _jsx(Text, { dimColor: true, children: "\u00B7" }), _jsx(Text, { color: info.color, children: info.label }), onOpenView !== undefined && (_jsx(Box, { flexShrink: 0, marginLeft: 1, onClick: (event) => {
                            // 拦截冒泡：这一格是「主屏查看」，不是卡片点击（→详情）。
                            event.stopImmediatePropagation();
                            onOpenView();
                        }, onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false), children: _jsx(Text, { color: hovered ? 'accent' : 'subtle', children: '⤢' }) }))] }), !settled && (lastRunning ?? previousDone) !== undefined && (_jsx(Text, { wrap: "truncate", children: lastRunning !== undefined ? (_jsxs(_Fragment, { children: [previousDone !== undefined && (_jsxs(_Fragment, { children: [_jsx(Text, { dimColor: true, children: '  · ' }), _jsx(Text, { color: "success", children: "\u2713" }), _jsx(Text, { color: toolNameColor(previousDone.name), children: previousDone.name }), _jsx(Text, { dimColor: true, children: ' · ' })] })), lastRunning.argsPreview === undefined && (_jsx(Text, { color: toolNameColor(lastRunning.name), children: lastRunning.name })), lastRunning.argsPreview !== undefined && (_jsxs(_Fragment, { children: [_jsx(Text, { color: toolNameColor(lastRunning.name), children: lastRunning.name }), _jsx(Text, { dimColor: true, children: ` (${clipLine(lastRunning.argsPreview.replace(/\s+/g, ' ').trim(), Math.max(10, rowWidth - lastRunning.name.length - 6))})` })] }))] })) : (previousDone !== undefined && (_jsxs(_Fragment, { children: [_jsx(Text, { dimColor: true, children: '  · ' }), _jsx(Text, { color: "success", children: "\u2713" }), _jsx(Text, { color: toolNameColor(previousDone.name), children: previousDone.name }), previousDone.argsPreview !== undefined && (_jsx(Text, { dimColor: true, children: ` (${clipLine(previousDone.argsPreview.replace(/\s+/g, ' ').trim(), Math.max(10, rowWidth - previousDone.name.length - 6))})` }))] }))) })), !settled && Array.from({ length: WATERFALL_ROWS }, (_, index) => (_jsx(Text, { dimColor: true, wrap: "truncate", children: `  │ ${clipLine(activity[index] ?? '', rowWidth)}` }, `${subagent.agentId}-wf-${index}`))), settled && subagent.status === 'failed' && subagent.error && (_jsx(Text, { color: "error", wrap: "truncate", children: `  └ ${clipLine(subagent.error, rowWidth)}` }))] });
}

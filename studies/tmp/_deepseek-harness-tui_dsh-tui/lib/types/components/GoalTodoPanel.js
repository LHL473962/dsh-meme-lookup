import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { Box, Text, useAnimationFrame } from '../ui.js';
import wrapText, { wrapTextLines } from '../ink/wrap-text.js';
import { t } from '../i18n.js';
import { primaryComboString } from '../utils/keymap.js';
import { formatGoalBudget, formatGoalBudgetCompact } from '../channel/goal-command.js';
import { useTooltip } from './Tooltip.js';
import { stringWidth } from '../ink/stringWidth.js';
/** Maximum todo rows shown before the overflow line. */
const MAX_TODOS = 8;
const PHASE_LABEL = {
    active: '● active',
    paused: '⏸ paused',
    blocked: '⛔ blocked',
    complete: '✓ complete',
};
/** Compact phase marker for the status-footer chip. */
const PHASE_GLYPH = {
    active: '●',
    paused: '⏸',
    blocked: '⛔',
    complete: '✓',
};
function phaseColor(phase) {
    if (phase === 'active')
        return 'success';
    if (phase === 'paused')
        return 'warning';
    if (phase === 'blocked')
        return 'error';
    return undefined;
}
/** `47s` under a minute, `3m12s` after — same shape as the subagent cards. */
function formatDuration(ms) {
    const seconds = Math.max(0, Math.floor(ms / 1000));
    return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m${seconds % 60}s`;
}
/**
 * Compact goal chip for the status footer: phase glyph + rounds (a goal a
 * backend budgets by tokens: tokens used / budget instead), colored by
 * phase. `minimal` swaps the glyph for a text form, per the minimal-mode
 * no-emoji contract.
 */
export function GoalStatusChip({ goal, minimal = false }) {
    const progress = goal.budget === undefined ? `${goal.roundsStarted}/${goal.maxGoalRounds}` : formatGoalBudgetCompact(goal.budget);
    return (_jsx(Text, { color: phaseColor(goal.phase), dimColor: goal.phase === 'complete', children: minimal
            ? `goal ${progress}`
            : `${PHASE_GLYPH[goal.phase]} ${progress}` }));
}
function PhaseBadge({ phase, roundsStarted, maxGoalRounds, budget, elapsed, }) {
    const color = phaseColor(phase);
    if (budget !== undefined) {
        return (_jsxs(Text, { color: color, dimColor: phase === 'complete', children: [PHASE_LABEL[phase], " \u00B7 ", formatGoalBudget(budget)] }));
    }
    return (_jsxs(Text, { color: color, dimColor: phase === 'complete', children: [PHASE_LABEL[phase], " \u00B7 ", roundsStarted, "/", maxGoalRounds, elapsed !== undefined ? ` · ${elapsed}` : ''] }));
}
function TodoGlyph({ status }) {
    switch (status) {
        case 'in_progress':
            return _jsx(Text, { color: "suggestion", children: "\u25CF " });
        case 'completed':
            return _jsx(Text, { dimColor: true, children: "\u2713 " });
        default:
            return _jsx(Text, { dimColor: true, children: "\u25CB " });
    }
}
/**
 * Mind-map style branch prefix: `├─` for every row but the last, which
 * closes with `└─`. The whole panel reads as one tree — the goal is the
 * root and each todo hangs off it.
 */
function BranchPrefix({ last }) {
    return _jsx(Text, { dimColor: true, children: last ? '└─ ' : '├─ ' });
}
/**
 * Live goal + todo panel above the prompt input. Data rides on the channel:
 * `channel.goal` is folded from `goal/change` context events and
 * `channel.todos` from `todo/write` whole-list snapshots, so every model
 * update re-renders this panel in real time (no polling). Renders nothing
 * while both slots are empty.
 *
 * The todo section folds two ways: completed rows fold automatically once
 * the agent goes idle (the header's `✓ done/total` count keeps the
 * summary), and `collapsed` folds the whole section to that single header
 * line any time — including mid-turn, where the line still previews the
 * in-progress task. `onToggle` is the click affordance for the header row;
 * the ctrl/cmd+q hotkey in Chat drives the same state.
 *
 * Goal elapsed time is the panel's own wall clock (started when the goal
 * id first appears, frozen on completion) — deliberately not derived from
 * session-event timestamps.
 */
export function GoalTodoPanel({ channel, collapsed = false, onToggle, idleDismissal = false, variant = 'default', visible = true, maxTodos, wrapWidth, }) {
    const goal = channel.goal;
    const objectiveRef = React.useRef(null);
    const goalTooltip = useTooltip(() => {
        const width = objectiveRef.current?.yogaNode?.getComputedWidth() ?? 0;
        if (goal === undefined || width <= 0)
            return '';
        return stringWidth(goal.objective) > width || goal.objective.includes('\n')
            ? goal.objective
            : '';
    });
    const allTodos = channel.todos ?? [];
    const doneCount = allTodos.filter(todo => todo.status === 'completed').length;
    // Completed rows are useful progress while a turn is running, but become
    // stale footer noise once the agent is idle. Keep unfinished work visible;
    // the header count carries the done summary either way.
    // panel 形态不自动隐藏完成行：侧栏折叠头常驻显示 ✓ done/total，用户
    // 「点开」是显式展开动作——idle 时把完成行过滤光就是「明明有 9 个、
    // 点开一条都没有」（完成行以 dim 呈现，进度语义不丢）。default 形态
    // （chat 页底部 chrome）保留原 auto-fold。
    const todos = variant === 'panel'
        ? allTodos
        : channel.working
            ? allTodos
            : allTodos.filter(todo => todo.status !== 'completed');
    // Local goal timer: remember when this goal id first rendered. Written in
    // render (idempotent lazy ref init) so a fresh mount with a live goal
    // starts counting immediately.
    const startRef = React.useRef(undefined);
    if (goal !== undefined && startRef.current?.id !== goal.id) {
        startRef.current = { id: goal.id, at: Date.now() };
    }
    const [now, setNow] = React.useState(() => Date.now());
    // Hover tint for the clickable todo fold header (mouse affordance).
    const [headerHovered, setHeaderHovered] = React.useState(false);
    const goalOpen = goal !== undefined && goal.phase !== 'complete';
    // Panel 形态：计时挂在共享动画时钟上（ClockProvider 单一定时源，
    // 终端失焦自动降频），visible=false 时传 null——零订阅。时钟只负责
    // 驱动重渲染；读数仍按墙钟（Date.now()）算，隐藏期间计时冻结的只是
    // 显示，重新打开立刻显示真实经过时间（mountPolicy=enabled 下面板
    // 保持挂载，startRef 不会重置）。
    const [clockRef] = useAnimationFrame(variant === 'panel' && goalOpen && visible ? 1000 : null);
    React.useEffect(() => {
        // default 形态保留原来的本地 1s 计时（底部 chrome 的既有行为）。
        if (variant === 'panel')
            return;
        // Tick only while the goal is open; a complete goal freezes the last
        // elapsed reading instead of counting past the finish line.
        if (goal === undefined || goal.phase === 'complete')
            return;
        const timer = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(timer);
    }, [goal, variant]);
    const elapsed = goal !== undefined && startRef.current !== undefined
        ? formatDuration((variant === 'panel' ? Date.now() : now) - startRef.current.at)
        : undefined;
    // All-completed idle snapshot with no goal: nothing left to narrate —
    // the whole panel folds away (historical behavior).
    const anyUnfinished = allTodos.some(todo => todo.status !== 'completed');
    const showTodoSection = allTodos.length > 0 &&
        (channel.working || anyUnfinished || goal !== undefined || variant === 'panel');
    if (goal === undefined && !showTodoSection)
        return null;
    const budget = maxTodos ?? MAX_TODOS;
    // 折行形态（panel）：每条 todo 占 1~2 行，预算按「行」折算——放不下
    // 的整条让位给「…N more」，不撑破面板高度（§16.6 盒高恒定）。cap：
    // 折出 >2 行时保留第一行、其余拼回一行截断加省略号（wrapText truncate）。
    // 单行形态（default）：与原 slice 语义逐字节一致。
    const display = [];
    if (wrapWidth !== undefined && wrapWidth > 4) {
        let used = 0;
        for (const todo of todos) {
            const wrapped = wrapTextLines(todo.content, wrapWidth).map(line => line.text);
            const lines = wrapped.length <= 2
                ? wrapped
                : [wrapped[0], wrapText(wrapped.slice(1).join(''), wrapWidth, 'truncate')];
            if (display.length > 0 && used + lines.length > budget)
                break;
            display.push({ todo, lines });
            used += lines.length;
        }
    }
    else {
        for (const todo of todos.slice(0, budget))
            display.push({ todo, lines: [todo.content] });
    }
    const visibleTodos = display;
    const hidden = todos.length - display.length;
    // Collapsed preview: the live task when one runs, else the next open row.
    const preview = allTodos.find(todo => todo.status === 'in_progress')
        ?? allTodos.find(todo => todo.status !== 'completed');
    return (_jsxs(Box, { ref: variant === 'panel' ? clockRef : undefined, flexDirection: "column", paddingLeft: variant === 'panel' ? 1 : 2, paddingRight: variant === 'panel' ? 1 : 2, paddingTop: 1, children: [goal !== undefined && (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Box, { flexDirection: "row", width: "100%", height: 1, children: [_jsx(Text, { color: "suggestion", children: "\uD83C\uDFAF " }), _jsx(Box, { ref: objectiveRef, flexGrow: 1, flexShrink: 1, ...goalTooltip, children: _jsx(Text, { bold: true, wrap: "truncate", children: goal.objective }) }), _jsx(Box, { flexShrink: 0, marginLeft: 1, children: _jsx(PhaseBadge, { phase: goal.phase, roundsStarted: goal.roundsStarted, maxGoalRounds: goal.maxGoalRounds, budget: goal.budget, elapsed: elapsed }) })] }), goal.phase === 'blocked' && goal.blockedReason !== undefined && (_jsxs(Box, { flexDirection: "row", marginTop: 1, height: 1, children: [_jsx(Text, { dimColor: true, children: "\u2502 " }), _jsx(Text, { color: "error", wrap: "truncate", children: goal.blockedReason.message })] }))] })), showTodoSection && (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Box, { flexDirection: "row", height: 1, onClick: onToggle, onMouseEnter: () => setHeaderHovered(true), onMouseLeave: () => setHeaderHovered(false), backgroundColor: headerHovered ? 'userMessageBackgroundHover' : undefined, children: [_jsxs(Text, { dimColor: true, children: [collapsed ? '▸' : '▾', " "] }), _jsxs(Text, { dimColor: true, children: ["\u2713 ", doneCount, "/", allTodos.length] }), collapsed && preview !== undefined && (_jsx(Box, { flexGrow: 1, flexShrink: 1, marginLeft: 1, children: preview.status === 'in_progress' ? (_jsxs(Text, { wrap: "truncate", children: [_jsx(Text, { color: "suggestion", children: "\u25CF " }), preview.content] })) : (_jsxs(Text, { wrap: "truncate", dimColor: true, children: ["\u25CB ", preview.content] })) }))] }), !collapsed && (_jsxs(Box, { flexDirection: "column", children: [visibleTodos.map((item, index) => {
                                const last = index === visibleTodos.length - 1 && hidden === 0;
                                return item.lines.map((line, li) => (_jsxs(Box, { flexDirection: "row", height: 1, children: [li === 0 ? (_jsxs(_Fragment, { children: [_jsx(BranchPrefix, { last: last }), _jsx(TodoGlyph, { status: item.todo.status })] })) : (_jsx(Text, { dimColor: true, children: last ? '     ' : '\u2502    ' })), _jsx(Text, { wrap: "truncate", dimColor: item.todo.status === 'completed', children: line })] }, li)));
                            }), hidden > 0 && (_jsxs(Box, { flexDirection: "row", height: 1, children: [_jsx(BranchPrefix, { last: true }), _jsxs(Text, { dimColor: true, children: ["\u2026 ", hidden, " more"] })] })), variant !== 'panel' && (_jsxs(Text, { dimColor: true, children: ["  ", t(idleDismissal && !channel.working ? 'goal-todo-hide-hint' : 'goal-todo-fold-hint', { key: primaryComboString('todoFold') })] }))] }))] }))] }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Box, Text, useAnimationFrame } from '../../ui.js';
import { formatJobDuration } from '../../dsh-adapter/jobs.js';
import { t } from '../../i18n.js';
import { isMinimalUiMode } from '../../minimalUiMode.js';
/**
 * Header line of a consecutive-job group (`row.jobGroup`): the run summary
 * while the group is open, and the fold line once it is closed.
 *
 *   ▾ 后台任务 ×6 · 2 运行中 · 4 已完成 · 合计 12.3s
 *   ▸ 已折叠 6 个后台任务 · 4 已完成 · 2 失败 · 合计 12.3s · 点击展开
 *
 * The fold line keeps the header's row and glyph slot, so a settling group
 * reads as the SAME block tucking its body away (the thinking/compact fold
 * convention) instead of a new row appearing. The whole line is clickable
 * and brightens on hover — the same mouse gesture the job cards use — and
 * Ctrl+O expands every group at once.
 *
 * The summary line sits OUTSIDE the group's rail: the cards below it carry
 * the bracket (`╭` on the first card, `╰` on the last), so this line reads as
 * the run's title rather than its first row.
 *
 * Failures stay LOUD while folded: the failed/killed counts are painted in
 * the error color, because folding must never bury a job that died.
 */
export function JobGroupHeader({ group, onToggle }) {
    const minimalUi = isMinimalUiMode();
    const [hovered, setHovered] = React.useState(false);
    // Only a LIVE group ticks: its elapsed keeps counting. A settled group's
    // duration is frozen, so it must not keep re-rendering the row.
    const [tickRef] = useAnimationFrame(group.running > 0 ? 1000 : null);
    const clickable = onToggle !== undefined;
    const duration = formatJobDuration({
        startedAt: group.startedAt,
        ...(group.endedAt === undefined ? {} : { finishedAt: group.endedAt }),
    });
    const chipColor = (color) => minimalUi ? undefined : color;
    const chips = [];
    if (group.running > 0)
        chips.push({ key: 'running', text: t('jobs-group-running', { count: group.running }), color: chipColor('warning') });
    if (group.failed > 0)
        chips.push({ key: 'failed', text: t('jobs-group-failed', { count: group.failed }), color: chipColor('error') });
    if (group.killed > 0)
        chips.push({ key: 'killed', text: t('jobs-group-killed', { count: group.killed }), color: chipColor('error') });
    if (group.folded && group.running === 0 && group.failed === 0 && group.killed === 0) {
        // Folded and clean: "全部完成" says more than "6 已完成" — the group is
        // the unit being reported on now.
        chips.push({ key: 'all', text: t('jobs-group-all-completed'), color: chipColor('success') });
    }
    else if (group.completed > 0) {
        chips.push({ key: 'completed', text: t('jobs-group-completed', { count: group.completed }), color: undefined });
    }
    // The mouse affordance: a folded line always teaches the way back in; an
    // open group only says it while hovered (its ▾ already carries the hint).
    const hint = group.folded
        ? t('jobs-group-hint-expand')
        : hovered && clickable ? t('jobs-group-hint-fold') : undefined;
    return (_jsxs(Box, { flexDirection: "row", gap: 1, ref: tickRef, onClick: clickable ? onToggle : undefined, onMouseEnter: clickable ? () => setHovered(true) : undefined, onMouseLeave: clickable ? () => setHovered(false) : undefined, children: [_jsx(Text, { color: hovered && clickable && !minimalUi ? 'accent' : 'inactive', children: group.folded ? '▸' : '▾' }), _jsx(Text, { wrap: "truncate-end", color: hovered && clickable ? 'text' : undefined, dimColor: !(hovered && clickable), children: group.folded
                    ? t('jobs-group-folded', { count: group.count })
                    : t('jobs-group-title', { count: group.count }) }), chips.map(chip => (_jsxs(React.Fragment, { children: [_jsx(Text, { color: "inactive", children: "\u00B7" }), _jsx(Text, { color: chip.color, dimColor: chip.color === undefined, children: chip.text })] }, chip.key))), _jsx(Text, { color: "inactive", children: "\u00B7" }), _jsx(Text, { dimColor: true, children: t('jobs-group-elapsed', { duration }) }), hint !== undefined && (_jsxs(React.Fragment, { children: [_jsx(Text, { color: "inactive", children: "\u00B7" }), _jsx(Text, { color: group.folded ? 'inactive' : 'accent', children: hint })] }))] }));
}

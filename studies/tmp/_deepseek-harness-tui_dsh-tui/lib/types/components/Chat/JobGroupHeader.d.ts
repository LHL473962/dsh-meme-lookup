import React from 'react';
import type { JobGroupRow } from '../../adapter/ports/channel-view.js';
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
export declare function JobGroupHeader({ group, onToggle }: {
    group: JobGroupRow;
    onToggle?(): void;
}): React.ReactNode;
//# sourceMappingURL=JobGroupHeader.d.ts.map
import React from 'react';
import type { Color } from '../ink/styles.js';
import type { Theme } from '../theme.js';
import type { LocalCommand } from '../commands.js';
/**
 * The slash-command suggestion overlay, using the shared rounded
 * `SuggestionCard` for the command list:
 *
 *   ╭─ 命令 · 共 12 项 ──────────────────────╮
 *   │ ❯ compact  Summarize earlier turns…  │   ← 选中：❯ + 加粗 + suggestion 色
 *   │   compare  Compare selected messages … │   ← 名字里命中输入的段提亮
 *   │   new      Start a new conversation   │   ← 灰区整行 subtle，不提亮命中
 *   │ ↑2 · ↓3                                 │   ← 仅当列表被窗口裁剪
 *   ╰─────────────────────────────────────────╯
 *
 * 未选中行整体 dim，唯独名字里匹配当前查询 token 的前缀以正常亮度提亮
 * （bold 与 dim 在终端互斥，故提亮用非 dim 而非加粗）；选中行整行
 * suggestion 色、名字加粗、前置 ❯ 指针。
 *
 * issue #1072：回合运行中（`holdFrom` 有值）命令按「对当前对话的影响」分区——
 * 不影响对话的留在上方用原样式，会被门禁拦下 / 会打断或替换对话 / 会 steer 的
 * 沉底为灰区（主题 `subtle`，不做命中提亮，但仍可选中执行，该门禁的门禁、
 * 该 steer 的 steer）。分区只是稳定重排：命令索引空间（`selectedIndex` /
 * `onPick`）与窗口数学都不变，灰区只靠颜色区分，不额外占显示行。
 */
export declare function CommandSuggestions({ commands, selectedIndex, columns, query, accent, holdFrom, onPick, onWheelStep, }: {
    commands: readonly (LocalCommand & {
        descriptionKey?: string;
    })[];
    selectedIndex: number;
    columns: number;
    /** 原始 `/…` 输入；其最后一段 token 用于名字前缀高亮。 */
    query?: string;
    accent?: keyof Theme | Color;
    /** 索引 ≥ 该值的条目属于「影响当前对话」灰区；undefined = 全部正常区。 */
    holdFrom?: number;
    /** 鼠标点击行（fullscreen）：上报过滤后列表的绝对索引（与键盘
     *  selectedIndex 同一索引空间），接受路径由 PromptInput 复用。 */
    onPick?: (index: number) => void;
    /** 滚轮步进（fullscreen）：±1 移动选中行。 */
    onWheelStep?: (step: 1 | -1) => void;
}): React.ReactNode;
//# sourceMappingURL=CommandSuggestions.d.ts.map
import React from 'react';
import type { ChannelUi as Channel } from '../adapter/channel/ui-policy.js';
import type { ChannelGoal } from '../dsh-adapter/channel.js';
/**
 * Compact goal chip for the status footer: phase glyph + rounds (a goal a
 * backend budgets by tokens: tokens used / budget instead), colored by
 * phase. `minimal` swaps the glyph for a text form, per the minimal-mode
 * no-emoji contract.
 */
export declare function GoalStatusChip({ goal, minimal }: {
    goal: ChannelGoal;
    minimal?: boolean;
}): React.ReactNode;
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
export declare function GoalTodoPanel({ channel, collapsed, onToggle, idleDismissal, variant, visible, maxTodos, wrapWidth, }: {
    channel: Channel;
    /** Fold the whole todo section to its summary header line. */
    collapsed?: boolean;
    /** Toggle the fold (click on the header row; shares the hotkey state). */
    onToggle?: () => void;
    /** The host uses the idle toggle to dismiss this footer instead of folding. */
    idleDismissal?: boolean;
    /** 'panel' = 侧栏 Todo Panel 形态：更紧凑（去外层 padding 与折叠
     *  提示行），计时走共享动画时钟（visible=false 时零订阅）。 */
    variant?: 'default' | 'panel';
    /** 侧栏 visible 契约：非 active Panel 时 false——暂停本地计时，
     *  store（channel.goal/todos）照常更新，重新打开直接读最新值。 */
    visible?: boolean;
    /** 覆盖 MAX_TODOS（panel variant 按宿主高度传入）。 */
    maxTodos?: number;
    /** panel variant：todo 行按此宽度折行——单条最多 2 行，超出部分截断
     *  加省略号；maxTodos 预算按「行」折算，放不下仍走「…N more」。缺省
     *  （default 形态）不折行，保持单行 truncate 的 chat 页现状。 */
    wrapWidth?: number;
}): React.ReactNode;
//# sourceMappingURL=GoalTodoPanel.d.ts.map
import React from 'react';
import type { SelectOption } from './Select.js';
import type { TuiThemeHost } from '../dsh-adapter/themes.js';
/**
 * Build the full selectable list from the shared catalog: `auto`, built-ins,
 * static JSON themes, and optional plugin themes. Shared by ThemePicker (render)
 * and the /theme command (focus index), so both always see the same ordering.
 */
export declare function getThemeOptions(themeHost?: TuiThemeHost): SelectOption[];
/**
 * Color-theme picker in the ActivityPicker style: a permission-colored Pane
 * listing the `auto` pseudo-theme and built-in palettes first, followed by
 * static JSON and plugin themes — each row shows the display name, base and
 * three key color swatches; `❯` marks focus, `✓` the active theme. Enter
 * applies through the ThemeProvider setter (persists to ~/.dsh-tui/theme.json
 * and hot swaps), Esc cancels.
 *
 * 宽终端（≥ MIN_SIDE_BY_SIDE_COLUMNS 列）在列表右侧并排一列预览：用**焦点行**
 * 主题的调色板实渲染代码块 + 代码操作工具卡 + diff（见 ThemePreviewPane）。
 * 列表只有三个色块，挑主题时看不到语法色、diff 色与工具卡底色——预览让
 * 「移动光标」就等于「试主题」，不必先 Enter 应用再后悔。键位语义不变
 * （↑↓ 移焦点、Enter 应用、Esc 取消），预览只是同一焦点索引的另一种投影。
 *
 * 窄终端把预览堆叠在列表下方；高度预算不够时预览整块让位——浮层向上生长，
 * 探出帧顶的行会被裁掉，宁可少画预览，也不能把列表顶出可视区（见 OverlayAbove）。
 */
export declare function ThemePicker({ focusIndex, currentTheme, themeHost, onPick, }: {
    focusIndex: number;
    currentTheme: string | undefined;
    /** Optional runtime theme host; static themes work without it. */
    themeHost?: TuiThemeHost;
    /** Mouse pick (fullscreen): clicked row's absolute index (Chat applies
     *  the same code path as the keyboard Enter). */
    onPick?: (index: number) => void;
}): React.ReactNode;
//# sourceMappingURL=ThemePicker.d.ts.map
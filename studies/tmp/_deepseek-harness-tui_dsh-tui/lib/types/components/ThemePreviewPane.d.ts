import React from 'react';
import type { ThemeCatalogEntry } from '../themeCatalog.js';
/**
 * `/theme` 右列的预览面板：用**被预览主题**的调色板（而不是当前生效主题）
 * 实渲染一段语法高亮代码块、一张代码操作工具卡和三行 diff。
 *
 * 为什么要有它：列表行只有 accent/text/success 三个色块，挑主题时看不到
 * 语法色（syntax*）、diff 色（diffAdded/diffRemoved）和工具卡底色
 * （toolCard 族/toolDot 族）——而那才是每天盯着的部分。预览跟随焦点行，移动
 * 光标即可比较，不必先 Enter 应用再后悔。
 *
 * 颜色全部走**显式色值**：调色板里的 hex/`ansi:` 值经 ThemedText/ThemedBox
 * 的 resolveColor 原样透传（那里只解析主题键名），于是预览列抹的是候选主题
 * 的色，而外层列表仍是当前主题——不需要给 design-system 加调色板覆盖层。
 * 同理这里一律不写 `dimColor`：ThemedText 的 dimColor 会盖掉传入的 color，
 * 把候选色换成**当前主题**的 inactive。
 */
export declare function ThemePreviewPane({ entry, rows, width, }: {
    /** 焦点行主题（目录条目自带已解析的完整调色板）。 */
    entry: ThemeCatalogEntry;
    /** 预览列可用行数（已按浮层高度预算钳过）；装不下的块从底部裁掉。 */
    rows: number;
    /** 预览列宽度（终端列数）：抬头主题名与跟随提示按它截断，不换行。 */
    width: number;
}): React.ReactNode;
//# sourceMappingURL=ThemePreviewPane.d.ts.map
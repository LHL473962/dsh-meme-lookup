import React from 'react';
import type { Color } from '../ink/styles.js';
import type { Theme } from '../theme.js';
import type { FileCandidate } from '../utils/fileSuggestions.js';
export declare function FileSuggestions({ files, selectedIndex, columns, query, accent, onPick, onWheelStep, }: {
    files: readonly FileCandidate[];
    selectedIndex: number;
    columns: number;
    /** `@` 触发 token 里已输入的查询（`mention.query`），用于名字前缀高亮。 */
    query?: string;
    accent?: keyof Theme | Color;
    /** 鼠标点击行（fullscreen）：上报过滤后列表的绝对索引（与键盘
     *  selectedIndex 同一索引空间），接受路径由 PromptInput 复用。 */
    onPick?: (index: number) => void;
    /** 滚轮步进（fullscreen）：±1 移动选中行。 */
    onWheelStep?: (step: 1 | -1) => void;
}): React.ReactNode;
//# sourceMappingURL=FileSuggestions.d.ts.map
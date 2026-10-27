import React from 'react';
export type QuestionMinimizedBarProps = {
    /** Progress title, same text as the expanded panel's Divider header
     *  (e.g. ` 📋 提问 · 第 2/5 题 · 还剩 3 题 `). */
    readonly progress: string;
    /** First line of the question body, truncated by the layout. */
    readonly questionText: string;
    /** Expand back to the full panel (Ctrl+K / Esc / click). */
    readonly onExpand: () => void;
};
export declare function QuestionMinimizedBar({ progress, questionText, onExpand, }: QuestionMinimizedBarProps): React.ReactNode;
//# sourceMappingURL=QuestionMinimizedBar.d.ts.map
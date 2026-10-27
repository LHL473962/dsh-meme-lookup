import React from 'react';
import { type HistoryEntry } from '../history.js';
/**
 * The ctrl+r history search dialog: a permission-colored Pane with a bold
 * title, the ⌕ SearchBox, the filtered history as ListItem rows (newest
 * first), and the ↑/↓ · Enter · Esc hint line. Keyboard handling lives in
 * the caller (Chat).
 */
export declare function HistorySearchDialog({ query, cursorOffset, matches, focusIndex, onPick, }: {
    query: string;
    cursorOffset: number;
    matches: readonly HistoryEntry[];
    focusIndex: number;
    /** 鼠标点击行（fullscreen）：上报绝对索引——Chat 用与 Enter 相同的
     *  填入/提交路径处理。 */
    onPick?: (index: number) => void;
}): React.ReactNode;
//# sourceMappingURL=HistorySearchDialog.d.ts.map
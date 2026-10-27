import React from 'react';
/**
 * Click-to-act file menu (fullscreen): opened by clicking a file path in
 * the transcript (tool cards, markdown code spans / plain text, file://
 * links). Rows: open the target, reveal it in the file manager, copy its
 * absolute path. The path shown is already resolved to an absolute path by
 * the caller (Chat.tsx resolves against the channel cwd at click time).
 * When the target is a directory, the first row reads "open folder" — the
 * same action (default handler), just honest about what it opens.
 */
export declare const FILE_ACTION_COUNT = 3;
export declare function FileActionsPanel({ path, isDir, focusIndex, onPick, }: {
    /** Absolute path the actions operate on (caller-resolved). */
    path: string;
    /** Whether the target exists on disk and is a directory. */
    isDir: boolean;
    /** Index of the keyboard-focused row. */
    focusIndex: number;
    /** Mouse pick (fullscreen): clicked row's absolute index. */
    onPick?: (index: number) => void;
}): React.ReactNode;
//# sourceMappingURL=FileActionsPanel.d.ts.map
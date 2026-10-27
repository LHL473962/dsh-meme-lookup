import type { ToolFileDiff } from '../dsh-adapter/channel.js';
/** The `patch` member of the union. */
export type ToolPatchDiff = Extract<ToolFileDiff, {
    readonly patch: string;
}>;
/** Whether a file diff carries a unified patch (vs old/new texts). */
export declare const isPatchDiff: (diff: ToolFileDiff) => diff is ToolPatchDiff;
/** One line of a hunk with its real file line numbers. */
export interface PatchLine {
    readonly kind: 'context' | 'del' | 'add';
    readonly text: string;
    /** Line number in the old file (context and removed lines). */
    readonly oldNo?: number;
    /** Line number in the new file (context and added lines). */
    readonly newNo?: number;
}
/** One parsed hunk. */
export interface PatchHunk {
    readonly oldStart: number;
    readonly newStart: number;
    readonly lines: readonly PatchLine[];
}
/** One file's parsed patch. */
export interface ParsedPatch {
    readonly hunks: readonly PatchHunk[];
    /** Added / removed line counts over every hunk (the `(+N -M)` stat). */
    readonly added: number;
    readonly removed: number;
    /** The widest line number any hunk shows (gutter width). */
    readonly maxLineNo: number;
    /** No hunk could be read: the patch's own lines, shown as-is. */
    readonly raw?: readonly string[];
}
/** Parse one file's patch (cached by its text, path and change kind). */
export declare function parseFilePatch(diff: ToolPatchDiff): ParsedPatch;
/**
 * The header a patch file renders above its hunks. In a multi-file card
 * every file gets a path row (`path` / `path → moved`, clickable, opening
 * `target`) followed by a dim `suffix` (` · new file (+3 -0)`). A lone file
 * already has its path in the card title, so it gets only the dim stat
 * line (`(+1 -1)`, `new file (+3 -0)`, `→ moved.ts (+1 -1)`).
 */
export type PatchHeader = {
    readonly kind: 'path';
    readonly path: string;
    readonly target: string;
    readonly suffix: string;
} | {
    readonly kind: 'stat';
    readonly text: string;
};
export declare function patchHeader(diff: ToolPatchDiff, parsed: ParsedPatch, multiFile: boolean): PatchHeader;
/** The plain text of a header (split view separators, tests). */
export declare const patchHeaderText: (header: PatchHeader) => string;
//# sourceMappingURL=diffPatch.d.ts.map
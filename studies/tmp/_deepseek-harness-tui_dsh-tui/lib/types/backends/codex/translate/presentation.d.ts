/**
 * Codex tool items as tool cards (docs/codex-backend-design.md §7.4, §8):
 * the tool name the transcript records, its arguments, and the card shape
 * each call and result renders as, in the backend-neutral presentation
 * vocabulary. The UI never picks a card by tool name; this module does,
 * from the item itself.
 *
 * Titles carry only the item's own text (commands, paths, queries): the
 * localized tool name comes from `displayKey`, so a language switch repaints.
 *
 * Diffs: an added file's `diff` is its content, a deleted one's is the old
 * content (C0 V13); updates keep their unified hunks and real line numbers.
 */
import type { ContentBlockView } from '../../../agent/events.js';
import type { ToolCallPresentation, ToolResultPresentation } from '../../../agent/presentation.js';
import { type Rec } from '../narrow.js';
/** The item types this module renders as tool cards. */
export declare const TOOL_ITEM_TYPES: ReadonlySet<string>;
/** How a tool item's call is recorded. */
export interface CodexToolCall {
    readonly name: string;
    readonly argsJson: string;
    readonly presentation?: ToolCallPresentation;
}
/** How a tool item's settled result is recorded. */
export interface CodexToolResult {
    readonly isError: boolean;
    readonly text: string;
    readonly content: readonly ContentBlockView[];
    /** Set exactly when `isError`: the failure's own words, or a fixed one. */
    readonly errorText?: string;
    readonly structured?: unknown;
    readonly presentation?: ToolResultPresentation;
}
/** Fixed result texts the translator localizes (the caller passes `t`). */
export interface ResultWords {
    readonly declined: string;
    readonly failed: string;
}
/** Rebuild old/new text from an unheaded unified hunk (the C1 fallback). */
export declare function hunkTexts(patch: string): {
    oldText: string;
    newText: string;
};
/** How a tool item's call is recorded; undefined for a non-tool item. */
export declare function toolCallOf(item: Rec, cwd: string): CodexToolCall | undefined;
/** How a settled tool item's result is recorded. */
export declare function toolResultOf(item: Rec, cwd: string, words: ResultWords): CodexToolResult;
//# sourceMappingURL=presentation.d.ts.map
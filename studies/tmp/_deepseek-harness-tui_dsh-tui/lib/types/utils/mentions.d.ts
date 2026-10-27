/**
 * `@` file-mention parsing (issue #15).
 *
 * A mention is an `@` that starts a whitespace-delimited token (string start
 * or after whitespace) — `hello@world` never triggers. The token body is
 * either a run of non-whitespace characters (`@src/a.ts`) or a double-quoted
 * path (`@"my dir/a.ts"`, for paths containing spaces).
 *
 * A token may carry a trailing line-range suffix (issue #359):
 * `@src/a.ts#L12` / `@src/a.ts#L12-14` (also after a quoted body:
 * `@"my dir/a.ts"#L3-5`). The suffix must anchor at the token END and match
 * `#L<digits>` / `#L<digits>-<digits>` exactly, so legal filenames that merely
 * contain `#` (`report#L12.md`) never trip it; a range like `#L14-12` is
 * rejected (kept as a literal path). Resolution order is strip-first: the
 * suffix-stripped `path` is tried, and the caller may fall back to `literal`
 * (the typed body, suffix intact) when that misses.
 */
export interface MentionToken {
    /** Start index of the `@` in the source text. */
    start: number;
    /** End index (exclusive) of the whole token, quote and suffix included. */
    end: number;
    /** The referenced path as typed (unquoted, no leading `@`, suffix stripped). */
    path: string;
    /** Present only when a line suffix was stripped: the typed body verbatim
     * (unquoted, suffix intact) — the literal fallback path for resolution. */
    literal?: string;
    /** Inclusive 1-based first line of the `#L` suffix, when present. */
    startLine?: number;
    /** Inclusive 1-based last line of the `#L` suffix; equals `startLine`
     * for the single-line form. */
    endLine?: number;
}
/** Extract every `@` mention in `text` (typed order, duplicates kept out). */
export declare function extractMentions(text: string): MentionToken[];
/**
 * The mention token the caret is currently editing, if any: an `@` token
 * that starts at or before the caret with the caret inside it. Used by the
 * prompt's completion trigger so `@` works mid-message, not only at the
 * start of the input.
 *
 * `query` is the PATH portion only (a `#L12-14` suffix never leaks into
 * it) and `pathEnd` marks where that portion ends, so completing a token
 * like `@src/a.ts#L12` matches on `src/a.ts` and replaces up to (not past)
 * the `#` — the typed line range survives acceptance.
 */
export declare function mentionAtCaret(value: string, cursor: number): {
    start: number;
    end: number;
    query: string;
    pathEnd?: number;
} | undefined;
//# sourceMappingURL=mentions.d.ts.map
/**
 * Title normalization shared by every migration source.
 *
 * One rule for all sources, so the same conversation shows the same title
 * whichever entry imported it: trim, collapse inner whitespace (a title is
 * one line), cap at {@link TITLE_MAX_CHARS} code points with a trailing `…`.
 *
 * @module @deepseek-harness-tui/dsh-tui/migrate/parse/title
 */
/** Longest normalized title, in code points (the ellipsis included). */
export declare const TITLE_MAX_CHARS = 80;
/**
 * Normalize a candidate title.
 * @param text - Raw title or first prompt.
 * @returns The one-line title, or '' when the input is blank.
 */
export declare function normalizeTitle(text: string | undefined): string;
//# sourceMappingURL=title.d.ts.map
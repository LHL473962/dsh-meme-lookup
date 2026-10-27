type WrapAnsiOptions = {
    hard?: boolean;
    wordWrap?: boolean;
    trim?: boolean;
};
/**
 * Wrap a string to a maximum column width, preserving ANSI escape sequences.
 *
 * Uses wrap-ansi (with the incremental fast path for growing streaming inputs).
 * @param input - the string to wrap.
 * @param columns - the maximum width in columns.
 * @param options - wrap options: hard breaks long words, wordWrap splits on word boundaries, trim strips trailing whitespace.
 * @returns the wrapped string.
 */
declare const wrapAnsi: (input: string, columns: number, options?: WrapAnsiOptions) => string;
export { wrapAnsi };
//# sourceMappingURL=wrapAnsi.d.ts.map
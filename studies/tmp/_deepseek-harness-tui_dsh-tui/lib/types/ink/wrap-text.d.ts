import type { Styles } from './styles.js';
/** Pre-wrapped display rows; keep source newlines and omitted copy separators. */
export declare function wrapTextLines(text: string, maxWidth: number, wrapLine?: (line: string) => string): {
    text: string;
    continuation: boolean;
    gap: boolean;
}[];
/**
 * Wrap or truncate text to a maximum width according to a textWrap style.
 * @param text - the text to fit.
 * @param maxWidth - the maximum display width in columns.
 * @param wrapType - the textWrap style: wrap, wrap-trim, truncate, truncate-start, or truncate-middle.
 * @returns the wrapped or truncated text, or `text` unchanged when no wrapping applies.
 */
export default function wrapText(text: string, maxWidth: number, wrapType: Styles['textWrap']): string;
//# sourceMappingURL=wrap-text.d.ts.map
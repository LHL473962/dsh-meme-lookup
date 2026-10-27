import type { TextDecoration } from './styles.js';
/** A parsed leading-structure run: its width and which columns are bars. */
export type HangInfo = {
    readonly width: number;
    readonly bars: readonly boolean[];
};
/**
 * Parse a line's leading structure: the quote rails, indentation, list
 * marker and checkbox the markdown formatter bakes into every hard row.
 * ANSI escapes are skipped. Returns undefined when the line has no
 * structure or nothing after it (a bare rail row has nothing to hang).
 * `bars[n]` says whether column n is a rail glyph; every other structure
 * column is rebuilt as a space.
 */
export declare function deriveHang(line: string): HangInfo | undefined;
/**
 * Hang width of a source line at `maxWidth`: its leading-structure width,
 * or 0 when it has none or when the prefix would leave fewer than two
 * columns for content (a wide glyph needs two). With 0 the line wraps
 * and paints exactly like undecorated text.
 */
export declare function hangWidthAt(rawLine: string, maxWidth: number): number;
/**
 * Wrap one source line for hang decoration. The first row keeps the
 * undecorated break points, and a line that fits `maxWidth` stays one
 * row. Only continuation pieces that would overflow once the
 * `hangWidth` prefix is prepended are re-wrapped at the narrower budget.
 * When a trailing separator space is all that overflows, it moves to the
 * front of the next piece (or is dropped on the last one) instead of
 * forcing a whitespace-only row; copy joins it back identically.
 */
export declare function wrapHangLine(line: string, maxWidth: number, hangWidth: number, wrap: (text: string, width: number) => string): string[];
/** Wrap budget for a decorated line: a prefix eats into every row. */
export declare function decoratedWrapBudget(decoration: TextDecoration, maxWidth: number): number;
/**
 * The rows one source line of a decorated text wraps to. Measure and
 * paint both call this so their row counts agree. `line` is what gets
 * wrapped; `rawLine` is the same line before tab expansion, which both
 * sides parse the hang from.
 */
export declare function wrapDecoratedLine(line: string, rawLine: string, maxWidth: number, decoration: TextDecoration, wrap: (text: string, width: number) => string): string[];
/**
 * Build the hang prefix for a continuation row from its source line's
 * first row: escapes pass through (rails keep their color), rail columns
 * keep their glyph, every other structure column becomes a space, and a
 * reset closes any open SGR. Escape-free prefixes get no reset.
 */
export declare function rebuildHangPrefix(styledFirstRow: string, hang: HangInfo): string;
//# sourceMappingURL=text-decoration.d.ts.map
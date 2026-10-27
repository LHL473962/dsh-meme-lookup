/** Formulas one paragraph may lay out as images; the rest keep Unicode. */
export declare const INLINE_MEDIA_MAX = 4096;
export type InlinePiece = {
    readonly kind: 'text';
    readonly text: string;
    readonly width: number;
} | {
    readonly kind: 'media';
    readonly index: number;
    readonly columns: number;
};
export type InlineRow = {
    readonly pieces: readonly InlinePiece[];
    /** Columns the row's content spans. */
    readonly width: number;
    /** The row continues the previous one (a wrap, not a source newline). */
    readonly continuation: boolean;
    /** A separator omitted at a full row boundary; restore it on copy. */
    readonly gap: boolean;
};
/** The placeholder run standing in for formula `index`, `columns` cells wide. */
export declare function inlineMediaPlaceholder(index: number, columns: number): string;
/**
 * Wrap `formatted` (ANSI text containing placeholder runs for `columns.length`
 * formulas) to `width` and split every row into text and media pieces.
 * Returns undefined when a formula could not be kept whole on one row — its
 * run was split by a hard wrap (wider than the row) or appears more than once
 * — so the caller keeps the plain text rendering instead.
 */
export declare function layoutInlineMedia(formatted: string, width: number, columns: readonly number[]): InlineRow[] | undefined;
//# sourceMappingURL=inline-layout.d.ts.map
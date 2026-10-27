/**
 * The render-path sanitization contract for plugin-supplied text — the
 * single implementation behind every managed-UI seam (dialogs, status line,
 * entry renderers, rewind modes, decision notices). TUI-PROP-009 Track A
 * makes these rules normative, so they live in exactly one place:
 *
 * - C0/C1 control chars are stripped (replaced by a space) — plugin text
 *   must never smuggle escape sequences onto the screen;
 * - whitespace collapses to single spaces (render paths are single-line);
 * - width is capped in terminal CELLS (never string.length) with an
 *   ellipsis.
 *
 * Non-scalar input is DROPPED, never `String()`-coerced — `String({})`
 * would put "[object Object]" on the render path. Scalars
 * (string/number/boolean) coerce through String() first.
 */
/** Sanitize an already-string value for the render path. */
export declare function cleanRenderText(value: string, maxCells: number): string;
/**
 * Sanitize untrusted plugin text destined for a MULTI-LINE block (a
 * `pushLocal` report): the same per-line strip as {@link cleanRenderText},
 * but newlines are structure here, not whitespace to fold. Blank rows are
 * dropped so one reported line stays one transcript row.
 */
export declare function cleanBlockLines(value: string, maxCells: number): string[];
/** Bounded, local-only registry output. Explicit command blocks keep the
 * existing cleanBlockLines contract; reports retain indentation and empty rows. */
export declare function cleanCommandReport(value: string): {
    lines: string[];
    truncated: boolean;
};
/**
 * Sanitize an untrusted (possibly non-string) value. Non-scalars — objects,
 * arrays, functions, symbols, null/undefined — yield '' so the caller takes
 * its drop/refuse path; scalars coerce then sanitize.
 */
export declare function cleanScalarText(value: unknown, maxCells: number): string;
/**
 * Truncate to a cell budget WITHOUT ellipsis, whitespace folding, or any
 * other mutation — the editing-path counterpart of {@link cleanRenderText}.
 * An input panel caps what the user types/pastes; inserting '…' or
 * collapsing their spaces would corrupt text they can still edit.
 */
export declare function capCells(value: string, maxCells: number): string;
/** C0/C1 control chars → space, nothing else touched. The single-line
 *  input panel flattens pasted chunks with this (newlines become spaces —
 *  the panel has no second row for them). */
export declare function flattenInline(value: string): string;
/**
 * Single-line field ingress for terminal/clipboard paste: strip COMPLETE
 * ANSI/OSC sequences first (paste content is user-controlled bytes — a
 * smuggled ESC[… would otherwise break out of the render path), then flatten
 * every remaining C0/C1 control char to a space. Unlike {@link flattenInline},
 * this never leaves `[31m`-style residue behind; the two regexes mirror
 * {@link cleanRenderText}'s strip, and the final pass covers the rest.
 */
export declare function flattenPasteInline(value: string): string;
/**
 * Footer-field ingress: the common render cleanup PLUS bidi controls and
 * invisible separators. Kept separate from {@link cleanRenderText} so the
 * existing managed-UI callers keep their exact behaviour. Non-scalars yield
 * '' (the caller decides between refuse and clear); scalars coerce then
 * sanitize.
 */
export declare function cleanStatusFieldText(value: unknown, maxCells: number): string;
/** Toast-bound plugin text (veto reasons, handled notices, rewind summaries)
 *  and single-line transcript notices are render-path data too: same
 *  sanitization, toast-width cap. */
export declare const NOTICE_CELLS = 200;
//# sourceMappingURL=sanitize.d.ts.map
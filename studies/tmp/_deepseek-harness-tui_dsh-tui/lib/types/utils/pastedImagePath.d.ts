/**
 * Conservative recognition of "the terminal pasted exactly one local image
 * file path" — the only shape a Finder/desktop drop reliably reaches the TUI
 * as. Ghostty (and most terminals) forward a drop as shell-escaped plain
 * text through the PTY, with no MIME or drag-and-drop boundary, so anything
 * ambiguous must stay verbatim text: this parser returns null unless the
 * WHOLE paste is a single, syntactically unambiguous local image path.
 * Existence is the caller's async check; parse success alone stages nothing.
 */
/** Image media type per file extension, or undefined for non-image paths.
 *  The one extension→type table shared by every composer staging path. */
export declare function imagePathMediaType(path: string): 'image/png' | 'image/jpeg' | 'image/webp' | 'image/gif' | undefined;
/**
 * Parse a bracketed-paste payload as one unambiguous local image path.
 *
 * Accepted forms (after trimming outer whitespace):
 * - a wholly single- or double-quoted path: `'/a/b c.png'`, `"/a/b c.png"`
 * - one bare token with backslash-escaped separators (Ghostty's
 *   `Shell.escape`): `/a/b\ c.png`
 * - a Windows drive-letter absolute path, quoted or bare: `D:\shots\a.png`,
 *   `D:/shots/a.png` (the terminal text-paste shape of an Explorer file
 *   copy — Warp and friends forward file copies as plain path text; the
 *   backslash separators decode literally in the bare-token branch)
 * - a `file://` URL, quoted or bare: the URI half of the OSC 8 hyperlink a
 *   Windows drag-and-drop emits. The drop frame is recognized and decoded
 *   before this parser runs — `readOsc8Frame` / `osc8DropPath` /
 *   `localPathOfFileUri` in `ink/parse-keypress.ts` require a complete frame
 *   set and hand the composer an already-decoded local path — so this branch
 *   covers a URI that reaches the paste as literal text; decoding it here
 *   re-attaches the drop to the image pipeline instead of inserting
 *   `file:///C:/…` as prose.
 *
 * The decoded path must be absolute (or `~/…`, expanded) and carry a
 * supported image extension. Everything else — multiple tokens, relative
 * paths, embedded newlines, unterminated quotes, non-image extensions —
 * returns null so the caller inserts the paste verbatim.
 */
export declare function parsePastedImagePath(text: string): string | null;
/**
 * Partition a file-manager clipboard offer: image paths resolve to opaque
 * staged values through `stage`, while other or failed paths keep
 * `formatPath`'s plain insert, preserving offer order. The caller binds all
 * staged values to visible tokens only after this batch settles. `failure`
 * carries the last staging error message ('' when none) for one warning.
 */
export type StagedClipboardFilePart<T> = {
    readonly kind: 'staged';
    readonly value: T;
} | {
    readonly kind: 'text';
    readonly value: string;
};
export declare function stageClipboardFilePaths<T>(paths: readonly string[], stage: (path: string) => Promise<T>, formatPath: (path: string) => string, maxStaged?: number): Promise<{
    readonly parts: readonly StagedClipboardFilePart<T>[];
    readonly staged: readonly T[];
    readonly failure: string;
    readonly failureCode?: 'image-limit';
}>;
/** Read one regular file through one descriptor, bounded to `maxBytes + 1`.
 * The extra byte detects a file that grows after fstat; a short read detects
 * shrinkage. This avoids stat(path) → readFile(path)'s path-swap TOCTOU and
 * never allocates from an untrusted size before the profile limit is checked. */
export declare function readBoundedRegularFile(path: string, maxBytes: number): Promise<Uint8Array>;
//# sourceMappingURL=pastedImagePath.d.ts.map
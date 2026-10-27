/** Our custom OSC 8 scheme carrying a raw display path (URI-encoded). */
export declare const FILE_LINK_SCHEME = "dsh-file:";
/** Encode a display path into a `dsh-file:` link URL. */
export declare function fileLinkUrl(path: string): string;
/**
 * Decode a `dsh-file:` link URL back to the raw display path. Returns
 * undefined for anything that is not a well-formed dsh-file URL.
 */
export declare function parseFileLinkUrl(url: string): string | undefined;
/**
 * Resolve a target (raw display path) against the session's base directory:
 * absolute paths and `~` pass through (with ~ expanded), everything else is
 * joined onto the base. Pure, so it is unit-testable without a workspace.
 */
export declare function resolveTargetPath(path: string, baseDir: string): string;
/**
 * Convert a `file://` URL to a local path. Wraps node:url.fileURLToPath —
 * undefined when the URL is not a valid file URL.
 */
export declare function fileUrlToPath(url: string): string | undefined;
/**
 * Conservative heuristic: does this text look like a file path worth
 * making clickable? Requires a slash separator, no whitespace, no URL/email
 * shape, and either a path anchor (`./`, `../`, `/`, `~/`, drive letter)
 * with a real path shape (another separator or an extension — a bare
 * anchored word like `/a` or `x.com/a` is too ambiguous), or a plausible
 * file extension. Length-capped so huge tokens (base64, logs) never get
 * linked.
 */
export declare function looksLikeFilePath(text: string): boolean;
/**
 * Best-effort existence hint: does `path` exist on disk? Used to decide
 * whether to render a path as clickable in contexts where the raw text is
 * ambiguous; never throws.
 */
export declare function pathExistsOnDisk(path: string): boolean;
/**
 * Replace every path-looking span in `text` via `wrap(path, display)`.
 * Trailing sentence punctuation stays OUTSIDE the wrapped display (so
 * "src/foo.ts." links `src/foo.ts` and keeps the period). Spans that fail
 * `looksLikeFilePath` are returned unchanged.
 * @param text - plain text to scan (no ANSI).
 * @param wrap - builds the clickable rendering for one path.
 */
export declare function linkifyFilePaths(text: string, wrap: (path: string, display: string) => string): string;
//# sourceMappingURL=fileTarget.d.ts.map
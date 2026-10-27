/**
 * Import-source helpers (browser half): turn a file the user picked into the
 * base64 string the host route carries.
 *
 * The archive travels as base64 inside the JSON body rather than as a
 * multipart upload because the route family's shared body reader is JSON-only;
 * the cap here matches the host's own archive limit, so an oversized file is
 * refused before a multi-megabyte request is built.
 */
/**
 * The largest archive the import route accepts. Mirrors IMPORT_LIMITS in the
 * host half (src/import.ts): the browser refuses the file early instead of
 * streaming something the host would reject after reading it.
 */
export declare const MAX_IMPORT_ARCHIVE_BYTES: number;
/**
 * Encode bytes as base64, in chunks.
 *
 * `String.fromCharCode(...bytes)` on a multi-megabyte array overflows the
 * argument list and throws, so the conversion walks the buffer in bounded
 * chunks before handing the binary string to btoa.
 * @param bytes - the raw archive bytes.
 * @returns the base64 encoding.
 */
export declare function bytesToBase64(bytes: Uint8Array): string;

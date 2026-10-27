/**
 * Narrowing helpers for the untyped app-server JSON (the counterpart of
 * `claude/narrow.ts`). The generated protocol types only annotate call
 * sites; every value read at run time goes through these (a `bigint` field
 * of a generated type is a plain JSON number on the wire).
 */
/** A plain object (not an array), else undefined. */
export const rec = (value) => typeof value === 'object' && value !== null && !Array.isArray(value) ? value : undefined;
export const str = (value) => typeof value === 'string' ? value : undefined;
/** A non-empty string, else undefined. */
export const text = (value) => typeof value === 'string' && value !== '' ? value : undefined;
/** A finite number, else undefined. */
export const num = (value) => typeof value === 'number' && Number.isFinite(value) ? value : undefined;
export const bool = (value) => typeof value === 'boolean' ? value : undefined;
export const arr = (value) => Array.isArray(value) ? value : [];
/** The string members of an array value. */
export const strings = (value) => arr(value).filter((item) => typeof item === 'string');
export const errorText = (error) => error instanceof Error ? error.message : String(error);

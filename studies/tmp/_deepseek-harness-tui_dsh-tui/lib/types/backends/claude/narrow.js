/** Narrowing helpers for the untyped SDK frames and transcript records. */
/** A plain object (not an array), else undefined. */
export const rec = (value) => typeof value === 'object' && value !== null && !Array.isArray(value) ? value : undefined;
export const str = (value) => typeof value === 'string' ? value : undefined;
/** A finite number, else undefined. */
export const num = (value) => typeof value === 'number' && Number.isFinite(value) ? value : undefined;
export const arr = (value) => Array.isArray(value) ? value : [];
export const errorText = (error) => error instanceof Error ? error.message : String(error);

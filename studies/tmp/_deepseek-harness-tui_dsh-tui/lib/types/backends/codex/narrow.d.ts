/**
 * Narrowing helpers for the untyped app-server JSON (the counterpart of
 * `claude/narrow.ts`). The generated protocol types only annotate call
 * sites; every value read at run time goes through these (a `bigint` field
 * of a generated type is a plain JSON number on the wire).
 */
export type Rec = Readonly<Record<string, unknown>>;
/** A plain object (not an array), else undefined. */
export declare const rec: (value: unknown) => Rec | undefined;
export declare const str: (value: unknown) => string | undefined;
/** A non-empty string, else undefined. */
export declare const text: (value: unknown) => string | undefined;
/** A finite number, else undefined. */
export declare const num: (value: unknown) => number | undefined;
export declare const bool: (value: unknown) => boolean | undefined;
export declare const arr: (value: unknown) => readonly unknown[];
/** The string members of an array value. */
export declare const strings: (value: unknown) => readonly string[];
export declare const errorText: (error: unknown) => string;
//# sourceMappingURL=narrow.d.ts.map
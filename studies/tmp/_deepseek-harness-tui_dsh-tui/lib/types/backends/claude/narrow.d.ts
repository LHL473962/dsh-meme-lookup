/** Narrowing helpers for the untyped SDK frames and transcript records. */
export type Rec = Readonly<Record<string, unknown>>;
/** A plain object (not an array), else undefined. */
export declare const rec: (value: unknown) => Rec | undefined;
export declare const str: (value: unknown) => string | undefined;
/** A finite number, else undefined. */
export declare const num: (value: unknown) => number | undefined;
export declare const arr: (value: unknown) => readonly unknown[];
export declare const errorText: (error: unknown) => string;
//# sourceMappingURL=narrow.d.ts.map
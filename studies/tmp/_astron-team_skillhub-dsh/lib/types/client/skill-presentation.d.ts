export declare function skillInitial(name?: string | null, slug?: string | null): string;
export declare function skillTone(identity: string): number;
export declare function formatCount(value: number): string;
export declare function validCount(value: unknown): value is number;
export declare function validRating(value: unknown): value is number;
export declare function readableDate(value?: string | null, includeTime?: boolean): string;

/** Only known error codes become user-visible text; upstream messages stay private. */
export declare function catalogErrorMessage(error: {
    code: string;
    details?: unknown;
}): string;

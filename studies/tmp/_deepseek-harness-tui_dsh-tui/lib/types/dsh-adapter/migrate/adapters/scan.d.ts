/** Walk-mode file/directory counter shared by every adapter's fast count. */
export declare function countEntries(roots: readonly string[], options: {
    readonly maxDepth: number;
    readonly fileMatch: (name: string) => boolean;
    /** Directory names never descended into. */
    readonly skipDirs?: readonly string[];
}): number;
//# sourceMappingURL=scan.d.ts.map
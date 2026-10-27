export type SharpModule = Awaited<typeof import('sharp')>['default'];
/** Load `sharp` once per process, preferring the host's copy. */
export declare function loadSharp(): Promise<SharpModule | undefined>;
/**
 * Candidate `sharp` entry files, host first. The host anchor is a blessed
 * upstream package: profile installs alias `@deepseek-ai/*` to the running
 * dsh, so resolving `sharp` from that location walks the host's tree.
 */
export declare function sharpCandidatePaths(): string[];
//# sourceMappingURL=sharp.d.ts.map
/** Detached in-process read projections. Executable leaves are guarded, not serialized. */
export declare function markChannelReadDirty(value: object): void;
export declare function createChannelReadView(check: (mutation: boolean) => void): <T>(value: T, nextVersion: number) => T;
//# sourceMappingURL=read-view.d.ts.map
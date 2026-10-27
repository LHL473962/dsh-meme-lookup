/** Channel lifetime plus binding fences for work that crosses an await. */
export declare function createChannelOwner(): {
    current: () => boolean;
    assertActive: () => void;
    readonly cleanupCount: number;
    signal: AbortSignal;
    bind(check: () => boolean): void;
    own(cleanup: () => void): () => void;
    dispose(): void;
};
export type ChannelOwner = ReturnType<typeof createChannelOwner>;
export declare function registerChannelOwner(channel: object, owner: ChannelOwner): void;
export declare function bindChannelOwner(channel: object, check: () => boolean): void;
export declare function channelOwnerCurrent(channel: object): boolean;
/** Register work that must be revoked whenever this Channel owner releases. */
export declare function onChannelOwnerDispose(channel: object, cleanup: () => void): () => void;
export declare function disposeChannelOwner(channel: object): void;
//# sourceMappingURL=owner.d.ts.map
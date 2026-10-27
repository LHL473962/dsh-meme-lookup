import type { ChannelState, ChatRow } from './types.js';
export declare function createChannelEmitter(getState: () => Pick<ChannelState, 'rows' | 'version'>, 
/** Returns true when the deferred projector changed renderer-visible data. */
beforeStream: () => boolean, options?: {
    /**
     * Fold rows past the transcript window (default on). Folding drops a
     * row's full text on the promise that `loadOlder` restores it from the
     * durable history; a session whose backend cannot slice its history
     * keeps every row whole instead (and shows no "load earlier" divider).
     * A function is read at every wake (the composition decides once its
     * extension attached).
     */
    readonly fold?: boolean | (() => boolean);
    /** Which rows the backend can restore (read at every fold pass);
     *  absent = every foldable row. */
    readonly restorable?: (row: ChatRow) => boolean;
}): {
    subscribe(listener: () => void): () => void;
    emit(): void;
    emitStream(): void;
    dispose(): void;
};
//# sourceMappingURL=emitter.d.ts.map
/** Error emitted when the browser has no live Host connection. */
export declare class PresetSetupDisconnectedError extends Error {
    /**
     * Create a stable disconnected error.
     *
     * @param cause Optional transport failure.
     */
    constructor(cause?: unknown);
}
/** RPC operations required by the preset setup controller. */
export interface PresetSetupPort {
    /**
     * @param signal Cancellation signal for the Host transport and inspection.
     * @returns Current Host-side preset state.
     * @throws When transport or response validation fails, or the signal is aborted.
     */
    status(signal: AbortSignal): Promise<{
        readonly status: 'not-installed' | 'installed' | 'conflict';
    }>;
    /**
     * @param signal Cancellation signal honored before Host publication.
     * @returns Result of an explicit Host-side installation attempt.
     * @throws When transport, response validation, or installation fails, or the signal is aborted.
     */
    install(signal: AbortSignal): Promise<{
        readonly status: 'installed' | 'conflict';
        readonly changed: boolean;
    }>;
}
/** Complete client state rendered by the preset setup surface. */
export type PresetSetupState = {
    readonly status: 'idle' | 'loading' | 'not-installed' | 'conflict' | 'disconnected';
    readonly open: boolean;
} | {
    readonly status: 'installed';
    readonly open: boolean;
    readonly changed: boolean;
} | {
    readonly status: 'error';
    readonly open: boolean;
    readonly message: string;
};
/** Framework-independent preset setup state controller. */
export declare class PresetSetupController {
    #private;
    /**
     * Create a controller over one Host RPC port.
     *
     * @param port RPC operations used for inspection and explicit installation.
     * @param reportListenerError Error sink for isolated render subscriber failures.
     */
    constructor(port: PresetSetupPort, reportListenerError: (error: unknown) => void);
    /** @returns The current immutable render state. */
    getSnapshot(): PresetSetupState;
    /**
     * Subscribe to state changes.
     *
     * @param listener Callback invoked after each state transition.
     * @returns A disposer that removes the subscription.
     */
    subscribe(listener: () => void): () => void;
    /** @returns Nothing. */
    open(): void;
    /** @returns Nothing. */
    close(): void;
    /**
     * Abort the current request and expose the disconnected state without waiting for settlement.
     *
     * @returns Nothing.
     */
    disconnected(): void;
    /**
     * Abort and await the previous request before loading Host installation state.
     * Transport and response failures become error or disconnected state instead of rejection.
     *
     * @returns Completion after the Host installation state has been loaded.
     */
    load(): Promise<void>;
    /**
     * Abort and await the previous request before starting an explicit Host installation.
     * Transport, validation, and installation failures become error or disconnected state instead of rejection.
     *
     * @returns Completion after the explicit Host installation request settles.
     */
    install(): Promise<void>;
    /**
     * Stop publishing state, abort the active Host request, and wait until it settles.
     *
     * @returns Completion after in-flight work reaches quiescence.
     */
    dispose(): Promise<void>;
}

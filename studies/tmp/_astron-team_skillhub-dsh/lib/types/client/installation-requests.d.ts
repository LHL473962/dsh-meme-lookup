import type { HostInstallRequest, NativeOperation } from '../host/types.js';
export interface InstallationAttempt {
    request: HostInstallRequest;
    state: 'submitting' | 'accepted' | 'unresolved';
    operation: NativeOperation | null;
    operationId?: string;
}
/** Shared across surfaces: response loss retains the original request, never a fresh install key. */
export declare class InstallationRequests {
    private readonly storage?;
    private readonly attempts;
    private readonly pending;
    private readonly listeners;
    private disposed;
    private storageFailed;
    constructor(storage?: (() => Pick<Storage, "getItem" | "setItem">) | undefined);
    get(key: string): InstallationAttempt | undefined;
    subscribe: (listener: () => void) => (() => void);
    submit(key: string, input: Omit<HostInstallRequest, 'requestKey' | 'mode'>, send: (request: HostInstallRequest) => Promise<NativeOperation | null>, supersededOperationId?: string): Promise<void>;
    dispose(): void;
    private notify;
    private save;
}

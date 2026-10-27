import type { HostExecutePlanRequest, NativeOperation } from '../host/types.js';
type RequestStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'> & Partial<Pick<Storage, 'length' | 'key'>>;
export declare function upgradeRequestKey(sessionId: string, source: string, item: {
    namespace: string;
    slug: string;
    scope: string;
}): string;
export interface UpgradeAttempt {
    request: HostExecutePlanRequest;
    hostInstanceId: string;
    operationId?: string;
    state: 'submitting' | 'accepted' | 'unresolved';
    operation: NativeOperation | null;
}
/** One explicit confirmation keeps its identity across response loss and browser reload. */
declare class PlanRequests {
    protected readonly storage: () => RequestStorage;
    private readonly kind;
    private readonly attempts;
    private readonly pending;
    private readonly listeners;
    private disposed;
    protected storageFailed: boolean;
    private revision;
    getRevision: () => number;
    constructor(storage: () => RequestStorage, kind: 'upgrade' | 'removal');
    protected get prefix(): string;
    private get label();
    private accepts;
    subscribe: (listener: () => void) => (() => void);
    get(key: string): UpgradeAttempt | undefined;
    submit(key: string, planId: string, hostInstanceId: string, send: (request: HostExecutePlanRequest) => Promise<NativeOperation | null>): Promise<void>;
    list(sessionId: string, source: string): Array<{
        key: string;
        namespace: string;
        slug: string;
        scope: 'user' | 'project';
    }>;
    dispose(): void;
    /** Caller supplies a freshly queried terminal outcome; uncertain or recovery-required work cannot be dismissed. */
    closeResult(key: string, operation: NativeOperation): void;
    private notify;
    private save;
}
export declare class UpgradeRequests extends PlanRequests {
    constructor(storage: () => RequestStorage);
}
/** Persisted coordinates keep removal results reachable after the installed row disappears. */
export declare class RemovalRequests extends PlanRequests {
    constructor(storage: () => RequestStorage & Pick<Storage, 'length' | 'key'>);
}
export {};

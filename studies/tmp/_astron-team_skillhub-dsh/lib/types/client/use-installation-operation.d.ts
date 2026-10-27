import { type QueryClient } from '@tanstack/react-query';
import type { NativeOperation } from '../host/types.js';
import type { InstallationServices } from './install-control.js';
export declare class OperationQueryError extends Error {
    readonly retryable: boolean;
    constructor(retryable: boolean);
}
/** Only transient read failures retry; writes and identity/ownership failures never do. */
export declare const retryOperationQuery: (failures: number, error: Error) => boolean;
export declare const shouldRefreshInstallation: (previous: NativeOperation | null | undefined, next: NativeOperation | null | undefined) => boolean;
export declare function useInstallationOperation(services: Pick<InstallationServices, 'sessionId' | 'operation'>, host: string, operationId?: string): import("@tanstack/react-query").UseQueryResult<NativeOperation | null, Error>;
/** Receipts and page projections share the same settled-operation refresh boundary. */
export declare function invalidateInstallationQueries(client: QueryClient, sessionId: string): Promise<void>;

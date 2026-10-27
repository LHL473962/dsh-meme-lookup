import { type CompatibilityServices } from './host-compatibility.js';
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol';
import type { HostExecutePlanRequest, HostRecoveryRequest, NativeOperation, UpgradePlanView } from '../host/types.js';
import type { UpgradeRequests } from './upgrade-requests.js';
export interface UpgradeServices extends CompatibilityServices {
    sessionId: string;
    upgradeRequests: UpgradeRequests;
    prepareVersionUpgrade?(revision: string, itemKey: string, version: string, signal: AbortSignal): Promise<RemoteResult<UpgradePlanView>>;
    prepareUpgrade(revision: string, itemKey: string, signal: AbortSignal): Promise<RemoteResult<UpgradePlanView>>;
    executePlan(input: HostExecutePlanRequest, signal: AbortSignal): Promise<RemoteResult<NativeOperation | null>>;
    operation(id: string, host: string): Promise<RemoteResult<NativeOperation | null>>;
    recoverOperation(input: HostRecoveryRequest): Promise<RemoteResult<NativeOperation | null>>;
}
export declare function UpgradeControl({ services, sourceRevision, source, item, eligible, onCompleted, onClosed, history, presentation, targetVersion }: {
    services: UpgradeServices;
    sourceRevision: string;
    source: string;
    eligible?: boolean;
    history?: boolean;
    presentation?: 'panel' | 'dialog';
    targetVersion?: string;
    item: {
        itemKey?: string;
        namespace: string;
        slug: string;
        version?: string;
        scope: string;
    };
    onCompleted?(version: string): void;
    onClosed?(): void;
}): import("react/jsx-runtime").JSX.Element | null;
/** Results remain reachable when inventory changes or temporarily cannot be read. */
export declare function UpgradeHistory({ services, sourceRevision, source, onClosed }: {
    services: UpgradeServices;
    sourceRevision: string;
    source: string;
    onClosed?(): void;
}): import("react/jsx-runtime").JSX.Element | null;
export declare function UpgradeConfirmationSummary({ item, plan, targetVersion }: {
    item: {
        namespace: string;
        slug: string;
        version?: string;
        scope: string;
    };
    plan: UpgradePlanView | undefined;
    targetVersion?: string;
}): import("react/jsx-runtime").JSX.Element;

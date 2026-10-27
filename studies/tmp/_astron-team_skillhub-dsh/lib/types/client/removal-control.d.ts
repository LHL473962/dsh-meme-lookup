import { type CompatibilityServices } from './host-compatibility.js';
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol';
import type { HostExecutePlanRequest, HostRecoveryRequest, NativeOperation, UninstallPlanView, InstalledSkillList } from '../host/types.js';
import { type RemovalRequests } from './upgrade-requests.js';
export interface RemovalServices extends CompatibilityServices {
    sessionId: string;
    removalRequests: RemovalRequests;
    prepareUninstall(revision: string, itemKey: string, signal: AbortSignal): Promise<RemoteResult<UninstallPlanView>>;
    executePlan(input: HostExecutePlanRequest, signal: AbortSignal): Promise<RemoteResult<NativeOperation | null>>;
    operation(id: string, host: string): Promise<RemoteResult<NativeOperation | null>>;
    recoverOperation(input: HostRecoveryRequest): Promise<RemoteResult<NativeOperation | null>>;
}
export declare function RemovalControl({ services, sourceRevision, source, item, eligible, onCompleted, onClosed, history, presentation }: {
    services: RemovalServices;
    sourceRevision: string;
    source: string;
    eligible?: boolean;
    history?: boolean;
    presentation?: 'panel' | 'dialog';
    item: {
        itemKey?: string;
        namespace: string;
        slug: string;
        scope: string;
        version?: string;
        state?: InstalledSkillList['items'][number]['state'];
    };
    onCompleted?(): void;
    onClosed?(): void;
}): import("react/jsx-runtime").JSX.Element | null;
export declare function RemovalHistory({ services, sourceRevision, source, onClosed }: {
    services: RemovalServices;
    sourceRevision: string;
    source: string;
    onClosed?(): void;
}): import("react/jsx-runtime").JSX.Element | null;
/** Only information needed to confirm the selected target; no raw host paths or plan metadata. */
export declare function RemovalConfirmationSummary({ item, version, stale }: {
    item: {
        namespace: string;
        slug: string;
        scope: string;
    };
    version?: string;
    stale: boolean;
}): import("react/jsx-runtime").JSX.Element;

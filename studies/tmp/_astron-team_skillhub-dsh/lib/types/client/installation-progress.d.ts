import type { NativeOperation } from '../host/types.js';
import type { InstallationAttempt } from './installation-requests.js';
import type { InstallationServices } from './install-control.js';
export interface InstallationProgressJob {
    key: string;
    sessionId: string;
    sourceRevision: string;
    hostInstanceId: string;
    namespace: string;
    slug: string;
    version: string;
    title: string;
    scope: 'user' | 'project';
}
export declare function installationProgressState(attempt: InstallationAttempt | undefined, operation: NativeOperation | null | undefined, readFailed: boolean): {
    label: string;
    message: string;
    state: "running";
} | {
    label: string;
    message: string;
    state: "stopped";
} | {
    label: string;
    message: string;
    state: "complete";
};
/** Indeterminate until a verified completion; phase names are not percentages. */
export declare function InstallationProgressSummary({ attempt, operation, readFailed, onCheck }: {
    attempt: InstallationAttempt | undefined;
    operation: NativeOperation | null | undefined;
    readFailed: boolean;
    onCheck?(): void;
}): import("react/jsx-runtime").JSX.Element;
export declare function InstallationProgressPanel({ job, services, onUsed }: {
    job: InstallationProgressJob;
    services: InstallationServices;
    onUsed?(): void;
}): import("react/jsx-runtime").JSX.Element;

import { type OperationDiagnostic } from './operation-diagnostic.js';
import type { UpdateIdentity, UpdateAssessment, InstalledProjection, InstalledProjectionTarget } from './generated/native-contract.js';
import type { UpgradeSelection, UpgradeBaseline } from './generated/native-contract.js';
import type { NativeUpgradeExecution } from './generated/native-contract.js';
import type { RemovalBaseline, NativeRemovalExecution } from './generated/native-contract.js';
import type { NativeRuntime, NativeInstallExecution, NativeInstallAcceptance, NativeOperationRequest, NativeOperation, NativeRecoveryResult, NativePendingOperation } from './generated/native-contract.js';
export interface LocalRuntimeStatus {
    state: 'starting' | 'ready' | 'failed' | 'closing' | 'disposed';
    hostInstanceId: string | null;
    pendingOperations: number;
}
export interface PreparedNativeInstall {
    acceptance: NativeInstallAcceptance;
    execution: Omit<NativeInstallExecution, 'operationId' | 'ownerId'>;
}
export interface PreparedNativeUpgrade {
    acceptance: NativeInstallAcceptance;
    execution: Omit<NativeUpgradeExecution, 'operationId' | 'ownerId'>;
}
export interface PreparedNativeRemoval {
    acceptance: NativeInstallAcceptance & {
        kind: 'uninstall' | 'remove-stale-record';
    };
    execution: Omit<NativeRemovalExecution, 'operationId' | 'ownerId'>;
}
/** Host-only initialization; no Client path input and no automatic replay of historical writes. */
export declare class LocalRuntime {
    private readonly open;
    private readonly assertWritableHost;
    private readonly reportFailure;
    private disposed;
    private runtime?;
    private starting?;
    private closing?;
    private readonly pending;
    private readonly startupPending;
    private status;
    constructor(open?: () => Promise<NativeRuntime>, assertWritableHost?: () => void, reportFailure?: (diagnostic: OperationDiagnostic) => void);
    start(): Promise<void>;
    private initialize;
    getStatus(): LocalRuntimeStatus;
    acceptInstall(request: NativeOperationRequest, validateNew: () => Promise<NativeInstallAcceptance>): Promise<NativeOperation | undefined>;
    getOperation(operationId: string, ownerId: string): Promise<NativeOperation | undefined>;
    observeInstallation(operationId: string, ownerId: string, roots: readonly string[], observe: (paths: readonly string[]) => Promise<boolean>): Promise<boolean>;
    findPlanOperation(request: NativeOperationRequest): Promise<NativeOperation | undefined>;
    assessUpdate(installed: UpdateIdentity, candidate: UpdateIdentity): Promise<UpdateAssessment>;
    inspectUpgrade(selected: UpgradeSelection, targets: readonly InstalledProjectionTarget[]): Promise<UpgradeBaseline>;
    inspectRemoval(selected: UpgradeSelection, target: InstalledProjectionTarget): Promise<RemovalBaseline>;
    readSkillExamples(directory: string): ReturnType<NativeRuntime['readSkillExamples']>;
    listInstalled(registry: string, targets: readonly InstalledProjectionTarget[]): Promise<InstalledProjection>;
    executeInstall(request: NativeInstallExecution): Promise<NativeRecoveryResult>;
    /** Host resolves historical targets from trusted context; neither Client nor model supplies paths. */
    recoverOperation(operationId: string, ownerId: string, prepare: (operation: NativePendingOperation) => Promise<Parameters<NativeRuntime['recover']>[3]>): Promise<NativeRecoveryResult | undefined>;
    /** Acceptance is returned early; the complete admitted workflow remains tracked until execution settles. */
    submitInstall(request: NativeOperationRequest, prepare: () => Promise<PreparedNativeInstall>): Promise<NativeOperation | undefined>;
    private call;
    submitUpgrade(request: NativeOperationRequest, prepare: () => Promise<PreparedNativeUpgrade>): Promise<NativeOperation | undefined>;
    submitRemoval(request: NativeOperationRequest, prepare: () => Promise<PreparedNativeRemoval>): Promise<NativeOperation | undefined>;
    private executeAccepted;
    private track;
    dispose(): Promise<void>;
}

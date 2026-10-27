import { Context } from '@deepseek-ai/cordis';
import { TypertRemoteService } from '@deepseek-ai/dsh-typert-protocol';
import { Config } from './config.js';
import type { SelectionSnapshot } from './conversation-selections.js';
import type { ManagementAction, ManagementRequest } from './management-tool.js';
import type { ConversationManagementResult } from './types.js';
import type { ConversationSearchContext, ConversationSearchResult } from './search-tool.js';
import type { RegistryConnectionTest, CatalogContext, CatalogLabels, CatalogPageResult, CatalogSort, ReviewPage, ConversationDetail, SkillDetail, SkillList, VersionPage } from './types.js';
import type { HostCompatibility } from './types.js';
import type { UpgradePlanView, UninstallPlanView, HostExecutePlanRequest, HostRecoveryRequest } from './types.js';
import type { ResolvedInstallationTarget } from './installation-targets.js';
import type { SkillAvailability } from './types.js';
import type { PendingConversationInstall, CancelledConversationInstall } from './conversation-install-request.js';
import type { NativeOperation, HostInstallRequest } from './types.js';
import type { NativeRecoveryResult } from './generated/native-contract.js';
import type { InstallationTargetList } from './types.js';
import type { LocalRuntimeStatus } from './local-runtime.js';
import type { InstalledSkillList, InstalledSkillDetail, InstalledUpdateCheck, SkillUsePreparation } from './types.js';
declare module '@deepseek-ai/cordis' {
    interface Context {
        skillhub: SkillHubService;
    }
}
/** Native SkillHub service with session-scoped installation and read-only catalog methods. */
export declare class SkillHubService extends TypertRemoteService {
    static Config: typeof Config;
    private readonly configuration;
    private sourceRevision;
    private registry?;
    private sourceInput;
    private readonly lifetime;
    private localRuntime?;
    private readonly selections;
    private readonly pendingConversationInstalls;
    private readonly pendingConversationChoices;
    private readonly managementRequests;
    private readonly managementConfirmations;
    private readonly installationTargets;
    private readonly upgradePlans;
    private readonly removalPlans;
    private readonly installedReferenceKey;
    private readonly capabilities;
    private readonly details;
    constructor(ctx: Context, configuration?: ReturnType<typeof Config>);
    /** Internal diagnostics, deliberately not a Remote method. */
    getLocalRuntimeStatus(): LocalRuntimeStatus | null;
    private refreshSource;
    getStatus(): string;
    /** Probe an unsaved address independently of the active source and its selection state. */
    testRegistryConnection(inputUrl: string, signal: AbortSignal): Promise<RegistryConnectionTest>;
    private assertRuntimeBaseline;
    getCompatibility(): HostCompatibility;
    getContext(): CatalogContext;
    listSkills(sourceRevision: string, query: string, signal: AbortSignal): Promise<SkillList>;
    listCatalog(sourceRevision: string, query: string, page: number, sort: CatalogSort, signal: AbortSignal): Promise<CatalogPageResult>;
    listLabels(sourceRevision: string, signal: AbortSignal): Promise<CatalogLabels>;
    listCatalogByLabel(sourceRevision: string, query: string, page: number, sort: CatalogSort, label: string, signal: AbortSignal): Promise<CatalogPageResult>;
    getSkillDetail(sourceRevision: string, namespace: string, slug: string, version: string, signal: AbortSignal): Promise<SkillDetail>;
    listVersions(detailToken: string, page: number, signal: AbortSignal): Promise<VersionPage>;
    listReviews(detailToken: string, page: number, signal: AbortSignal): Promise<ReviewPage>;
    listInstalled(sourceRevision: string, signal: AbortSignal): Promise<InstalledSkillList>;
    /** Tools use explicit trusted context, never a forged Remote invocation. */
    private listInstalledForAgent;
    checkAvailability(sourceRevision: string, itemKey: string, signal: AbortSignal): Promise<SkillAvailability>;
    private checkAvailabilityForAgent;
    /** Read-only handoff: installed snapshots and market names never authorize an invocation. */
    prepareSkillUse(sourceRevision: string, itemKey: string, signal: AbortSignal): Promise<SkillUsePreparation>;
    getInstalledDetail(sourceRevision: string, itemKey: string, signal: AbortSignal): Promise<InstalledSkillDetail>;
    checkUpdate(sourceRevision: string, itemKey: string, signal: AbortSignal): Promise<InstalledUpdateCheck>;
    checkVersionUpdate(sourceRevision: string, itemKey: string, version: string, signal: AbortSignal): Promise<InstalledUpdateCheck>;
    private checkUpdateForVersion;
    prepareUpgrade(sourceRevision: string, itemKey: string, signal: AbortSignal): Promise<UpgradePlanView>;
    prepareVersionUpgrade(sourceRevision: string, itemKey: string, version: string, signal: AbortSignal): Promise<UpgradePlanView>;
    private prepareUpgradeForVersion;
    prepareUninstall(sourceRevision: string, itemKey: string, signal: AbortSignal): Promise<UninstallPlanView>;
    private prepareUninstallForAgent;
    /** Opaque references are stable within a Host and bind the full trusted record snapshot. */
    private installedItemKey;
    private readInstalledItem;
    executePlan(input: HostExecutePlanRequest, signal: AbortSignal): Promise<NativeOperation | null>;
    private executePlanForAgent;
    openConversationDetail(selectionRef: string, signal: AbortSignal): Promise<ConversationDetail>;
    /** Reissue only from this session's trusted search log; never restore old authorization. */
    reopenConversationDetail(callId: string, selectionRef: string, signal: AbortSignal): Promise<ConversationDetail>;
    acknowledgeConversationDetail(selectionRef: string, detailToken: string): boolean;
    listInstallTargets(detailToken: string, signal: AbortSignal): Promise<InstallationTargetList>;
    private installationTargetsFor;
    startInstall(input: HostInstallRequest, signal: AbortSignal): Promise<NativeOperation | null>;
    getOperation(operationId: string, hostInstanceId: string): Promise<NativeOperation | null>;
    recoverOperation(input: HostRecoveryRequest): Promise<NativeOperation | null>;
    private selectionScope;
    /** Trusted coordinator shared by the scoped Remote and the forthcoming installation tool. */
    submitInstallation(agentId: string, input: HostInstallRequest, signal: AbortSignal): Promise<NativeOperation | undefined>;
    private prepareInstallation;
    /** Use the Host question surface without creating an operation until a human answers. */
    installConversationWithChoice(input: unknown, context: ConversationSearchContext, signal: AbortSignal): Promise<NativeOperation | PendingConversationInstall | CancelledConversationInstall | undefined>;
    /** Stable tool identity is checked in the journal before resolving ephemeral detail/target references. */
    installConversation(input: unknown, context: ConversationSearchContext, signal: AbortSignal): Promise<NativeOperation | PendingConversationInstall | undefined>;
    /** Internal owner-scoped query shared with the pending UI adapter. */
    getInstallationOperation(agentId: string, operationId: string): Promise<NativeOperation | undefined>;
    /** Internal recovery for an existing session; historical sources are never queried or reinstalled. */
    recoverInstallationOperation(agentId: string, operationId: string): Promise<NativeRecoveryResult | undefined>;
    /** Internal only: page and tool execution share this final target-reference check. */
    resolveInstallationTarget(agentId: string, detailToken: string, targetToken: string, signal: AbortSignal): Promise<{
        target: ResolvedInstallationTarget;
        snapshot: SelectionSnapshot;
    }>;
    private conversationSelection;
    resolveConversationSelection(agent: {
        session: {
            id: string;
            header: {
                cwd?: string;
            };
        };
    }, reference: string): {
        selectionRef: string;
        detailToken: string;
        snapshot: SelectionSnapshot;
    };
    searchConversation(query: string, context: ConversationSearchContext, signal: AbortSignal): Promise<ConversationSearchResult>;
    /** Model adapters always supply trusted exec context; never synthesize a Remote invocation. */
    manageConversation(action: ManagementAction, input: ManagementRequest, context: ConversationSearchContext, signal: AbortSignal, useQuestions?: boolean): Promise<object>;
    beginConversationManagement(sourceRevision: string, itemKey: string, action: 'upgrade' | 'uninstall', version: string | null, requestKey: string, signal: AbortSignal): Promise<ConversationManagementResult>;
    /** Only a trusted Client event or native userQuestions answer can enter this confirmation path. */
    confirmConversationManagement(confirmationRef: string, confirmed: boolean, signal: AbortSignal): Promise<ConversationManagementResult>;
    private confirmManagementForAgent;
    private readDetail;
    private assertSource;
    private readSource;
}
export default SkillHubService;

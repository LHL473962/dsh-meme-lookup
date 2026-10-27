import { type SkillUseServices } from './use-skill.js';
import { type UpgradeServices } from './upgrade-control.js';
import { type InstallationProgressJob } from './installation-progress.js';
import { type CompatibilityServices } from './host-compatibility.js';
import type { RemoteResult } from '@deepseek-ai/dsh-typert-protocol';
import type { HostInstallRequest, InstallationTargetList, InstalledSkillList, NativeOperation, SkillDetail, InstalledUpdateCheck } from '../host/types.js';
import type { InstallationRequests } from './installation-requests.js';
export interface InstallationServices extends CompatibilityServices {
    sessionId: string;
    skillUse?: SkillUseServices;
    upgrades?: UpgradeServices;
    registryIdentity?(revision: string): Promise<string>;
    checkVersionUpdate?(revision: string, itemKey: string, version: string, signal: AbortSignal): Promise<RemoteResult<InstalledUpdateCheck>>;
    manageInstalled?(revision: string, item: InstalledSkillList['items'][number]): void;
    requests: InstallationRequests;
    targets(token: string, signal: AbortSignal): Promise<RemoteResult<InstallationTargetList>>;
    installed(revision: string, signal: AbortSignal): Promise<RemoteResult<InstalledSkillList>>;
    start(input: HostInstallRequest, signal: AbortSignal): Promise<RemoteResult<NativeOperation | null>>;
    operation(id: string, host: string): Promise<RemoteResult<NativeOperation | null>>;
}
export declare function InstallControl({ detail, sourceRevision, services, initiatedFrom, onContextStale, presentation, onClose, onSubmitted, onManage }: {
    detail: SkillDetail;
    sourceRevision: string;
    services: InstallationServices;
    initiatedFrom: HostInstallRequest['initiatedFrom'];
    onContextStale?(): void;
    presentation?: 'panel' | 'dialog';
    onClose?(): void;
    onSubmitted?(job: InstallationProgressJob): void;
    onManage?(item: InstalledSkillList['items'][number]): void;
}): import("react/jsx-runtime").JSX.Element;
/** Prefer the scope already installed, rather than presenting a misleading second install. */
export declare function preferredInstallationScope(inventory: InstalledSkillList, detail: Pick<SkillDetail, 'namespace' | 'slug'>, available: readonly ('user' | 'project')[]): 'user' | 'project' | undefined;
export declare function selectedVersionUpdateMessage(update: InstalledUpdateCheck): string;

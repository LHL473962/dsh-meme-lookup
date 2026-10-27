import { type SkillUseServices } from './use-skill.js';
import type { RefObject } from 'react';
import type { RemoteResult, TypertRemoteNamespaceMap } from '@deepseek-ai/dsh-typert-protocol';
import type { InstalledSkillList, InstalledSkillDetail, InstalledUpdateCheck, SkillHubConfig } from '../host/types.js';
import type { UpgradeServices } from './upgrade-control.js';
import { type RemovalServices } from './removal-control.js';
import type { InstalledNavigation } from './installed-navigation.js';
export interface InstalledServices extends UpgradeServices, RemovalServices {
    sessionId: string;
    skillUse?: SkillUseServices;
    list(sourceRevision: string, signal: AbortSignal): Promise<RemoteResult<InstalledSkillList>>;
    detail(sourceRevision: string, itemKey: string, signal: AbortSignal): Promise<RemoteResult<InstalledSkillDetail>>;
    checkUpdate(sourceRevision: string, itemKey: string, signal: AbortSignal): Promise<RemoteResult<InstalledUpdateCheck>>;
}
export declare function InstalledSkills({ services, sourceRevision, source, remote, modes, scrollContainer, navigation, onRemove, onUpgrade }: {
    services: InstalledServices;
    sourceRevision: string;
    source: string;
    remote: TypertRemoteNamespaceMap['skillhub'];
    modes: SkillHubConfig['detailTabs'];
    scrollContainer: RefObject<HTMLElement>;
    navigation: InstalledNavigation;
    onRemove?(item: InstalledSkillList['items'][number]): void;
    onUpgrade?(item: InstalledSkillList['items'][number]): void;
}): import("react/jsx-runtime").JSX.Element;

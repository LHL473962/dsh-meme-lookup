import { type QueryClient } from '@tanstack/react-query';
import type { SkillDetail, HostInstallRequest, InstalledSkillList } from '../host/types.js';
import { type InstallationServices } from './install-control.js';
/** A fresh, identity-bound read for confirmation; no navigation or write on opening. */
export declare function SkillInstallDialog({ client, identity, load, services, initiatedFrom, close, onManage }: {
    client: QueryClient;
    identity: string;
    load(signal: AbortSignal): Promise<{
        detail: SkillDetail;
        sourceRevision: string;
    }>;
    services: InstallationServices;
    initiatedFrom: HostInstallRequest['initiatedFrom'];
    close(): void;
    onManage?(item: InstalledSkillList['items'][number]): void;
}): import("react/jsx-runtime").JSX.Element;

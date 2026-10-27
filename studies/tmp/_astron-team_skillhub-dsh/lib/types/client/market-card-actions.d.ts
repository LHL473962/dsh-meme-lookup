import type { InstalledSkillList } from '../host/types.js';
import type { InstalledServices } from './installed-skills.js';
type InstalledItem = InstalledSkillList['items'][number];
export declare function MarketCardActions({ records, services, sourceRevision, verified, onInstall, onManage }: {
    records: InstalledItem[];
    services?: InstalledServices;
    sourceRevision: string;
    verified: boolean;
    onInstall(): void;
    onManage(item: InstalledItem, intent: 'remove' | 'upgrade'): void;
}): import("react/jsx-runtime").JSX.Element | undefined;
export {};

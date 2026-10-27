import type { InstalledSkillList } from '../host/types.js';
export interface InstalledNavigation {
    sessionId: string;
    sourceRevision: string;
    scope: 'all' | 'user' | 'project';
    keyword: string;
    selected: InstalledSkillList['items'][number] | null;
    completed: {
        itemKey: string;
        version: string;
    } | null;
    removalCompleted: string | null;
    intent: 'detail' | 'upgrade' | 'remove';
    listScroll: number;
    triggerKey: string | null;
}
export declare function installedNavigationFor(owner: {
    installedNavigation?: InstalledNavigation;
}, sessionId: string, sourceRevision: string): InstalledNavigation;

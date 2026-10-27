import type { InstalledSkillList, SearchInstallationStatus } from './types.js';
/** Strip local identifiers and paths from a current-source inventory projection. */
export declare function summarizeInstallation(identity: {
    namespace: string;
    slug: string;
}, inventory: InstalledSkillList | undefined, checkedAt?: string): SearchInstallationStatus;

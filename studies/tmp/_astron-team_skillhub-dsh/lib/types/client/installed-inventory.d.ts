import type { InstalledSkillList } from '../host/types.js';
/** Unknown/corrupt inventory blocks every scope; unavailable roots only block their own scope. */
export declare function isInventoryScopeVerified(inventory: InstalledSkillList | undefined, scope: 'user' | 'project'): boolean;

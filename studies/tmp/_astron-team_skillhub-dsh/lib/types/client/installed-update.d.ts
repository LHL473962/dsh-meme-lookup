import type { InstalledServices } from './installed-skills.js';
/** Disabled queries run only after an explicit click; rows and details share the result. */
export declare function useInstalledUpdate(services: InstalledServices, sourceRevision: string, itemKey?: string): import("@tanstack/react-query").UseQueryResult<import("../host/types.ts").InstalledUpdateCheck, Error>;

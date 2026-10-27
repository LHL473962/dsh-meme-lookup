import type { SelectionScope } from './conversation-selections.js';
export interface TargetContext extends SelectionScope {
    detailToken: string;
}
export interface ResolvedInstallationTarget {
    scope: 'user' | 'project';
    /** Canonical paths resolved by the Host's filesystem policy adapter. */
    root: string;
    dshHome: string;
}
/** Private references only; accepting a reference never substitutes for execution-time path checks. */
export declare class InstallationTargets {
    private readonly records;
    clear(): void;
    issue(context: TargetContext, target: ResolvedInstallationTarget): {
        targetToken: string;
        scope: 'user' | 'project';
    };
    resolve(token: string, context: TargetContext, resolveCurrent: (scope: 'user' | 'project') => Promise<ResolvedInstallationTarget>): Promise<ResolvedInstallationTarget>;
    private lookup;
    private stale;
}

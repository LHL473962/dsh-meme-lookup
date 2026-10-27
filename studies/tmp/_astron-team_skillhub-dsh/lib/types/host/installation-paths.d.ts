import type { FileSystem } from '@deepseek-ai/dsh-fs';
import { type SandboxExecutionPolicy } from '@deepseek-ai/dsh-sandbox';
import type { ResolvedInstallationTarget } from './installation-targets.js';
type HostFileSystem = Pick<FileSystem, 'sandboxMode' | 'resolve' | 'processPath' | 'processPathFromHostPath'>;
/** Default local DSH skill roots. Custom provider roots need a separate verified adapter. */
export declare function resolveInstallationPath(options: {
    scope: 'user' | 'project';
    cwd: string;
    fs: HostFileSystem;
    signal: AbortSignal;
    policy?: SandboxExecutionPolicy;
}): Promise<ResolvedInstallationTarget>;
/** Read-only root resolution uses the same Host mapping without requiring write permission. */
export declare function resolveInstalledPath(options: {
    scope: 'user' | 'project';
    cwd: string;
    fs: HostFileSystem;
    signal: AbortSignal;
}): Promise<ResolvedInstallationTarget>;
/** Preflight only. Every filesystem mutation must repeat this check under its target lock. */
export declare function assertInstallationPolicy(path: string, policy: SandboxExecutionPolicy): Promise<void>;
/** All content, staging and backup paths must remain under the accepted canonical skill root. */
export declare function assertInstallationMutation(root: string, paths: readonly string[], policy?: SandboxExecutionPolicy): Promise<void>;
/** Removal may reach exactly one journal-bound quarantine outside the skill discovery root. */
export declare function assertRemovalMutation(root: string, slug: string, operationId: string, paths: readonly string[], policy?: SandboxExecutionPolicy): Promise<void>;
export {};

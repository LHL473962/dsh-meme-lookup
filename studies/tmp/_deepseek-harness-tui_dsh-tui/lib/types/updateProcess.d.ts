/** Conservative wall-clock limit, independent of output/silence. */
export declare const DEFAULT_UPDATE_TIMEOUT_MS: number;
export declare function updateTimeoutMs(value?: string | undefined): number;
export interface InstallerEvent {
    readonly category: string;
    readonly pid?: number;
    readonly lastOutputAt?: number;
    readonly stage: 'start' | 'timeout' | 'cancel' | 'error' | 'close' | 'cleanup-error';
    readonly code?: number;
    readonly message?: string;
}
export interface InstallerOptions {
    env?: NodeJS.ProcessEnv;
    shell?: boolean;
    category: string;
    timeoutMs?: number;
    signal?: AbortSignal;
    /** Grace period for this owned process group, before forceful termination. */
    terminationGraceMs?: number;
    onStdout?: (text: string) => void;
    onStderr?: (text: string) => void;
    onEvent?: (event: InstallerEvent) => void;
}
/** Installer-only runner: one result, owned tree cancellation, bounded cleanup.
 * Output is observational; even "Done" cannot settle the process successfully.
 */
export declare function runInstallerProcess(command: string, args: readonly string[], options: InstallerOptions): Promise<number>;
//# sourceMappingURL=updateProcess.d.ts.map
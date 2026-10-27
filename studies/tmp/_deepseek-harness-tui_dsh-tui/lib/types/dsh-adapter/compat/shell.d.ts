/** Foreground shell seam across the legacy run() and 0.1.7 execute() APIs. */
export interface ShellRequest {
    command: string;
    workdir?: string;
    timeoutMs: number;
}
export interface ShellResult {
    stdout: {
        text: string;
    };
    stderr: {
        text: string;
    };
    timedOut: boolean;
}
export interface ForegroundShell {
    resolve(request: ShellRequest): unknown;
    run?(spec: unknown): Promise<ShellResult>;
    execute?(spec: unknown): Promise<{
        result(): Promise<ShellResult>;
    }>;
}
/** Resolve through the host so workspace, timeout and sandbox policy survive. */
export declare function runForegroundShell(shell: ForegroundShell, request: ShellRequest): Promise<ShellResult>;
//# sourceMappingURL=shell.d.ts.map
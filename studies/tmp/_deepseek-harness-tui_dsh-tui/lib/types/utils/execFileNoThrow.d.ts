/** The settled outcome of a no-throw command run. */
export interface ExecFileNoThrowResult {
    code: number | null;
    stdout: string;
    stderr: string;
}
/** Options for {@link execFileNoThrow}: stdin payload, timeout, and child
 * working directory. */
export interface ExecFileNoThrowOptions {
    input?: string;
    timeout?: number;
    useCwd?: boolean;
    cwd?: string;
}
/** Run a command without throwing; child output is bounded for safety. */
export declare function execFileNoThrow(file: string, args?: readonly string[], options?: ExecFileNoThrowOptions): Promise<ExecFileNoThrowResult>;
//# sourceMappingURL=execFileNoThrow.d.ts.map
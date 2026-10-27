/** Where the executable came from (`/doctor`). */
export type ClaudeExecutableSource = 'env' | 'path' | 'bundled';
export interface ClaudeExecutable {
    /** Absolute path, or undefined to let the SDK use its bundled binary. */
    readonly path: string | undefined;
    readonly source: ClaudeExecutableSource;
    /** Winning probe's version; absent for an unprobed env path or SDK bundle. */
    readonly version?: string;
}
/** Resolve the executable (never throws; the SDK binary is the fallback). */
export declare function resolveClaudeExecutable(env?: NodeJS.ProcessEnv): Promise<ClaudeExecutable>;
/**
 * The child environment.
 *
 * `appVersion` is the running TUI's version as the host reports it
 * (`BackendHost.appVersion`) — the backend does not read the host's own
 * `package.json` (B-3). Absent (a host that cannot tell, an uninstalled
 * checkout) keeps the long-standing `dev` tag.
 */
export declare function buildClaudeEnv(options?: {
    readonly appVersion?: string;
    readonly base?: NodeJS.ProcessEnv;
}): Record<string, string>;
/** Read `--version`, starting script entries through `node` as the SDK does. */
export declare function readClaudeVersion(executable: string, appVersion?: string): Promise<string | undefined>;
/**
 * The SDK `stderr` callback: chunks are split into lines; each non-empty line
 * goes to `line` (the host's debug log + deduplicating notice reporter).
 */
export declare function createStderrSink(line: (text: string) => void): (data: string) => void;
//# sourceMappingURL=process.d.ts.map
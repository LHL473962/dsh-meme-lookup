/** Where the executable came from (`/doctor`). */
export type CodexExecutableSource = 'env' | 'path';
export interface CodexExecutable {
    readonly path: string;
    readonly source: CodexExecutableSource;
}
/** Whether a variable is one the child must not inherit. */
export declare function scrubbedCodexVariable(name: string): boolean;
/** The app-server child environment. */
export declare function buildCodexEnv(base?: NodeJS.ProcessEnv, extra?: Readonly<Record<string, string>>): Record<string, string>;
/** Run `<executable> --version` (bounded); the parsed version or undefined. */
export declare function readCodexVersion(executable: string, env?: NodeJS.ProcessEnv): Promise<string | undefined>;
/**
 * The native binary behind an npm `codex` shim (`codex.cmd`, `codex.ps1`,
 * the extensionless script), or undefined. A shim runs `node …/@openai/codex/
 * bin/codex.js`, which locates `vendor/<triple>/bin/codex[.exe]` (older
 * packages use `codex/` instead of `bin/`) of the
 * platform package and spawns it; spawning that binary directly avoids
 * `cmd.exe` re-parsing the `-c key="value"` arguments. Pure over its I/O
 * seams (unit-tested with a fake tree).
 */
export declare function resolveNpmShim(shim: string, io: {
    readonly platform: string;
    readonly arch: string;
    readonly exists: (path: string) => boolean;
    readonly read: (path: string) => string | undefined;
}): string | undefined;
/** The binary to spawn for a resolved path: an npm shim's native binary
 *  when one is found, else the path itself. */
export declare function spawnablePath(path: string): string;
/** Resolve the executable and its version; undefined when none is usable. */
export declare function resolveCodexExecutable(env?: NodeJS.ProcessEnv): Promise<(CodexExecutable & {
    readonly version: string | undefined;
}) | undefined>;
//# sourceMappingURL=binary.d.ts.map
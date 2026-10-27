import type { Context } from '@deepseek-ai/cordis';
import type * as AppBoot from '@deepseek-ai/dsh-app-boot';
import type * as HomePaths from '@deepseek-ai/dsh-home-paths';
import type * as Cmdline from '@deepseek-ai/dsh-cmdline';
import type * as HttpProxy from '@deepseek-ai/dsh-http-proxy';
import { HOST_MODULES } from './host-contract.js';
import { type ProcessExitSeam } from './process-exit.js';
type Warn = (line: string) => void;
/** Picking from the real module type fails the build when the contract names an undeclared export. */
type ContractExports<K extends (typeof HOST_MODULES)[number]['key']> = Extract<(typeof HOST_MODULES)[number], {
    key: K;
}>['exports'][number];
type AppBootModule = Pick<typeof AppBoot, ContractExports<'appBoot'>>;
/** `@deepseek-ai/dsh/profile-boot`, declared locally: the host CLI is not a dependency. */
interface ProfileBootModule {
    prepareProfile(name: string, userLayer?: boolean, fromDefaultProfile?: string): AppBoot.Profile;
    readonly INSTALL_ANCHOR: string;
    readonly PROFILE_ROOT_FILENAME: 'cordis.yml';
}
type HomePathsModule = Pick<typeof HomePaths, ContractExports<'homePaths'>>;
type CmdlineModule = Pick<typeof Cmdline, ContractExports<'cmdline'>>;
type HttpProxyModule = Pick<typeof HttpProxy, ContractExports<'httpProxy'>>;
export interface HostDsh {
    readonly packageDir: string;
    /** Reported, not gated on: the exports are. */
    readonly version: string;
    readonly Context: new () => Context;
    readonly appBoot: AppBootModule;
    readonly Loader: unknown;
    readonly homePaths: HomePathsModule;
    readonly launchEnvironmentKey: string;
    readonly cmdline: CmdlineModule;
    readonly profileBoot: ProfileBootModule;
    readonly httpProxy: HttpProxyModule;
}
/** Where the host came from, or why there is none (shown to the user). */
export type HostDshLocation = {
    readonly packageDir: string;
    readonly via: 'link' | 'shim' | 'beside' | 'volta';
} | {
    readonly reason: string;
};
/** `findHostDsh`'s reason when PATH has no `dsh` at all. */
export declare const NO_DSH_ON_PATH = "no dsh on PATH";
/**
 * Find the installed host package from the first `dsh` on PATH, following
 * what a launch would run: a link (npm on Unix) by its realpath, an npm /
 * pnpm / yarn launcher script (sh, `.cmd`, `.ps1`) by the script path it
 * starts, a volta shim through volta's package image. A launcher that
 * cannot be followed is no host: the reason says what was found.
 */
export declare function findHostDsh(env?: NodeJS.ProcessEnv, platform?: NodeJS.Platform): HostDshLocation;
/**
 * The script paths a launcher starts: quoted or bare tokens ending in
 * `.js` / `.mjs` / `.cjs` (npm and pnpm cmd-shim, `.cmd` and `.ps1` shims,
 * a hand-written `exec node …/bin.js` wrapper).
 */
export declare function launcherScriptPaths(text: string): string[];
/** Expand a launcher's own-directory variables and resolve with `platform`'s path rules. */
export declare function resolveLauncherPath(script: string, base: string, platform: NodeJS.Platform): string | undefined;
/**
 * The capability probe: throws naming what is missing (no host, a module that
 * does not import, an export the entry needs); the caller falls back.
 */
export declare function loadHostDsh(packageDir?: string | undefined): Promise<HostDsh>;
export interface HostRoot {
    readonly ctx: Context;
    /**
     * Select the final kernel after the Loader is available and third-party
     * backends have been assembled. This must happen before the runtime applies
     * and before the root composes its profile.
     */
    selectKernel(dsh: boolean): Promise<void>;
    /**
     * The dsh-tui profile (DSH kernel) or the light profile (./lite-profile.ts).
     * Rejects with the Loader's or the audit's error; the tree stays up.
     * `stopping`: a root dispose is waiting, so skip audit and readiness.
     */
    compose(warn: Warn, stopping?: () => boolean): Promise<void>;
    /**
     * Remove the fail-loud handlers (DSH kernel; a no-op otherwise) once the
     * TUI's process guard is up: it alone owns a fatal error, and fail-loud
     * would exit before the funnel restored the terminal.
     */
    readonly uninstallFailLoud: () => void;
    /** The host's DSH runtime version (`unknown` when it reports none). */
    readonly kernelVersion: string;
}
export interface PrepareHostRootOptions {
    readonly profile: string;
    /** `ctx.cmdlineArgs`. */
    readonly args: readonly string[];
    /** Routes `ctx.appExit(code)` to the TUI's exit funnel; the bounded `shutdown` when unfilled or refused. */
    readonly exitSeam?: ProcessExitSeam;
}
/**
 * Build the entry's root from the host's `cordis` and install the host's
 * module resolution on it before any TUI module is imported, so the TUI and
 * the DSH plugins resolve shared packages (react, schemastery, the
 * `@deepseek-ai/*` peers) the same way. Both kernels: otherwise the peers
 * resolve only through `$DSH_HOME/profiles/node_modules`, which a fresh
 * install may not have. The DSH kernel also gets the rest of `runProfile`'s prepare.
 */
export declare function prepareHostRoot(host: HostDsh, options: PrepareHostRootOptions): Promise<HostRoot>;
/** A composition failure, with the startup report saved for it. */
export declare class HostComposeError extends Error {
    readonly original: unknown;
    readonly logPath: string | undefined;
    constructor(original: unknown, logPath: string | undefined);
}
export {};
//# sourceMappingURL=host-dsh.d.ts.map
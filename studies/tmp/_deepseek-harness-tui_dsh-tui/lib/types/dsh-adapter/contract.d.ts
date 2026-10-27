/** Primary validated upstream line (newest). */
export declare const UPSTREAM_VALIDATED_VERSION = "0.2.1-rc.3";
/**
 * Explicitly supported upstream prerelease lines, oldest first.
 *
 * 0.2.1-rc.3 = primary continuous-CI line; 0.2.1-rc.2 and
 * 0.2.0-rc.2/rc.1 = previous family (mapped compatibility);
 * 0.1.7-rc.2/rc.1 = previous family (mapped compatibility);
 * 0.1.5-rc.1/alpha.2/alpha.1 = mapped
 * compatibility lines (source-checked when the primary line moves);
 * 0.1.3-alpha.2 = compatibility line (the only 0.1.3 build on npm);
 * 0.1.2-rc.1 = previous family (full CI coverage); 0.1.2-alpha.3–alpha.5 =
 * mapped compatibility lines; 0.1.1-rc.1/rc.2 = compatibility lines
 * (install- and type-level compatibility); 0.1.0-rc.7/rc.8 = full CI
 * coverage; 0.1.0-rc.6 = legacy line (install- and type-level
 * compatibility, feature surface may lack later additions — new features
 * must degrade gracefully there).
 * The peer range in package.json is deliberately wider than this list: an
 * install on an older or newer line is allowed but reports drift at boot.
 */
export declare const UPSTREAM_VALIDATED_VERSIONS: readonly ["0.1.0-rc.6", "0.1.0-rc.7", "0.1.0-rc.8", "0.1.1-rc.1", "0.1.1-rc.2", "0.1.2-alpha.3", "0.1.2-alpha.4", "0.1.2-alpha.5", "0.1.2-rc.1", "0.1.3-alpha.2", "0.1.5-alpha.1", "0.1.5-alpha.2", "0.1.5-rc.1", "0.1.7-rc.1", "0.1.7-rc.2", "0.2.0-rc.1", "0.2.0-rc.2", "0.2.1-rc.2", "0.2.1-rc.3"];
/**
 * Framework packages version on their own lines; the contract validates
 * their MAJOR (breaking surface), not the harness prerelease number.
 */
export declare const UPSTREAM_FRAMEWORK_MAJORS: Record<string, number>;
/** Official packages the adapter consumes at runtime or as types. */
export declare const UPSTREAM_BLESSED_PACKAGES: readonly ["@deepseek-ai/cordis", "@deepseek-ai/schemastery", "@deepseek-ai/dsh-agent", "@deepseek-ai/dsh-agent-instructions", "@deepseek-ai/dsh-agent-preset-registry", "@deepseek-ai/dsh-atomic-write", "@deepseek-ai/dsh-ptc-runtime-node", "@deepseek-ai/dsh-commands", "@deepseek-ai/dsh-cordis-host-runner", "@deepseek-ai/dsh-deepseek-account", "@deepseek-ai/dsh-host-webserver", "@deepseek-ai/dsh-llm", "@deepseek-ai/dsh-llm-pi-ai", "@deepseek-ai/dsh-persona", "@deepseek-ai/dsh-scope", "@deepseek-ai/dsh-session", "@deepseek-ai/dsh-settings", "@deepseek-ai/dsh-skill", "@deepseek-ai/dsh-storage", "@deepseek-ai/dsh-storage-domain", "@deepseek-ai/dsh-storage-json", "@deepseek-ai/dsh-workspace", "@deepseek-ai/dsh-web-app", "@deepseek-ai/dsh-system-prompt", "@deepseek-ai/dsh-terminal", "@deepseek-ai/dsh-terminal-bash", "@deepseek-ai/dsh-tool-ask-user", "@deepseek-ai/dsh-tool-bash-persistent", "@deepseek-ai/dsh-tool-cordis", "@deepseek-ai/dsh-tool-subagent", "@deepseek-ai/dsh-user-approval", "@deepseek-ai/dsh-user-questions", "@deepseek-ai/dsh-app-boot", "@deepseek-ai/dsh-cmdline", "@deepseek-ai/dsh-home-paths", "@deepseek-ai/dsh-http-proxy", "@deepseek-ai/dsh-launch-environment", "@deepseek-ai/dsh-plugin-manager"];
export interface UpstreamDriftEntry {
    package: string;
    installed: string | undefined;
    validated: string;
}
/** Supported upstream prerelease channels in ascending precedence order. */
export type UpstreamPrereleaseChannel = 'alpha' | 'beta' | 'rc';
/** A parsed upstream prerelease version, e.g. `0.1.2-alpha.1` → `[0, 1, 2, 'alpha', 1]`. */
export type UpstreamVersionTuple = readonly [number, number, number, UpstreamPrereleaseChannel, number];
/** Parse an upstream prerelease version; undefined when unparseable. */
export declare function parseUpstreamVersion(version: string | undefined): UpstreamVersionTuple | undefined;
/** Order two parsed versions: negative/positive/zero as a `<`/`>`/`=`. */
export declare function compareVersions(a: UpstreamVersionTuple, b: UpstreamVersionTuple): number;
/** Human-readable summary of the exact validated prerelease lines. */
export declare const UPSTREAM_VALIDATED_LABEL: string;
export declare function installedUpstreamVersions(): Record<string, string | undefined>;
/**
 * The installed upstream version of one blessed package, parsed; undefined
 * when missing or not on a supported `x.y.z-(alpha|beta|rc).n` line. Feature gates
 * compare this against the line a behavior was introduced on, so the
 * adapter degrades on older installs instead of calling APIs they do not
 * have.
 */
export declare function installedUpstreamVersion(packageName: string): UpstreamVersionTuple | undefined;
/**
 * 内核（dsh）版本的铭牌来源（第七版：落地页右下角双版本号）。
 *
 * 真实来源两级，都不造假：
 * 1. **宿主 CLI** `@deepseek-ai/dsh` 的 package.json——TUI 作为插件跑在 dsh
 *    宿主进程里时它一定可解析（`bin/dsh-tui.js` 委托 `dsh --profile` 启动）；
 *    孤立回归/源码 checkout 里解析不到就落到第 2 级。
 * 2. **内核线包** `@deepseek-ai/dsh-agent`（与内核同线发版、由本仓直接依赖，
 *    `installedUpstreamVersions` 的既有清单成员）的已装版本——它就是
 *    upstreamDriftSummary 用来判定「内核在不在验证线」的同一份数据。
 *
 * 两级都读不到 → undefined（调用方只画 TUI 版本，不编造）。
 */
export declare function installedKernelVersion(): string | undefined;
/**
 * Whether the installed version of `packageName` is at or beyond `minimum`
 * (a literal like `'0.1.0-rc.8'`). Unparseable or older installs return
 * false so features introduced on the minimum line degrade gracefully.
 */
export declare function installedMeetsVersion(packageName: string, minimum: string): boolean;
/**
 * The distinct installed prerelease versions across the blessed harness
 * packages (framework packages excluded). One entry = coherent install;
 * several = a mixed tree, which the per-package drift check cannot see.
 * Empty when nothing (or no harness package) is installed.
 */
export declare function installedUpstreamLines(installedVersions?: Readonly<Record<string, string | undefined>>): string[];
/**
 * Report every blessed package whose installed version is NOT one of the
 * validated release lines. Empty array = the running install matches the
 * contract.
 */
export declare function upstreamDrift(installedVersions?: Readonly<Record<string, string | undefined>>): UpstreamDriftEntry[];
/**
 * Classification of a drifted install for the one-line boot notice:
 * `newer` / `older` — every drifted harness package sits on a single
 * parseable version off one end of the validated window; `mixed` — several
 * distinct versions coexist (unstable tree); `broken` — something is
 * missing or unparseable and wording cannot get more specific.
 */
export type UpstreamDriftKind = 'newer' | 'older' | 'mixed' | 'broken';
/** Merged drift verdict consumed by the logo header notice (LogoV2). */
export interface UpstreamDriftSummary {
    kind: UpstreamDriftKind;
    /** Distinct installed versions among drifted packages ('missing' for absent ones). */
    versions: string[];
}
/**
 * Collapse {@link upstreamDrift} into a single summary for the boot notice:
 * undefined when the install matches the contract. Only harness prerelease packages
 * decide newer/older/mixed; a framework-only drift (e.g. a cordis major
 * bump) reports `broken`, since its version line is not comparable.
 */
export declare function upstreamDriftSummary(installedVersions?: Readonly<Record<string, string | undefined>>): UpstreamDriftSummary | undefined;
//# sourceMappingURL=contract.d.ts.map
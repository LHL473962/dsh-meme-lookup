import { shellQuote } from './utils/shellQuote.js';
import { type KernelBackendId } from './kernelPrefs.js';
import { detachHandoffStdin } from './ink/stdin-handoff.js';
export { shellQuote };
export { detachHandoffStdin };
/**
 * env marker on every replacement (/restart, /update, kernel switch): it is
 * started with the original app arguments, so a command-line prompt in them
 * was already sent by the first process and must not be sent again.
 */
export declare const LAUNCH_PROMPT_SENT_ENV = "DSH_TUI_LAUNCH_PROMPT_SENT";
/**
 * Append a /restart handoff event to ~/.dsh-tui/restart.log.
 * @param event - Short stable event name.
 * @param data - Small JSON-safe detail (never credentials or session text).
 */
export declare function logRestartEvent(event: string, data?: Record<string, unknown>): void;
/**
 * `~/.dsh-tui/last-run.json`: which kernel and session the most recent TUI
 * instance ran, written at boot (plugin.ts) and refreshed by the exit funnel.
 * The launcher's safe-mode retry reads it. After a kernel switch the
 * launcher's own env still names the original backend, so retrying from that
 * env would reopen the old kernel, or hand a DSH session id to a Claude boot.
 * kernel.json has the backend but not the session or when it was written.
 */
export interface LastRunRecord {
    /** The kernel THIS instance ran on (Config domain: KernelBackendId). */
    readonly backendId: KernelBackendId;
    /** The resumable session id on that backend; '' = nothing resumable (the
     *  retry cold-starts the backend instead of resuming across domains). */
    readonly sessionId: string;
    /** The session's working directory (diagnostics; the retry keeps the
     *  launch cwd, it does not chdir from this field). */
    readonly cwd: string;
    /** Which boot wrote this record (pid+clock id; diagnostics and
     *  generation comparisons). */
    readonly attemptId: string;
    /** epoch-ms stamp (added by writeLastRunRecord): the launcher compares it
     *  against its own start to tell this-chain records from a previous
     *  launch's leftovers. */
    readonly updatedAt: number;
    /** Writer pid (diagnostics). */
    readonly pid?: number;
}
/**
 * Stamp the last-run record atomically (tmp + rename, so the launcher's read
 * never sees half a file). Best effort, never throws: a failed stamp only
 * degrades the launcher's retry to its legacy sniffing path.
 * @param record - Identity without updatedAt (stamped here, one clock).
 * @param file - Path override (verify scripts point at a temp dir).
 */
export declare function writeLastRunRecord(record: Omit<LastRunRecord, 'updatedAt'>, file?: string): void;
/**
 * Read the last-run record; unreadable/invalid/missing yields undefined (the
 * caller falls back to its legacy behavior). Never throws.
 * @param file - Path override (verify scripts point at a temp dir).
 */
export declare function readLastRunRecord(file?: string): LastRunRecord | undefined;
/** Start a fresh, clearly delimited /restart attempt block in the log. */
export declare function beginRestartAttempt(sessionId: string): void;
/**
 * Write a handoff notice to stderr synchronously: process.exit() right after
 * an async stream write skips the flush, and a vanished diagnosis is
 * indistinguishable from a silent failure.
 */
export declare function writeHandoffNotice(text: string): void;
/**
 * Hand the terminal back after a kernel-switch replacement that cannot clean
 * up after itself: one that died before its first frame (this process still
 * holds the alternate screen) or one killed by a signal. Besides leaving the
 * alternate screen it turns off the input modes the replacement may already
 * have enabled; each reset is harmless if the mode was never on. Written
 * synchronously to fd 1 so the failure notice that follows lands on the main
 * screen.
 */
export declare function restoreHandoffScreen(): void;
export interface TuiUpdateInfo {
    current: string;
    latest: string;
    isStandalone?: boolean;
    downloadUrl?: string;
    /** SHA256SUMS manifest URL when the release publishes one; absent = the update warning path. */
    checksumUrl?: string;
}
/** What a fresh registry lookup says about this install. */
export type TuiUpdateTarget = {
    kind: 'update';
    current: string;
    latest: string;
    authoritative?: string;
    isStandalone?: boolean;
    downloadUrl?: string;
    checksumUrl?: string;
} | {
    kind: 'latest';
    current: string;
    isStandalone?: boolean;
} | {
    kind: 'unknown';
    isStandalone?: boolean;
};
export interface TuiUpdateResult {
    /** Exit code of the `dsh plugin update` run (0 = the package was updated). */
    updateCode: number;
    /**
     * Exit code of the restarted TUI process. Equals `updateCode` when the
     * failure happened before a restart was attempted.
     */
    restartCode: number;
}
/** Read the version from either the compiled package or the source checkout. */
export declare function installedTuiVersion(): string | undefined;
/**
 * The profile this TUI was booted with (`dsh --profile <name>`), read from
 * the launcher argv the process inherited. dsh sets no profile env var, and
 * its launcher parses its own flags first, so the first `--profile` token in
 * argv is the launcher's. Undefined for non-profile launches (source
 * checkouts, `--config` overlays) — there is no profile installation for
 * `/update` to act on, so the command must stay disabled there.
 */
export declare function resolveDshProfileName(argv?: readonly string[]): string | undefined;
/**
 * Resolve the registry base URL the way npm/pnpm would: `NPM_CONFIG_REGISTRY`
 * (both spellings) over the `registry=` line in ~/.npmrc over npmjs.org, so
 * mirror users see the same `latest` their package manager would install.
 */
export declare function resolveRegistryBase(): string;
/** True when `current` is a strictly newer valid version than `previous`. */
export declare function isVersionNewer(current: string, previous: string): boolean;
/**
 * Versions whose compiled plugin hard-injects `tuiWorkspaces`
 * ('0.7.0'–'0.7.1'; removed in 0.7.2). Installing one while the globally
 * installed launcher copy predates the `dsh-tui-workspaces` patch row
 * deadlocks boot forever at "pending (waiting for service: tuiWorkspaces)"
 * (issues #183/#307) — and /update reaching such a target is exactly how
 * stale-mirror installs stranded users. /update must refuse them.
 * @param version - the candidate install target.
 * @returns true for the known boot-deadlock version range.
 */
export declare function isBootDeadlockTarget(version: string): boolean;
/**
 * Detect whether the current process is running in standalone / portable package mode.
 *
 * @returns `true` when running inside a standalone binary distribution, `false` otherwise.
 */
export declare function isStandaloneRuntime(): boolean;
/**
 * Get the path to the current standalone executable binary.
 *
 * @returns The resolved executable path from environment or `process.execPath`.
 */
export declare function getStandaloneBinaryPath(): string;
/**
 * Get the expected release asset file name for the current platform and architecture.
 *
 * @param platform - Node.js platform identifier (e.g. `'linux'`, `'win32'`, `'darwin'`).
 * @param arch - Node.js architecture identifier (e.g. `'x64'`, `'arm64'`).
 * @returns The archive file name matching the target platform.
 */
export declare function getStandaloneAssetName(platform?: NodeJS.Platform, arch?: NodeJS.Architecture): string;
/** Options for {@link fetchGithubLatestRelease} — injectable for tests. */
export interface GithubReleaseQuery {
    /** GitHub API base; defaults to `https://api.github.com`. */
    apiBaseUrl?: string;
    /** Fetch implementation; defaults to the global fetch. */
    fetchImpl?: typeof fetch;
    /** Cancellation shared with the update that requested this release. */
    signal?: AbortSignal;
}
/**
 * Fixed-name SHA256SUMS download URL for a release version — the
 * mirror-fallback counterpart of {@link findChecksumAssetUrl}: when the
 * GitHub API is unreachable and the version came from a registry, there is no
 * asset list to parse, so the manifest is probed at its conventional name on
 * the same direct-download host (release-bundle.yml publishes it as
 * `SHA256SUMS` next to every asset).
 */
export declare function releaseChecksumUrl(version: string): string;
/**
 * Fetch latest release info from GitHub Releases API for the standalone asset.
 *
 * @param options - Injectable API base / fetch for tests.
 * @returns Release version tag, matching asset download URL, and the
 *   SHA256SUMS manifest URL when the release ships one, or `undefined` on any
 *   failure.
 */
export declare function fetchGithubLatestRelease(options?: GithubReleaseQuery): Promise<{
    version: string;
    downloadUrl?: string;
    checksumUrl?: string;
} | undefined>;
/**
 * Verify a downloaded release asset against its SHA256SUMS manifest text
 * (fail-closed in every ambiguous shape: a malformed line, a missing entry
 * for the asset, or multiple bare digests all reject — a release that
 * publishes a manifest has declared checksums mandatory for its assets).
 * Both the GNU `hex␣␣name` and `hex␣*name` (binary-mode) line forms parse,
 * and a single bare `hex` line (a `<asset>.sha256` sidecar) applies to the
 * one asset it accompanies.
 *
 * Trust boundary (explicit scope note): the manifest is fetched from the
 * SAME release as the asset, so what this check defends against is
 * download-domain hijacking, cache poisoning, and asset/manifest mix-ups —
 * any tampering that changes the asset without also controlling the
 * release's published checksums. It does NOT defend against a fully
 * compromised release source (attacker publishes matching checksums for
 * malicious bytes): that requires a signature chain (minisign/cosign with
 * the public key built into the binary) — a declared follow-up item, out
 * of this change's scope.
 *
 * @param buffer - The downloaded asset bytes.
 * @param manifestText - SHA256SUMS file content.
 * @param assetName - Asset file name to look up in the manifest.
 * @returns true only when the manifest names the asset and the digest matches.
 */
export declare function verifyAssetChecksum(buffer: Buffer, manifestText: string, assetName: string): boolean;
/**
 * Escape a value for embedding in a PowerShell single-quoted literal: only
 * `''` needs escaping there (same convention as `buildPsScript` in
 * src/utils/clipboard.ts). Extract/archive paths derive from environment
 * variables (`DSH_TUI_STANDALONE_CACHE`), so an unescaped `'` closes the
 * literal and turns the rest of the path into executable command text.
 * @param value - Raw string to embed between single quotes.
 * @returns The value with every `'` doubled.
 */
export declare function escapePsSingleQuoted(value: string): string;
/**
 * How the Windows half of the standalone updater extracts the downloaded zip:
 * prefer the bsdtar `tar.exe` Windows 10 1809+ ships (it reads zip, and the
 * array argv never goes through a shell, so there is no quoting surface at
 * all), and only fall back to `Expand-Archive` when tar is missing — with
 * both paths escaped as single-quoted literals. Extracted as a pure function
 * so scripts/verify-update-extract.tsx can pin the no-injection contract.
 * @param downloadPath - Path of the downloaded archive (attacker-influenced
 *   via cache-dir environment variables).
 * @param extractDir - Destination directory for extraction.
 * @param tarAvailable - Whether `tar --version` ran successfully (probed once
 *   per update with {@link windowsTarAvailable}).
 * @returns The child command plus its argv — array form for both tools.
 */
export type WindowsExtractPlan = {
    tool: 'tar';
    args: string[];
} | {
    tool: 'powershell';
    args: string[];
};
export declare function windowsExtractPlan(downloadPath: string, extractDir: string, tarAvailable: boolean): WindowsExtractPlan;
/** What {@link validateExtractedTree} says about an extracted release tree. */
export interface ExtractedTreeCheck {
    ok: boolean;
    /** First offending entry (path + why) when ok is false. */
    reason?: string;
}
/**
 * Zip-slip / symlink guard between extraction and replacement (security
 * review, medium): walk the freshly extracted tree WITHOUT following links
 * and require every entry to be a regular file or directory whose resolved
 * path stays inside the extract dir. GNU tar happily materializes symlink
 * members pointing outside (verified: `link.txt -> /etc/passwd` lands on
 * disk), and the follow-up copyFileSync would then read/write through the
 * link; `../` members are also refused by tar/unzip themselves, but the
 * prefix check here keeps the guard local and future-proof against a
 * different extractor. The node-tar strict equivalent (preservePaths: false +
 * strict) is in standalone/entry.mjs — this covers the system-tool paths
 * entry.mjs cannot. Symlinks are rejected outright (defense in depth: a
 * "harmless" in-tree link is still indistinguishable from a hostile one at
 * this layer), as are fifo/socket/device entries — and hard links (red-team
 * review): GNU tar refusing external linkname targets is extractor behavior,
 * not a guarantee this code may lean on (busybox tar and friends land hard
 * links verbatim), so any regular file with nlink > 1 is refused — a landed
 * hard link aliases a file this walk never enumerated.
 * @param extractDir - Directory the archive was extracted into.
 * @returns ok plus the first offending entry's path.
 */
export declare function validateExtractedTree(extractDir: string): ExtractedTreeCheck;
/** Options for {@link downloadAndReplaceStandaloneBinary} — injectable for tests. */
export interface StandaloneDownloadOptions {
    /**
     * Override the asset size cap (default {@link MAX_ASSET_BYTES}). Tests
     * inject a small value so the mid-stream abort path runs in milliseconds.
     */
    maxAssetBytes?: number;
    /**
     * Override the checksum-manifest size cap (default
     * {@link MAX_CHECKSUM_MANIFEST_BYTES}). Tests inject a small value so the
     * manifest's own mid-stream abort path runs against a local unbounded
     * server stream.
     */
    maxChecksumManifestBytes?: number;
    /** Cancel both the archive and checksum transfer before replacement. */
    signal?: AbortSignal;
}
/**
 * Download the new standalone release binary package and atomically replace the running binary.
 *
 * Integrity (security review, high): when the caller resolved a SHA256SUMS
 * manifest URL for the release, the downloaded bytes must match the manifest
 * digest before anything is extracted or replaced — a mismatch (or an
 * unreadable/malformed manifest) deletes the downloaded file and fails the
 * update closed. Releases without any manifest still update, but the progress
 * channel carries an explicit "no checksum" warning.
 * TODO(next major): make the manifest mandatory — a release that publishes no
 * checksums will then be refused outright instead of warned about.
 *
 * @param downloadUrl - Direct URL to download the release archive.
 * @param onProgress - Optional callback invoked with progress status strings.
 * @param checksumUrl - SHA256SUMS manifest URL for the release, when known.
 * @param options - Injectable download limits (tests pass a small cap).
 * @returns Object indicating success or an error message on failure.
 */
export declare function downloadAndReplaceStandaloneBinary(downloadUrl: string, onProgress?: (text: string) => void, checksumUrl?: string, options?: StandaloneDownloadOptions): Promise<{
    success: boolean;
    error?: string;
}>;
/**
 * Classify this install against a fresh registry lookup: an update is
 * available, the install is already latest, or the answer is unknown
 * (offline / registry error / unreadable own version).
 *
 * The configured registry decides the install target (pnpm must be able to
 * fetch it), but when that registry is a mirror it can lag behind npmjs —
 * issue #307's users were pinned onto stale versions this way. A
 * best-effort npmjs.org check runs in parallel and surfaces as
 * `authoritative` when it knows a strictly newer release, so callers can
 * say "installing X now, official latest is Y" instead of silently
 * upgrading to yesterday's version.
 */
export declare function resolveTuiUpdateTarget(signal?: AbortSignal): Promise<TuiUpdateTarget>;
/**
 * Check npm for a newer published TUI version. Network and registry errors
 * are intentionally treated as "no result" so an offline launch never delays
 * or blocks the interactive TUI.
 */
export declare function checkForTuiUpdate(): Promise<TuiUpdateInfo | undefined>;
/** Build the profile-manager command, preferring a preflight-pinned version. */
export declare function tuiUpdatePluginArgs(profile: string, targetVersion?: string): string[];
/** The profile's pnpm-workspace.yaml (`$DSH_HOME ?? ~/.dsh` layout). */
export declare function profileWorkspaceYamlPath(profile: string): string;
/** What ensureProfileAllowBuilds did to the profile workspace file. */
export interface AllowBuildsOutcome {
    /** Keys already present before this run (left untouched). */
    existing: string[];
    /** Keys this run appended. */
    added: string[];
}
/**
 * Make sure the profile's pnpm-workspace.yaml carries explicit `false`
 * allowBuilds entries for the dsh-tui chain's postinstall-only deps, so a
 * pnpm ≥11 update is not killed by ERR_PNPM_IGNORED_BUILDS. Best effort and
 * idempotent: existing entries are never overwritten (an explicit user
 * decision wins), a missing `allowBuilds:` block is appended, and a missing
 * file is created. Returns undefined when the profile directory is absent or
 * the file could not be updated — the caller still runs pnpm, whose own
 * ERR_PNPM_IGNORED_BUILDS diagnostic stays the visible fallback.
 */
export declare function ensureProfileAllowBuilds(profile: string): AllowBuildsOutcome | undefined;
/** Path-based core of {@link ensureProfileAllowBuilds} for callers that hold
 *  the profile directory itself (the Claude SDK installer's heal pass). */
export declare function ensureWorkspaceAllowBuilds(yamlPath: string): AllowBuildsOutcome | undefined;
/** What ensureProfileReleaseAgeExclude did to the profile workspace file. */
export interface ReleaseAgeExcludeOutcome {
    /** Final exclude entries after the run (ours plus preserved foreign ones). */
    entries: string[];
    /** True when the file was written (entry added or stale entry replaced). */
    changed: boolean;
}
/**
 * pnpm ≥11 delays installs of packages published within `minimumReleaseAge`
 * (24h by default) — on release day that gate refuses the very version
 * `/update` is installing (ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION), which
 * reads to the user as a broken update until the window passes. Pre-seed the
 * profile's pnpm-workspace.yaml with release-age exclusions scoped to this
 * package at the exact versions pnpm verifies before it can swap the package:
 * the target version itself, plus `alsoExempt` — the pre-update `updatedFrom`,
 * read from the running package's own manifest (normally the version the
 * profile lockfile pins). Two releases inside the 24h window leave the OLD
 * lockfile entry inside it too, and pnpm fails the whole policy check on that
 * entry before replacing the package (issue #1205), so exempting only the
 * target is not enough. Same best-effort,
 * idempotent pattern as {@link ensureProfileAllowBuilds}: entries for this
 * package track exactly the versions the current update needs (older own
 * entries are dropped instead of accumulating), foreign entries are
 * preserved, a missing `minimumReleaseAgeExclude` block is appended, a
 * missing file is created, and an absent profile directory resolves to
 * undefined — the caller still runs pnpm, whose own diagnostic stays the
 * visible fallback. Both versions share ONE entry, `pkg@<target> || <from>`:
 * pnpm 11.5.x–11.7.x honour only the FIRST entry per package (later entries
 * for the same package are ignored), so two entries leave the old lockfile
 * version unexempted there whatever their order — the `pnpm update` dsh runs
 * for `/update` fails on it (issue #1605) — while 11.10+ applies every entry.
 * A version union is read whole by both. Both exemptions come from the
 * manifest, not from `pnpm-lock.yaml`: a profile whose manifest and lockfile
 * diverged keeps the lockfile's entry unexempted.
 *
 * @param profile - The dsh profile whose workspace file is seeded.
 * @param version - The update target (exact version).
 * @param alsoExempt - Optional second version to keep exempt, normally the
 *   pre-update `updatedFrom`; ignored when empty or equal to `version`.
 */
export declare function ensureProfileReleaseAgeExclude(profile: string, version: string, alsoExempt?: string): ReleaseAgeExcludeOutcome | undefined;
/** What ensureWorkspaceStoreDir did to the profile workspace file. */
export interface StoreDirOutcome {
    /** True when the file was written (the pin was appended). */
    readonly changed: boolean;
}
/**
 * pnpm resolves its content-addressable store from the environment when no
 * explicit setting exists: a pnpm run under a redirected \u0060XDG_DATA_HOME\u0060
 * (sandbox, relay, container) silently records THAT location in the
 * profile's \u0060node_modules/.modules.yaml\u0060, and every later pnpm run in the
 * profile — dsh's own updates, plugin installs, the Claude SDK wizard —
 * dies with ERR_PNPM_UNEXPECTED_STORE until node_modules is rebuilt by
 * hand. Pin \u0060storeDir\u0060 in the profile's pnpm-workspace.yaml so all of them
 * resolve the same store whatever the environment says. The value is
 * relative on purpose: pnpm resolves it against the workspace file\u0027s
 * directory, landing on \u0060<dsh home>/.pnpm-store\u0060 beside the profiles root
 * for every user and surviving a relocated \u0060DSH_HOME\u0060. Same best-effort,
 * idempotent pattern as {@link ensureProfileAllowBuilds}: an existing
 * top-level \u0060storeDir:\u0060 is never overwritten (an explicit user decision
 * wins), a missing file is created, and any failure resolves to undefined —
 * pnpm's own diagnostic stays the visible fallback, and the installer's
 * store-mismatch self-heal catches what a failed pin leaves behind.
 */
export declare function ensureWorkspaceStoreDir(yamlPath: string): StoreDirOutcome | undefined;
/**
 * The @img suffix of the RUNNING platform: musl linux maps to linuxmusl, and
 * FreeBSD — which has no native @img build — maps to the only form it can load.
 * Without that mapping a FreeBSD update would ignore `@img/sharp-freebsd-wasm32`
 * and leave sharp with nothing to load.
 */
export declare function sharpCurrentSuffix(platform: string, cpu: string, libc: string): string;
/**
 * Deliberate omission: sharp's registry matrix (0.35.3) also carries the
 * platform-agnostic `wasm32` fallback (~9MB unpacked) plus
 * `webcontainers-wasm32`. They carry no os constraint, so they resolve on
 * every platform — including architectures with no native @img build at all
 * (loong64 etc.), where wasm is the only working form. They are therefore
 * NOT ignored: updates keep downloading them, trading ~9MB for not breaking
 * sharp on fallback-only architectures.
 */
/** Patterns for every @img platform package EXCEPT the running one. */
export declare function ignoredSharpOptionalPatterns(platform: string, cpu: string, libc: string): string[];
/** The SDK bundle suffix of the RUNNING platform (musl linux adds `-musl`). */
export declare function claudeSdkCurrentSuffix(platform: string, cpu: string, libc: string): string;
/** Patterns for every SDK bundle EXCEPT the running one. */
export declare function ignoredClaudeSdkOptionalPatterns(platform: string, cpu: string, libc: string): string[];
/** Patterns for every known native package this platform does not load. */
export declare function ignoredForeignPlatformPatterns(platform: string, cpu: string, libc: string): string[];
/**
 * Libc verdict for an explicit platform, so the whole matrix is testable on any
 * host. Node's report wins when present: a stray musl loader (Debian's musl
 * package, cross-compile toolchains) on a glibc system must NOT flip the
 * verdict, or the current platform's own packages would land in the ignore
 * list. The loader-path probe only answers when the report is unavailable (the
 * same fallback sharp's detect-libc uses); a non-Linux platform is always glibc.
 */
export declare function detectLibc(platform: string, report: {
    header?: {
        glibcVersionRuntime?: string;
    };
} | undefined, muslLoaderPresent: boolean): 'glibc' | 'musl';
/** What ensurePlatformFilterAt did to a profile workspace file. */
export interface PlatformFilterOutcome {
    /** The foreign-platform ignore patterns the file now carries. */
    entries: string[];
    /** True when the file was written (filter added or refreshed). */
    changed: boolean;
}
/**
 * Keep an `ignoredOptionalDependencies:` block in a profile's
 * pnpm-workspace.yaml listing every native package this platform does not
 * load — the foreign-platform sharp natives and Claude SDK bundles — so an
 * update (or an on-demand kernel install) stops downloading them. The list is
 * recomputed on every run: it is a fact about the machine running pnpm, so a
 * profile carried to another platform (WSL, a musl container, a new cpu) gets
 * a fresh list instead of a stale one that would skip the packages that
 * machine needs. Entries this module's own tables cover are rewritten (by
 * package name, so quoted forms, trailing comments and blank lines inside the
 * block all still refresh); every other entry — a user's `fsevents`, a native
 * package a backend adds later, a user's own `@img/sharp-wasm32` exemption —
 * is preserved verbatim, same as in {@link ensureProfileAllowBuilds}. Best
 * effort and idempotent: the file is written only when the resulting block
 * actually differs, a missing `ignoredOptionalDependencies:` block is
 * appended, and an absent directory resolves to undefined — the caller still
 * runs pnpm, only the download-size win is lost. A document this function
 * cannot rewrite safely (a flow-style value, a duplicated key, which is
 * already invalid YAML) is left untouched rather than half-rewritten. Residual
 * caveat shared by any persisted machine fact: a second platform using the
 * same profile without running either path keeps this platform's list, so its
 * own binaries stay skipped until the next update or install there.
 */
export declare function ensurePlatformFilterAt(yamlPath: string): PlatformFilterOutcome | undefined;
/** {@link ensurePlatformFilterAt} for a profile's own workspace file. */
export declare function ensureProfilePlatformFilter(profile: string): PlatformFilterOutcome | undefined;
/**
 * The pnpm Windows tmp-rename race signature (issue #225): pnpm swaps a
 * package directory via a `<name>_tmp_<pid>` staging dir, and a file lock or
 * AV scan makes the scandir/rename fail with ENOENT/EPERM/EBUSY. The failure
 * is transient — the identical command succeeds on retry — but the crashed
 * run leaves a half-updated profile (manifest pins the old version while the
 * lockfile already carries the new snapshot), which presents as "update did
 * nothing" (#209). Genuine resolution errors never carry the `_tmp_<pid>`
 * token, so matching both keeps the retry from masking real failures.
 */
export declare function isTransientUpdateFailure(stderr: string): boolean;
/**
 * The pnpm Linux flavor of the tmp-rename race (issue #479): the very same
 * `importPackage` staging path, but overlayfs surfaces the second swap of an
 * already-replaced package dir as EEXIST — deterministically, on every run,
 * never transiently. A plain retry of the identical command ALWAYS fails the
 * same way (the leftover `_tmp_<pid>_<threadId>` staging dir keeps colliding),
 * so this signature must route to the recovery path
 * (removeStalePackageInstall + rerun), not to the plain retry.
 */
export declare function isEexistTmpRenameFailure(stderr: string): boolean;
/**
 * The dsh profile layout places plugin packages under
 * `$DSH_HOME ?? ~/.dsh` — the same root dsh itself resolves
 * (`dshHomePath is $DSH_HOME ?? ~/.dsh`, and packaged presets resolve
 * identically). /update's recovery path needs this location to clear a
 * half-updated install pnpm can no longer swap in place (issue #479).
 */
export declare function profilePackageDir(profile: string): string;
/** What removeStalePackageInstall actually cleared from disk. */
export interface StaleInstallRemoval {
    /**
     * `removed` — the package dir (or its junction/symlink link) is gone;
     * `absent` — it was not there to begin with (custom profile roots just
     * miss); `failed` — an error other than ENOENT blocked the removal.
     */
    packageDir: 'removed' | 'absent' | 'failed';
    /** Leftover pnpm staging dirs (`dsh-tui_tmp_<pid>_<threadId>`) removed. */
    tmpDirs: string[];
}
/**
 * Recovery for the pnpm tmp-rename races (issues #225/#479): remove the
 * profile's installed copy of this package plus the sibling `_tmp_`
 * staging dirs a crashed swap leaves behind, so the next installer run
 * takes the fresh-install path instead of renaming over the collision.
 * Field-verified workaround (issue #479): `rm -rf <pkg dir>` + rerun
 * succeeds where ten plain retries fail.
 *
 * A junction/symlink at the package dir is UNLINKED only — the link is
 * removed, the target tree (a dev checkout it may point at) is never
 * traversed or deleted. Best effort throughout: this runs inside a
 * failure-recovery branch, so an unusable result simply falls through to
 * the rerun and the manual repair hint.
 */
export declare function removeStalePackageInstall(profile: string): StaleInstallRemoval;
/**
 * Best-effort migrate the GLOBAL launcher to the delegating shim (0.8.7):
 * after a successful profile update, copy this package's `bin/dsh-tui.js`
 * and `package.json` over the global install so the launcher can never lag
 * the profile again — the shim delegates all logic to the profile copy it
 * just updated. Single-file-safe by contract: the new bin imports nothing
 * from lib/ (see its header), so overwriting it inside an older global
 * install cannot dangle a missing helper.
 *
 * Locating the global dir relies on argv[1] being the global `dsh-tui.js`
 * (true when booted through the `dsh-tui` command). Source checkouts and
 * direct `dsh --profile` boots resolve nothing — the migration is a silent
 * no-op there. Write failures (permissions, locked files) are equally
 * silent: the launcher-alignment warning remains the fallback diagnosis.
 *
 * @returns true when the global launcher files were replaced.
 */
export declare function migrateGlobalLauncher(): boolean;
/** Outcome of the install-only half of an update (no restart). */
export interface TuiUpdateOutcome {
    /** 0 = the profile now runs the intended version; non-zero = failed. */
    code: number;
    /** Version installed before the update ran (the #307 stamp). */
    updatedFrom: string;
    /** Version installed after the update ran, when readable. */
    installed?: string;
}
/**
 * Install-only half of `/update`: run `dsh plugin add`, refuse boot-deadlock
 * targets, verify the profile actually advanced, and migrate the global
 * launcher. No restart — `updateTuiAndRestart` layers the session-preserving
 * restart on top, and the `dsh-tui update` CLI stops here.
 *
 * @param profile - The dsh profile to update.
 * @param targetVersion - Exact version from the preflight registry check, or
 *   undefined when that check failed and pnpm should resolve latest.
 * @returns The update exit code plus the before/after versions.
 */
export declare function updateTui(profile: string, targetVersion?: string, signal?: AbortSignal): Promise<TuiUpdateOutcome>;
/**
 * Update the installed dsh-tui package and restart the same launcher while
 * preserving the active session. The TUI must already be unmounted before
 * this is called so pnpm output cannot corrupt the rendered terminal frame.
 *
 * When the preflight registry check resolved an exact target, pass that
 * version to pnpm instead of resolving `latest` a second time. This avoids a
 * stale mirror/dist-tag response between the check and install. If preflight
 * failed, retain the `--latest` fallback: a plain `pnpm update` stays inside
 * the manifest range and can restart unchanged across minor releases.
 *
 * @param sessionId - Session to resume in the replacement process.
 * @param profile - The dsh profile this TUI was launched with; updating any
 *   other profile would leave the running install untouched.
 * @param targetVersion - Exact version returned by the preflight registry
 *   check, or undefined when that check failed and pnpm should resolve latest.
 * @param kernel - The kernel this process runs (TuiRestartOptions.kernel).
 * @returns Exit codes for the update run and the replacement process.
 */
export declare function updateTuiAndRestart(sessionId: string, profile: string, targetVersion?: string, kernel?: KernelBackendId, 
/** The standalone entry's supervision hooks (TuiRestartOptions.onSpawn / onTerminationSignal). */
supervision?: Pick<TuiRestartOptions, 'onSpawn' | 'onTerminationSignal'>, signal?: AbortSignal): Promise<TuiUpdateResult>;
/**
 * Headless `dsh-tui update`: the `/update` decision flow (preflight, deadlock
 * refusal, mirror-lag note, `--latest` fallback) followed by the install-only
 * half — no TUI, no restart. The bin launcher dynamic-imports this from the
 * profile copy's compiled lib.
 *
 * @param profile - The dsh profile to update.
 * @returns Process exit code: 0 on success or already-latest, 1 otherwise.
 */
export declare function cliUpdate(profile: string): Promise<number>;
/**
 * Restart the running TUI in place and resume the active session — the
 * `/update` restart path minus the pnpm step, for `/restart`. Spawns the
 * same node process with the original argv and the dual-written resume
 * contract, so a fresh process re-boots the same profile and attaches the
 * same session. No installation is touched, so it works on any launch
 * (profile, source checkout, `--config` overlay). `/update` reuses this
 * handoff for its own restart tail (`kind: 'update'`): the keyboard-race
 * hardening below is exactly the failure its users reported (issue #483:
 * update restarts into a TUI that takes no input).
 *
 * The TUI must already be unmounted before this is called (same terminal
 * handoff contract as `updateTuiAndRestart`): the caller runs this from the
 * exit funnel's done callback, after finishExit detached the terminal and
 * the readable stdin pump.
 *
 * This waits for the replacement's natural exit: the outer command
 * interpreter that ran `dsh-tui` reclaims the console the moment the
 * launch chain (cmd → wrapper → this process) unwinds, and an orphaned
 * replacement still attached to the console then fights the interpreter's
 * own prompt and line reader for every keypress (field evidence
 * 2026-08-24: healthy child mounted the UI, the old process exited on a
 * 4s survival timer, the interpreter printed its prompt over the TUI and
 * the DA response bytes landed on the prompt line). Waiting is safe
 * because finishExit already paused and unref'd this process's stdin —
 * the child is the console's only key reader (issues #284/#307).
 *
 * The 4s survival window remains a DIAGNOSIS marker only: a replacement
 * that dies within it never painted the TUI, and its captured stderr is
 * reported synchronously (a raw inherit write can vanish mid-handoff). A
 * late exit is quiet — by then the user owned a working TUI session.
 *
 * @param sessionId - Session to resume in the replacement process; empty
 *   starts fresh. Ignored when `options.backend` switches kernels.
 * @param options - `kind: 'update'` drops the /restart boot-diagnosis
 *   marker and tags restart.log events for the update flow; `env` adds
 *   marker variables for the replacement (e.g. DSH_TUI_UPDATED_FROM);
 *   `backend` switches the replacement onto that kernel.
 * @returns 0 when the replacement ran and exited cleanly, 127 when it
 *   failed to start, otherwise the child's own exit code.
 */
export interface TuiRestartOptions {
    /** Extra env markers for the replacement process (/update's stamp). */
    env?: Record<string, string>;
    /**
     * 'update' reuses this handoff after an install: no
     * DSH_TUI_RESTART_CHILD marker (that flag is /restart-only boot
     * diagnostics) and restart.log events carry the update-restart tag.
     */
    kind?: 'restart' | 'update';
    /**
     * A kernel switch from the launchpad selector. restart.log events use the
     * backend-switch tag; the replacement gets DSH_TUI_BACKEND and the one-shot
     * KERNEL_SWITCH_HANDOFF_ENV set to the chosen kernel (the latter beats a
     * Config row that pins the other one), and no DSH_TUI_RESUME_SESSION: the
     * new kernel starts a new session.
     */
    backend?: KernelBackendId;
    /**
     * The chosen kernel's display name (its manifest's short label), resolved by
     * the caller from the registry entry: THIS module prints it and has no registry
     * of its own (`bin/dsh-tui.js` shares that constraint). Absent → the raw id,
     * which is what an unregistered/uninstalled backend would show anyway.
     */
    backendName?: string;
    /**
     * 'alt' (fullscreen kernel switch only): this process keeps the alternate
     * screen open through the spawn, the replacement adopts it without a
     * second 1049h, and its first flushed frame (ACKed on fd 3) hands the
     * screen over; see src/handoffAck.ts. /restart, /update and inline
     * sessions go back to the main screen before the spawn as before.
     */
    handoffScreen?: 'alt';
    /**
     * The kernel this process runs. A plain /restart or /update passes it in
     * the one-shot KERNEL_SWITCH_HANDOFF_ENV so the replacement reopens the
     * session on the same kernel even when a Config row names the other one
     * (as it does after a kernel switch). Ignored when `backend` is set.
     */
    kernel?: KernelBackendId;
    /** The replacement was spawned (the standalone entry forwards SIGTERM to it). */
    onSpawn?: (child: {
        kill(signal: NodeJS.Signals): boolean;
    }) => void;
    /**
     * The replacement ended by a signal: called before any outcome notice, so a
     * standalone-entry supervisor can end by the same signal. Returning normally
     * continues with the usual outcome handling.
     */
    onTerminationSignal?: (signal: NodeJS.Signals) => void;
}
/**
 * The replacement's env, pure: the resume marker, the /restart child stamp,
 * the caller's extra markers and the kernel-switch overrides. Exported for
 * scripts/verify-launchpad, which feeds it through the boot resolver.
 */
export declare function restartChildEnv(parentEnv: NodeJS.ProcessEnv, sessionId: string, kind: 'restart' | 'update', options: TuiRestartOptions): NodeJS.ProcessEnv;
/**
 * The replacement's argv after `process.execPath`, pure: the same script and
 * arguments again, except that a replacement started outside the entry goes
 * to `hostEntry` with the app arguments (the entry hosts every kernel).
 */
export declare function restartArgv(input: {
    readonly execArgv: readonly string[];
    readonly argv: readonly string[];
    /** Whether this is a kernel switch (resume flags are dropped). */
    readonly switching: boolean;
    /** The replacement opens a fresh session (no session id to hand over, e.g.
     *  after /new): inherited resume flags name the previous one and are dropped. */
    readonly fresh?: boolean;
    readonly hostEntry: string | undefined;
}): string[];
export declare function restartTui(sessionId: string, options?: TuiRestartOptions): Promise<number>;
//# sourceMappingURL=update.d.ts.map
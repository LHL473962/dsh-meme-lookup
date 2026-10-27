/**
 * Loads the installed dsh's modules and builds the entry's single Cordis root.
 * Host modules come from the `dsh` on PATH by realpath, imported by file URL;
 * `@deepseek-ai/*` is `import type` here only (contract: ./host-contract.ts).
 * Never writes to stdout: before the mount host warnings go to stderr, the
 * composition takes the caller's sink.
 */
import { randomUUID } from 'node:crypto';
import { existsSync, readFileSync, realpathSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { basename, delimiter, dirname, join, posix, win32 } from 'node:path';
import { pathToFileURL } from 'node:url';
import { inspect } from 'node:util';
import { HOST_MODULES, HOST_PACKAGE } from './host-contract.js';
import { LITE_PROFILE_EXCLUDED_BUNDLES, liteProfilePlan } from './lite-profile.js';
import { PROCESS_SHUTDOWN_TIMEOUT_MS } from './process-exit.js';
/** The diagnostic prefix the host's own boot uses. */
const BIN_NAME = 'dsh';
/** Cordis fiber state "active" (dsh-app-boot FIBER_ACTIVE). */
const FIBER_ACTIVE = 2;
const APP_BOOT = HOST_MODULES.find(spec => spec.key === 'appBoot').specifier;
/** `findHostDsh`'s reason when PATH has no `dsh` at all. */
export const NO_DSH_ON_PATH = 'no dsh on PATH';
/**
 * Find the installed host package from the first `dsh` on PATH, following
 * what a launch would run: a link (npm on Unix) by its realpath, an npm /
 * pnpm / yarn launcher script (sh, `.cmd`, `.ps1`) by the script path it
 * starts, a volta shim through volta's package image. A launcher that
 * cannot be followed is no host: the reason says what was found.
 */
export function findHostDsh(env = process.env, platform = process.platform) {
    const names = platform === 'win32' ? ['dsh.cmd', 'dsh.ps1', 'dsh'] : ['dsh'];
    for (const dir of (env.PATH ?? env.Path ?? '').split(delimiter)) {
        if (dir === '')
            continue;
        for (const name of names) {
            const candidate = join(dir, name);
            if (!existsSync(candidate))
                continue;
            // npm's Windows shims sit beside the global node_modules.
            if (platform === 'win32') {
                const beside = join(dir, 'node_modules', '@deepseek-ai', 'dsh');
                if (isHostPackage(beside))
                    return { packageDir: beside, via: 'beside' };
            }
            // The first `dsh` on PATH is the one a launch would run: it is the host
            // or there is none.
            let real;
            try {
                real = realpathSync(candidate);
            }
            catch (error) {
                return { reason: `${candidate} cannot be resolved (${error instanceof Error ? error.message : String(error)})` };
            }
            const linked = hostPackageAbove(real);
            if (linked !== undefined)
                return { packageDir: linked, via: 'link' };
            return followLauncher(candidate, real, env, platform);
        }
    }
    return { reason: NO_DSH_ON_PATH };
}
function hostPackageAbove(path) {
    for (let up = dirname(path);; up = dirname(up)) {
        if (isHostPackage(up))
            return up;
        if (dirname(up) === up)
            return undefined;
    }
}
/** The largest launcher script read (npm / pnpm shims are well under 2 KiB). */
const LAUNCHER_SCRIPT_MAX = 64 * 1024;
/**
 * A `dsh` that is not a link into the package: a launcher script (read the
 * script path it starts) or a volta shim (volta's package image).
 */
function followLauncher(candidate, real, env, platform) {
    if (/^volta-shim(?:\.exe)?$/iu.test(basename(real))) {
        const volta = env.VOLTA_HOME ?? join(env.HOME ?? env.USERPROFILE ?? '', '.volta');
        const image = join(volta, 'tools', 'image', 'packages', '@deepseek-ai', 'dsh');
        for (const packageDir of [join(image, 'lib', 'node_modules', '@deepseek-ai', 'dsh'), join(image, 'node_modules', '@deepseek-ai', 'dsh')]) {
            if (isHostPackage(packageDir))
                return { packageDir, via: 'volta' };
        }
        return { reason: `${candidate} is a volta shim and volta's image has no @deepseek-ai/dsh under ${image}` };
    }
    let text;
    try {
        const content = readFileSync(real);
        if (content.length > LAUNCHER_SCRIPT_MAX || content.subarray(0, 4096).includes(0)) {
            return { reason: `${candidate} is neither a link into @deepseek-ai/dsh nor a launcher script` };
        }
        text = content.toString('utf8');
    }
    catch (error) {
        return { reason: `${candidate} cannot be read (${error instanceof Error ? error.message : String(error)})` };
    }
    const base = dirname(real);
    for (const script of launcherScriptPaths(text)) {
        const path = resolveLauncherPath(script, base, platform);
        if (path === undefined || !existsSync(path))
            continue;
        let target;
        try {
            target = realpathSync(path);
        }
        catch {
            continue;
        }
        const packageDir = hostPackageAbove(target);
        if (packageDir !== undefined)
            return { packageDir, via: 'shim' };
    }
    return { reason: `${candidate} is a launcher script that starts no @deepseek-ai/dsh script found on disk` };
}
/**
 * The script paths a launcher starts: quoted or bare tokens ending in
 * `.js` / `.mjs` / `.cjs` (npm and pnpm cmd-shim, `.cmd` and `.ps1` shims,
 * a hand-written `exec node …/bin.js` wrapper).
 */
export function launcherScriptPaths(text) {
    const found = [];
    const token = /"([^"\r\n]+?\.[cm]?js)"|'([^'\r\n]+?\.[cm]?js)'|((?:[^\s"'`;|&<>()]+?)\.[cm]?js)(?=[\s"';|&)]|$)/gmu;
    for (const match of text.matchAll(token)) {
        const path = match[1] ?? match[2] ?? match[3];
        if (path !== undefined && !found.includes(path))
            found.push(path);
    }
    return found;
}
/** Expand a launcher's own-directory variables and resolve with `platform`'s path rules. */
export function resolveLauncherPath(script, base, platform) {
    let path = script
        .replace(/^\$\{?basedir\}?/u, base)
        .replace(/^\$\(dirname\s+"?\$0"?\)/u, base)
        .replace(/^%~dp0%?/iu, base + '\\')
        .replace(/^%dp0%/iu, base)
        .replace(/^\$PSScriptRoot/iu, base);
    // Anything else still holding a variable is not a path this can follow.
    if (/[$%]/u.test(path))
        return undefined;
    if (platform !== 'win32')
        path = path.replaceAll('\\', '/');
    return (platform === 'win32' ? win32 : posix).resolve(base, path);
}
function isHostPackage(dir) {
    try {
        const manifest = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));
        return typeof manifest === 'object' && manifest !== null && manifest.name === HOST_PACKAGE;
    }
    catch {
        return false;
    }
}
/**
 * The capability probe: throws naming what is missing (no host, a module that
 * does not import, an export the entry needs); the caller falls back.
 */
export async function loadHostDsh(packageDir = undefined) {
    if (packageDir === undefined) {
        const found = findHostDsh();
        if (!('packageDir' in found))
            throw new Error(found.reason);
        packageDir = found.packageDir;
    }
    let version = 'unknown';
    try {
        const manifest = JSON.parse(readFileSync(join(packageDir, 'package.json'), 'utf8'));
        if (typeof manifest.version === 'string')
            version = manifest.version;
    }
    catch {
    }
    const hostRequire = createRequire(join(packageDir, 'package.json'));
    const importFrom = async (require, specifier) => {
        try {
            return await import(pathToFileURL(require.resolve(specifier)).href);
        }
        catch (error) {
            throw new Error(`dsh ${version} at ${packageDir}: ${specifier} does not load (${error instanceof Error ? error.message.split('\n')[0] : String(error)})`, { cause: error });
        }
    };
    // The Loader and the home paths are app-boot's own dependencies (the
    // Loader's builtins must be the instance app-boot mounts includes with).
    let appBootRequire;
    try {
        appBootRequire = createRequire(hostRequire.resolve(APP_BOOT));
    }
    catch (error) {
        throw new Error(`dsh ${version} at ${packageDir}: ${APP_BOOT} does not resolve (${error instanceof Error ? error.message.split('\n')[0] : String(error)})`, { cause: error });
    }
    const loaded = await Promise.all(HOST_MODULES.map(spec => importFrom(spec.via === 'app-boot' ? appBootRequire : hostRequire, spec.specifier)));
    const modules = new Map(HOST_MODULES.map((spec, index) => [spec.key, loaded[index]]));
    for (const spec of HOST_MODULES) {
        const module = modules.get(spec.key);
        for (const name of spec.exports) {
            if (module?.[name] === undefined)
                throw new Error(`dsh ${version} at ${packageDir} lacks ${spec.specifier.replace(/^@deepseek-ai\//u, '')}.${name}`);
        }
    }
    const module = (key) => modules.get(key);
    return {
        packageDir,
        version,
        Context: module('cordis').Context,
        appBoot: module('appBoot'),
        Loader: module('loader').default,
        homePaths: module('homePaths'),
        launchEnvironmentKey: module('launchEnvironment').DSH_LAUNCH_ENVIRONMENT_KEY,
        cmdline: module('cmdline'),
        profileBoot: module('profileBoot'),
        httpProxy: module('httpProxy'),
    };
}
/**
 * Build the entry's root from the host's `cordis` and install the host's
 * module resolution on it before any TUI module is imported, so the TUI and
 * the DSH plugins resolve shared packages (react, schemastery, the
 * `@deepseek-ai/*` peers) the same way. Both kernels: otherwise the peers
 * resolve only through `$DSH_HOME/profiles/node_modules`, which a fresh
 * install may not have. The DSH kernel also gets the rest of `runProfile`'s prepare.
 */
export async function prepareHostRoot(host, options) {
    const { appBoot, profileBoot } = host;
    // bin.js: the `.env` layers fill unset variables before anything reads them
    // (the dsh-tui row's `!!js process.env.DSH_TUI_*` included).
    const environment = appBoot.loadLayeredEnv(BIN_NAME);
    // 1–2. composeProfile (no `--patch` overlays from the launcher).
    const profile = profileBoot.prepareProfile(options.profile, true, undefined);
    const resolution = await appBoot.createRuntimeResolution({ installAnchor: profileBoot.INSTALL_ANCHOR, profile });
    const rootConfig = join(profile.dir, profileBoot.PROFILE_ROOT_FILENAME);
    // Build the neutral Loader root first: discovery needs its resolver before
    // the final kernel can decide whether DSH-only preparation is appropriate.
    const ctx = new host.Context();
    ctx.baseUrl = pathToFileURL(dirname(rootConfig)).href + '/';
    ctx.provide('dshHomePath', host.homePaths.dshHomePath);
    ctx.on('internal/update', ((_config, _noSave, next) => {
        Promise.resolve(next()).catch((error) => { ctx.logger.error(error); });
    }), { global: true, prepend: true });
    await ctx.plugin(host.Loader, undefined);
    const shutdown = createProcessShutdown(() => ctx.fiber.dispose());
    const appReady = createAppReady();
    let uninstallFailLoud = () => undefined;
    // `startedBundles` names what is really composed.
    const profileContextFor = (startedBundles) => ({
        name: options.profile,
        dir: profile.dir,
        patchPath: profile.patchPath,
        installAnchor: profileBoot.INSTALL_ANCHOR,
        startedBundles: [...startedBundles],
        cwd: process.cwd(),
        home: host.homePaths.resolveDshHome(),
        overlays: [],
        telemetryDisabledEnv: process.env.DSH_TELEMETRY_DISABLED,
    });
    let profileContext;
    let kernelSelected = false;
    try {
        // 6. The resolution hijack (both kernels), before any TUI module loads.
        await ctx.plugin(appBoot.PluginPackages, { resolution });
    }
    catch (error) {
        // The caller falls back to another launch path in this same process:
        // leave nothing of this root behind (runProfile disposes on failure too).
        await ctx.fiber.dispose().catch(() => undefined);
        throw error;
    }
    const selectKernel = async (dsh) => {
        if (kernelSelected)
            throw new Error('dsh-tui: the host kernel was already selected');
        // A light profile needs none of runProfile's DSH-only services. The entry
        // uses the same final answer for its slot and for this composition mode.
        try {
            if (dsh) {
                const disposeProxy = await host.httpProxy.installProxyFromEnvironment(environment, message => { process.stderr.write(`${BIN_NAME}: ${message}\n`); });
                if (disposeProxy !== undefined)
                    ctx.effect(() => () => { void Promise.resolve(disposeProxy()).catch(() => undefined); }, 'dsh-tui host proxy');
                // 5. runProfile: fail-loud (removable here, unlike runProfile's).
                uninstallFailLoud = appBoot.installFailLoud(BIN_NAME, process, async () => { await ctx.fiber.dispose(); });
                profileContext = profileContextFor(profile.layers.map(layer => layer.packageName));
                ctx.provide('profileContext', profileContext);
                ctx.provide(host.launchEnvironmentKey, environment);
                // 7. App arguments and the exit / readiness seams.
                host.cmdline.provideCmdline(ctx, {
                    args: options.args,
                    exit: code => {
                        const answer = options.exitSeam?.request?.({ kind: 'code', code }) ?? 'refused';
                        if (answer === 'refused')
                            void shutdown(code);
                    },
                    ready: appReady.service,
                });
            }
            kernelSelected = true;
        }
        catch (error) {
            uninstallFailLoud();
            await ctx.fiber.dispose().catch(() => undefined);
            throw error;
        }
    };
    const mountAndAudit = async (patches, warn, stopping) => {
        // boot(): warnings and errors logged while the tree starts, for the startup report.
        const startupLogs = [];
        const diagnostics = new host.Context();
        diagnostics.logger = ctx.logger;
        diagnostics.logger.exporter({
            levels: { default: 2 },
            export: ({ ts, name, type, args }) => {
                if (type === 'warn' || type === 'error')
                    startupLogs.push({ ts, name, type, args });
            },
        });
        try {
            await appBoot.mountRootInclude(ctx, rootConfig, patches, undefined, BIN_NAME);
            const loader = () => ctx.get('loader');
            await loader()?.await();
            // Disposed or about to be: no audit, and no readiness (HMR would start
            // its profile refresh on a dying tree).
            if (loader() === undefined || stopping())
                return;
            await appBoot.auditStartupEntries(ctx, BIN_NAME, warn);
            if (ctx.fiber.state === FIBER_ACTIVE && loader() !== undefined && !stopping())
                appReady.commit();
        }
        catch (error) {
            // Unlike bin.js, a report is saved for every failure (the screen
            // stays up and shows its path).
            if (error instanceof appBoot.StartupError) {
                Object.defineProperty(error, 'startup', { value: { configurationPath: rootConfig, messages: startupLogs }, enumerable: false, configurable: true, writable: true });
            }
            const logPath = await writeStartupReport(error, {
                home: host.homePaths.resolveDshHome(),
                version: hostVersion(host),
                profile: options.profile,
                ...(error instanceof appBoot.StartupError ? {} : { configurationPath: rootConfig, messages: startupLogs }),
            });
            throw new HostComposeError(error, logPath);
        }
        finally {
            await diagnostics.fiber.dispose().catch(() => undefined);
        }
    };
    return {
        ctx,
        selectKernel,
        uninstallFailLoud: () => { uninstallFailLoud(); },
        kernelVersion: hostVersion(host),
        async compose(warn, stopping = () => false) {
            if (!kernelSelected)
                throw new Error('dsh-tui: select the host kernel before composing its profile');
            if (profileContext !== undefined) {
                await mountAndAudit(appBoot.readProfilePatches(BIN_NAME, profileContext, profile), warn, stopping);
                return;
            }
            const plan = liteProfilePlan(profile);
            if (!plan.trimmed) {
                // Nothing to trim: composing the layers is the full composition, and
                // not fatal (the screen is mounted; failing would cost every plugin).
                warn(`dsh-tui: light profile: ${options.profile} lists none of ${LITE_PROFILE_EXCLUDED_BUNDLES.join(', ')}; composing it whole but the dsh-tui row\n`);
            }
            else {
                warn(`dsh-tui: light profile: ${plan.excluded.join(', ')} left out of ${profile.layers.length} bundles; disabled ${plan.disableRows.map(row => row.id).join(', ')} (their injected services come from the excluded bundles)\n`);
            }
            // The trimmed layers' patches, then the disable rows applied last (a
            // static disable in cordis.patch.yml would also hit the DSH kernel).
            const patches = appBoot.readProfilePatches(BIN_NAME, profileContextFor(plan.layers.map(layer => layer.packageName)), { ...profile, layers: [...plan.layers] });
            patches.push(...plan.disableRows);
            await mountAndAudit(patches, warn, stopping);
        },
    };
}
/** A composition failure, with the startup report saved for it. */
export class HostComposeError extends Error {
    original;
    logPath;
    constructor(original, logPath) {
        super(original instanceof Error ? original.message : String(original), { cause: original });
        this.original = original;
        this.name = 'HostComposeError';
        this.logPath = logPath;
    }
}
function hostVersion(host) {
    try {
        return host.appBoot.getDshRuntimeVersion();
    }
    catch {
        return host.version;
    }
}
/**
 * dsh `bin.js` reportStartupFailure (0.2.1-rc.3), the file half only: the
 * screen is up, so never stderr. Undefined when it could not be written.
 */
async function writeStartupReport(error, context) {
    const now = new Date().toISOString();
    const report = 'WARNING: Raw diagnostics may contain configuration or credential values from plugin errors. Review before sharing.\n\n' + inspect({
        timestamp: now,
        dshVersion: context.version,
        nodeVersion: process.version,
        platform: process.platform,
        arch: process.arch,
        profile: context.profile,
        ...(context.configurationPath === undefined ? {} : { startup: { configurationPath: context.configurationPath, messages: context.messages ?? [] } }),
        error,
    }, {
        depth: null,
        maxArrayLength: null,
        maxStringLength: null,
        showHidden: true,
        customInspect: false,
        getters: false,
        colors: false,
    }) + '\n';
    const logDir = join(context.home, 'logs');
    const logPath = join(logDir, `startup-${now.replaceAll(':', '-')}-${randomUUID()}.log`);
    try {
        await mkdir(logDir, { recursive: true, mode: 0o700 });
        await writeFile(logPath, report, { flag: 'wx', mode: 0o600 });
    }
    catch {
        return undefined;
    }
    return logPath;
}
/** dsh `profile-boot` createAppReady (0.2.1-rc.3). */
function createAppReady() {
    let ready = false;
    const listeners = new Set();
    return {
        service: {
            onReady(listener) {
                if (ready) {
                    listener();
                    return () => undefined;
                }
                listeners.add(listener);
                return () => { listeners.delete(listener); };
            },
        },
        commit() {
            if (ready)
                return;
            ready = true;
            for (const listener of [...listeners])
                listener();
            listeners.clear();
        },
    };
}
/** dsh `process-shutdown` createProcessShutdown (0.2.1-rc.3), the `shutdown` half only. */
function createProcessShutdown(dispose, timeoutMs = PROCESS_SHUTDOWN_TIMEOUT_MS) {
    let pending;
    let settled = false;
    return code => {
        if (pending !== undefined)
            return pending;
        const timer = setTimeout(() => {
            if (settled)
                return;
            settled = true;
            process.exit(code);
        }, timeoutMs);
        pending = Promise.resolve().then(dispose).then(() => {
            if (settled)
                return;
            settled = true;
            clearTimeout(timer);
            process.exitCode = code;
        }, () => {
            if (settled)
                return;
            settled = true;
            clearTimeout(timer);
            process.exit(code);
        });
        return pending;
    };
}

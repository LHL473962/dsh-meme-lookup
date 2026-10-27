/**
 * The host contract of this package's entry (ADAPTER.md): what the entry
 * loads from the installed `dsh` and what it reproduces. Read by
 * ./host-dsh.ts, ./contract.ts and scripts/verify-host-contract.ts.
 * Pure data, no imports.
 */
/** The host CLI package whose installation the entry loads. */
export declare const HOST_PACKAGE = "@deepseek-ai/dsh";
/** The host line the reproduced pieces were checked against (host-replica.snapshot.json). */
export declare const HOST_REPLICA_VERSION = "0.2.1-rc.3";
/** Where the entry resolves a host module from. */
export type HostModuleVia = 
/** The host package's own `createRequire` (its nested node_modules). */
'host'
/** `@deepseek-ai/dsh-app-boot`'s `createRequire`: the instance app-boot itself uses. */
 | 'app-boot';
export interface HostModuleSpec {
    /** The `HostDsh` field it fills. */
    readonly key: string;
    readonly specifier: string;
    readonly via: HostModuleVia;
    /** Every export the entry reads; the probe requires each to be defined. */
    readonly exports: readonly string[];
}
/** The host modules the entry loads, all from one installation, in load order. */
export declare const HOST_MODULES: readonly [{
    readonly key: "cordis";
    readonly specifier: "@deepseek-ai/cordis";
    readonly via: "host";
    readonly exports: readonly ["Context"];
}, {
    readonly key: "appBoot";
    readonly specifier: "@deepseek-ai/dsh-app-boot";
    readonly via: "host";
    readonly exports: readonly ["loadLayeredEnv", "createRuntimeResolution", "PluginPackages", "installFailLoud", "readProfilePatches", "mountRootInclude", "auditStartupEntries", "StartupError", "getDshRuntimeVersion"];
}, {
    readonly key: "loader";
    readonly specifier: "@deepseek-ai/cordis-plugin-loader";
    readonly via: "app-boot";
    readonly exports: readonly ["default"];
}, {
    readonly key: "homePaths";
    readonly specifier: "@deepseek-ai/dsh-home-paths";
    readonly via: "app-boot";
    readonly exports: readonly ["dshHomePath", "resolveDshHome"];
}, {
    readonly key: "launchEnvironment";
    readonly specifier: "@deepseek-ai/dsh-launch-environment";
    readonly via: "host";
    readonly exports: readonly ["DSH_LAUNCH_ENVIRONMENT_KEY"];
}, {
    readonly key: "cmdline";
    readonly specifier: "@deepseek-ai/dsh-cmdline";
    readonly via: "host";
    readonly exports: readonly ["provideCmdline"];
}, {
    readonly key: "profileBoot";
    readonly specifier: "@deepseek-ai/dsh/profile-boot";
    readonly via: "host";
    readonly exports: readonly ["prepareProfile", "INSTALL_ANCHOR", "PROFILE_ROOT_FILENAME"];
}, {
    readonly key: "httpProxy";
    readonly specifier: "@deepseek-ai/dsh-http-proxy";
    readonly via: "host";
    readonly exports: readonly ["installProxyFromEnvironment"];
}];
/**
 * The packages ./host-dsh.ts takes types from (`import type` only); each is
 * an optional peer + dev dependency and blessed. Not the host package itself
 * (its dependency tree is the whole CLI).
 */
export declare const HOST_TYPE_PACKAGES: readonly ["@deepseek-ai/dsh-app-boot", "@deepseek-ai/dsh-cmdline", "@deepseek-ai/dsh-home-paths", "@deepseek-ai/dsh-http-proxy", "@deepseek-ai/dsh-launch-environment"];
/**
 * The packages the adapter takes types from for host services it reaches
 * through `ctx` rather than through the entry's host boot; each is an
 * optional peer + dev dependency and blessed. Unlike {@link HOST_TYPE_PACKAGES}
 * these are read by the running profile's own composition, and the host CLI
 * supplies the package (a profile has no copy) — so absence at run time is
 * valid and the consumer degrades instead of failing.
 */
export declare const ADAPTER_TYPE_PACKAGES: readonly ["@deepseek-ai/dsh-plugin-manager"];
/** One upstream body the entry reproduces (fingerprinted by verify:contract). */
export interface HostReplica {
    readonly id: string;
    /** The package holding the upstream body; its `lib/*.js` are searched. */
    readonly package: string;
    /** A top-level `function` (sync or async) or `const` in that package's lib. */
    readonly symbol: string;
    readonly kind: 'function' | 'const';
    /** What in ./host-dsh.ts reproduces it, and how far. */
    readonly local: string;
}
/**
 * The reproduced upstream pieces. A changed fingerprint means: re-read the
 * upstream body against `local`, carry the change over, regenerate the snapshot.
 */
export declare const HOST_REPLICAS: readonly HostReplica[];
/** Where the entry deliberately differs from `dsh --profile`. Documentation only; ADAPTER.md points here. */
export declare const HOST_DEVIATIONS: readonly {
    readonly id: string;
    readonly what: string;
}[];
//# sourceMappingURL=host-contract.d.ts.map
/**
 * Host-only live-probe access.
 *
 * The reversible live probes used by the Kernel's driver are deliberately not
 * methods on the plugin-visible Cordis services. A plugin can obtain
 * `ctx.tuiPluginStorage`, `ctx.tuiMessageObserver` or `ctx.tuiPluginHost` and
 * call ordinary public methods, but it cannot discover a `probeReversible`
 * method from the normal package export surface.
 *
 * IMPORTANT trust boundary:
 *
 * This module is NOT a security boundary. dsh-TUI's plugin model is
 * trusted-in-process; any code running in the same process can locate the
 * package root through `package.json` and absolutely import the compiled
 * internal file (for example `lib/adapter/kernel/host-probe-access.js`).
 * The package `exports` map blocks ordinary deep imports, but it cannot stop
 * same-process absolute-path loading. The host-only token and registration
 * functions therefore exist to prevent accidental public-API pollution and
 * obvious misuse, not to defend against a malicious in-process plugin.
 *
 * Hardening choices:
 * - `HOST_PROBE_TOKEN` is a module-local symbol and is NOT exported from this
 *   module or from any package public entry.
 * - The registration functions refuse to replace an existing host runner on a
 *   concrete service, so an in-process caller cannot overwrite the real probe
 *   with a fake one after the host has bootstrapped.
 * - The run functions accept an optional token only for backwards-compatible
 *   calling conventions; when no token is supplied they still execute the
 *   registered host runner. They are internal module functions, not package
 *   public API.
 */
export interface CommandLiveProbeResult {
    readonly ok: true;
    readonly name: string;
    readonly lifecycleAppends: number;
}
export interface StorageLiveProbeResult {
    readonly service: 'tuiPluginStorage';
    readonly ok: true;
    readonly operations: readonly string[];
    readonly tempNamespace: string;
}
export interface MessageLiveProbeResult {
    readonly service: 'tuiMessageObserver';
    readonly ok: true;
    readonly before: number;
    readonly during: number;
    readonly after: number;
    readonly delivered: number;
}
type CommandRunner = (token?: unknown) => Promise<CommandLiveProbeResult>;
type StorageRunner = (token?: unknown) => Promise<StorageLiveProbeResult>;
type MessageRunner = (token?: unknown) => Promise<MessageLiveProbeResult>;
/**
 * Register a live-probe runner for a concrete host service.
 *
 * If a runner is already registered for the same unwrapped service, the call
 * is a no-op: the host bootstrap owns the WeakMap slot and an in-process
 * caller must not be able to replace a real probe with a forged runner.
 */
export declare function registerCommandLiveProbe(service: object, runner: CommandRunner): void;
export declare function registerStorageLiveProbe(service: object, runner: StorageRunner): void;
export declare function registerMessageLiveProbe(service: object, runner: MessageRunner): void;
export declare function hasCommandLiveProbe(service: unknown): boolean;
export declare function hasStorageLiveProbe(service: unknown): boolean;
export declare function hasMessageLiveProbe(service: unknown): boolean;
export declare function runCommandLiveProbe(service: unknown, token?: unknown): Promise<CommandLiveProbeResult>;
export declare function runStorageLiveProbe(service: unknown, token?: unknown): Promise<StorageLiveProbeResult>;
export declare function runMessageLiveProbe(service: unknown, token?: unknown): Promise<MessageLiveProbeResult>;
export {};
//# sourceMappingURL=host-probe-access.d.ts.map
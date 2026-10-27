import type { Agent } from '@deepseek-ai/dsh-agent';
import type { Context } from '@deepseek-ai/cordis';
import { Config } from './index.js';
import { type RuntimeConfig } from './compat/settings.js';
import { type CrashDetail } from '../utils/crashDetail.js';
import { type PluginManagerView } from './plugin-manager.js';
import { createTerminalNotifier, type NotificationMethod, type TaskNotifications } from '../ink/terminal-notification.js';
import type { WindowsToastInput, WindowsToastResult } from '../ink/terminal-notification-windows.js';
import { initialPromptFromCmdlineArgs } from './startup-args.js';
import { type KernelBackendId } from '../kernelPrefs.js';
import { render } from '../ui.js';
import { type ShutdownInput } from '../ink/shutdown-input.js';
import type { EntrySlot } from './entry-slot.js';
import { type ProcessExitSeam } from './process-exit.js';
export { initialPromptFromCmdlineArgs };
/**
 * Extract the startup prompt from raw app argv, excluding session selectors
 * and Web startup flag values. `--trusted-host` consumes multiple authorities
 * up to the next flag; none of them are prompt text (issue #882). An app-level
 * `--` ends flag parsing; all following tokens are literal prompt text.
 */
/**
 * 落地页 / 首启引导该不该在这次启动出现。
 *
 * 只看「用户有没有说要回到哪儿」：`--resume` 目标与首句都算他知道自己要去哪。
 * **工作区目标不算**——`dst` 默认把 cwd 当工作区目标喂进来，算进去就等于在本机
 * 最主流的启动方式下把这两个屏永久关掉（实测事故，见调用点的口径注释）。
 *
 * @param input.launchSessionId - 本次要恢复的会话（--resume / DSH_TUI_RESUME_SESSION）。
 * @param input.initialPrompt - 命令行里带的首句提示词（无则空串）。
 * @returns true 表示这次是「普通启动」。
 */
export declare function isLandingLaunch(input: {
    launchSessionId?: string;
    initialPrompt: string;
}): boolean;
/**
 * How this process should treat the TUI frontend, given the terminal it runs on.
 *
 * Three startup identities exist:
 *  1. `dsh-tui` / standalone — the user explicitly asked for the terminal UI;
 *  2. Web / Tauri / other GUI hosts — the profile merely has dsh-tui installed
 *     and the current process is NOT a dsh-tui frontend. stdout is a pipe or
 *     null there, and mounting a TUI would fail the whole composition.
 *
 * The official launcher (and the standalone runtime) mark explicit launches,
 * so an explicit `dsh-tui` run without a TTY keeps failing loudly, while
 * foreign hosts skip the plugin and let the host boot.
 */
export type TuiHostMode = 'interactive' | 'invalid-explicit-launch' | 'headless-host';
export declare function resolveTuiHostMode(stdoutIsTTY?: boolean, env?: NodeJS.ProcessEnv): TuiHostMode;
/** How a host other than the dsh-tui Config row starts the runtime. */
export interface RuntimeApplyOptions {
    /**
     * Mount before the non-DSH startup session opens and adopt it once open
     * (standalone entry only; the profile path's DSH fallback needs the open to
     * settle before the mount).
     */
    readonly deferBackendOpen?: boolean;
    /** The DSH profile for a host whose argv has no `--profile`: `/update` and the settings import use it. */
    readonly profile?: string;
    /**
     * The standalone entry composes after the mount. On the DSH kernel: mount on
     * a placeholder session; the profile's dsh-tui row later calls `attachDsh`.
     */
    readonly entrySlot?: EntrySlot;
    /** The entry's rebuilt Config lacks the patch's Config row: do not re-resolve the kernel. */
    readonly entryKernel?: KernelBackendId;
    /** Filled with this runtime's exit funnel once mounted, cleared on teardown. */
    readonly exitSeam?: ProcessExitSeam;
}
/** Where a Windows task-completion announcement delivers, and where it falls back to. */
export interface TaskCompletionDelivery {
    /** Live inventory from the running profile; installed packages alone do not own events. */
    pluginManager?: Pick<PluginManagerView, 'listPlugins'>;
    /** Live owner/settings permission for pending native dispatch and fallback. */
    canDispatch?: () => boolean;
    /** Hand the completion to the native toast transport (D8 keeps the dedup inside it). */
    toast(input: WindowsToastInput): Promise<WindowsToastResult>;
    /** The terminal bell, used when the native transport is unavailable. */
    terminal(title: string, message: string): void;
}
/** The two live task-notification settings both delivery paths read. */
export interface TaskNotificationSettings {
    /** When a completion is announced at all: `off` suppresses it entirely. */
    condition: TaskNotifications;
    /** How it is delivered: the native toast here, a terminal sequence or the bell there. */
    method: NotificationMethod;
}
/** The terminal notifier the host configures, as `createTerminalNotifier` returns it. */
export type TerminalNotifier = ReturnType<typeof createTerminalNotifier>;
/** The live task-notification settings and their one writer. */
export interface TaskNotificationSettingsHandle {
    /** The current values; the toast branch and the terminal fallback read these. */
    readonly settings: TaskNotificationSettings;
    /**
     * Adopt a new condition/method: the terminal notifier and the toast branch
     * both read these, so one writer keeps them in step.
     * @param condition - The new condition, or undefined for the default.
     * @param method - The new method, or undefined for the default.
     */
    configure(condition: TaskNotifications | undefined, method: NotificationMethod | undefined): void;
}
/**
 * Create the live task-notification settings around a notifier.
 *
 * The notifier holds the values for the terminal path, and the Windows branch
 * needs the same two before it can decide whether to spawn anything. One writer
 * keeps them in step - `applyDisplay` is the second caller, for a live /settings
 * edit.
 * @param notifier - The terminal notifier to configure.
 * @param initial - The values this launch starts with.
 * @returns The settings and the single function that changes them.
 */
export declare function createTaskNotificationSettings(notifier: TerminalNotifier, initial: TaskNotificationSettings): TaskNotificationSettingsHandle;
/**
 * Ring the terminal for a completion the host's gate already approved.
 *
 * The gate asks whether the terminal is focused; this port runs after the toast's
 * await, which is up to 30 s of PowerShell. Asking the focus question a second
 * time here would drop the bell for a user who came back to the terminal in that
 * window - while the log had already reported it rung (AC-5). The decision
 * travels in instead. `notify()` is synchronous, so the override covers exactly
 * this call.
 * @param notifier - The terminal notifier the host configured.
 * @param settings - The live settings the decision was taken from.
 * @param title - The localized title.
 * @param message - The single-line summary; empty rings for the title alone.
 */
export declare function ringTaskCompletion(notifier: TerminalNotifier, settings: TaskNotificationSettings, title: string, message: string): void;
/**
 * Show one task-completion toast and answer for what it did.
 *
 * Exactly one answer reaches the terminal path: `unavailable` rings the bell
 * (AC-5), because the alternative is a notification the user never learns
 * about. `shown` is already delivered and `yielded` belongs to the external
 * notifier (D8/AC-6) — ringing after either would remind the user twice.
 *
 * The transport is a parameter so the regression can drive all three answers
 * without a toast, a registry write or a child process.
 * @param title - The localized title.
 * @param message - The single-line summary; empty shows the title alone.
 * @param backendId - The session that completed; a DSH plugin only covers DSH events.
 * @param delivery - The toast port, and the terminal path to fall back to.
 */
export declare function deliverTaskCompletionOnWindows(title: string, message: string, backendId: string, delivery: TaskCompletionDelivery): Promise<void>;
export declare function apply(ctx: Context, runtimeConfig: RuntimeConfig<Config>, configOwner?: Context, runtimeOptions?: RuntimeApplyOptions): Promise<void>;
/**
 * Distinguish a user-driven exit from a cordis context teardown (issue #12).
 *
 * Both paths settle the Ink instance's exit promise, but only a user exit
 * (`/exit`, double Ctrl+C, render crash) may leave the process. A teardown —
 * the DSH launcher's boot-time recompose disposes every entry once — must
 * only unmount the UI: the recomposed tree re-runs `apply` and mounts a
 * fresh instance, so exiting here would kill the process mid-recompose
 * (the "flash back to bash with no error" symptom).
 *
 * `markTeardown` must run before the unmount that settles the exit promise
 * (the settle reaches `handleExit` through a microtask, so a same-tick flag
 * is always observed). Exported for scripts/verify-teardown-exit.tsx.
 */
export declare function createExitFunnel(deps: {
    onUserExit: (error?: unknown) => void;
}): {
    /**
     * Settle the exit once.
     * @returns true when this call ran the user-exit path (the funnel now owns
     *  the process), false when it was already settled or the tree is being
     *  torn down. A process-level crash backstop must fall back to Node's
     *  default crash on false instead of swallowing the error.
     */
    handleExit: (error?: unknown) => boolean;
    markTeardown: () => void;
};
/**
 * The exit funnel's crash tail, separate so scripts/verify-shutdown-fallback
 * can drive it with failing sinks:
 *
 *  - Diagnostics (serialization and every log sink) may fail: a throwing
 *    getter or Proxy trap on the error, or a sink that throws, falls back to
 *    unserializableCrashDetail and one more logging attempt. The funnel latch
 *    is already set here, so an exception escaping would skip the rest.
 *  - The resume markers (and the last-run record, via writeResumeMarkers)
 *    and the terminal cleanup (finish, then disposeRootAndExit(1)) always
 *    run, whatever happened to the diagnostics.
 */
export interface CrashExitDeps {
    /** The crash value itself (may be hostile: throwing getters, Proxy traps). */
    readonly error: unknown;
    /** Serializer override (verify fault injection); default serializeCrashDetail. */
    readonly serialize?: (error: unknown) => CrashDetail;
    /** One-line error log (ctx.logger.error). */
    readonly logError: (message: string) => void;
    /** crash.log append (appendCrashLog). */
    readonly appendLog: (detail: CrashDetail) => void;
    /** restart.log one-line event (logRestartEvent). */
    readonly logRestart: (event: string, data?: Record<string, unknown>) => void;
    /** Debug log (logForDebugging). */
    readonly logDebug: (message: string, data?: Record<string, unknown>) => void;
    /** Resume markers; best effort, isolated from the diagnostics' fate. */
    readonly writeResumeMarkers: () => void;
    /** MUST-RUN terminal cleanup + exit(1) handoff (finishExit + dispose). */
    readonly finish: (crashLine: string) => void;
}
export declare function runCrashExit(deps: CrashExitDeps): void;
/**
 * The crash tail's resume markers (exported for scripts/verify-shutdown-fallback).
 * Leaves the marker a clean exit would, never CLEARS one.
 */
export declare function writeCrashResumeMarkers(deps: {
    readonly ctx: Context;
    /** The non-DSH backend startup; undefined on the DSH kernel. */
    readonly backendStart: {
        persisted(sessionId: string, rows: readonly {
            readonly kind: string;
        }[]): boolean;
        readonly sessionPrefs: {
            setLastSession(sessionId: string): void;
        };
    } | undefined;
    readonly channel: {
        readonly agentId: string;
        readonly pending: readonly unknown[];
        readonly rows: readonly {
            readonly kind: string;
        }[];
    };
    readonly startupAgent: Agent | undefined;
    readonly writeResumeTarget: (sessionId: string) => void;
    readonly refreshLastRunRecord: () => void;
}): void;
/**
 * Whether a user exit should leave the resume marker (and print the resume
 * hint). Must be judged against the LIVE session behind the channel, not the
 * boot-time agent apply() captured: /resume, /new and /model swap the active
 * agent (channel.agentId follows, the old handle is disposed), so the
 * captured reference can point at a stale session — wiping a marker the
 * resume path just wrote (boot empty → /resume into history) or rewriting it
 * to a fresh empty session (boot with history → /new). `liveAgent` is the
 * registry lookup of channel.agentId; it falls back to the captured agent
 * when the lookup misses. Exported for scripts/verify-exit-resume-marker.
 */
export declare function isExitResumable(deps: {
    pendingCount: number;
    liveAgent: Agent | undefined;
    /** Undefined when the session runs on a non-DSH backend: its id is never
     *  a DSH resume target. */
    startupAgent: Agent | undefined;
}): boolean;
/**
 * Finish terminal I/O before handing control to a process-level exit action.
 * Exported for scripts/verify-shutdown-fallback.
 */
export declare function finishExit(ctx: Context, instance: Awaited<ReturnType<typeof render>> | undefined, fullscreen: boolean, notice: string | undefined, stderrNotice: string | undefined, done: () => void, options?: {
    keepAltScreen?: boolean;
    /** Explicit renderer lease for legacy wrappers that replace unmount(). */
    shutdownInput?: ShutdownInput;
}): Promise<void>;
/** Deferred runtime failures must restore the terminal and fail the process. */
export declare function handleStartupError(ctx: Context, error: unknown): void;
//# sourceMappingURL=plugin.d.ts.map
/**
 * The Windows toast transport (DESIGN D3/D4/D8/D10/D11/D12): the only place the
 * renderer talks to the Windows shell about task-completion notifications.
 *
 * It answers two questions, and a caller should not need anything else:
 *   - show one                                  {@link notifyWindowsToast}
 *   - yield when the caller confirms an active external notifier
 *
 * Every system side effect sits behind the win32 guard and behind the injected
 * ports, so a POSIX process that reaches this module anyway neither writes the
 * registry nor spawns anything (AC-7/D12). Reaching it is the unusual case:
 * nothing imports it at load time - the host loads it for the first toast - so a
 * POSIX process does not load it at all.
 *
 * Showing is in-box PowerShell 5.1 + WinRT, one process per notification (D3):
 * the ~3 s cold start of `powershell.exe` is the accepted cost of adding no
 * resident helper (R1). That process is started without a console of this one's
 * ({@link toastHostSpawnOptions}), because a PowerShell host renames the console
 * it runs on. Nothing here waits for the user either: `Show()` hands the
 * notification to the shell and the process exits.
 */
import type { SpawnOptions } from 'node:child_process';
import type { ExecFileNoThrowOptions, ExecFileNoThrowResult } from '../utils/execFileNoThrow.js';
/** The process runner the ports below drive, as `execFileNoThrow` provides it. */
type RunCommand = (file: string, args: readonly string[], options?: ExecFileNoThrowOptions) => Promise<ExecFileNoThrowResult>;
/** The AppUserModelID the toast is shown under (spike H, 2026-10-16). */
export declare const TOAST_AUMID = "dsh-tui";
/**
 * The AUMID key. Writing it is what makes the toast display at all: an
 * unregistered AUMID answers `Show()` in 15 ms without an error and shows
 * nothing (E2), which is why "registration succeeded" - not `Show()` - is the
 * success signal this module reports (D11).
 */
export declare const AUMID_REGISTRY_KEY = "HKCU\\Software\\Classes\\AppUserModelId\\dsh-tui";
/**
 * How the toast host is started: as a console application with no console.
 *
 * Showing a toast means running in-box `powershell.exe` (D3), and a PowerShell
 * host sets the console title as it starts. A child that inherits this process's
 * console therefore renames the session's tab - measured 2026-10-16, before and
 * after one toast: `✦ 🐋 [dsh-tui:42672]` became `Windows PowerShell` (UAT-M4).
 *
 * `windowsHide` is what keeps that console away: Windows starts the child with
 * CREATE_NO_WINDOW, so it has none of its own to retitle, while the pipes below
 * still carry its XML and its failure text. Both halves were measured on a real
 * machine (2026-10-16): the host runs - a write to disk and its stdout arrive,
 * exit 0, 2.1 s for the real toast body whose `Show()` did not throw - and the
 * console title is left alone, against the same measurement with today's options,
 * which clobbered it with `Windows PowerShell`.
 *
 * `detached: true` (DETACHED_PROCESS) was measured and rejected: the title
 * survived there too, but the host exited after ~0.4 s without running the script
 * at all - a silent no-op that would trade a dead click for a toast that never
 * appears. Do not swap one for the other without repeating that measurement.
 * @returns The spawn options the toast host is started with.
 */
export declare function toastHostSpawnOptions(): SpawnOptions;
/**
 * Escape the four characters that would otherwise end a text node (AC-8). A
 * summary is arbitrary model output, so nothing may reach the XML unescaped.
 * @param text Raw text from the renderer.
 * @returns The same text, safe inside an XML text node.
 */
export declare function escapeXmlText(text: string): string;
/** The parts of a task-completion toast. */
export interface ToastContent {
    /** First line; the renderer passes its localized title (AC-1). */
    title: string;
    /** Second line: the single-line summary. Omitted when empty, clipped by {@link clampSummary}. */
    message?: string;
}
/**
 * Build the ToastGeneric document (D10).
 * @param content Title and summary.
 * @returns The XML handed to `XmlDocument.LoadXml` on the PowerShell side.
 */
export declare function toastXml(content: ToastContent): string;
/** One HKCU value write; the default port shells out to in-box `reg.exe`. */
export interface RegistryPort {
    /**
     * @param key One of this module's own keys.
     * @param name Value name, or null for the key's default value.
     * @param value The string to store.
     * @returns Success, or the reason the write was refused. Never throws.
     */
    setValue(key: string, name: string | null, value: string): Promise<RegistryWriteResult>;
}
export type RegistryWriteResult = {
    ok: true;
} | {
    ok: false;
    detail: string;
};
/** Every port is injectable so the regression never writes the registry or spawns. */
export interface WindowsToastTransportOptions {
    /** Platform override for the regression; production is `process.platform`. */
    platform?: NodeJS.Platform;
    /** Environment for the `%WINDIR%` lookups; defaults to `process.env`. */
    env?: Record<string, string | undefined>;
    /** Registry port; defaults to in-box `reg.exe` on this module's own HKCU keys. */
    registry?: RegistryPort;
    /**
     * Where the toast's icon comes from; defaults to {@link shippedToastIcon},
     * which looks for the file the package ships. `undefined` registers no icon
     * at all rather than a path the shell cannot read.
     */
    iconPath?: () => string | undefined;
    /**
     * Process runner for `reg.exe`; defaults to `execFileNoThrow`. Not the toast
     * host's: that one must not inherit this console, so it has
     * {@link WindowsToastTransportOptions.runToastHost}.
     */
    run?: RunCommand;
    /**
     * Process runner for the toast host; defaults to the console-less spawn
     * ({@link toastHostSpawnOptions}). A port of its own because "which runner"
     * is exactly the difference between a session whose tab keeps its title and
     * one whose tab a PowerShell host renames (UAT-M4).
     */
    runToastHost?: RunCommand;
    /** Clock, so the log can report how long the toast spawn took (R1); defaults to `Date.now`. */
    now?: () => number;
    /** Log sink; defaults to `logForDebugging`. */
    log?: (message: string, fields?: Record<string, unknown>) => void;
}
export type WindowsToastFailure = 'not-win32'
/** No `%WINDIR%`, so neither in-box tool can be located. */
 | 'system-root-missing'
/** D11: the toast cannot display, so the caller has to ring the bell instead (AC-5). */
 | 'aumid-registration-failed'
/** The toast process failed; the caller rings the bell rather than going silent. */
 | 'toast-failed' | 'unexpected';
export type WindowsToastAvailability = {
    available: true;
} | {
    available: false;
    reason: 'yielded' | WindowsToastFailure;
    detail?: string;
};
export type WindowsToastResult = {
    status: 'shown';
}
/** An external notifier owns task completions: no toast and no bell (AC-6). */
 | {
    status: 'yielded';
}
/** The caller revoked this pending delivery: no toast and no bell. */
 | {
    status: 'suppressed';
}
/** Nothing was delivered: the caller falls back to the bell, never to silence. */
 | {
    status: 'unavailable';
    reason: WindowsToastFailure;
    detail?: string;
};
export interface WindowsToastInput {
    /** The localized title (AC-1). */
    title: string;
    /** Single-line summary; empty shows the title alone. */
    message?: string;
    /** The host confirmed an enabled, active DSH notifier in its live inventory. */
    externalNotifierActive?: boolean;
    /** Recheck live permission before dispatch, without repeating the focus gate. */
    canDispatch?: () => boolean;
}
/** The two overrides a caller may need before a notification exists. */
export interface WindowsToastAvailabilityQuery {
    /** Platform override for a regression; defaults to the transport's platform. */
    platform?: NodeJS.Platform;
    /** Active notifier ownership, supplied by the host rather than inferred from installed files. */
    externalNotifierActive?: boolean;
}
export interface WindowsToastTransport {
    /** Dedup, register, show. Never rejects: the caller treats this as fire-and-forget. */
    notify(input: WindowsToastInput): Promise<WindowsToastResult>;
}
/**
 * Create a transport with its own registration state. Production shares one
 * instance through {@link notifyWindowsToast}, because "the AUMID is registered"
 * is a per-process fact (D11).
 * @param options Ports and paths; every one of them has a production default.
 * @returns The transport.
 */
export declare function createWindowsToastTransport(options?: WindowsToastTransportOptions): WindowsToastTransport;
/**
 * Show one task-completion toast: stand down for an external notifier, register
 * once, then spawn the in-box host. Never rejects, and an unavailable transport
 * is reported so the caller can ring the bell instead (AC-5).
 * @param input Title, summary and the profile document for the dedup read.
 * @returns What happened, in terms the caller can act on.
 */
export declare function notifyWindowsToast(input: WindowsToastInput): Promise<WindowsToastResult>;
export {};
//# sourceMappingURL=terminal-notification-windows.d.ts.map
/**
 * Signals and exit in this package's entry go through the TUI's exit funnel
 * (./plugin.ts) when it is up, else the entry disposes the root, bounded. A
 * termination signal ends the process by that signal, not `runProfile`'s 0 /
 * 130 (the launcher reads non-zero as a crash, 0 hides it from `timeout`,
 * tmux and service managers); a second signal forces the exit at once.
 */
export type TerminationSignal = 'SIGTERM' | 'SIGHUP' | 'SIGINT';
export declare const TERMINATION_SIGNALS: readonly TerminationSignal[];
export type ExitRequest = {
    readonly kind: 'signal';
    readonly signal: TerminationSignal;
}
/** `ctx.appExit(code)` (dsh-cmdline): a plugin asked the app to exit. */
 | {
    readonly kind: 'code';
    readonly code: number;
};
/** The owner's answer. `exiting` / `pending` (already in flight) arm the backstop;
 *  `supervising` (a replacement that may run for hours) does not; `refused`
 *  makes the entry dispose the root itself. */
export type ExitRequestAnswer = 'exiting' | 'pending' | 'supervising' | 'refused';
export interface ProcessExitSeam {
    request?: (request: ExitRequest) => ExitRequestAnswer;
}
/** dsh `process-shutdown` PROCESS_SHUTDOWN_TIMEOUT_MS (0.2.1-rc.3): the dispose bound. */
export declare const PROCESS_SHUTDOWN_TIMEOUT_MS = 5000;
/**
 * End the process by `signal`. Only the entry's own listeners come off, so the
 * renderer's signal-exit hook still restores the terminal; a foreign listener
 * would keep the process alive, so after a short grace every listener goes.
 */
export declare function dieBySignal(signal: TerminationSignal): void;
export interface EntrySignalOptions {
    readonly seam: ProcessExitSeam;
    /** Dispose the root without the funnel (no owner, or it refused). */
    readonly disposeRoot: () => Promise<unknown>;
    /** restart.log / debug breadcrumb; must not write to the terminal. */
    readonly log?: (event: string, data?: Record<string, unknown>) => void;
}
/** Once per process. */
export declare function installEntrySignals(options: EntrySignalOptions): void;
//# sourceMappingURL=process-exit.d.ts.map
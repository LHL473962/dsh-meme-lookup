/** One serialized level: the crash itself or a link of its `.cause` chain. */
export interface CrashDetailLevel {
    /** Constructor name (`TypeError`), or the JS typeof for non-Errors. */
    readonly name: string;
    readonly message: string;
    /** Raw multi-frame stack when this level is an Error that carries one. */
    readonly stack?: string;
}
/** Full crash serialization: the error, its cause chain, and React extras. */
export interface CrashDetail {
    readonly message: string;
    /** Head-level stack (=== levels[0].stack). */
    readonly stack?: string;
    /** The error followed by every `.cause` link, outermost first. */
    readonly levels: readonly CrashDetailLevel[];
    /** React component tree trace when attached to the error object. */
    readonly componentStack?: string;
    /** React production digest when attached to the error object. */
    readonly digest?: string;
    /** `${name}: ${message}` one-liner for logs that must stay one line. */
    readonly summary: string;
    /** Full multi-line block crash.log stores after its header line. */
    readonly text: string;
}
/** Stand-in text for a value whose own string conversion throws. */
export declare const UNSERIALIZABLE = "[unserializable value]";
/**
 * Serialize an unknown crash value: head message + stack, the `.cause` chain
 * level by level, and componentStack / digest when attached. Never throws and
 * never loops — the crash path's own diagnostics must not become a second
 * crash. Exported for scripts/verify-crash-detail.
 */
export declare function serializeCrashDetail(error: unknown): CrashDetail;
/**
 * Crash detail built from literals only, for when serializing or logging
 * the real one failed. It never touches the thrown value, so it cannot throw.
 */
export declare function unserializableCrashDetail(): CrashDetail;
/**
 * The crash.log line: restart.log's `<UTC ISO> pid=<pid>` header style
 * (writeRestartLine precedent, src/update.ts) followed by the detail block.
 * @param detail - Serialized crash (serializeCrashDetail).
 * @param at - Timestamp of the crash (injected so the format stays testable).
 * @param pid - Process id (injected so the format stays testable).
 */
export declare function formatCrashLogLine(detail: CrashDetail, at: Date, pid: number): string;
/**
 * Append the crash detail to `<dir>/crash.log` (default `~/.dsh-tui`,
 * DATA_DIR — same home-dir resolution as restart.log, never a hard-coded
 * path). Every failure is swallowed: post-mortem diagnostics must never take
 * the exit path down (mouse-debug.log precedent).
 * @param detail - Serialized crash (serializeCrashDetail).
 * @param dir - Data directory override (verify scripts point at a temp dir).
 */
export declare function appendCrashLog(detail: CrashDetail, dir?: string): void;
//# sourceMappingURL=crashDetail.d.ts.map
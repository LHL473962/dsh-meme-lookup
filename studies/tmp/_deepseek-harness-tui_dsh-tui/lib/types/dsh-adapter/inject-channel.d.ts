/**
 * External injection channel — lets an out-of-process editor integration
 * (e.g. the `dsh.nvim` Neovim plugin) push text into the running TUI's
 * prompt input and, optionally, submit it. This is dsh-TUI's answer to
 * OpenCode's `POST /tui/publish` (`tui.prompt.append` / `tui.command.execute`),
 * but over a per-session local socket instead of an HTTP port: no port
 * allocation, no auth surface, and the endpoint is torn down with the
 * session.
 *
 * Transport: a Unix domain socket at `~/.dsh-tui/inject/<sessionId>.sock`
 * (a named pipe `\\.\pipe\dsh-tui-inject-<sessionId>` on Windows). Alongside
 * it the server maintains a discovery file `~/.dsh-tui/inject/servers.json`
 * listing every live session (`pid`, `sessionId`, `cwd`, `socketPath`) so a
 * client can pick the instance whose `cwd` overlaps the editor's project —
 * the same cwd-matching OpenCode's server discovery does.
 *
 * Wire format: newline-delimited JSON, one message per line. Messages:
 *   - `{ "type": "prompt.append", "text": "@src/foo.ts " }`
 *   - `{ "type": "command.execute", "command": "prompt.submit" }`
 * A trailing space in appended text (OpenCode's convention) leaves the input
 * unsubmitted; the client sends `prompt.submit` when it wants the turn sent.
 *
 * @module
 */
/** Directory holding per-session sockets and the discovery file. */
export declare const INJECT_DIR: string;
/** Discovery file listing every live injection endpoint. */
export declare const SERVERS_FILE: string;
/**
 * A discovery record for one live session, written to {@link SERVERS_FILE}.
 * Clients read the array and match `cwd` against their own project root.
 */
export interface InjectServerRecord {
    /** Process id of the TUI holding this endpoint (staleness/liveness check). */
    readonly pid: number;
    /** DSH session id this endpoint injects into. */
    readonly sessionId: string;
    /** Session working directory, for client-side cwd matching. */
    readonly cwd: string;
    /** Absolute socket path (Unix) or named-pipe path (Windows) to connect to. */
    readonly socketPath: string;
    /** Epoch ms when the endpoint was opened (newest-wins tie-break for clients). */
    readonly startedAt: number;
}
/**
 * A message accepted over the injection socket. `prompt.append` carries the
 * text to insert at the caret; `command.execute` names a TUI command
 * (currently only `prompt.submit`).
 */
export type InjectMessage = {
    readonly type: 'prompt.append';
    readonly text: string;
} | {
    readonly type: 'command.execute';
    readonly command: 'prompt.submit';
};
/** Host callbacks the channel drives when a validated message arrives. */
export interface InjectHandlers {
    /** Append `text` to the prompt input (does not submit). */
    append(text: string): void;
    /** Submit the current prompt input as a turn. */
    submit(): void;
}
/**
 * The Chat screen's fulfillment of {@link InjectHandlers}: the UI publishes a
 * controller each render so the adapter-owned socket can drive prompt append
 * and submit without the socket reaching into React state directly.
 */
export type InjectController = InjectHandlers;
/**
 * The platform socket path for a session id. Windows named pipes live under
 * the `\\.\pipe\` namespace and ignore {@link INJECT_DIR}; the discovery file
 * still records the pipe path so clients connect to the right name.
 * @param sessionId - DSH session id.
 * @returns Connectable socket path or pipe name.
 */
export declare function socketPathFor(sessionId: string): string;
/**
 * Parse and validate one line as an {@link InjectMessage}. Returns `null` for
 * anything malformed — the socket is a trust boundary (a foreign process
 * writes to it), so every field is checked rather than trusted.
 * @param line - One newline-delimited JSON line (already trimmed of the newline).
 * @returns The validated message, or `null` to ignore the line.
 */
export declare function parseInjectMessage(line: string): InjectMessage | null;
/** A running injection channel; call {@link InjectChannel.close} at teardown. */
export interface InjectChannel {
    /** Absolute socket path this channel listens on. */
    readonly socketPath: string;
    /** Stop listening, remove this session's discovery record, and unlink the socket. */
    close(): void;
}
/**
 * Open the injection channel for one session: bind the socket, register the
 * discovery record, and dispatch validated messages to `handlers`. Returns
 * `null` when the socket cannot be bound (another process owns a stale socket
 * that is genuinely in use, or the platform forbids it) — injection is an
 * optional integration, so a bind failure degrades to "no channel" rather
 * than failing the session.
 *
 * @param sessionId - DSH session id to expose.
 * @param cwd - Session working directory, recorded for client cwd matching.
 * @param handlers - Host callbacks invoked per validated message.
 * @param onError - Optional sink for non-fatal listen/socket errors.
 * @returns The live channel, or `null` if binding failed.
 */
export declare function openInjectChannel(sessionId: string, cwd: string, handlers: InjectHandlers, onError?: (message: string) => void): InjectChannel | null;
//# sourceMappingURL=inject-channel.d.ts.map
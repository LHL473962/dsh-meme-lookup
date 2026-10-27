/**
 * IDE selection channel (PR-B groundwork): the dsh-tui side of a loopback
 * WebSocket link with a companion IDE extension (dsh-tui-vscode). The
 * extension broadcasts caret-selection changes; the TUI consumes them to
 * attach `<attached-file …>` blocks at submit time (ADR-001).
 *
 * Discovery has two paths (DESIGN D4):
 *   1. env direct — DSH_TUI_IDE_PORT + DSH_TUI_IDE_TOKEN, injected when the
 *      extension spawns this TUI itself;
 *   2. lock scan — `~/.dsh-tui/ide/*.lock` files written by the extension
 *      ({port, token, workspaceFolders, pid}); locks whose workspaceFolders
 *      match the session cwd connect first.
 *
 * Both paths fail → silent degradation (AC-4): no error, no retry,
 * connected=false, every other TUI feature unaffected. The client is Node's
 * native WebSocket global (engines ^22.19 || >=24, D5) — zero dependencies
 * and no auto-reconnect (degrade-on-drop is the design).
 *
 * Protocol constants here are a cross-repo contract (the extension's server
 * side implements the mirror); changing them requires updating both ends
 * plus ADR-001 (DESIGN §9.5). Protocol version 2:
 * - Handshake: the client's first frame is
 *   `{"method":"ide/hello","params":{"token","protocolVersion"}}`; the
 *   server validates the token and answers
 *   `{"method":"ide/hello_ack","params":{"protocolVersion",
 *   "workspaceFolders"}}`. The client is connected only after a valid ack —
 *   a wrong token closes the socket and the client tries its next
 *   candidate.
 * - Notifications: `{"method":"selection_changed","params":{path,
 *   startLine, endLine, isEmpty, text, documentVersion}}` — coordinates are
 *   0-based, and `text` carries the editor buffer's own selection text
 *   (unsaved edits included); the TUI attaches that text verbatim and only
 *   falls back to reading the file from disk for protocol-1 pushes.
 */
/** Env var carrying the extension's loopback WS port (spawn-injected). */
export declare const IDE_PORT_ENV = "DSH_TUI_IDE_PORT";
/** Env var carrying the extension's handshake token (spawn-injected). */
export declare const IDE_TOKEN_ENV = "DSH_TUI_IDE_TOKEN";
/** Wire protocol this client speaks; hello_ack carries the server's value. */
export declare const IDE_PROTOCOL_VERSION = 2;
/** Where the extension advertises its loopback server (`~/.dsh-tui/ide`). */
export declare function ideLockDir(dataDir?: string): string;
/** Connection target resolved from the spawn environment. */
export type IdeChannelConfig = {
    port: number;
    token: string;
};
/**
 * Parse the direct-connect environment. Returns undefined when the pair is
 * absent or malformed — port must be an integer within 1..65535 and the
 * token non-empty — so a bad env degrades to lock discovery instead of
 * throwing.
 */
export declare function envDirect(env: NodeJS.ProcessEnv): IdeChannelConfig | undefined;
/**
 * A parsed `*.lock` file: the extension's advertisement of its loopback
 * server. workspaceFolders holds the absolute paths of its open workspace
 * roots.
 */
export type LockEntry = {
    port: number;
    token: string;
    workspaceFolders: string[];
    pid: number;
};
/** Snapshot carried by a `selection_changed` notification. */
export type SelectionSnapshot = {
    /** Workspace-relative or absolute file path, as the extension reports it. */
    path: string;
    /** First selected line, 0-based. */
    startLine: number;
    /** Last selected line, 0-based inclusive. */
    endLine: number;
    /** True when the editor selection collapsed to nothing. */
    isEmpty: boolean;
    /**
     * Protocol 2: the editor buffer's OWN text for the selection (unsaved
     * edits included), exactly what the user saw when selecting. Always
     * present from a v2 extension (the handshake gates on a v2 ack, so an
     * older extension never gets connected); a missing/empty value only
     * occurs on a degenerate push and falls back to reading the file from
     * disk, which can differ from the editor for unsaved buffers.
     */
    text?: string;
    /** Protocol 2: the editor document version the text came from. */
    documentVersion?: number;
};
/**
 * Validate an inbound `ide/hello_ack` frame. Returns the server's protocol
 * version and workspace folders, or undefined for anything else — wrong
 * method, malformed envelope, or a version this client does not speak (both
 * ends ship together, so a mismatch is a foreign server and must not be
 * treated as connected).
 */
export declare function parseHelloAck(message: unknown): {
    protocolVersion: number;
    workspaceFolders: string[];
} | undefined;
/**
 * Normalize a path for comparison: backslashes folded to forward slashes,
 * trailing slashes stripped, case folded when the platform's filesystem is
 * case-insensitive (same semantics as channel.ts normalizeCwd — sessions.ts
 * precedent). Exported so verifiers can pin the Windows behavior.
 */
export declare function normalizeIdePath(path: string, caseInsensitive: boolean): string;
/**
 * Read and parse one lock file. Returns undefined for unreadable or
 * malformed content (broken JSON, wrong field types) — a single bad lock
 * must never break the whole scan.
 */
export declare function readLockEntry(file: string): LockEntry | undefined;
/**
 * Scan a lock directory and return the candidates whose workspaceFolders
 * actually CONTAIN the session cwd, most-specific root first; ties keep
 * directory order (stable sort). Malformed and stale locks are skipped, and
 * an unmatched lock is NOT a candidate at all — dialing another workspace's
 * IDE would attach that project's selections here (maintainer review round 3:
 * "unmatched trails every match" used to make start() connect to an
 * unrelated window when nothing matched). Never throws — an unreadable
 * directory degrades to an empty list.
 *
 * `pid` is part of the lock contract and reserved for future disambiguation
 * (DESIGN R5); matching currently relies on workspaceFolders only.
 */
export declare function pickLockCandidates(lockDir: string, cwd: string, pid?: number): LockEntry[];
/**
 * Validate one inbound notification as a `selection_changed` frame. Returns
 * undefined for anything else — wrong method, malformed envelope, missing or
 * out-of-range coordinates (endLine >= startLine >= 0, non-empty path).
 */
export declare function parseSelectionChanged(message: unknown): SelectionSnapshot | undefined;
type SelectionListener = (snapshot: SelectionSnapshot) => void;
/**
 * What one consumed selection contributed to a submitted message, recorded
 * next to the user row so the transcript can render a "Selected N lines
 * from <file>" indicator (T06). `lines` is the number of lines actually
 * attached after clamping — the truth the model received, not the request.
 */
export type SelectionAttachedInfo = {
    lines: number;
    path: string;
};
/**
 * Connection lifecycle (DESIGN §3): idle → connecting (env first, then lock
 * candidates under one shared budget) → connected, or silently disconnected.
 * Once connected, an error or drop degrades to disconnected — no retry.
 * The latest non-empty selection stays available after consumption so
 * consecutive submits can reuse it; an isEmpty notification clears it.
 */
export declare class IdeChannel {
    private socket;
    private pendingSocket;
    private state;
    private current;
    /** Bumped on every connect attempt and on stop(): in-flight dials check it
     *  in `finish` and the discovery loop checks it before every next dial, so
     *  a stopped channel can neither be revived by a late onopen/ack nor keep
     *  dialing further candidates (maintainer review rounds 2–3). */
    private generation;
    /** Env/lockDir of the last start(), reused by rebind() so a cwd change
     *  rediscovers against the same environment it originally connected in. */
    private startEnv;
    private startLockDir;
    /** Workspace folders the connected server reported in hello_ack. */
    private ackedWorkspaceFolders;
    private readonly listeners;
    /** True only while the loopback link is up. */
    get connected(): boolean;
    /** Workspace folders the connected server acked with, or undefined while
     *  not connected (test/introspection seam for the cwd-coverage rule). */
    get workspaceFolders(): string[] | undefined;
    /** Latest non-empty selection, or undefined (never consumed-clearing). */
    get selection(): SelectionSnapshot | undefined;
    /**
     * Subscribe to every selection notification, including empty ones.
     * @returns An unsubscribe handle.
     */
    onSelection(listener: SelectionListener): () => void;
    /**
     * Discover and connect. All arguments are injectable so callers (and
     * verifiers) can pin the environment, lock directory and session cwd;
     * defaults read the live process values. Resolves without throwing in
     * every outcome — check `connected` afterwards.
     */
    start(env?: NodeJS.ProcessEnv, lockDir?: string, cwd?: string): Promise<void>;
    /** Drop the link (if any) and mark the channel disconnected. Cancels any
     *  dial still pending: the generation bump invalidates its finish, and the
     *  pending socket is aborted so a late onopen/ack can never re-connect.
     *  Cached selection state goes with the link — a stopped channel must not
     *  keep serving the old window's snapshot to anyone who reads `selection` /
     *  `workspaceFolders` (degradeToDisconnected already does this; stop() used
     *  to leave both behind, contradicting rebind()'s own contract). */
    stop(): void;
    /**
     * Re-target the channel after the session cwd changed (/workspace, /resume
     * adopting another session, ...). The old link belongs to the old
     * workspace — a selection pushed there must never attach into the new one
     * — so drop it (stop() clears the cached selection and the acked folders)
     * and rediscover against the new cwd with the env/lockDir start() was last
     * given (maintainer review
     * round 3: clearing the cached selection used to keep the stale link, and
     * the terminal-on-disconnect design meant a plain stop() could never
     * reconnect; rebind() is the one sanctioned way back to idle).
     */
    rebind(cwd: string): Promise<void>;
    private teardown;
    private detach;
    /** Close without waiting; closing a CONNECTING socket cancels the dial. */
    private abort;
    /**
     * Dial one candidate and complete the token handshake. Resolves true only
     * when the server answered `ide/hello_ack` with a matching protocol
     * version — an OPEN socket alone proves nothing: a wrong-token server
     * accepts the WS upgrade and then closes, and treating open as connected
     * used to strand the client on a rejected candidate (maintainer review
     * round 3). Anything slower than `timeoutMs`, any error, or any first
     * frame that is not a valid v2 ack resolves false and cleans up.
     */
    private tryConnect;
    private attachMessageHandler;
    private degradeToDisconnected;
}
export {};
//# sourceMappingURL=ide-channel.d.ts.map
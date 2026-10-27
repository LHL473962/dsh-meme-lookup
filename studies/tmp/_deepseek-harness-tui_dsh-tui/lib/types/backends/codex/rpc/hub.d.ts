import { type Rec } from '../narrow.js';
import { type CallOptions, type RequestId, type RpcClock } from './client.js';
import { type TransportFactory } from './transport.js';
/** The server's handshake answer. */
export interface InitializeInfo {
    readonly userAgent: string;
    readonly codexHome: string;
    readonly platformFamily: string;
    readonly platformOs: string;
    /** Which connection generation answered (1 = the first child). */
    readonly generation: number;
}
/** One server request as a session sees it. */
export interface HubServerRequest {
    /** `codex:<generation>:<id>`: unique across restarts. */
    readonly key: string;
    readonly id: RequestId;
    readonly generation: number;
    readonly method: string;
    readonly params: Rec;
    /** The same request arrived again (a rejoin redelivered it). */
    readonly redelivered: boolean;
    respond(result: unknown): void;
    respondError(code: number, message: string): void;
    /** Whether the connection it came on is still the live one. */
    live(): boolean;
}
/** A bounded hub diagnostic, broadcast and replayed to every attached sink. */
export interface HubDiagnostic {
    readonly kind: 'debug' | 'stderr';
    readonly message: string;
}
/** What a session attaches for its thread. */
export interface ThreadSink {
    notification(method: string, params: Rec): void;
    serverRequest(request: HubServerRequest): void;
    /** The child went away; `permanent` = no restart will follow. */
    connectionLost(error: Error, permanent: boolean): void;
    /** A restarted child finished its handshake: resubscribe. */
    connectionRestored(): void;
    /** Startup diagnostics are replayed on attach; subsequent ones fan out. */
    diagnostic?(entry: HubDiagnostic): void;
}
export interface HubSettings {
    readonly executable: string;
    readonly args: readonly string[];
    readonly env: Readonly<Record<string, string>>;
    readonly cwd: string;
    /** Credential mode and channel-private env participate in hub identity. */
    readonly credentialMode?: 'codex' | 'external' | 'channel' | 'native-fallback';
    readonly injectedEnvKeys?: readonly string[];
}
export interface CodexHubDeps {
    readonly transportFactory?: TransportFactory;
    readonly clock?: RpcClock;
    readonly debug?: (message: string) => void;
    /** One child stderr line (never the terminal). */
    readonly stderr?: (line: string) => void;
    /** Idle time before an unused hub closes (default 30 s). */
    readonly idleMs?: number;
    /** Restart backoff; its length is the attempt budget. */
    readonly restartDelaysMs?: readonly number[];
    /** `clientInfo.version` (the dsh-tui version). */
    readonly clientVersion?: string;
    /** Bound on the `initialize` answer. */
    readonly handshakeTimeoutMs?: number;
}
export type HubState = 'starting' | 'ready' | 'restarting' | 'failed' | 'closed';
export interface CodexHub {
    /** The current connection's handshake. */
    readonly ready: Promise<InitializeInfo>;
    readonly info: InitializeInfo | undefined;
    readonly generation: number;
    readonly state: HubState;
    readonly fingerprint: string;
    /** Last 200 diagnostics, including stderr emitted before a session attached. */
    readonly diagnostics: readonly HubDiagnostic[];
    /** One-time startup finding survives diagnostic-history eviction. */
    readonly bubblewrapMissing: boolean;
    /** A request on the live connection (waits for its handshake). */
    call<R = unknown>(method: string, params?: unknown, options?: CallOptions): Promise<R>;
    attach(threadId: string, sink: ThreadSink): () => void;
    /** Deliver another thread's traffic to the sink of `toThreadId` (a
     *  subagent's thread to its parent session). */
    route(threadId: string, toThreadId: string): () => void;
    onGlobal(listener: (method: string, params: Rec) => void): () => void;
    /** A handler for thread-less server requests (`account/…`). */
    onGlobalRequest(method: string, handler: (request: HubServerRequest) => void): () => void;
    retain(): () => void;
    close(): Promise<void>;
}
/** A stable digest of what makes two hubs interchangeable (values hashed,
 *  never kept). */
export declare function hubFingerprint(settings: HubSettings): string;
/** The thread a message concerns, when it names one. */
export declare function threadOf(params: Rec): string | undefined;
/** Create a hub (no registry: tests and the registry below). */
export declare function createCodexHub(settings: HubSettings, deps?: CodexHubDeps): CodexHub;
/** The process-wide hub for these settings (created on first use). */
export declare function acquireCodexHub(settings: HubSettings, deps?: CodexHubDeps): CodexHub;
/** Close every hub (the process exit path; tests). */
export declare function closeAllCodexHubs(): Promise<void>;
/** Parse a JSON-RPC answer's error message for a user (no params). */
export declare const rpcErrorText: (error: unknown) => string;
//# sourceMappingURL=hub.d.ts.map
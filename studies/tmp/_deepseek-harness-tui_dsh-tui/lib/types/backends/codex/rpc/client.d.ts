/**
 * JSON-RPC 2.0 over the app-server's newline-delimited stdio
 * (docs/codex-backend-design.md §5.2). Transport-agnostic: the hub feeds
 * every received line to `receive` and writes through `write`.
 *
 * - Requests get increasing integer ids and a per-method timeout (a timeout
 *   rejects with `CodexRpcError(-32000)` and never kills the process: the
 *   server may still answer, and a late answer is dropped).
 * - Server requests (a message with both `id` and `method`) go to the one
 *   registered handler; it returns the result (or a promise of it), or
 *   `undefined` to answer later through `respond` (a parked approval).
 * - A line that does not parse, an unknown notification and a response to
 *   an id nobody waits for are debug-logged and dropped, never thrown.
 * - `close(reason)` rejects every pending request with `reason`.
 *
 * Diagnostics never carry request parameters: the credential-bearing
 * methods (`account/login/start`) would otherwise leak token material into
 * the debug log.
 */
import { type Rec } from '../narrow.js';
export type RequestId = number | string;
/** JSON-RPC error codes the backend distinguishes. */
export declare const RPC_ERROR: {
    readonly timeout: -32000;
    readonly invalidRequest: -32600;
    readonly methodNotFound: -32601;
    readonly invalidParams: -32602;
    readonly internal: -32603;
};
/** A JSON-RPC error answer (or a local timeout / closed connection). */
export declare class CodexRpcError extends Error {
    readonly code: number;
    readonly data?: unknown | undefined;
    constructor(message: string, code: number, data?: unknown | undefined);
}
/** The JSON-RPC code of an error, when it is one. */
export declare const rpcCode: (error: unknown) => number | undefined;
/** Timer seam (tests inject a manual clock). */
export interface RpcClock {
    setTimeout(callback: () => void, ms: number): unknown;
    clearTimeout(handle: unknown): void;
}
export declare const REAL_CLOCK: RpcClock;
/** Default request timeout (ms). */
export declare const DEFAULT_TIMEOUT_MS = 30000;
export interface CallOptions {
    readonly timeoutMs?: number;
    readonly signal?: AbortSignal;
}
/** A server → client request handler (see the module comment). */
export type ServerRequestHandler = (id: RequestId, method: string, params: Rec) => Promise<unknown> | unknown;
export interface RpcClient {
    call<R = unknown>(method: string, params?: unknown, options?: CallOptions): Promise<R>;
    notify(method: string, params?: unknown): void;
    onNotification(listener: (method: string, params: Rec) => void): () => void;
    onServerRequest(handler: ServerRequestHandler): void;
    respond(id: RequestId, result: unknown): void;
    respondError(id: RequestId, code: number, message: string): void;
    /** Feed one received line. */
    receive(line: string): void;
    /** Reject every pending request; later calls reject at once. */
    close(reason: Error): void;
    readonly closed: boolean;
    /** Requests still waiting for an answer. */
    readonly pending: number;
}
export declare function createRpcClient(options: {
    readonly write: (line: string) => void;
    readonly debug: (message: string) => void;
    readonly clock?: RpcClock;
}): RpcClient;
//# sourceMappingURL=client.d.ts.map
import { UnsupportedRuntimePlatformError } from './managed-runtime.js';
import { mkdir, writeFile } from 'node:fs/promises';
import { join, resolve, win32 } from 'node:path';
import { randomUUID } from 'node:crypto';
import { realpathSync } from 'node:fs';
/** Windows roots are case-insensitive and may use either separator. */
export function workspaceRootsEqual(left, right, platform = process.platform) {
    const normalize = platform === 'win32'
        ? (value) => win32.normalize(value).replace(/[\\/]+$/, '').toLowerCase()
        : (value) => resolve(value);
    return normalize(left) === normalize(right);
}
/** Header OpenWrite requires on every write request (POST/PUT). */
const WRITE_HEADER = 'X-OpenWrite-Studio';
/** HTTP header values are bytes, so Unicode paths need explicit wire encoding.
 * Plain ASCII retains the old contract, including literal percent characters. */
export function workspaceRootHeaders(root, lowercase = false) {
    const name = lowercase ? 'x-openwrite-workspace-root' : 'X-OpenWrite-Workspace-Root';
    return /[^\x20-\x7e]/.test(root)
        ? { [name]: encodeURIComponent(root), [name + (lowercase ? '-encoding' : '-Encoding')]: 'uri' }
        : { [name]: root };
}
/** A normalized Studio failure: HTTP status plus the server's machine-readable code. */
export class StudioError extends Error {
    status;
    code;
    details;
    requestId = null;
    constructor(message, status, code, details = null) {
        super(message);
        this.name = 'StudioError';
        this.status = status;
        this.code = code;
        this.details = details;
    }
}
/** Narrow `JSON.parse` output to the JsonValue union without `any`. */
function asJson(value) {
    // Studio only ever sends JSON; unrepresentable values degrade to null rather
    // than leaking an untyped `any` into tool output.
    return (value === undefined ? null : value);
}
/** Parse a `Content-Disposition: attachment; filename*=UTF-8''...` header. */
function parseDispositionFilename(header) {
    if (header === null)
        return undefined;
    const encoded = /filename\*=UTF-8''([^;]+)/i.exec(header);
    if (encoded?.[1] !== undefined) {
        try {
            return decodeURIComponent(encoded[1]);
        }
        catch {
            // Malformed percent-encoding: fall through to the plain filename form.
        }
    }
    const plain = /filename="?([^";]+)"?/i.exec(header);
    return plain?.[1];
}
/** Set query params on a URL, expanding array values into repeated entries. */
function applyParams(url, params) {
    for (const [key, value] of Object.entries(params)) {
        if (Array.isArray(value)) {
            for (const item of value)
                url.searchParams.append(key, item);
        }
        else {
            url.searchParams.set(key, value);
        }
    }
}
/** Legacy Core fallback; newer servers declare mutation semantics in a response header. */
export function mutationAffectsState(path, body, headers) {
    const declared = headers?.get('X-OpenWrite-Mutated');
    if (declared === '0' || declared === '1')
        return declared === '1';
    const endpoint = path.split('?')[0]?.replace(/^\/+/, '').replace(/^api\//, '');
    if (endpoint === 'review/history')
        return false;
    if (endpoint !== 'manuscript-editing')
        return true;
    let payload = body;
    if (Buffer.isBuffer(payload))
        payload = payload.toString('utf8');
    if (typeof payload === 'string') {
        try {
            payload = JSON.parse(payload);
        }
        catch {
            return true;
        }
    }
    if (payload === null || typeof payload !== 'object' || Array.isArray(payload))
        return true;
    const action = payload['action'];
    return typeof action !== 'string' || !['versions', 'version', 'compare', 'annotations'].includes(action);
}
export class StudioClient {
    connect;
    baseUrl;
    timeoutMs;
    onMutation;
    /** Workspace context stamped onto every request; undefined for legacy (unscoped) clients. */
    context;
    constructor(options) {
        this.connect = options.connect;
        this.baseUrl = options.baseUrl.replace(/\/+$/, '');
        this.timeoutMs = options.timeoutMs;
        this.onMutation = options.onMutation;
        this.context = options.context;
    }
    /**
     * Derive a lightweight request-scoped client sharing baseUrl/timeout/onMutation.
     * Every request it makes carries the §3 context headers, and mutation
     * notifications report this context so invalidation stays per-root.
     */
    scoped(context) {
        return new StudioClient({ connect: this.connect, baseUrl: this.baseUrl, timeoutMs: this.timeoutMs, onMutation: this.onMutation, context });
    }
    /** §3 context headers; empty for a legacy (unscoped) client. */
    contextHeaders() {
        const context = this.context;
        if (context === undefined)
            return {};
        const headers = workspaceRootHeaders(context.workspaceRoot);
        if (context.workspaceId !== undefined)
            headers['X-OpenWrite-Workspace-Id'] = context.workspaceId;
        if (context.sessionId !== undefined)
            headers['X-OpenWrite-Session-Id'] = context.sessionId;
        if (context.contextEpoch !== undefined)
            headers['X-OpenWrite-Context-Epoch'] = String(context.contextEpoch);
        if (context.toolCallId !== undefined)
            headers['X-OpenWrite-Tool-Call-Id'] = context.toolCallId;
        if (context.rootCallId !== undefined)
            headers['X-OpenWrite-Root-Call-Id'] = context.rootCallId;
        if (context.toolName !== undefined)
            headers['X-OpenWrite-Tool-Name'] = context.toolName;
        return headers;
    }
    /** GET a JSON endpoint. `params` entries are URL-encoded; undefined values are dropped. */
    async getJson(path, params = {}, signal) {
        const url = new URL(`${this.baseUrl}${path}`);
        applyParams(url, params);
        const response = await this.request(url, { method: 'GET', headers: this.contextHeaders() }, signal);
        return this.readJson(response);
    }
    /** POST a JSON object with the Studio write protocol header. */
    async postJson(path, body, signal) {
        const response = await this.request(new URL(`${this.baseUrl}${path}`), {
            method: 'POST',
            headers: { [WRITE_HEADER]: '1', ...this.contextHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        }, signal);
        const result = await this.readJson(response);
        if (mutationAffectsState(path, body, response.headers))
            this.onMutation?.(path, this.context);
        return result;
    }
    /** PUT a JSON object with the Studio write protocol header. */
    async putJson(path, body, signal) {
        const response = await this.request(new URL(`${this.baseUrl}${path}`), {
            method: 'PUT',
            headers: { [WRITE_HEADER]: '1', ...this.contextHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        }, signal);
        const result = await this.readJson(response);
        if (mutationAffectsState(path, body, response.headers))
            this.onMutation?.(path, this.context);
        return result;
    }
    /** GET a file-download endpoint (export), returning the raw bytes and filename. */
    async download(path, params, signal) {
        const url = new URL(`${this.baseUrl}${path}`);
        applyParams(url, params);
        const response = await this.request(url, { method: 'GET', headers: this.contextHeaders() }, signal);
        if (!response.ok) {
            // Error downloads are still JSON payloads.
            await this.readJson(response);
        }
        const content = new Uint8Array(await response.arrayBuffer());
        return {
            filename: parseDispositionFilename(response.headers.get('content-disposition')) ?? 'export.bin',
            contentType: response.headers.get('content-type') ?? 'application/octet-stream',
            content,
        };
    }
    /** One fetch honoring both the caller's abort signal and the configured timeout. */
    async request(url, init, signal) {
        const signals = [AbortSignal.timeout(this.timeoutMs)];
        if (signal !== undefined)
            signals.push(signal);
        try {
            const connection = await this.connect?.();
            const target = connection ? new URL(url.pathname + url.search, connection.baseUrl) : url;
            const headers = connection?.token ? { ...init.headers, Authorization: `Bearer ${connection.token}` } : init.headers;
            const response = await fetch(target, { ...init, headers, signal: AbortSignal.any(signals) });
            const actual = response.headers.get('X-OpenWrite-Project-Path');
            if (response.ok && actual && this.context?.workspaceRoot) {
                const expected = realpathSync(this.context.workspaceRoot);
                const received = decodeURIComponent(actual);
                if (!workspaceRootsEqual(received, expected)) {
                    await response.body?.cancel();
                    throw new StudioError('Connected workspace differs from requested project', 409, 'WORKSPACE_CONTEXT_MISMATCH', { requested_path: expected, project_path: received });
                }
            }
            return response;
        }
        catch (error) {
            if (error instanceof StudioError)
                throw error;
            if (error instanceof UnsupportedRuntimePlatformError) {
                throw new StudioError(error.message, error.status, error.code, { platform: error.platform });
            }
            if (this.context?.workspaceRoot) {
                try {
                    const root = join(this.context.workspaceRoot, '.openwrite', 'transport-errors');
                    await mkdir(root, { recursive: true });
                    await writeFile(join(root, `${randomUUID()}.json`), JSON.stringify({
                        source: 'transport', code: signal?.aborted ? 'REQUEST_ABORTED' : 'NETWORK_ERROR',
                        created_at: new Date().toISOString(), path: url.pathname,
                        tool_name: this.context.toolName ?? '', tool_call_id: this.context.toolCallId ?? '',
                    }));
                }
                catch { /* A diagnostic failure must not hide the transport failure. */ }
            }
            if (signal?.aborted)
                throw error;
            const cause = error instanceof Error ? error.cause : undefined;
            const detail = cause instanceof Error ? ` (${cause.message})` : cause === undefined ? '' : ` (${String(cause)})`;
            throw new StudioError(`Studio request failed: ${error instanceof Error ? error.message : String(error)}${detail}`, 0, 'NETWORK_ERROR');
        }
    }
    /**
     * Read a JSON response, throwing a normalized StudioError for non-2xx statuses
     * and for bodies carrying the server's `{error, code}` contract. Success
     * envelopes (`{ok: true, data}`) are unwrapped to their `data` payload.
     */
    async readJson(response) {
        let parsed;
        try {
            parsed = await response.json();
        }
        catch {
            throw new StudioError(`Studio returned HTTP ${response.status} with a non-JSON body`, response.status, 'INVALID_RESPONSE');
        }
        const body = asJson(parsed);
        if (typeof body === 'object' && body !== null && !Array.isArray(body)) {
            const error = body['error'];
            if (error !== undefined && error !== null && error !== false && error !== '') {
                const nested = typeof error === 'object' && !Array.isArray(error) ? error : {};
                const code = typeof body['code'] === 'string' ? body['code'] : typeof nested['code'] === 'string' ? nested['code'] : 'STUDIO_ERROR';
                const message = typeof body['message'] === 'string' ? body['message'] : typeof error === 'string' ? error : typeof nested['message'] === 'string' ? nested['message'] : JSON.stringify(error);
                const details = body['details'] ?? nested['details'] ?? null;
                const failure = new StudioError(message, response.status, code, details);
                failure.requestId = typeof body['request_id'] === 'string' ? body['request_id'] : null;
                throw failure;
            }
            // HTTP status remains authoritative even when a proxy or incompatible
            // server sends a success-shaped envelope with an error status.
            if (response.ok && body['ok'] === true && 'data' in body)
                return body['data'];
        }
        if (!response.ok) {
            throw new StudioError(`Studio returned HTTP ${response.status}`, response.status, 'HTTP_ERROR');
        }
        return body;
    }
}

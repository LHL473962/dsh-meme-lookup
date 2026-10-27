import { Service } from '@deepseek-ai/cordis';
import { StudioClient, workspaceRootHeaders, workspaceRootsEqual, mutationAffectsState } from './client.js';
import { workspaceContextFromExec } from './tools.js';
export const CONFIG_ROUTE = '/studio-panel/config.json';
export const API_PROXY_ROUTE = '/studio-panel/api';
export const EVENTS_ROUTE = '/studio-panel/events';
export const INVALIDATION_ROUTE = '/studio-panel/invalidation.json';
const PROXY_TIMEOUT_MS = 60_000;
/** Cap for the best-effort upstream context_epoch read; never blocks a snapshot longer. */
const CONTEXT_EPOCH_TIMEOUT_MS = 5_000;
const WRITABLE_PATHS = new Set([
    'writing-assets',
    'arc-reconcile',
    'assets',
    'assets/update',
    'assets/package/import',
    'outline/edit',
    'rolling-plans',
    'narrative-forecasts',
    'sync',
    'import/preview',
    'import',
    'manuscript-imports/prepare',
    'manuscript-imports/structure',
    'manuscript-imports/confirm',
    'manuscript-imports/run',
    'manuscript-imports/discard',
    'project-archives/create',
    'project-archives/restore/preview',
    'project-archives/restore',
    'reading-order/move',
    'scenes/migration/apply',
    'scenes/migration/rollback',
    'scenes/metadata',
    'scenes/move',
    'tasks',
    'benchmarks',
    'document',
    'document/change-plan',
    'structured/change-plan',
    'manuscript-editing',
    'manuscript/drafts/restore',
    'manuscript/acceptance/baseline',
    'manuscript/acceptance/external',
    'manuscript/acceptance/reconcile',
    'manuscript/acceptance/ack',
    'manuscript/acceptance/abandon',
    'review/history',
    'project/init',
    'project/metadata',
    'model',
    'model/test',
    'model/embedding/test',
    'model/embedding',
    'model/embedding/select',
    'model/embedding/delete',
    'model/profiles',
    'model/profiles/delete',
    'model/routes',
    'chapter/delete-batch',
    'research/settings',
]);
const WRITABLE_PATH_RE = /^(?:tasks\/[A-Za-z0-9_-]+\/(?:cancel|retry|confirm)|revisions\/(?:selection|from-review|rev_[A-Za-z0-9_-]+\/(?:apply|reject|regenerate)))$/;
/** Mutation/SSE state bucket key for context-less (legacy) mutations. */
const LEGACY_ROOT_KEY = '';
function sendJson(res, status, payload) {
    const body = Buffer.from(JSON.stringify(payload));
    res.writeHead(status, {
        'content-type': 'application/json',
        'cache-control': 'no-cache',
        'content-length': String(body.length),
    });
    res.end(body);
}
async function readBody(req) {
    const iterator = req[Symbol.asyncIterator];
    if (iterator === undefined)
        return Buffer.alloc(0);
    const chunks = [];
    for await (const chunk of iterator.call(req)) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
}
function resourceForPath(path) {
    if (path.startsWith('/api/manuscript-imports'))
        return 'tasks';
    if (path.startsWith('/api/project-archives'))
        return 'workspace';
    if (path.startsWith('/api/document') || path.startsWith('/api/write') || path.startsWith('/api/manuscript/'))
        return 'manuscript';
    if (path.startsWith('/api/outline'))
        return 'outline';
    if (path.startsWith('/api/scenes'))
        return 'outline';
    if (path.startsWith('/api/assets'))
        return 'assets';
    if (path.startsWith('/api/tasks') || path.startsWith('/api/review'))
        return 'tasks';
    if (path.startsWith('/api/benchmarks'))
        return 'benchmark';
    if (path.startsWith('/api/model'))
        return 'models';
    if (path.startsWith('/api/research'))
        return 'research';
    if (path.startsWith('/api/manuscript-editing'))
        return 'manuscript';
    if (path.startsWith('/api/revisions'))
        return 'revisions';
    return 'workspace';
}
function compactTaskList(bytes, pathPart, method) {
    if (method !== 'GET' || pathPart !== 'tasks')
        return bytes;
    try {
        const envelope = JSON.parse(bytes.toString('utf8'));
        const data = envelope['data'];
        if (data === undefined || !Array.isArray(data['tasks']))
            return bytes;
        const tasks = data['tasks'].map((raw) => {
            if (raw === null || typeof raw !== 'object' || Array.isArray(raw))
                return raw;
            const task = raw;
            const result = task['result'] !== null && typeof task['result'] === 'object' && !Array.isArray(task['result'])
                ? task['result']
                : null;
            const reviewV2 = result?.['review_v2'] !== null && typeof result?.['review_v2'] === 'object' && !Array.isArray(result?.['review_v2'])
                ? result['review_v2']
                : null;
            const reviewResult = task['type'] === 'chapter_review' && result !== null
                ? {
                    score: result['score'],
                    passed: result['passed'],
                    issues: result['issues'],
                    summary: result['summary'],
                    review_v2: reviewV2 === null ? undefined : {
                        schema_version: reviewV2['schema_version'],
                        execution_status: reviewV2['execution_status'],
                        quality_score: reviewV2['quality_score'],
                        coverage: reviewV2['coverage'],
                        gate_status: reviewV2['gate_status'],
                        delivery_status: reviewV2['delivery_status'],
                        production_gate_status: reviewV2['production_gate_status'],
                        freshness_status: reviewV2['freshness_status'],
                        source_revision: reviewV2['source_revision'],
                        current_source_revision: reviewV2['current_source_revision'],
                    },
                    issue_details: Array.isArray(result['issue_details'])
                        ? result['issue_details'].map((rawIssue) => {
                            const issue = rawIssue !== null && typeof rawIssue === 'object' && !Array.isArray(rawIssue)
                                ? rawIssue
                                : {};
                            return {
                                severity: issue['severity'],
                                review_severity: issue['review_severity'],
                                revision_priority: issue['revision_priority'],
                                legacy_severity: issue['legacy_severity'],
                                dimension: issue['dimension'],
                                category: issue['category'],
                                summary: issue['summary'] ?? issue['description'],
                            };
                        })
                        : [],
                }
                : null;
            const benchmarkResult = task['type'] === 'model_benchmark' && result !== null
                ? {
                    run_id: result['run_id'], status: result['status'], artifact_path: result['artifact_path'],
                    context_hash: result['context_hash'], summary: result['summary'],
                }
                : null;
            return {
                task_id: task['task_id'],
                type: task['type'],
                status: task['status'],
                phase: task['phase'],
                phase_index: task['phase_index'],
                progress: task['progress'],
                chapter_id: task['chapter_id'],
                input_summary: task['input_summary'],
                error: task['error'],
                retryable: task['retryable'],
                attempt: task['attempt'],
                created_at: task['created_at'],
                updated_at: task['updated_at'],
                started_at: task['started_at'],
                completed_at: task['completed_at'],
                result_ref: task['result_ref'],
                schema_version: task['schema_version'],
                result: reviewResult ?? benchmarkResult,
            };
        });
        return Buffer.from(JSON.stringify({ ...envelope, data: { ...data, tasks } }));
    }
    catch {
        return bytes;
    }
}
/** Read a single-valued request header (node lowercases header names). */
function headerValue(req, name) {
    const value = req.headers?.[name];
    return typeof value === 'string' && value !== '' ? value : undefined;
}
/** Read the `?workspace=` query parameter of a route URL. */
function workspaceParam(req) {
    const value = new URL(req.url ?? '/', 'http://localhost').searchParams.get('workspace');
    return value === null || value === '' ? undefined : value;
}
/** Single host-side boundary shared by agent tools, browser proxy and live invalidation. */
export class NovelDomainService extends Service {
    toolOptions;
    client;
    authorizeRequest;
    connect;
    baseUrl;
    resolveWorkspace;
    /** Per-root invalidation state, keyed by canonical workspace root ('' = legacy). */
    roots = new Map();
    /** Open SSE connections bound to the root key they subscribed to. */
    streams = new Map();
    constructor(ctx, options) {
        super(ctx, 'novelDomain');
        this.toolOptions = { timeoutMs: options.timeoutMs, ...(options.outputDir ? { outputDir: options.outputDir } : {}) };
        this.connect = options.connect;
        this.authorizeRequest = options.authorizeRequest;
        this.baseUrl = options.baseUrl.replace(/\/+$/, '');
        this.resolveWorkspace = options.resolveWorkspace;
        this.client = new StudioClient({
            connect: options.connect,
            baseUrl: this.baseUrl,
            timeoutMs: options.timeoutMs,
            onMutation: (path, context) => this.notifyMutation(path, context),
        });
    }
    /**
     * Factory for the tool surface: every tool execution derives its own
     * request-scoped client from the dsh session context (fail closed).
     */
    clientFactory() {
        return exec => this.client.scoped(workspaceContextFromExec(exec));
    }
    /** Record a mutation under its root and broadcast only to that root's SSE connections. */
    notifyMutation(path, context) {
        const root = context?.workspaceRoot ?? LEGACY_ROOT_KEY;
        const state = this.roots.get(root) ?? { revision: 0, lastMutation: { revision: 0, resource: 'workspace', path: '' } };
        state.revision += 1;
        state.lastMutation = { revision: state.revision, resource: resourceForPath(path), path };
        this.roots.set(root, state);
        const event = JSON.stringify({ workspace_root: root, ...state.lastMutation });
        for (const [stream, key] of this.streams) {
            if (key === root)
                stream.write(`event: invalidate\ndata: ${event}\n\n`);
        }
    }
    /** Snapshot of one root's invalidation state (zero revision when never mutated). */
    snapshotFor(root) {
        const state = this.roots.get(root);
        if (state === undefined)
            return { revision: 0, resource: null, path: null, workspace_root: root };
        return { workspace_root: root, ...state.lastMutation };
    }
    /**
     * Best-effort read of the upstream per-root context epoch (the only signal
     * that background task transitions bump). ANY failure — network, non-2xx,
     * missing/invalid field — degrades to null so the caller omits the field;
     * this helper never throws and never breaks a snapshot.
     */
    async fetchContextEpoch(root, id, signal) {
        try {
            const timeout = AbortSignal.timeout(CONTEXT_EPOCH_TIMEOUT_MS);
            const payload = await this.client
                .scoped({ workspaceRoot: root, workspaceId: id })
                .getJson('/api/workspace/context', {}, signal === undefined ? timeout : AbortSignal.any([timeout, signal]));
            const epoch = payload?.['context_epoch'];
            return typeof epoch === 'number' && Number.isFinite(epoch) ? epoch : null;
        }
        catch {
            return null;
        }
    }
    /**
     * Resolve a browser-supplied workspace id through the host registry, failing
     * closed per the contract: missing id → 400 WORKSPACE_CONTEXT_MISSING, no
     * registry → 503 WORKSPACE_REGISTRY_UNAVAILABLE, unknown id → 400 WORKSPACE_UNKNOWN.
     */
    resolveBrowserWorkspace(id) {
        if (id === undefined) {
            return { rejection: { status: 400, code: 'WORKSPACE_CONTEXT_MISSING', message: 'missing workspace id (x-dsh-workspace-id header or ?workspace= param)' } };
        }
        if (this.resolveWorkspace === undefined) {
            return { rejection: { status: 503, code: 'WORKSPACE_REGISTRY_UNAVAILABLE', message: 'host workspaceRegistry service is not available' } };
        }
        const root = this.resolveWorkspace(id);
        if (root === null) {
            return { rejection: { status: 503, code: 'WORKSPACE_REGISTRY_UNAVAILABLE', message: 'host workspaceRegistry service is not available' } };
        }
        if (root === undefined) {
            return { rejection: { status: 400, code: 'WORKSPACE_UNKNOWN', message: `workspace id is not registered: ${id}` } };
        }
        return { root, id };
    }
    static sendRejection(res, rejection) {
        sendJson(res, rejection.status, { error: rejection.message, code: rejection.code });
    }
    registerWebRoutes(ctx) {
        const register = route => ctx.webServer.register({ ...route, handler: (req, res) => {
                const rejection = this.authorizeRequest?.(req.headers);
                if (rejection !== undefined) {
                    sendJson(res, rejection, { error: 'dsh browser authentication required' });
                    return;
                }
                return route.handler(req, res);
            } });
        // These responses belong to this webServer injection scope. Removing a
        // route does not close requests already handled by it; end them explicitly
        // so EventSource reconnects to the newly mounted plugin after a reload.
        const responses = new Set();
        const lifetime = new AbortController();
        let disposed = false;
        ctx.effect(() => () => {
            disposed = true;
            lifetime.abort();
            for (const response of responses) {
                this.streams.delete(response);
                try {
                    response.end();
                }
                catch { /* already disconnected */ }
            }
            responses.clear();
        }, 'novel-domain: close live invalidation responses');
        ctx.effect(() => register({
            kind: 'exact',
            path: CONFIG_ROUTE,
            handler: (req, res) => {
                if (req.method !== 'GET' && req.method !== 'HEAD') {
                    res.writeHead(405);
                    res.end();
                    return;
                }
                res.writeHead(200, { 'content-type': 'application/json', 'cache-control': 'no-cache' });
                res.end(JSON.stringify({ studioUrl: this.baseUrl }));
            },
        }), 'novel-domain: config route');
        ctx.effect(() => register({
            kind: 'prefix',
            path: API_PROXY_ROUTE,
            handler: this.createProxyHandler(lifetime.signal, responses),
        }), 'novel-domain: API proxy');
        ctx.effect(() => register({
            kind: 'exact',
            path: INVALIDATION_ROUTE,
            handler: async (req, res) => {
                if (disposed) {
                    sendJson(res, 503, { error: 'novel-domain is reloading', code: 'NOVEL_DOMAIN_DISPOSED' });
                    return;
                }
                if (req.method !== 'GET' && req.method !== 'HEAD') {
                    res.writeHead(405);
                    res.end();
                    return;
                }
                const resolved = this.resolveBrowserWorkspace(workspaceParam(req));
                if ('rejection' in resolved) {
                    NovelDomainService.sendRejection(res, resolved.rejection);
                    return;
                }
                const snapshot = this.snapshotFor(resolved.root);
                // Merge the upstream context epoch (omitted when unreadable): this is
                // how polling clients observe background task transitions that never
                // touch the bridge-local revision.
                responses.add(res);
                const contextEpoch = await this.fetchContextEpoch(resolved.root, resolved.id, lifetime.signal);
                responses.delete(res);
                if (disposed)
                    return;
                sendJson(res, 200, contextEpoch === null ? snapshot : { ...snapshot, context_epoch: contextEpoch });
            },
        }), 'novel-domain: invalidation snapshot');
        ctx.effect(() => register({
            kind: 'exact',
            path: EVENTS_ROUTE,
            handler: async (req, res) => {
                if (disposed) {
                    sendJson(res, 503, { error: 'novel-domain is reloading', code: 'NOVEL_DOMAIN_DISPOSED' });
                    return;
                }
                if (req.method !== 'GET') {
                    res.writeHead(405);
                    res.end();
                    return;
                }
                const resolved = this.resolveBrowserWorkspace(workspaceParam(req));
                if ('rejection' in resolved) {
                    NovelDomainService.sendRejection(res, resolved.rejection);
                    return;
                }
                res.writeHead(200, {
                    'content-type': 'text/event-stream',
                    'cache-control': 'no-cache',
                    connection: 'keep-alive',
                });
                responses.add(res);
                this.streams.set(res, resolved.root);
                const dispose = () => { this.streams.delete(res); responses.delete(res); };
                res.on?.('close', dispose);
                res.on?.('error', dispose);
                // The ready event carries the upstream context epoch when it is
                // readable; the stream waits for the fetch to settle (capped at
                // CONTEXT_EPOCH_TIMEOUT_MS), never longer. A client gone by then
                // simply never gets the ready event — polling carries epochs anyway.
                const revision = this.roots.get(resolved.root)?.revision ?? 0;
                const contextEpoch = await this.fetchContextEpoch(resolved.root, resolved.id, lifetime.signal);
                if (disposed || !this.streams.has(res))
                    return;
                const ready = { workspace_root: resolved.root, revision };
                if (contextEpoch !== null)
                    ready['context_epoch'] = contextEpoch;
                res.write(`event: ready\ndata: ${JSON.stringify(ready)}\n\n`);
            },
        }), 'novel-domain: invalidation stream');
    }
    createProxyHandler(lifetime, responses) {
        return async (req, res) => {
            if (lifetime.aborted) {
                sendJson(res, 503, { error: 'OpenWrite 已停止' });
                return;
            }
            const sub = (req.url ?? '').slice(API_PROXY_ROUTE.length);
            if (sub === '' || !sub.startsWith('/')) {
                sendJson(res, 404, { error: 'novel-domain proxy: missing API path' });
                return;
            }
            // Every browser request carries only a workspace_id; the trusted host
            // registry resolves it to the canonical root (contract §2.2).
            const resolved = this.resolveBrowserWorkspace(headerValue(req, 'x-dsh-workspace-id'));
            if ('rejection' in resolved) {
                NovelDomainService.sendRejection(res, resolved.rejection);
                return;
            }
            const method = req.method ?? 'GET';
            const pathPart = sub.split('?')[0]?.slice(1) ?? '';
            const isWrite = method === 'POST' || method === 'PUT';
            if (!isWrite && method !== 'GET' && method !== 'HEAD') {
                sendJson(res, 405, { error: 'novel-domain proxy allows only GET/HEAD and allowlisted writes' });
                return;
            }
            if (isWrite && !WRITABLE_PATHS.has(pathPart) && !WRITABLE_PATH_RE.test(pathPart)) {
                sendJson(res, 405, { error: `novel-domain proxy: write path "${pathPart}" is not allowlisted` });
                return;
            }
            responses.add(res);
            try {
                const headers = {
                    accept: 'application/json',
                    ...workspaceRootHeaders(resolved.root, true),
                    'x-openwrite-workspace-id': resolved.id,
                };
                const sessionId = headerValue(req, 'x-dsh-session-id');
                if (sessionId !== undefined)
                    headers['x-openwrite-session-id'] = sessionId;
                let body;
                if (isWrite) {
                    body = await readBody(req);
                    headers['content-type'] = 'application/json';
                    headers['x-openwrite-studio'] = '1';
                }
                const connection = await this.connect?.();
                if (connection?.token)
                    headers['authorization'] = `Bearer ${connection.token}`;
                const upstream = await fetch(new URL(`/api${sub}`, connection?.baseUrl ?? this.baseUrl), {
                    method,
                    headers,
                    ...(body !== undefined ? { body: new Uint8Array(body) } : {}),
                    signal: AbortSignal.any([lifetime, AbortSignal.timeout(PROXY_TIMEOUT_MS)]),
                });
                if (lifetime.aborted)
                    return;
                const actualRoot = upstream.headers.get('X-OpenWrite-Project-Path');
                if (upstream.ok && actualRoot && !workspaceRootsEqual(decodeURIComponent(actualRoot), resolved.root)) {
                    await upstream.body?.cancel();
                    sendJson(res, 409, { error: 'Connected workspace differs from requested project', code: 'WORKSPACE_CONTEXT_MISMATCH', details: { requested_path: resolved.root, project_path: decodeURIComponent(actualRoot) } });
                    return;
                }
                const upstreamBytes = Buffer.from(await upstream.arrayBuffer());
                const bytes = compactTaskList(upstreamBytes, pathPart, method);
                const responseHeaders = {
                    'content-type': upstream.headers.get('content-type') ?? 'application/json',
                    'cache-control': 'no-cache',
                    'content-length': String(bytes.length),
                };
                const disposition = upstream.headers.get('content-disposition');
                const instanceId = upstream.headers.get('X-OpenWrite-Instance-Id');
                if (instanceId)
                    responseHeaders['X-OpenWrite-Instance-Id'] = instanceId;
                if (actualRoot)
                    responseHeaders['X-OpenWrite-Project-Path'] = actualRoot;
                if (disposition !== null)
                    responseHeaders['content-disposition'] = disposition;
                res.writeHead(upstream.status, responseHeaders);
                res.end(bytes);
                if (isWrite && upstream.ok && mutationAffectsState(pathPart, body, upstream.headers)) {
                    this.notifyMutation(`/api/${pathPart}`, { workspaceRoot: resolved.root, workspaceId: resolved.id });
                }
            }
            catch (error) {
                if (!lifetime.aborted) {
                    const failure = error;
                    if (failure.code === 'RUNTIME_PLATFORM_UNSUPPORTED') {
                        sendJson(res, 503, { error: failure.message, code: failure.code });
                    }
                    else
                        sendJson(res, 502, { error: '写作环境暂不可用，请打开环境与诊断重试' });
                }
            }
            finally {
                responses.delete(res);
            }
        };
    }
}

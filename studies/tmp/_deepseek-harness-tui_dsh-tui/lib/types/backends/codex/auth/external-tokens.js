import { codexText } from '../text.js';
import { rec, str } from '../narrow.js';
import { CLIENT, NOTIFY, SERVER_REQUEST } from '../protocol/index.js';
import { REAL_CLOCK, RPC_ERROR } from '../rpc/client.js';
import { codexAuthRoute } from './route.js';
export const CODEX_OAUTH_PROVIDER = 'openai-codex';
export const CODEX_REFRESH_BUDGET_MS = 8000;
/** Decode our own stored JWT payload only; signature verification is the
 * provider's job. Missing account identity is not an injectable credential. */
export function externalTokensOf(access) {
    const parts = access.access.split('.');
    if (parts.length !== 3)
        return undefined;
    try {
        const payload = rec(JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8')));
        const claims = rec(payload?.['https://api.openai.com/auth']);
        const id = str(claims?.chatgpt_account_id);
        if (id === undefined || id.trim() === '')
            return undefined;
        return { accessToken: access.access, chatgptAccountId: id, chatgptPlanType: str(claims?.chatgpt_plan_type) ?? null };
    }
    catch {
        return undefined;
    }
}
export function createCodexAuth(deps) {
    const { hub } = deps;
    const clock = deps.clock ?? REAL_CLOCK;
    const debug = deps.debug ?? (() => undefined);
    const env = deps.env ?? {};
    let config = deps.config;
    let route = codexAuthRoute(config, env, deps.channel !== undefined);
    let source = deps.channel === undefined ? 'unknown' : 'channel';
    let ownSource = source;
    let subscription;
    let injected;
    let managedFailed = false;
    let externalLoaded = false;
    let skipStoredCredential = deps.skipStoredCredential === true;
    let epoch = 0;
    let starting;
    let startedGeneration = 0;
    const listeners = new Set();
    const notices = new Map();
    const note = (key, level, text) => {
        const notice = { key, level, text };
        notices.set(key, notice);
        for (const listener of [...listeners]) {
            try {
                listener(notice);
            }
            catch {
                debug('codex auth: notice listener failed');
            }
        }
    };
    const disable = () => { epoch += 1; injected = undefined; source = ownSource; subscription = undefined; };
    const failed = (key) => {
        const mayHaveLoaded = injected !== undefined || externalLoaded;
        disable();
        managedFailed = mayHaveLoaded;
        if (managedFailed)
            source = 'unknown';
        debug('codex auth: managed credential failed; injection stopped');
        note('codex-auth', 'error', codexText(key));
    };
    const fresh = async (rejected) => {
        if (deps.credential === undefined)
            return undefined;
        const controller = new AbortController();
        let timer;
        const budget = new Promise((_resolve, reject) => {
            timer = clock.setTimeout(() => { controller.abort(); reject(new Error('refresh failed')); }, CODEX_REFRESH_BUDGET_MS);
        });
        const options = { ...(rejected === undefined ? {} : { rejected }), signal: controller.signal };
        try {
            return await Promise.race([deps.credential.fresh(options), budget]);
        }
        finally {
            clock.clearTimeout(timer);
        }
    };
    const readOwnAccount = async () => {
        if (deps.channel !== undefined) {
            ownSource = 'channel';
            source = 'channel';
            return;
        }
        try {
            const result = rec(await hub.call(CLIENT.accountRead, { refreshToken: false }));
            const account = rec(result?.account);
            if (account?.type === 'apiKey')
                ownSource = 'api-key';
            else if (account?.type === 'chatgpt')
                ownSource = 'codex-login';
            else if (result?.requiresOpenaiAuth === true && account === undefined)
                ownSource = 'missing';
            else
                ownSource = 'unknown';
            if (injected === undefined && !managedFailed) {
                source = ownSource;
                subscription = str(account?.planType);
            }
        }
        catch {
            debug('codex auth: account/read failed');
        }
    };
    const refresh = async (request) => {
        const previous = injected;
        const version = epoch;
        if (previous === undefined || !route.firstParty || deps.externalAllowed === false) {
            request.respondError(RPC_ERROR.timeout, 'refresh failed');
            return;
        }
        try {
            const access = await fresh(previous.accessToken);
            const tokens = access === undefined ? undefined : externalTokensOf(access);
            if (tokens === undefined)
                throw new Error('refresh failed');
            if (!request.live())
                return;
            // A simultaneous login or degradation wins over this in-flight refresh.
            if (epoch !== version) {
                if (injected === undefined) {
                    request.respondError(RPC_ERROR.timeout, 'refresh failed');
                    return;
                }
                request.respond(injected);
                return;
            }
            injected = tokens;
            source = 'dsh-auth';
            subscription = tokens.chatgptPlanType ?? undefined;
            request.respond(tokens);
        }
        catch {
            request.respondError(RPC_ERROR.timeout, 'refresh failed');
            if (request.generation === hub.generation && epoch === version)
                failed('codex-auth-refresh-failed');
        }
    };
    hub.onGlobalRequest(SERVER_REQUEST.chatgptAuthTokensRefresh, request => { void refresh(request); });
    hub.onGlobal((method, params) => {
        if (method === NOTIFY.accountLoginCompleted && params.loginId == null && params.success === false && injected !== undefined)
            failed('codex-auth-login-failed');
    });
    const select = async () => {
        route = codexAuthRoute(config, env, deps.channel !== undefined);
        await readOwnAccount();
        if (deps.channel !== undefined)
            return;
        if (route.firstParty && deps.externalAllowed !== false && deps.credential !== undefined && !skipStoredCredential) {
            try {
                const access = await fresh();
                if (access !== undefined) {
                    const tokens = externalTokensOf(access);
                    if (tokens === undefined) {
                        note('codex-auth', 'warning', codexText('codex-auth-claims-missing'));
                    }
                    else {
                        epoch += 1;
                        injected = tokens;
                        source = 'dsh-auth';
                        subscription = tokens.chatgptPlanType ?? undefined;
                        await hub.call(CLIENT.accountLoginStart, { type: 'chatgptAuthTokens', ...tokens });
                        externalLoaded = true;
                        if (injected !== undefined)
                            managedFailed = false;
                    }
                }
            }
            catch {
                failed('codex-auth-refresh-failed');
            }
        }
        if (source === 'missing')
            note('codex-auth-required', 'warning', codexText('codex-auth-login-needed'));
    };
    const runtime = {
        get source() { return source; },
        get route() { return route; },
        get managedFailed() { return managedFailed; },
        start() {
            if (starting === undefined || startedGeneration !== hub.generation) {
                if (startedGeneration !== hub.generation) {
                    externalLoaded = false;
                    managedFailed = false;
                    injected = undefined;
                }
                startedGeneration = hub.generation;
                starting = select();
            }
            return starting;
        },
        async reconnect() {
            skipStoredCredential = false;
            epoch += 1;
            injected = undefined;
            notices.clear();
            try {
                config = rec(rec(await hub.call(CLIENT.configRead, { includeLayers: false, cwd: deps.cwd }))?.config);
            }
            catch {
                config = undefined;
                debug('codex auth: config/read failed; managed injection disabled');
            }
            startedGeneration = hub.generation;
            starting = select();
            await starting;
        },
        async status() {
            await runtime.start();
            const account = await runtime.account();
            const labels = {
                channel: codexText('codex-auth-source-channel', { name: deps.channel?.name ?? '' }),
                'dsh-auth': codexText('codex-auth-source-oauth'),
                'codex-login': codexText('codex-auth-source-native'),
                'api-key': codexText('codex-auth-source-api-key'),
                missing: codexText('codex-auth-source-missing'),
                unknown: codexText('codex-auth-source-unknown'),
            };
            return { lines: [labels[source], ...(account.subscription === undefined ? [] : [codexText('codex-auth-plan', { plan: account.subscription })]), ...(route.host === undefined ? [] : [codexText('codex-auth-host', { host: route.host })]), ...(!route.firstParty || deps.externalAllowed === false ? [codexText('codex-auth-route-blocked')] : []), ...[...notices.values()].map(notice => notice.text)] };
        },
        async account() {
            await readOwnAccount();
            return { provider: route.provider, tokenSource: source, ...(subscription === undefined ? {} : { subscription }) };
        },
        subscribe(listener) {
            listeners.add(listener);
            for (const notice of notices.values())
                listener(notice);
            return () => { listeners.delete(listener); };
        },
        async deviceLogin() {
            if (deps.channel !== undefined)
                throw new Error(codexText('codex-auth-channel-active'));
            let finish;
            const done = new Promise(resolve => { finish = resolve; });
            const early = [];
            let loginId;
            const complete = (params) => {
                if (params.loginId !== loginId)
                    return;
                off();
                if (params.success === true) {
                    disable();
                    managedFailed = false;
                    externalLoaded = false;
                    ownSource = 'codex-login';
                    source = 'codex-login';
                }
                finish(params.success === true);
            };
            const off = hub.onGlobal((method, params) => {
                if (method !== NOTIFY.accountLoginCompleted)
                    return;
                if (loginId === undefined)
                    early.push(params);
                else
                    complete(params);
            });
            try {
                const answer = rec(await hub.call(CLIENT.accountLoginStart, { type: 'chatgptDeviceCode' }));
                loginId = str(answer?.loginId);
                const verificationUrl = str(answer?.verificationUrl);
                const userCode = str(answer?.userCode);
                if (loginId === undefined || verificationUrl === undefined || userCode === undefined)
                    throw new Error('login failed');
                const url = new URL(verificationUrl);
                if (url.protocol !== 'https:' || !['auth.openai.com', 'chatgpt.com'].includes(url.hostname) || url.username !== '' || url.password !== '')
                    throw new Error('login failed');
                for (const params of early)
                    complete(params);
                const id = loginId;
                return {
                    loginId: id, verificationUrl, userCode, done,
                    async cancel() {
                        off();
                        finish(false);
                        try {
                            await hub.call(CLIENT.accountLoginCancel, { loginId: id });
                        }
                        catch {
                            debug('codex auth: device login cancel failed');
                        }
                    },
                };
            }
            catch {
                off();
                finish(false);
                throw new Error(codexText('codex-auth-login-failed'));
            }
        },
        async apiKeyLogin(apiKey) {
            if (deps.channel !== undefined)
                throw new Error(codexText('codex-auth-channel-active'));
            if (apiKey.trim() === '')
                throw new Error(codexText('codex-auth-api-key-required'));
            try {
                await hub.call(CLIENT.accountLoginStart, { type: 'apiKey', apiKey });
                disable();
                managedFailed = false;
                externalLoaded = false;
                ownSource = 'api-key';
                source = 'api-key';
            }
            catch {
                throw new Error(codexText('codex-auth-login-failed'));
            }
        },
    };
    return runtime;
}
const managed = new WeakMap();
/** All attached sessions share one login and one refresh handler per hub. */
export function acquireCodexAuth(deps) {
    let runtime = managed.get(deps.hub);
    if (runtime === undefined) {
        runtime = createCodexAuth(deps);
        managed.set(deps.hub, runtime);
    }
    return runtime;
}

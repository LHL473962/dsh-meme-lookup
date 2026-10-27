/** The only gate for injecting a dsh-auth ChatGPT token (§5.10).
 * Failed config/read and every non-first-party override fail closed. */
import { rec, str } from '../narrow.js';
/** A host-only diagnostic: never URL credentials, path, query or fragment. */
export function codexOriginHost(value) {
    if (typeof value !== 'string' || value === '')
        return undefined;
    try {
        return new URL(value).host || undefined;
    }
    catch {
        return undefined;
    }
}
function officialUrl(value) {
    if (value === undefined || value === null || value === '')
        return true;
    if (typeof value !== 'string')
        return false;
    try {
        const url = new URL(value);
        return url.protocol === 'https:' && (url.hostname === 'api.openai.com' || url.hostname === 'chatgpt.com')
            && (url.port === '' || url.port === '443') && url.username === '' && url.password === ''
            && !value.includes('?') && !value.includes('#') && !value.includes('\\');
    }
    catch {
        return false;
    }
}
/** config is the config/read response's config member, not its envelope. */
export function codexAuthRoute(config, env = {}, channelActive = false) {
    const provider = str(config?.model_provider) || 'openai';
    const providers = rec(config?.model_providers);
    const current = rec(providers?.[provider]);
    const environmentUrls = Object.entries(env).filter(([key, value]) => key.toUpperCase() === 'OPENAI_BASE_URL' && value !== undefined && value !== '').map(([, value]) => value);
    const host = codexOriginHost(current?.base_url ?? config?.openai_base_url ?? config?.chatgpt_base_url ?? environmentUrls[0]);
    const blocked = (reason) => ({ firstParty: false, provider, ...(host === undefined ? {} : { host }), reason });
    if (config === undefined)
        return blocked('config-unavailable');
    if (channelActive)
        return blocked('channel');
    if (provider !== 'openai' || (config.model_provider != null && typeof config.model_provider !== 'string'))
        return blocked('provider');
    const openai = providers?.openai;
    if ((config.model_providers != null && providers === undefined) || (openai != null && rec(openai) === undefined) || rec(openai)?.base_url != null)
        return blocked('provider-url');
    if (!officialUrl(config.openai_base_url) || !officialUrl(config.chatgpt_base_url))
        return blocked('base-url');
    if (!environmentUrls.every(officialUrl))
        return blocked('environment-url');
    return { firstParty: true, provider, host: host ?? 'chatgpt.com' };
}

import { asStoredCredential, CredentialFile, defaultCredentialsFile } from './oauth/credentials.js';
/** The provider's pi-ai OAuth `refresh`, loaded on first use. */
const piAiRefresh = async (provider, credential, signal) => {
    const [{ adapterBuiltinProviders }, { oauthOf }] = await Promise.all([
        import('./oauth/pi-ai.js'),
        import('./oauth/profiles.js'),
    ]);
    const route = adapterBuiltinProviders().find(candidate => candidate.id === provider);
    if (route === undefined)
        throw new Error(`dsh-auth: the installed pi-ai catalog ships no provider "${provider}"`);
    const refreshed = asStoredCredential(await oauthOf(route).refresh(credential, signal));
    if (refreshed === undefined)
        throw new Error(`dsh-auth: the ${provider} refresh returned an unusable credential`);
    return refreshed;
};
/** Refresh this long before the token expires (a turn must not start on a
 *  token that dies mid-request). */
const REFRESH_MARGIN_MS = 5 * 60_000;
/** Bound on one refresh round trip. */
const REFRESH_TIMEOUT_MS = 60_000;
/** The dsh-auth credential of one provider as a backend credential source. */
export function createOAuthCredentialSource(provider, options = {}) {
    const store = new CredentialFile(options.file ?? defaultCredentialsFile());
    const now = options.now ?? Date.now;
    const refresh = options.refresh ?? piAiRefresh;
    const access = (value) => {
        const credential = asStoredCredential(value);
        return credential === undefined ? undefined : { access: credential.access, expires: credential.expires };
    };
    return {
        async stored() {
            return access(await store.read(provider)) !== undefined;
        },
        async fresh(request = {}) {
            request.signal?.throwIfAborted();
            // Due: about to expire, or still the very token the backend refused.
            // A token that differs from the refused one was rotated by someone
            // else (a fresh `/login`, another request's refresh): use it as is.
            const due = (credential) => credential.expires - now() <= REFRESH_MARGIN_MS ||
                (request.rejected !== undefined && credential.access === request.rejected);
            const current = access(await store.read(provider));
            request.signal?.throwIfAborted();
            if (current === undefined)
                return undefined;
            if (!due(current))
                return current;
            // Re-read and refresh under the file's own lock (compare-and-swap): a
            // concurrent dsh-auth request or another process that already rotated
            // the token wins, and its credential is what comes back.
            const next = await store.modify(provider, async (stored) => {
                const credential = asStoredCredential(stored);
                if (credential === undefined)
                    return undefined;
                if (!due({ access: credential.access, expires: credential.expires }))
                    return undefined;
                const timeout = AbortSignal.timeout(REFRESH_TIMEOUT_MS);
                const signal = request.signal === undefined ? timeout : AbortSignal.any([request.signal, timeout]);
                signal.throwIfAborted();
                const refreshed = await refresh(provider, credential, signal);
                signal.throwIfAborted();
                return refreshed;
            });
            return access(next);
        },
    };
}

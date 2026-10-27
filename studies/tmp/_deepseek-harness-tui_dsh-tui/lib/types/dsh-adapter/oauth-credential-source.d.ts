/**
 * The host side of a backend's OAuth credential (`BackendHost.oauthCredential`):
 * the dsh-auth credential file, read and
 * refreshed through dsh-auth's own public pieces — `CredentialFile` (whose
 * `modify` serializes a refresh across requests and processes) and the
 * provider's pi-ai OAuth flow (`refresh`). Nothing here runs a login (that
 * stays dsh-auth's `/login` wizard) or logs token material.
 *
 * The file is the dsh-auth default location (`$DSH_AUTH_CREDENTIALS`, else
 * `$DSH_HOME/dsh-auth/credentials.json`, else `~/.dsh/…`); a custom
 * `credentialsFile` in the dsh-auth config row is not visible to this module
 * — set `DSH_AUTH_CREDENTIALS` to the same path.
 *
 * The pi-ai catalog is loaded only when a refresh is actually due: a backend
 * session whose token is still fresh never pays for it.
 *
 * A refresh is compare-and-swap: due only while the stored token is about to
 * expire or is still the one the backend refused, re-checked under the
 * credential file's lock right before the network call. Residual race: a
 * writer that rotates the token WITHOUT that lock (outside dsh-auth's
 * `CredentialFile`) can still interleave with a refresh here; closing it
 * would need dsh-auth itself to version its credentials.
 */
import type { OAuthCredentialSource } from '../agent/backend.js';
import { type StoredOAuthCredential } from './oauth/credentials.js';
/** One token refresh (default: the provider's own pi-ai OAuth flow). */
export type OAuthRefresh = (provider: string, credential: StoredOAuthCredential, signal: AbortSignal) => Promise<StoredOAuthCredential>;
/** The dsh-auth credential of one provider as a backend credential source. */
export declare function createOAuthCredentialSource(provider: string, options?: {
    readonly file?: string;
    readonly now?: () => number;
    readonly refresh?: OAuthRefresh;
}): OAuthCredentialSource;
//# sourceMappingURL=oauth-credential-source.d.ts.map
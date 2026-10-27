/**
 * File-backed OAuth credential persistence: a pi-ai `CredentialStore` over
 * one JSON document, one credential per provider id.
 *
 * Writes are atomic (temp file + rename) with 0700 directory / 0600 file
 * permissions best-effort on every platform. Mutations share an in-process
 * queue and a cross-process file lock; pi-ai runs its OAuth refresh *inside*
 * {@link CredentialFile.modify}, so the exclusion also keeps concurrent
 * requests from double-refreshing a rotated token. The file is the single
 * source of truth;
 * nothing here ever logs token material, and {@link CredentialFile.describe}
 * reports only non-secret metadata for status surfaces.
 *
 * @module @deepseek-harness-tui/dsh-tui/oauth/credentials
 */
import type { PiAiCredential, PiAiCredentialInfo, PiAiCredentialStore } from './pi-ai.js';
/** The stored credential shape: a pi-ai `OAuthCredential`. */
export type StoredOAuthCredential = Extract<PiAiCredential, {
    type: 'oauth';
}>;
/** Narrow an unknown parsed value into a stored credential, or reject it. */
export declare function asStoredCredential(value: unknown): StoredOAuthCredential | undefined;
/** Default credential file location: `$DSH_HOME/dsh-auth/credentials.json` (or `~/.dsh/…`). */
export declare function defaultCredentialsFile(): string;
/**
 * The credential file. IO failures throw (loud, naming the path) rather than
 * degrading to an empty store: silently treating a corrupt or unreadable
 * credential file as "signed out everywhere" would strand every route behind
 * a fresh login for no reason.
 */
export declare class CredentialFile implements PiAiCredentialStore {
    readonly path: string;
    /** One document needs one read-modify-write queue, regardless of provider. */
    private pending;
    private deviceId;
    constructor(path: string);
    /** Stable per-store UUID for pi-ai's OpenAI ChatGPT agent-host identity. */
    getOrCreateDeviceId(): string;
    /** The stored credential for one provider, possibly expired. */
    read(providerId: string): Promise<PiAiCredential | undefined>;
    /** Stored credential metadata without resolving or exposing secrets. */
    list(): Promise<readonly PiAiCredentialInfo[]>;
    /**
     * Serialized read-modify-write for one provider. `fn` sees the current
     * credential; returning a new credential persists it, returning
     * `undefined` leaves the entry unchanged. Resolves with the post-write
     * credential. Rejections from `fn` propagate without touching the file.
     */
    modify(providerId: string, fn: (current: PiAiCredential | undefined) => Promise<PiAiCredential | undefined>): Promise<PiAiCredential | undefined>;
    /** Remove one provider's credential (logout). */
    delete(providerId: string): Promise<void>;
    /** Non-secret metadata for every stored credential, for status surfaces. */
    describe(): Promise<readonly {
        provider: string;
        expiresAt: number;
        expired: boolean;
    }[]>;
    /** Keep the entire read-modify-rename cycle exclusive across processes. */
    private chain;
    private load;
    private save;
}
//# sourceMappingURL=credentials.d.ts.map
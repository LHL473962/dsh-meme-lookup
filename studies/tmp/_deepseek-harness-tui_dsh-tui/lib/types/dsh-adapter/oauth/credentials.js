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
import { randomUUID } from 'node:crypto';
import { mkdirSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { homedir } from 'node:os';
import { withFileLock } from '@deepseek-ai/dsh-atomic-write';
/** Narrow an unknown parsed value into a stored credential, or reject it. */
export function asStoredCredential(value) {
    if (typeof value !== 'object' || value === null)
        return undefined;
    const record = value;
    if (record['type'] !== 'oauth')
        return undefined;
    if (typeof record['access'] !== 'string' || typeof record['refresh'] !== 'string')
        return undefined;
    if (typeof record['expires'] !== 'number' || !Number.isFinite(record['expires']))
        return undefined;
    return value;
}
/** Default credential file location: `$DSH_HOME/dsh-auth/credentials.json` (or `~/.dsh/…`). */
export function defaultCredentialsFile() {
    const override = process.env['DSH_AUTH_CREDENTIALS'];
    if (override !== undefined && override !== '')
        return override;
    const root = process.env['DSH_HOME'] ?? join(homedir(), '.dsh');
    return join(root, 'dsh-auth', 'credentials.json');
}
const EMPTY_DOCUMENT = { version: 1, providers: {} };
const DEVICE_ID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/iu;
/**
 * The credential file. IO failures throw (loud, naming the path) rather than
 * degrading to an empty store: silently treating a corrupt or unreadable
 * credential file as "signed out everywhere" would strand every route behind
 * a fresh login for no reason.
 */
export class CredentialFile {
    path;
    /** One document needs one read-modify-write queue, regardless of provider. */
    pending = Promise.resolve();
    deviceId;
    constructor(path) {
        this.path = path;
    }
    /** Stable per-store UUID for pi-ai's OpenAI ChatGPT agent-host identity. */
    getOrCreateDeviceId() {
        if (this.deviceId !== undefined)
            return this.deviceId;
        const path = join(dirname(this.path), 'device-id');
        let value;
        try {
            value = readFileSync(path, 'utf8');
        }
        catch (error) {
            if (error?.code !== 'ENOENT') {
                throw new Error(`dsh-auth: cannot read device ID file ${path}: ${String(error)}`);
            }
            mkdirSync(dirname(path), { recursive: true, mode: 0o700 });
            try {
                writeFileSync(path, `${randomUUID()}\n`, { flag: 'wx', mode: 0o600 });
            }
            catch (writeError) {
                // A second process may have created the same installation ID first.
                if (writeError?.code !== 'EEXIST') {
                    throw new Error(`dsh-auth: cannot write device ID file ${path}: ${String(writeError)}`);
                }
            }
            try {
                value = readFileSync(path, 'utf8');
            }
            catch (readError) {
                throw new Error(`dsh-auth: cannot read device ID file ${path}: ${String(readError)}`);
            }
        }
        const id = value.trim();
        if (!DEVICE_ID_PATTERN.test(id)) {
            throw new Error(`dsh-auth: device ID file ${path} is not a UUID; fix or remove it by hand`);
        }
        this.deviceId = id;
        return id;
    }
    /** The stored credential for one provider, possibly expired. */
    async read(providerId) {
        return (await this.load()).providers[providerId];
    }
    /** Stored credential metadata without resolving or exposing secrets. */
    async list() {
        const document = await this.load();
        return Object.entries(document.providers).map(([providerId, credential]) => ({
            providerId,
            type: credential.type,
        }));
    }
    /**
     * Serialized read-modify-write for one provider. `fn` sees the current
     * credential; returning a new credential persists it, returning
     * `undefined` leaves the entry unchanged. Resolves with the post-write
     * credential. Rejections from `fn` propagate without touching the file.
     */
    async modify(providerId, fn) {
        return this.chain(async () => {
            const document = await this.load();
            const current = document.providers[providerId];
            const replacement = await fn(current);
            if (replacement === undefined || replacement === current)
                return current;
            if (replacement.type !== 'oauth') {
                throw new Error(`dsh-auth: refusing to store a "${replacement.type}" credential for "${providerId}" — this store holds OAuth credentials only`);
            }
            await this.save({ ...document, providers: { ...document.providers, [providerId]: replacement } });
            return replacement;
        });
    }
    /** Remove one provider's credential (logout). */
    async delete(providerId) {
        await this.chain(async () => {
            const document = await this.load();
            if (!(providerId in document.providers))
                return;
            const providers = { ...document.providers };
            delete providers[providerId];
            await this.save({ ...document, providers });
        });
    }
    /** Non-secret metadata for every stored credential, for status surfaces. */
    async describe() {
        const document = await this.load();
        const now = Date.now();
        return Object.entries(document.providers)
            .filter((entry) => entry[1].type === 'oauth')
            .map(([provider, credential]) => ({
            provider,
            expiresAt: credential.expires,
            expired: credential.expires <= now,
        }));
    }
    /** Keep the entire read-modify-rename cycle exclusive across processes. */
    chain(operation) {
        const run = this.pending.then(() => {
            mkdirSync(dirname(this.path), { recursive: true, mode: 0o700 });
            // pi-ai may refresh a token over the network while holding this lock.
            return withFileLock(this.path, operation, { waitMs: 120_000 });
        });
        this.pending = run.then(() => undefined, () => undefined);
        return run;
    }
    async load() {
        let text;
        try {
            text = readFileSync(this.path, 'utf8');
        }
        catch (error) {
            if (error?.code === 'ENOENT') {
                return EMPTY_DOCUMENT;
            }
            throw new Error(`dsh-auth: cannot read credential file ${this.path}: ${String(error)}`);
        }
        let parsed;
        try {
            parsed = JSON.parse(text);
        }
        catch (error) {
            throw new Error(`dsh-auth: credential file ${this.path} is not valid JSON (${String(error)}); `
                + 'fix or remove the file by hand — it will not be overwritten silently');
        }
        if (typeof parsed !== 'object' || parsed === null) {
            throw new Error(`dsh-auth: credential file ${this.path} has an unexpected shape; fix or remove it by hand`);
        }
        const record = parsed;
        if (record['version'] !== 1 || typeof record['providers'] !== 'object' || record['providers'] === null) {
            throw new Error(`dsh-auth: credential file ${this.path} has an unexpected shape; fix or remove it by hand`);
        }
        const providers = {};
        for (const [provider, value] of Object.entries(record['providers'])) {
            const credential = asStoredCredential(value);
            if (credential === undefined) {
                throw new Error(`dsh-auth: credential file ${this.path} holds an invalid entry for "${provider}"; fix or remove it by hand`);
            }
            providers[provider] = credential;
        }
        return { version: 1, providers };
    }
    async save(document) {
        const text = JSON.stringify(document, null, 2) + '\n';
        const directory = dirname(this.path);
        const temporary = join(directory, `.${Math.random().toString(36).slice(2)}.tmp`);
        try {
            writeFileSync(temporary, text, { mode: 0o600 });
            renameSync(temporary, this.path);
        }
        catch (error) {
            throw new Error(`dsh-auth: cannot write credential file ${this.path}: ${String(error)}`);
        }
    }
}

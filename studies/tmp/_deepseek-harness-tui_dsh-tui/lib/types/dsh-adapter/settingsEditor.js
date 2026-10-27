/** Read a nested value by path (array indexes as strings). */
export function getPath(value, path) {
    let current = value;
    for (const key of path) {
        if (Array.isArray(current)) {
            current = current[Number(key)];
            continue;
        }
        if (typeof current !== 'object' || current === null)
            return undefined;
        current = current[key];
    }
    return current;
}
/**
 * Whether a value explicitly carries the path — its presence marks a user
 * override, independent of the value stored there.
 */
export function hasPath(value, path) {
    if (path.length === 0)
        return value !== undefined;
    const parent = getPath(value, path.slice(0, -1));
    const key = path[path.length - 1];
    if (Array.isArray(parent))
        return Number(key) < parent.length;
    if (typeof parent !== 'object' || parent === null)
        return false;
    return key in parent;
}
/** Default draft text for a kind; the empty string when the section carries none. */
function defaultFormat(field, value) {
    if (field.format)
        return field.format(value);
    if (value === undefined || value === null)
        return '';
    switch (field.kind) {
        case 'number':
            return typeof value === 'number' ? String(value) : '';
        case 'boolean':
            return value === true ? 'true' : 'false';
        default:
            return typeof value === 'string' ? value : String(value);
    }
}
/** Default write for a kind: an empty text/number draft stages a clear. */
function defaultParse(field, text) {
    if (field.parse)
        return field.parse(text);
    const trimmed = text.trim();
    switch (field.kind) {
        case 'number': {
            if (trimmed === '')
                return { kind: 'clear' };
            const value = Number(trimmed);
            return Number.isFinite(value) ? { kind: 'set', value } : undefined;
        }
        case 'boolean':
            return { kind: 'set', value: trimmed === 'true' };
        case 'select':
            return field.options?.some(option => option.value === trimmed)
                ? { kind: 'set', value: trimmed }
                : undefined;
        default:
            return trimmed === '' ? { kind: 'clear' } : { kind: 'set', value: text };
    }
}
/** Key addressing one field inside a form: its path joined. */
function fieldKey(field) {
    return field.path.join('.');
}
/**
 * The staged form over one settings namespace's declared fields. The screen
 * re-seeds it from a fresh namespace view after every save and whenever the
 * underlying document changes.
 */
export class SettingsForm {
    host;
    view;
    fields;
    edits = new Map();
    saving = false;
    failed = false;
    failureMessage = undefined;
    constructor(host, view, fields) {
        this.host = host;
        this.view = view;
        this.fields = fields;
    }
    get available() {
        return this.view !== undefined;
    }
    /** The namespace view the form was seeded from (undefined = not served). */
    get namespace() {
        return this.view;
    }
    field(field) {
        const key = fieldKey(field);
        const staged = this.edits.get(key);
        if (field.secret !== undefined) {
            // A credential literal never seeds a draft: blank until typed, and a
            // blank draft writes nothing.
            return { text: staged?.text ?? '', overridden: false, invalid: false };
        }
        if (staged !== undefined) {
            const write = defaultParse(field, staged.text);
            return {
                text: staged.text,
                overridden: write?.kind === 'set',
                invalid: write === undefined,
            };
        }
        return {
            text: defaultFormat(field, this.view ? getPath(this.view.value, field.path) : undefined),
            overridden: this.view !== undefined && hasPath(this.view.user, field.path),
            invalid: false,
        };
    }
    shell() {
        let invalid = false;
        for (const field of this.fields) {
            if (this.field(field).invalid)
                invalid = true;
        }
        return {
            available: this.available,
            dirty: this.edits.size > 0,
            invalid,
            saving: this.saving,
            failed: this.failed,
            failureMessage: this.failed ? this.failureMessage : undefined,
        };
    }
    /** Whether the field holds a staged (unsaved) edit. */
    isStaged(field) {
        return this.edits.has(fieldKey(field));
    }
    /** Stage draft text for one field. */
    edit(field, text) {
        this.edits.set(fieldKey(field), { text, clear: false });
        this.clearFailure();
    }
    /** Stage a clear, so saving lets the field re-inherit the composition layer. */
    resetField(field) {
        this.edits.set(fieldKey(field), { text: '', clear: true });
        this.clearFailure();
    }
    /** Drop every staged edit. */
    discard() {
        this.edits.clear();
        this.clearFailure();
    }
    /** A new edit or save cycle retires the last failure's explanation. */
    clearFailure() {
        this.failed = false;
        this.failureMessage = undefined;
    }
    /** Whether any staged draft is invalid, which blocks the save. */
    get invalid() {
        return this.shell().invalid;
    }
    /**
     * Write every staged edit. Settings fields land as one revision-fenced
     * `mutate` (one retry on a stale-revision conflict); credential fields
     * write through the credentials seam. Resolves to whether every write
     * landed — the caller re-seeds from a fresh namespace view afterwards.
     *
     * Only the edits THIS save snapshotted are cleared on success, and only
     * when they are still the same edit: a draft typed while the write was in
     * flight is a newer object and survives — it was never written, so it must
     * not be silently dropped.
     */
    async save() {
        if (this.view === undefined || this.invalid || this.saving)
            return false;
        const ns = this.view.ns;
        const snapshot = new Map(this.edits);
        const ops = [];
        const secrets = [];
        for (const field of this.fields) {
            const staged = snapshot.get(fieldKey(field));
            if (staged === undefined)
                continue;
            if (field.secret !== undefined) {
                // Blank drafts write nothing; typed drafts replace the credential.
                if (staged.text !== '')
                    secrets.push({ ref: field.secret.ref, text: staged.text, field });
                continue;
            }
            const write = staged.clear ? { kind: 'clear' } : defaultParse(field, staged.text);
            if (write === undefined)
                return false;
            ops.push(write.kind === 'clear'
                ? { op: 'unset', path: field.path }
                : { op: 'set', path: field.path, value: write.value });
        }
        this.saving = true;
        this.clearFailure();
        try {
            if (ops.length > 0) {
                try {
                    await this.host.write(ns, ops, this.view.revision);
                }
                catch (error) {
                    // One retry on a stale-revision conflict (a concurrent write landed
                    // between seed and save); anything else propagates.
                    if (error?.code !== 'SETTINGS_CONFLICT')
                        throw error;
                    const fresh = this.host.listNamespaces().find(entry => entry.ns === ns);
                    await this.host.write(ns, ops, fresh?.revision);
                }
            }
            for (const secret of secrets) {
                await this.host.writeCredential(secret.ref, secret.text, secret.field.secret?.authorization);
            }
            for (const [key, edit] of snapshot) {
                if (this.edits.get(key) === edit)
                    this.edits.delete(key);
            }
            this.failed = false;
            return true;
        }
        catch (error) {
            this.failed = true;
            // Guarded rejections (reserved credential refs, …) carry their own
            // localized explanation — keep it for the screen to show verbatim
            // instead of a generic "save failed".
            this.failureMessage = error instanceof Error && error.message !== '' ? error.message : undefined;
            return false;
        }
        finally {
            this.saving = false;
        }
    }
    /** Whether any layer supplies the credential a secret field addresses. */
    credentialConfigured(field) {
        return field.secret === undefined ? Promise.resolve(false) : this.host.credentialConfigured(field.secret.ref);
    }
}

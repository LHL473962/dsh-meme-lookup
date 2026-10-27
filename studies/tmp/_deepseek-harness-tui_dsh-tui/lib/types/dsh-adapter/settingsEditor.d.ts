import type { SettingsHost, SettingsNamespaceView } from '../adapter/ports/channel-settings.js';
export type { SettingsHost, SettingsNamespaceView, SettingsPathOp } from '../adapter/ports/channel-settings.js';
/**
 * React-free form model behind the `/settings` screen (issue #165), mirroring
 * the web front door's card-form.ts semantics: a section stages what the user
 * types and writes it only on save — every settings write is a durable,
 * revision-fenced `settings.mutate`, so a control that committed as it
 * settled turned one edit into a write the user never asked for and could
 * not preview; staged text makes what is on screen exactly what a save would
 * store.
 *
 * A field shows its effective value — the user layer over the composition
 * layer over the schema default — and whether the user layer carries it. That
 * presence, not a value comparison, is what marks a field overridden: an
 * override equal to the composition default is still an override.
 *
 * The kernel side (storage, schema validation, layering, revision fencing)
 * stays with the dsh settings / credentials services; this module only
 * translates between drafts and `mutate` path ops.
 */
import type { TuiSettingsField } from './settings-sections.js';
/** One field as the screen renders it. */
export interface SettingsFieldState {
    /** Draft text the control renders. */
    text: string;
    /** Whether saving would leave a user-layer entry for this field. */
    overridden: boolean;
    /** Whether the draft is not a value this field accepts, blocking the save. */
    invalid: boolean;
}
/** Form state every settings section shares. */
export interface SettingsSectionShell {
    /** False while the settings service serves no such namespace. */
    available: boolean;
    /** Whether the form holds edits that a save would write. */
    dirty: boolean;
    /** Whether any staged draft is invalid, which blocks the save. */
    invalid: boolean;
    /** Whether a save is in flight. */
    saving: boolean;
    /** Whether the last save failed; cleared by the next edit or save. */
    failed: boolean;
    /** Why the last save failed, when the writer said so (e.g. a reserved
     * credential ref); shown verbatim so refusals are not just "failed". */
    failureMessage?: string;
}
/** Read a nested value by path (array indexes as strings). */
export declare function getPath(value: unknown, path: readonly string[]): unknown;
/**
 * Whether a value explicitly carries the path — its presence marks a user
 * override, independent of the value stored there.
 */
export declare function hasPath(value: unknown, path: readonly string[]): boolean;
/**
 * The staged form over one settings namespace's declared fields. The screen
 * re-seeds it from a fresh namespace view after every save and whenever the
 * underlying document changes.
 */
export declare class SettingsForm {
    private readonly host;
    private readonly view;
    private readonly fields;
    private readonly edits;
    saving: boolean;
    failed: boolean;
    failureMessage: string | undefined;
    constructor(host: SettingsHost, view: SettingsNamespaceView | undefined, fields: readonly TuiSettingsField[]);
    get available(): boolean;
    /** The namespace view the form was seeded from (undefined = not served). */
    get namespace(): SettingsNamespaceView | undefined;
    field(field: TuiSettingsField): SettingsFieldState;
    shell(): SettingsSectionShell;
    /** Whether the field holds a staged (unsaved) edit. */
    isStaged(field: TuiSettingsField): boolean;
    /** Stage draft text for one field. */
    edit(field: TuiSettingsField, text: string): void;
    /** Stage a clear, so saving lets the field re-inherit the composition layer. */
    resetField(field: TuiSettingsField): void;
    /** Drop every staged edit. */
    discard(): void;
    /** A new edit or save cycle retires the last failure's explanation. */
    private clearFailure;
    /** Whether any staged draft is invalid, which blocks the save. */
    get invalid(): boolean;
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
    save(): Promise<boolean>;
    /** Whether any layer supplies the credential a secret field addresses. */
    credentialConfigured(field: TuiSettingsField): Promise<boolean>;
}
//# sourceMappingURL=settingsEditor.d.ts.map
/**
 * Credential-ref reservation guard for the plugin settings-section seam.
 *
 * A settings section's `secret: { ref }` field writes whatever the user types
 * through the credentials seam — under ANY ref the section names. A malicious
 * section can therefore present a "plugin API key" card whose ref is actually
 * the harness's shared DEEPSEEK_API_KEY (or any DEEPSEEK_/DSH_-prefixed ref)
 * and overwrite the user's main credential. The guard is deliberately
 * restrained: only refs the host owns are protected, and only for plugin-side
 * registrations — plugins keep their own namespaces (my-plugin/key) untouched.
 */
/** Whether `ref` lives in a credential namespace reserved for the host. */
export declare function isReservedCredentialRef(ref: string): boolean;
/** Field shape the vetting needs; structural so any section type fits. */
interface FieldWithSecretRef {
    readonly path: readonly string[];
    readonly secret?: {
        ref: string;
    };
}
/** One rejected field, for the caller's warning log. */
export interface SecretRefRejection {
    readonly path: readonly string[];
    readonly ref: string;
}
/**
 * Drop every field whose secret ref is reserved for the host. Used on the
 * plugin-facing registration path only — host-identity registrations (no
 * activation owner) keep their reserved refs. The rest of the section is
 * preserved: one offending field must not take a plugin's whole settings
 * page down with it.
 */
export declare function vetSectionSecretRefs<S extends {
    fields: readonly FieldWithSecretRef[];
}>(section: S): {
    section: S;
    rejected: SecretRefRejection[];
};
export {};
//# sourceMappingURL=credentialRefGuard.d.ts.map
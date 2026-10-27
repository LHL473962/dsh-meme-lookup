/**
 * The panel's own "switched off" set for plugin-provided skills.
 *
 * A skill whose instruction file comes from a plugin provider — the registry
 * reports `SkillSummary.path`, but the file sits outside every skill root this
 * panel scans — has no writable path, so the SKILL.md frontmatter switch the
 * other rows use cannot address it (and offering that switch would only produce
 * a 404). This store is the plugin's own answer: one small JSON document under
 * `$DSH_HOME/dsh-skill-explorer/` listing the provider-backed skills the user
 * switched off in the panel, keyed by the stable pair (provider, skill name).
 *
 * It is a PANEL-LOCAL decision: the host registry still loads the skill, so the
 * panel copy and the README say so plainly instead of pretending the model
 * stopped receiving it. What the store does change is this panel's invocable
 * view (see applyProviderToggles in collect.ts), which is the scope the issue
 * accepts.
 *
 * Writes are atomic (unique temp file, fsync, rename), so an interrupted write
 * can never leave a half-written document behind.
 */
/**
 * Stable identity of one plugin-provided skill in this store.
 *
 * The name alone is not enough: the registry merges by name, but two providers
 * can each supply a file for the same name, and only the pair identifies which
 * one a row shows. An absent provider normalizes to the empty string so the
 * same skill always maps to the same record.
 */
export interface ProviderSkillIdentity {
    /** Official skill name (the grammar isSkillName enforces). */
    name: string;
    /** Provider id as the registry reports it ('' when it reports none). */
    provider: string;
}
/** The stored document: the provider-backed skills the user switched off. */
export interface ProviderToggleDocument {
    version: 1;
    disabled: ProviderSkillIdentity[];
}
/** Store file location: $DSH_HOME/dsh-skill-explorer/provider-toggles.json. */
export declare function providerToggleFile(dshHome: string): string;
/** The document a panel that has never been switched off reads as. */
export declare function emptyProviderToggles(): ProviderToggleDocument;
/**
 * Normalize a submitted identity, or reject it.
 *
 * The name must satisfy the official skill grammar (the same one the scan and
 * the file write routes apply), and the provider must be a short id: both are
 * written into the store verbatim, so an unbounded or ungrammatical value would
 * be a record no row could ever match.
 * @param name - candidate skill name from the panel.
 * @param provider - candidate provider id (optional).
 * @returns the normalized identity, or undefined when it is not storable.
 */
export declare function providerSkillIdentity(name: string, provider?: string): ProviderSkillIdentity | undefined;
/**
 * Tolerant deserialize: a missing, corrupt, or foreign document reads as "no
 * skill switched off", which is the state a fresh install is in. Records that
 * no row could match (an ungrammatical name, an over-long provider id, a
 * duplicate) are dropped rather than carried forward.
 * @param raw - file text.
 * @returns the usable records, de-duplicated, bounded and sorted.
 */
export declare function deserializeProviderToggles(raw: string): ProviderToggleDocument;
/** Serialize the document in the shape deserializeProviderToggles accepts. */
export declare function serializeProviderToggles(doc: ProviderToggleDocument): string;
/**
 * Read the store for a panel request.
 *
 * An unreadable file degrades to the empty document on purpose: the panel then
 * shows every provider skill as enabled, which is the state before the user
 * ever used the switch, instead of failing the whole list route.
 * @param dshHome - the DSH home root.
 * @returns the records the panel currently honors.
 */
export declare function readProviderToggles(dshHome: string): Promise<ProviderToggleDocument>;
/**
 * Record (or clear) the panel-local switch for one provider-backed skill.
 *
 * Both directions are idempotent: switching the same skill off twice keeps one
 * record instead of stacking duplicates, and switching on a skill that is not
 * stored leaves the file untouched. A no-op write is skipped so an unchanged
 * panel never rewrites the document.
 * @param dshHome - the DSH home root.
 * @param identity - the normalized provider-backed skill identity.
 * @param enabled - true to enable (drop the record), false to disable.
 * @returns the document as it stands after the call.
 */
export declare function setProviderSkillEnabled(dshHome: string, identity: ProviderSkillIdentity, enabled: boolean): Promise<ProviderToggleDocument>;

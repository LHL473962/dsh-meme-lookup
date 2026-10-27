/** The truth API the model list consumes (structural: no import cycle). */
export interface ModelEnvTruth {
    /** The model the channel actually routes `requestedId` to, when the
     *  configuration says it differs; undefined = display as-is. */
    actualFor(requestedId: string): string | undefined;
}
/**
 * The active channel profile's mapping (channels.ts): `models` are exact
 * requested-id → actual entries (matched exactly, then base-normalized);
 * `tiers` map a tier keyword (haiku/opus/sonnet/fable, plus the reserved
 * `default` for the any-model rule) to the model serving it — the settings
 * env heuristics promoted to the user's own data, so they outrank both the
 * legacy model-names.json and the env itself.
 */
export interface ChannelModelSource {
    readonly models?: Readonly<Record<string, string>>;
    readonly tiers?: Readonly<Record<string, string>>;
}
/** Read the env the CLI applies from `<configDir>/settings.json` (best-effort:
 *  absent/unreadable/malformed means no values, never an error). */
export declare function readSettingsEnvForModels(configDir: string): Record<string, string | undefined>;
/**
 * The user-maintained local map, `<DATA_DIR>/backends/claude/model-names.json`
 * (`{ "claude-opus-5-5[1m]": "glm-5.3[1M]", ... }`): ids a relay channel
 * disguises → the name to display. Optional and additive on top of the
 * settings env tiers; checked first so a hand-written entry always wins
 * (the /provider-style escape hatch when the channel tool renames its env
 * shape). Best-effort: absent/unreadable/malformed reads as no entries.
 */
export declare function readLocalModelNames(dir: string): Readonly<Record<string, string>>;
/** Build the channel-model truth from the tier env the caller resolved
 *  (mergedModelEnv — the CLI's own three-layer order, see there) plus the
 *  optional local model-names.json map, which outranks it — and the active
 *  channel profile (channels.ts), which outranks everything. */
export declare function readModelEnvTruth(env: Record<string, string | undefined>, localNames?: Readonly<Record<string, string>>, channel?: ChannelModelSource): ModelEnvTruth;
/**
 * Whether the env the CLI child runs with already routes to `model`
 * through its model slots: some slot's value — compared as base ids,
 * `[1M]`-style suffixes and letter case ignored — names the same model.
 * The session's explicit `model` query parameter can then be omitted:
 * the CLI's SDK path (2.1.284+) resolves an explicit model against the
 * bundled official catalog and fail-fasts a non-official name (a relay
 * model) as `[claude-code:unrecognized_model]`, while the same name in
 * an env slot routes fine — the parameter would only add a failing
 * catalog check on top of routing that already serves that model.
 */
export declare function envSlotsServeModel(env: Record<string, string | undefined>, model: string): boolean;
/** The env the CLI child actually applies, in the CLI's own order: keys
 *  the TUI put in the flag layer (`injectedKeys`: the channel connection,
 *  the first-party pin) > the settings file's `env` > the inherited env.
 *  The CLI applies the settings `env` over the environment it inherited, so
 *  an inherited key only fills gaps. Empty live values never clobber
 *  anything. */
export declare function mergedModelEnv(configDir: string, liveEnv: Readonly<Record<string, string | undefined>>, injectedKeys?: ReadonlySet<string>): Record<string, string | undefined>;
/** The env "import from settings" reads: the settings file plus the
 *  inherited environment (settings first), without the TUI's own
 *  injections. Reading those back would import the channel the TUI itself
 *  activated: switch settings to relay B, import, get relay A back. */
export declare function importedModelEnv(configDir: string, liveEnv: Readonly<Record<string, string | undefined>>, injectedKeys?: ReadonlySet<string>): Record<string, string | undefined>;
/** One-shot wiring for the session: settings env of `configDir` + live env
 *  (the CLI's flag > settings > inherited order), the optional local
 *  model-names.json map, and the active channel profile. */
export declare function modelTruthFrom(configDir: string, liveEnv: Readonly<Record<string, string | undefined>>, localNames?: Readonly<Record<string, string>>, channel?: ChannelModelSource, injectedKeys?: ReadonlySet<string>): ModelEnvTruth;
//# sourceMappingURL=modelEnv.d.ts.map
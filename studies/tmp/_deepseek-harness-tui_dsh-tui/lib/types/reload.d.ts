/**
 * `/reload` planning — the pi-style soft reload: re-read the TUI's persisted
 * preference files (`~/.dsh-tui/{theme,lang,agent-preset,model,
 * working-activity}.json`) and decide what to re-apply live, honoring the
 * same boot-time precedence every picker does:
 *
 *   - theme:    DSH_TUI_THEME wins; else theme.json.
 *   - lang:     DSH_TUI_LANG > settings `dsh-tui.lang` (folded in by the
 *               caller as `langOverriddenBySettings`) > cordis.yml `lang`
 *               > lang.json.
 *   - preset:   DSH_TUI_PRESET wins; else agent-preset.json (the cordis.yml
 *               `preset` is only the deployment default).
 *   - model:    model.json whole (issue #67 — a cordis.yml pair is only the
 *               deployment default); nothing to apply without it.
 *   - activity: cordis.yml `activityFrames` wins; else
 *               working-activity.json.
 *
 * Settings-namespace values (settings.yaml user layer) are deliberately NOT
 * re-read here: the dsh-tui namespace applies live through its settings
 * watch and hot-reloads its document through the platform's file watcher,
 * so /reload only needs the five boot-only pref files. What no reload can
 * re-read (cordis.yml root config, frozen fullscreen layout, newly built
 * code) is the job of `/restart`.
 *
 * Pure and injectable so scripts/verify-reload.ts can exercise every branch
 * without a UI or a file system.
 */
import type { Lang } from './i18n.js';
import type { ModelPref } from './modelPrefs.js';
import type { ModelRoute } from './modelRoute.js';
/** The five boot-only preference surfaces /reload re-reads. */
export type ReloadKind = 'theme' | 'lang' | 'preset' | 'model' | 'activity';
export type ReloadSkipReason = 
/** A launch-time environment variable pins the value (DSH_TUI_THEME / DSH_TUI_LANG). */
'env-wins'
/** cordis.yml or the settings user layer pins the value; the pref must not override it. */
 | 'config-wins'
/** The pref file is missing or unparsable. */
 | 'invalid';
/** One live change /reload applies. Kind `model` carries the route halves. */
export interface ReloadApply {
    kind: ReloadKind;
    /** The live value before this reload. */
    from: string;
    /** The value the pref file now names. */
    to: string;
    /** Present for kind `model`: the full route halves to switch to. */
    route?: ModelRoute;
}
/** A pref /reload did not apply, and why. */
export interface ReloadSkip {
    kind: ReloadKind;
    reason: ReloadSkipReason;
}
/** What one /reload run decided, before any side effects. */
export interface ReloadPlan {
    /** Apply these in order (theme → lang → preset → model → activity). */
    apply: ReloadApply[];
    /** Pref files whose value already matches the live state. */
    unchanged: ReloadKind[];
    /** Pref files not applied, and why. */
    skipped: ReloadSkip[];
}
/** Everything the planner needs — caller reads the files and live values. */
export interface ReloadInput {
    /** DSH_TUI_THEME, when it holds a valid theme name. */
    envTheme?: string;
    /** DSH_TUI_LANG, when it holds a valid language. */
    envLang?: string;
    /** Fresh readThemePref(). */
    themePref?: string;
    /** The live theme name (ThemeProvider state). */
    currentTheme: string;
    /** Fresh readLangPref(). */
    langPref?: Lang;
    /** The live UI language. */
    currentLang: Lang;
    /** True when the settings user layer (settings.yaml `dsh-tui.lang`) pins a language. */
    langOverriddenBySettings: boolean;
    /** cordis.yml's raw `lang` key, when set. */
    configuredLang?: string;
    /** A `DSH_TUI_PRESET` launch instruction, when set (pins this run). */
    envPreset?: string;
    /** Fresh readPresetPref(). */
    presetPref?: string;
    /** The live preset id (channel.agentPreset; undefined = roster default). */
    currentPreset?: string;
    /** Fresh readModelPref(). */
    modelPref?: ModelPref;
    /** The live route (channel provider/model). */
    currentModel?: ModelRoute;
    /** cordis.yml's explicit `activityFrames` key, when set. */
    configuredActivity?: string;
    /** Fresh readActivityFrames(). */
    activityPref?: string;
    /** The live activity preset (channel.activityFrames). */
    currentActivity?: string;
}
/**
 * Decide what one /reload applies. Pure: returns the plan, never touches
 * the UI or the channel. The caller executes `apply` in order and renders
 * the report.
 */
export declare function planReload(input: ReloadInput): ReloadPlan;
//# sourceMappingURL=reload.d.ts.map
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
/**
 * Decide what one /reload applies. Pure: returns the plan, never touches
 * the UI or the channel. The caller executes `apply` in order and renders
 * the report.
 */
export function planReload(input) {
    const apply = [];
    const unchanged = [];
    const skipped = [];
    // Theme: env override wins at launch; else the persisted choice.
    if (input.envTheme !== undefined) {
        skipped.push({ kind: 'theme', reason: 'env-wins' });
    }
    else if (input.themePref === undefined) {
        skipped.push({ kind: 'theme', reason: 'invalid' });
    }
    else if (input.themePref === input.currentTheme) {
        unchanged.push('theme');
    }
    else {
        apply.push({ kind: 'theme', from: input.currentTheme, to: input.themePref });
    }
    // Language: env, then the settings user layer, then cordis.yml, then the
    // persisted choice — mirror the boot precedence in plugin.apply.
    if (input.envLang !== undefined) {
        skipped.push({ kind: 'lang', reason: 'env-wins' });
    }
    else if (input.langOverriddenBySettings || input.configuredLang !== undefined) {
        skipped.push({ kind: 'lang', reason: 'config-wins' });
    }
    else if (input.langPref === undefined) {
        skipped.push({ kind: 'lang', reason: 'invalid' });
    }
    else if (input.langPref === input.currentLang) {
        unchanged.push('lang');
    }
    else {
        apply.push({ kind: 'lang', from: input.currentLang, to: input.langPref });
    }
    // Preset: a DSH_TUI_PRESET launch instruction pins this run; else the
    // persisted choice. A static cordis.yml `preset` is only the deployment
    // default, so it never blocks a reload.
    if (input.envPreset !== undefined) {
        skipped.push({ kind: 'preset', reason: 'env-wins' });
    }
    else if (input.presetPref === undefined) {
        skipped.push({ kind: 'preset', reason: 'invalid' });
    }
    else if (input.presetPref === input.currentPreset) {
        unchanged.push('preset');
    }
    else {
        apply.push({ kind: 'preset', from: input.currentPreset ?? '—', to: input.presetPref });
    }
    // Model route: the persisted choice is the standing one (the atomic rule of
    // issue #67 — a cordis.yml pair is only the deployment default and can
    // never merge with half the pref). A route the file does not hold reads as
    // invalid here; the config default only takes over on the next boot.
    if (input.modelPref === undefined) {
        skipped.push({ kind: 'model', reason: 'invalid' });
    }
    else if (input.currentModel !== undefined
        && input.currentModel.provider === input.modelPref.provider
        && input.currentModel.model === input.modelPref.model) {
        unchanged.push('model');
    }
    else {
        apply.push({
            kind: 'model',
            from: input.currentModel === undefined
                ? '—'
                : `${input.currentModel.provider}/${input.currentModel.model}`,
            to: `${input.modelPref.provider}/${input.modelPref.model}`,
            route: { provider: input.modelPref.provider, model: input.modelPref.model },
        });
    }
    // Working-activity indicator: cordis.yml's static choice wins.
    if (input.configuredActivity !== undefined) {
        skipped.push({ kind: 'activity', reason: 'config-wins' });
    }
    else if (input.activityPref === undefined) {
        skipped.push({ kind: 'activity', reason: 'invalid' });
    }
    else if (input.activityPref === input.currentActivity) {
        unchanged.push('activity');
    }
    else {
        apply.push({ kind: 'activity', from: input.currentActivity ?? 'moon8', to: input.activityPref });
    }
    return { apply, unchanged, skipped };
}

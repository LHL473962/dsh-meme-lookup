/** Assemble the session's model, mode and relay-channel controls. */
import { randomUUID } from 'node:crypto';
import { activeProfileOf } from '../channels.js';
import { createClaudeControls } from '../controls.js';
import { importedModelEnv, modelTruthFrom, readLocalModelNames } from '../modelEnv.js';
export function createSessionControls(context) {
    const { deps, prefs, channels, channelTokens, translator, configDir, emit } = context;
    /** The env keys the TUI itself put into the spawn env: the auth plan's
     *  flag layer (the channel connection, or the first-party pin). The
     *  settings import leaves them out (it would re-import the channel the TUI
     *  activated); the model truth ranks them above the settings file, the
     *  flag > settings > inherited order the CLI applies. */
    const injectedEnvKeys = () => new Set(Object.keys(context.authPlan.settings?.env ?? {}));
    const controls = createClaudeControls({
        query: () => context.run.query,
        emit: events => emit(events),
        submitText: async (text) => {
            await context.session.submit({ text, clientMessageId: randomUUID() }, 'turn');
        },
        currentModel: () => translator.model,
        currentMode: () => translator.mode ?? deps.start.mode,
        noteModel: model => translator.noteModel(model),
        noteMode: mode => translator.noteMode(mode),
        prefs,
        channels,
        tokens: channelTokens,
        debug: deps.host.debug,
        // "Import from settings" reads the user's settings file plus the
        // inherited env (settings first, as the CLI does), without the TUI's own
        // injections: a cc-switch-written settings.json is what it sees.
        settingsEnv: () => importedModelEnv(configDir(), context.authPlan.env, injectedEnvKeys()),
        // Channel model truth, lazily (the list reads it on demand): the active
        // channel profile first (channels.json — the user's own data), then the
        // settings env of the same config dir the transcripts use, plus the
        // live auth env on top. A cosmetic tier name a relay channel wrote
        // must not hide the model that actually serves the request.
        modelTruth: () => {
            const active = activeProfileOf(channels.read());
            // `model-names.json` is this backend's own cache, under the directory
            // the host handed over: a host that hands over none has none to read
            // (D2 — never a path this backend picked for itself).
            const dataDir = deps.host.dataDir;
            return modelTruthFrom(configDir(), context.authPlan.env, dataDir === undefined ? {} : readLocalModelNames(dataDir), active === undefined ? undefined : { models: active.models, tiers: active.tiers }, injectedEnvKeys());
        },
    });
    return controls;
}

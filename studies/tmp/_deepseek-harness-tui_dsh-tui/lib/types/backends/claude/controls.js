import { claudeText } from './text.js';
import { createHash } from 'node:crypto';
import { channelTokenRef } from '../shared/channel-tokens.js';
import { importFromSettingsEnv, importTokenFromSettingsEnv, hasChannelConnection } from './channels.js';
/** The fixed roster, in order, for the /permission picker: `bypassPermissions`
 *  is always listed — the SDK gate keeps it available at runtime (options.ts),
 *  so the user's explicit choice is honoured instead of being vetoed by the
 *  TUI — and `auto` only where the model's classifier supports it. `dontAsk`
 *  is never offered unless the session already runs in it. */
const ROSTER = ['default', 'acceptEdits', 'plan', 'bypassPermissions'];
/** The Shift+Tab cycle surface, in order: the pre-bypass roster, verbatim.
 *  `bypassPermissions` is deliberately not here: Shift+Tab is a reflexive
 *  key (the user taps it repeatedly to move through modes), and one stray
 *  press landing in "all confirmations off" is unacceptable — bypass is
 *  entered only through the /permission picker's explicit, explained row.
 *  Declared as `modes.cycle()` so the narrowing lives in the capability
 *  layer, not as a mode name hardcoded in the UI. */
const CYCLE_ROSTER = ['default', 'acceptEdits', 'plan'];
/** The CLI's standard reasoning-effort tiers, weakest to strongest — the
 * compatibility fallback `levels()` serves for a model row that declares no
 * list of its own (relay custom rows; the CLI accepts any effortLevel flag
 * via applyFlagSettings, so the standard ladder is an honest offer). */
const EFFORT_FALLBACK_TIERS = ['low', 'medium', 'high', 'xhigh', 'max'];
/** The model catalog row a model id or alias selects. */
function rowOf(models, id) {
    return models.find(model => model.value === id)
        ?? models.find(model => model.resolvedModel === id)
        ?? models.find(model => id.startsWith('claude-') && model.resolvedModel !== undefined && id.startsWith(model.resolvedModel));
}
/** Context usage → the neutral view (no free/buffer pseudo-categories as "used"). */
export function contextUsageView(usage) {
    return {
        used: usage.totalTokens,
        max: usage.maxTokens,
        categories: usage.categories.map(category => ({ name: category.name, tokens: category.tokens, kind: category.kind })),
        sections: (usage.systemPromptSections ?? []).map(section => ({ name: section.name, tokens: section.tokens })),
        files: usage.memoryFiles.map(file => ({ path: file.path, tokens: file.tokens })),
        skills: (usage.skills?.skillFrontmatter ?? []).map(skill => ({ name: skill.name, tokens: skill.tokens })),
        tools: [
            ...(usage.systemTools ?? []).map(tool => ({ name: tool.name, tokens: tool.tokens })),
            ...usage.mcpTools.map(tool => ({ name: tool.name, tokens: tool.tokens, server: tool.serverName })),
        ],
    };
}
/** Account info → the neutral view (the email is never surfaced). */
export function accountView(info, apiKeySource) {
    return {
        ...(info.organization === undefined ? {} : { organization: info.organization }),
        ...(info.subscriptionType === undefined ? {} : { subscription: info.subscriptionType }),
        ...(info.apiProvider === undefined ? {} : { provider: info.apiProvider }),
        ...(info.tokenSource === undefined ? {} : { tokenSource: info.tokenSource }),
        ...((info.apiKeySource ?? apiKeySource) === undefined ? {} : { apiKeySource: info.apiKeySource ?? apiKeySource }),
    };
}
/** The connection fingerprint of one profile: a sha256 over the endpoint,
 *  the stored token (when the seam holds one) and the channel-private env —
 *  equal fingerprints are the same connection, so the UI can decide
 *  restart-vs-refresh without ever seeing the token. */
const connectionFingerprint = (profile, tokens) => {
    const token = profile.tokenRef !== undefined && tokens !== undefined ? tokens.read(profile.tokenRef) ?? '' : '';
    const env = Object.entries(profile.env ?? {}).sort(([a], [b]) => a < b ? -1 : a > b ? 1 : 0).map(([key, value]) => key + '=' + value).join(';');
    return createHash('sha256').update([profile.baseUrl ?? '', token, env].join('\u0000')).digest('hex').slice(0, 16);
};
/** One stored profile as the capability's readonly view (file order kept). */
const profileView = (profile, tokens) => ({
    id: profile.id,
    name: profile.name,
    models: Object.entries(profile.models ?? {}).map(([from, to]) => ({ from, to })),
    tiers: Object.entries(profile.tiers ?? {}).map(([tier, to]) => ({ tier, to })),
    ...(!hasChannelConnection(profile) ? {} : {
        connection: {
            ...(profile.baseUrl === undefined ? {} : { baseUrl: profile.baseUrl }),
            hasToken: profile.tokenRef !== undefined && (tokens?.declared(profile.tokenRef) ?? false),
            envKeys: Object.keys(profile.env ?? {}),
            fingerprint: connectionFingerprint(profile, tokens),
        },
    }),
});
/** Build the capabilities (catalogs seeded from the handshake by `seed`). */
export function createClaudeControls(deps) {
    let models = [];
    let commands = [];
    /** The TUI's own effort choice (the CLI reports none back in `init`). */
    let effort = deps.prefs.read().effort;
    /** Terminal-only commands the CLI lists separately (never offered here). */
    let terminalOnly = new Set();
    const currentRow = () => rowOf(models, deps.currentModel());
    const effortsFor = (row) => {
        if (row === undefined || row.supportsEffort === false)
            return { levels: [] };
        // Known rows without a tier list use the CLI-standard compatibility
        // ladder; unknown rows offer nothing. Preview and live controls agree.
        const declared = row.supportedEffortLevels;
        const fallback = declared === undefined || declared.length === 0;
        return {
            levels: (fallback ? EFFORT_FALLBACK_TIERS : declared).map(level => ({ id: level, label: effortLabel(level) })),
            ...(fallback ? { levelsFallback: true } : {}),
        };
    };
    /** Check the remembered effort against what a model declares. It is
     *  cleared only on an explicit refusal: `supportsEffort === false`, or a
     *  declared level list without the tier. A row that declares neither
     *  (the offline catalog's Haiku rows, a relay's custom rows) keeps it:
     *  the CLI accepts any effortLevel flag and levels() offers the standard
     *  tiers for that shape. Runs on every confirmation of the model (a
     *  switch, the open/resume seed, `system/init`, `message_start`).
     *  Returns the events to emit. */
    const convergeEffort = (row) => {
        if (row === undefined || effort === undefined)
            return [];
        const levels = row.supportedEffortLevels;
        if (row.supportsEffort === false || (levels !== undefined && levels.length > 0 && !levels.includes(effort))) {
            effort = undefined;
            deps.prefs.write({ effort: null });
            return [{ type: 'effort.changed', effort: null }];
        }
        return [];
    };
    const refreshModels = async () => {
        try {
            models = await deps.query().supportedModels();
        }
        catch (error) {
            deps.debug(`claude: supportedModels failed (${error instanceof Error ? error.message : String(error)})`);
        }
        return models;
    };
    /** A roster as mode options: `auto` where the model supports it, and the
     *  live mode last when the roster would not offer it (a session started
     *  in `dontAsk`, say) — it stays listed and can be cycled away from. */
    const modeOptions = (roster) => {
        const ids = [...roster];
        if (currentRow()?.supportsAutoMode === true)
            ids.push('auto');
        const current = deps.currentMode();
        if (current !== '' && !ids.includes(current))
            ids.push(current);
        return ids.map(id => ({ id, label: modeLabel(id), description: modeDescription(id) }));
    };
    /** Whether another profile row still references `ref` (a hand edit can
     *  point two channels at one key): such a credential is not erased. */
    const refSharedElsewhere = (ref, exceptId) => deps.channels.read().channels.some(channel => channel.id !== exceptId && channel.tokenRef === ref);
    const capabilities = {
        models: {
            async list() {
                const truth = deps.modelTruth?.();
                return (await refreshModels()).map(model => {
                    // Channel truth (modelEnv.ts): when the configuration says this
                    // row's id routes to a different model, the label becomes the
                    // actual model and the cosmetic name moves into the description.
                    // No mapping (a real Claude setup, or one resolving to the same
                    // model) renders exactly as before.
                    const actual = truth?.actualFor(model.value)
                        ?? truth?.actualFor(model.resolvedModel ?? '');
                    if (actual === undefined) {
                        return { id: model.value, label: model.displayName, description: model.description };
                    }
                    const description = [model.displayName, model.description]
                        .filter((part) => typeof part === 'string' && part.trim() !== '')
                        .join(' — ');
                    return { id: model.value, label: actual, description: description === '' ? undefined : description };
                });
            },
            current: () => ({ model: deps.currentModel() }),
            display: () => {
                const current = deps.currentModel();
                return current === '' ? undefined : deps.modelTruth?.().actualFor(current);
            },
            async set(ref) {
                const row = rowOf(models, ref.model) ?? rowOf(await refreshModels(), ref.model);
                if (row === undefined)
                    return { kind: 'refused', reason: claudeText('claude-model-unknown', { model: ref.model }) };
                // In place (no fork): the CLI applies it from the next request on.
                await deps.query().setModel(row.value);
                deps.prefs.write({ model: row.value });
                deps.emit(deps.noteModel(row.resolvedModel ?? row.value));
                // An effort the new model refuses is cleared (the CLI would run its
                // default anyway).
                deps.emit(convergeEffort(row));
                return { kind: 'switched' };
            },
        },
        effort: {
            get levelsFallback() {
                return effortsFor(currentRow()).levelsFallback;
            },
            levels() {
                return effortsFor(currentRow()).levels;
            },
            forModel: (ref) => effortsFor(rowOf(models, ref.model)),
            current: () => effort,
            async set(id) {
                // `null` resets to the model's default level (applyFlagSettings
                // contract); a level is session-scoped in the flag layer.
                await deps.query().applyFlagSettings({ effortLevel: id });
                effort = id ?? undefined;
                deps.prefs.write({ effort: id });
                deps.emit([{ type: 'effort.changed', effort: id }]);
            },
        },
        modes: {
            list: () => modeOptions(ROSTER),
            cycle: () => modeOptions(CYCLE_ROSTER),
            current: () => deps.currentMode(),
            async set(id) {
                // No TUI-side vetting: the query was pre-warmed for `bypassPermissions`
                // (options.ts) and the CLI is the authority on what it accepts. A
                // refusal comes back as a rejection and is reported by the channel's
                // guarded setMode, never swallowed here.
                await deps.query().setPermissionMode(id);
                // The pick is remembered (prefs.ts): the next session starts where
                // this one ended — the same best-effort write model / effort ride.
                deps.prefs.write({ permissionMode: id });
                deps.emit(deps.noteMode(id));
            },
        },
        channels: {
            list: () => deps.channels.read().channels.map(profile => profileView(profile, deps.tokens)),
            activeId: () => deps.channels.read().active,
            setActive: (id) => { deps.channels.setActive(id); },
            importFromSettings: () => {
                const env = deps.settingsEnv?.() ?? {};
                const draft = importFromSettingsEnv(env);
                if (draft === undefined)
                    return undefined;
                // A re-import refreshes the same-id channel in place, keeping the
                // user's hand-written exact models (channels.ts's contract).
                const existing = deps.channels.read().channels.find(channel => channel.id === draft.id);
                const imported = existing === undefined ? draft : importFromSettingsEnv(env, existing) ?? draft;
                // The settings env's auth token, when present, is copied into the
                // credential store (settings keeps its value); the profile keeps
                // only the ref, so channels.json never holds a token. An existing
                // ref is reused, else the derived one.
                const token = importTokenFromSettingsEnv(env);
                const ref = existing?.tokenRef ?? channelTokenRef(imported.id);
                const profile = token !== undefined && deps.tokens !== undefined
                    ? { ...imported, tokenRef: ref }
                    : imported;
                if (token !== undefined && deps.tokens !== undefined)
                    deps.tokens.write(ref, token);
                deps.channels.save(profile);
                return profileView(profile, deps.tokens);
            },
            save: input => {
                const current = deps.channels.read().channels.find(channel => channel.id === input.id);
                // A token the wizard collected goes to the credential store; ''
                // removes it (and the profile's ref). A rotation reuses the row's
                // existing ref (a hand-written one included); only a row without one
                // takes the derived ref.
                let storedTokenRef = current?.tokenRef;
                if (input.token !== undefined && deps.tokens !== undefined) {
                    if (input.token === '') {
                        // The credential goes only with its last referent.
                        if (storedTokenRef !== undefined) {
                            if (refSharedElsewhere(storedTokenRef, input.id)) {
                                deps.debug(`claude: channel ${input.id} cleared its token; the shared ref ${storedTokenRef} stays in the store (another channel still references it)`);
                            }
                            else {
                                deps.tokens.erase(storedTokenRef);
                            }
                        }
                        storedTokenRef = undefined;
                    }
                    else {
                        const target = storedTokenRef ?? channelTokenRef(input.id);
                        deps.tokens.write(target, input.token);
                        storedTokenRef = target;
                    }
                }
                const profile = {
                    id: input.id,
                    name: input.name,
                    ...(input.baseUrl === undefined ? { ...(current?.baseUrl === undefined ? {} : { baseUrl: current.baseUrl }) } : input.baseUrl === '' ? {} : { baseUrl: input.baseUrl }),
                    ...(storedTokenRef === undefined ? {} : { tokenRef: storedTokenRef }),
                    ...(input.env === undefined ? { ...(current?.env === undefined ? {} : { env: current.env }) } : Object.keys(input.env).length === 0 ? {} : { env: input.env }),
                    ...(input.models === undefined ? { ...(current?.models === undefined ? {} : { models: current.models }) } : input.models),
                    ...(input.tiers === undefined ? { ...(current?.tiers === undefined ? {} : { tiers: current.tiers }) } : input.tiers),
                };
                deps.channels.save(profile);
                return profileView(profile, deps.tokens);
            },
            remove: id => {
                const current = deps.channels.read().channels.find(channel => channel.id === id);
                if (current === undefined)
                    return false;
                // The credential is erased only when no other row references it and
                // the ref is this channel's derived one (a hand-written ref may be
                // owned by the host). What is kept goes to the debug log (a ref name
                // is not secret).
                if (current.tokenRef !== undefined) {
                    if (refSharedElsewhere(current.tokenRef, id)) {
                        deps.debug(`claude: channel ${id} removed; its tokenRef ${current.tokenRef} stays in the store (another channel still references it)`);
                    }
                    else if (current.tokenRef === channelTokenRef(id)) {
                        deps.tokens?.erase(current.tokenRef);
                    }
                    else {
                        deps.debug(`claude: channel ${id} removed; its non-derived tokenRef ${current.tokenRef} stays in the store (possibly host-owned - erase by hand if truly orphaned)`);
                    }
                }
                deps.channels.remove(id);
                return true;
            },
            peekSettingsImport: () => {
                const env = deps.settingsEnv?.() ?? {};
                const draft = importFromSettingsEnv(env);
                if (draft === undefined)
                    return undefined;
                return {
                    ...(draft.baseUrl === undefined ? {} : { baseUrl: draft.baseUrl }),
                    tiers: draft.tiers ?? {},
                };
            },
        },
        init: { run: () => deps.submitText('/init') },
        compact: {
            // The CLI's own `/compact`: the translator turns its
            // `compacting` status and `compact_boundary` into the compaction rows.
            run: () => deps.submitText('/compact'),
        },
        commands: {
            async list() {
                try {
                    commands = await deps.query().supportedCommands();
                }
                catch (error) {
                    deps.debug(`claude: supportedCommands failed (${error instanceof Error ? error.message : String(error)})`);
                }
                return commandInfos();
            },
        },
        mcp: {
            async status() {
                const servers = await deps.query().mcpServerStatus();
                return servers.map(server => ({ name: server.name, status: server.status, ...(server.tools === undefined ? {} : { toolCount: server.tools.length }) }));
            },
            reconnect: (name) => deps.query().reconnectMcpServer(name),
            toggle: (name, enabled) => deps.query().toggleMcpServer(name, enabled),
        },
        context: {
            async usage(detail) {
                return contextUsageView(await deps.query().getContextUsage({ detail }));
            },
        },
    };
    /** The CLI's commands as the slash menu lists them. */
    const commandInfos = () => commands
        .filter(command => !terminalOnly.has(command.name))
        .map(command => ({
        name: command.name,
        ...(command.description === '' ? {} : { description: command.description }),
        ...(command.argumentHint === '' ? {} : { argumentHint: command.argumentHint }),
    }));
    return {
        capabilities,
        /** The handshake's catalogs (`initializationResult().models/commands`),
         *  read without a round trip; malformed entries are skipped. */
        seed(init) {
            const list = (value) => Array.isArray(value)
                ? value.filter((item) => typeof item === 'object' && item !== null)
                : [];
            models = list(init?.models).filter(row => typeof row.value === 'string' && typeof row.displayName === 'string');
            commands = list(init?.commands).filter(row => typeof row.name === 'string');
        },
        /** The session confirmed the model by other means than a switch (the
         *  open/resume seed, `system/init`, `message_start`): check the effort
         *  as convergeEffort does. A model without a catalog row keeps it. */
        noteConfirmedModel(model) {
            if (model === '')
                return;
            const events = convergeEffort(rowOf(models, model));
            if (events.length > 0)
                deps.emit(events);
        },
        /** `system/init.terminal_slash_commands` (terminal-only, never offered). */
        setTerminalOnly(names) {
            terminalOnly = new Set(names);
        },
    };
}
/** The localized label of a backend-native permission mode. */
export function modeLabel(id) {
    switch (id) {
        case 'default': return claudeText('claude-mode-default');
        case 'acceptEdits': return claudeText('claude-mode-acceptEdits');
        case 'plan': return claudeText('claude-mode-plan');
        case 'auto': return claudeText('claude-mode-auto');
        case 'dontAsk': return claudeText('claude-mode-dontAsk');
        case 'bypassPermissions': return claudeText('claude-mode-bypassPermissions');
        default: return id;
    }
}
/** The one-line explanation of a backend-native permission mode (the
 *  picker's second row: what the mode actually does — never a repeat of the
 *  label). Unknown ids have none. */
export function modeDescription(id) {
    switch (id) {
        case 'default': return claudeText('claude-mode-desc-default');
        case 'acceptEdits': return claudeText('claude-mode-desc-acceptEdits');
        case 'plan': return claudeText('claude-mode-desc-plan');
        case 'auto': return claudeText('claude-mode-desc-auto');
        case 'dontAsk': return claudeText('claude-mode-desc-dontAsk');
        case 'bypassPermissions': return claudeText('claude-mode-desc-bypassPermissions');
        default: return undefined;
    }
}
/** The localized label of an effort level. */
export function effortLabel(id) {
    switch (id) {
        case 'low': return claudeText('claude-effort-low');
        case 'medium': return claudeText('claude-effort-medium');
        case 'high': return claudeText('claude-effort-high');
        case 'xhigh': return claudeText('claude-effort-xhigh');
        case 'max': return claudeText('claude-effort-max');
        default: return id;
    }
}

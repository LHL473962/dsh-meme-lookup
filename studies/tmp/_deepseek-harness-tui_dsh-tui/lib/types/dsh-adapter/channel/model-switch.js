import { t } from '../../i18n.js';
import { WORKING_GATE_NOTICES } from '../../commands.js';
import { writeModelPref } from '../../modelPrefs.js';
/** Select the next request's route without replacing the conversation or its agent. */
export function createModelSwitchAction(ctx, state, deps) {
    let operation = 0;
    return async (provider, model) => {
        if (!deps.owner.current())
            return false;
        if (state.working) {
            deps.notify(t(WORKING_GATE_NOTICES.model), { color: 'warning' });
            return false;
        }
        const generation = ++operation;
        if (provider === state.provider && model === state.model)
            return true;
        if (!deps.supportsRouteSwitch) {
            deps.notify(t('model-switch-legacy-unavailable'), { color: 'warning', timeoutMs: 8000 });
            return false;
        }
        const capture = deps.binding.capture();
        const current = () => deps.owner.current() && deps.binding.isCurrent(capture) && generation === operation;
        try {
            const llm = ctx.get('llm');
            if (llm?.listModels !== undefined) {
                const models = await llm.listModels(provider);
                if (models.length > 0 && !models.some(entry => entry.id === model))
                    throw new Error(`unknown model: ${provider}/${model}`);
            }
        }
        catch (error) {
            if (current())
                deps.notify(t('model-switch-failed', { err: error instanceof Error ? error.message : String(error) }), { color: 'error', timeoutMs: 8000 });
            return false;
        }
        if (!current())
            return false;
        // A turn may have started during the model lookup; refuse it like the entry gate.
        if (state.working) {
            deps.notify(t(WORKING_GATE_NOTICES.model), { color: 'warning' });
            return false;
        }
        // Assembly captures this complete route for both persona variables and the
        // request waterfall. The loop persists its actual header on the next request.
        // In-flight compaction keeps running: it summarizes on the logged route.
        deps.selection.current = { provider, model };
        state.provider = provider;
        state.model = model;
        state.contextWindow = undefined;
        state.effortLevels = undefined;
        state.reasoningEffort = undefined;
        deps.dropModelCompletion();
        void deps.applyPreferredEffort();
        deps.seedUpstreamRetry(provider);
        if (!writeModelPref(provider, model))
            deps.notify(t('model-pref-write-failed'), { color: 'warning' });
        state.emit();
        return true;
    };
}

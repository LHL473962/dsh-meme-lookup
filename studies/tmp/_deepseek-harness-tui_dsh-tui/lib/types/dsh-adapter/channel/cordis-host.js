import { adapterRuntimeFor } from '../../adapter/kernel/runtime-context.js';
import { installDecisionGuard, markDecisionDispatchTopology } from '../decision-guard.js';
import { dispatchTuiDecision, dispatchTuiNotification } from '../extension-events.js';
import { getLocalSettingsSectionsHost } from '../settings-sections.js';
/**
 * @param services - Services served in place of the context's own (the
 *   TUI's file-backed `settings`, ../tui-settings.ts).
 */
export function cordisChannelHost(ctx, services = {}) {
    const withEffect = ctx;
    return {
        get: name => Object.hasOwn(services, name) ? services[name] : ctx.get(name),
        // Read per use.
        get logger() { return ctx.logger; },
        runtime: adapterRuntimeFor(ctx),
        // Bare embedders (scripts) mount without the effect capability.
        ...(withEffect.effect === undefined ? {} : {
            effect: (setup, label) => { withEffect.effect?.call(ctx, setup, label); },
        }),
        onAgentPreStep: listener => ctx.on('agent/pre-step', listener),
        dispatchDecision: (name, payload, normalize) => dispatchTuiDecision(ctx, name, payload, normalize),
        dispatchNotification: (name, payload) => dispatchTuiNotification(ctx, name, payload),
        installDecisionGuard: grants => { installDecisionGuard(ctx, grants); },
        markDecisionDispatchTopology: () => markDecisionDispatchTopology(ctx),
        localSettingsSections: () => getLocalSettingsSectionsHost(ctx),
        // Cordis announces every service change on the root; bare embedders
        // (scripts) without `on` hear nothing.
        ...(typeof ctx.on !== 'function' ? {} : {
            watchServices: listener => ctx.on('internal/service', ((name) => {
                if (typeof name === 'string')
                    listener(name);
            })),
        }),
    };
}

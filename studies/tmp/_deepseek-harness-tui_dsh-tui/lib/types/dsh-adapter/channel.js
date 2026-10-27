import { createDshSession, isAgentSession } from './backend/session.js';
import { cordisChannelHost } from './channel/cordis-host.js';
import { createCoreChannel } from './channel/core/compose.js';
import { attachDshExtensions } from './channel/extensions.js';
import { attachSessionWorkingActivity } from './channel/session-activity.js';
import { createChannelOwner } from './channel/owner.js';
/**
 * Create the live channel state for one agent session: replay the durable
 * transcript, subscribe to the session's events, and expose every TUI action.
 * @internal
 * @param ctx - The plugin context; optional services are resolved via ctx.get.
 * @param initial - The session the channel renders; rewinds and resumes
 *   replace it, while model switches keep it. A raw DSH agent (direct embedders, fixtures) is
 *   wrapped as a DSH session together with `options.handle`.
 * @param options - Boot options: model route, cwd, provider, and the
 *   reasoning-effort / working-activity preferences.
 * @returns The live channel state, subscribed and ready to render.
 */
export function createChannel(ctx, initial, options) {
    const owner = createChannelOwner();
    try {
        const session = isAgentSession(initial) ? initial : createDshSession(ctx, { agent: initial, handle: options.handle });
        const core = createCoreChannel(cordisChannelHost(ctx, options.settingsService === undefined ? {} : { settings: options.settingsService }), session, options, owner);
        // DSH extensions attach only to a DSH session; other backends get the
        // core and whatever their session capabilities offer.
        const native = session.capabilities.native.dsh;
        if (native !== undefined) {
            attachDshExtensions(core, ctx, native, options);
        }
        else if (options.startup !== undefined) {
            // A placeholder learns its backend at the first adoption; a DSH
            // session adopted then gets the same extensions.
            core.extendOnAdopt(adopted => {
                const dsh = adopted.capabilities.native.dsh;
                if (dsh !== undefined)
                    attachDshExtensions(core, ctx, dsh, options);
            });
        }
        // A backend that builds its own working line (the Claude backend) exposes
        // it as a capability. DSH keeps using its projection above. Without the
        // capability or the publish option nothing is attached.
        // A placeholder serves nothing yet, so its real session's capability
        // decides per bind (a DSH session adopted later replaces these hooks:
        // `extend` merges `bind` whole).
        if (session.capabilities.workingActivity !== undefined || options.startup !== undefined)
            attachSessionWorkingActivity(core, options);
        return core.start();
    }
    catch (error) {
        // Setup is one transaction from the first acquired resource. Preserve the
        // construction failure while still attempting every registered rollback.
        try {
            owner.dispose();
        }
        catch { /* primary setup error remains authoritative */ }
        throw error;
    }
}
export { expandMentions } from './channel/mentions.js';
export { sessionCwdMatches } from './channel/paths.js';
export { emptyTokenUsage } from './channel/usage.js';

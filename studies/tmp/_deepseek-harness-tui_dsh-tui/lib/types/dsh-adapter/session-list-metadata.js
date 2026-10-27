import { z } from 'zod';
export const SESSION_LIST_METADATA_KEY = 'sessionListMetadata';
export const SESSION_LIST_METADATA_STATE_VERSION = 1;
const sessionListMetadataSchema = z.object({
    blank: z.boolean(),
    lastPromptAt: z.number().nullable(),
});
export function initSessionListMetadata() {
    return { blank: true, lastPromptAt: null };
}
/** Match the host fold, including reference identity when neither field changes. */
export function applySessionListMetadata(state, event) {
    const blank = state.blank && event.type !== 'turn/start';
    const lastPromptAt = event.type === 'user/message' && event.data.source.kind === 'user'
        ? event.time
        : state.lastPromptAt;
    return blank === state.blank && lastPromptAt === state.lastPromptAt
        ? state
        : { blank, lastPromptAt };
}
function sessionListMetadataDefinition() {
    const view = (state) => state;
    return {
        key: SESSION_LIST_METADATA_KEY,
        stateVersion: SESSION_LIST_METADATA_STATE_VERSION,
        stateSchema: sessionListMetadataSchema,
        init: initSessionListMetadata,
        apply: applySessionListMetadata,
        wire: { viewSchema: sessionListMetadataSchema, view },
        // rc.6 and alpha.2 registries accept register() but read these older fields.
        // Reuse the same schema and view so registration order cannot change meaning.
        schema: sessionListMetadataSchema,
        viewSchema: sessionListMetadataSchema,
        view,
    };
}
/** Register before creating the boot agent, so its first checkpoint has the key. */
export function attachSessionListMetadata(ctx) {
    ctx.inject(['sessionProjections'], ((projectionCtx) => {
        const registry = projectionCtx.sessionProjections;
        if (typeof registry?.register !== 'function')
            return;
        try {
            // The host binds this registration to the calling context's fiber.
            registry.register(sessionListMetadataDefinition());
        }
        catch (error) {
            try {
                ctx.logger.debug(`dsh-tui: could not register sessionListMetadata: ${String(error)}`);
            }
            catch {
                // Diagnostics must not turn a missing seam or version conflict into a startup failure.
            }
        }
    }));
}

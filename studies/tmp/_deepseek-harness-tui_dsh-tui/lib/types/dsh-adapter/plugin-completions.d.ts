/**
 * `/plugin info <name>` completion: the bundles this profile added.
 *
 * The names come from the same host service and the same predicate the short
 * list reads (`extraBundles` in `./plugin-manager.ts`), so the popup and
 * `/plugin list` cannot disagree about what "added" means.
 *
 * A row's description is the bundle's own title and version — sanitized, capped
 * by display width, and kept in every shipped language, so the popup shows the
 * same title `/plugin info` would and a `/lang` switch repaints it.
 *
 * The cache reads like `/model`'s (`channel/model-actions.ts`): one load, an
 * answer that arrives after the owner moved on is dropped, and the popup is
 * refreshed by `emit()` when the names land. A service that is missing — a
 * non-DSH kernel, an older host — or that throws before it returns a promise
 * answers the same empty list: the tree then shows its static subcommand nodes
 * and nothing throws.
 */
import type { Context } from '@deepseek-ai/cordis';
import type { CommandCompletionNode } from '../commands.js';
/** The warm-and-read pair the slash completion tree consumes. */
export declare function createPluginCompletionCatalog(ctx: Context, deps: {
    owner: {
        readonly signal: AbortSignal;
        current(): boolean;
    };
    emit(): void;
}): {
    warmPluginNames(): void;
    pluginNames(): readonly CommandCompletionNode[];
};
//# sourceMappingURL=plugin-completions.d.ts.map
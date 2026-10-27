import { getLang, LANGS } from '../i18n.js';
import { extraBundles, pluginManagerOf, pluginTitleIn } from './plugin-manager.js';
import { cleanScalarText } from './sanitize.js';
/**
 * Display-cell budget for one description. The popup truncates to its own row
 * width at render, so this only bounds what a bundle's metadata may park in the
 * cache — a title is host input and arrives as wide as it likes.
 */
const DESCRIPTION_CELLS = 200;
/**
 * What one bundle answers to, version included, in every shipped language. The
 * title is host metadata landing in the popup's row, so it is sanitized and
 * capped as a display string (`cleanScalarText`: a newline in a title would
 * leave the row, ANSI would paint it). Every language is built at warm time
 * because the cache loads once; `CommandSuggestions` resolves `descriptions` at
 * render (`localizedDescription`), so `/lang` repaints the popup without a
 * reload and the popup titles a bundle exactly as `/plugin info` does.
 */
function bundleDescriptions(bundle) {
    const version = bundle.version === undefined ? '' : ` · ${bundle.version}`;
    const built = {};
    for (const lang of LANGS) {
        built[lang] = cleanScalarText(`${pluginTitleIn(bundle, lang, bundle.name)}${version}`, DESCRIPTION_CELLS);
    }
    return built;
}
/** The warm-and-read pair the slash completion tree consumes. */
export function createPluginCompletionCatalog(ctx, deps) {
    let nodes;
    let load;
    const warmPluginNames = () => {
        if (load !== undefined)
            return;
        const manager = pluginManagerOf(ctx);
        if (manager === undefined) {
            nodes = [];
            return;
        }
        let pending;
        try {
            pending = manager.listBundles();
        }
        catch {
            // The service threw before it returned a promise; `.catch` only covers a
            // rejection, so the raw throw would otherwise reach the keystroke path
            // that asked for the names. Answer an empty list like an absent service,
            // and leave `load` unset so a later warm can try again.
            nodes = [];
            return;
        }
        const live = () => deps.owner.current() && !deps.owner.signal.aborted;
        load = pending.then(bundles => {
            // A late answer after a release would write into a dead channel; let a
            // later warm try again instead of pinning the empty result.
            if (!live()) {
                load = undefined;
                return;
            }
            nodes = extraBundles(bundles).map(bundle => {
                // The package name is what `/plugin info` matches, so it is the token;
                // the title and version are what a person recognizes in the popup. Both
                // come from the report's own reader, per language, so the two never
                // disagree — and neither renders raw host metadata.
                const descriptions = bundleDescriptions(bundle);
                return {
                    name: bundle.name,
                    description: descriptions[getLang()] ?? bundle.name,
                    descriptions,
                    ...(bundle.enabled ? {} : { tag: 'off' }),
                };
            });
            deps.emit();
        }).catch(() => {
            load = undefined;
            if (live())
                nodes = [];
        });
    };
    return { warmPluginNames, pluginNames: () => nodes ?? [] };
}

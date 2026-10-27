import { getLang } from '../i18n.js';
import { isCompositionOwned } from './plugin-declaration.js';
/**
 * Soft-probe the profile plugin manager. `undefined` when the row is not
 * mounted (a non-DSH kernel composition, an older host, a bare Cordis root):
 * the caller reports what it cannot do instead of throwing.
 */
export function pluginManagerOf(ctx) {
    const manager = ctx.get('pluginManager', false);
    if (manager === undefined || manager === null)
        return undefined;
    return manager;
}
let installRequestSeq = 0;
/**
 * A fresh id for one installation. `PluginInstallRequestId` is a branded string
 * and no published subpath exports a constructor for the brand, so this is the
 * one place that asserts one into existence; the counter is per process, which
 * is all an id has to be for the service to correlate a cancel or a recovery
 * with the run that asked.
 */
export function newInstallRequestId() {
    installRequestSeq += 1;
    return `dsh-tui-${process.pid}-${installRequestSeq}`;
}
/**
 * Subscribe to the manager's install events for one request. The events are
 * emitted on the shared context, so a profile running two installations would
 * otherwise render both in one report; the request id is the only thing that
 * tells them apart. Chunks the service leaves unidentified (its git connection
 * check runs without a request) are not one installation's output and are
 * dropped with the rest.
 */
export function pluginInstallEvents(ctx) {
    return {
        onLog: (requestId, listener) => ctx.on('plugin-manager/install-log', (chunk) => {
            if (chunk.requestId === requestId)
                listener(chunk);
        }),
        onState: (requestId, listener) => ctx.on('plugin-manager/install-state', (progress) => {
            if (progress.requestId === requestId)
                listener(progress);
        }),
    };
}
/**
 * The bundles a person added to this profile: the ones its own dependencies
 * hold (`installed`), minus the composition itself. The installation-supplied
 * bundles and this application's own rows are not plugins anybody installed,
 * so the short list leaves them out — a clean profile reports "nothing added"
 * instead of listing the launcher's base. One predicate, so the list and the
 * `/plugin info` completion cannot drift apart.
 */
export function extraBundles(bundles) {
    return bundles.filter(bundle => bundle.installed && !isCompositionOwned(bundle.name));
}
/**
 * What a bundle or loader entry calls itself, in the reader's language. The
 * entry stays `unknown` on purpose: `meta` arrived after the 0.1.5 line, so the
 * alpha.2 compat line's own declarations may not carry the field at all
 * (`verify:alpha-source` type-checks this package against them), and reading it
 * structurally is what keeps one reader compiling on every line. An older host
 * that answers without it takes the caller's fallback — the package name, the
 * module specifier — and one reader means the report's rows and the completion
 * popup cannot disagree about a title.
 */
export function localizedPluginText(entry, fallback) {
    return pluginTitleIn(entry, getLang(), fallback);
}
/**
 * {@link localizedPluginText} pinned to one named language — the completion
 * catalog caches every shipped language at once, so it cannot ask the active
 * one and then serve a stale answer after `/lang`.
 */
export function pluginTitleIn(entry, lang, fallback) {
    const meta = entry?.meta;
    const title = meta?.title;
    if (title === undefined)
        return fallback;
    if (typeof title === 'string')
        return title;
    return title[lang] ?? title.en ?? fallback;
}

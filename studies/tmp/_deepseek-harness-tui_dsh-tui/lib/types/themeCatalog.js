/**
 * Cordis-free theme catalog shared by the theme picker and channel actions.
 *
 * The catalog is an ordered projection, not a cache: static JSON palettes stay
 * owned by customTheme.ts, while runtime palettes stay owned by TuiThemeHost.
 * Ordering is the precedence contract: auto, built-ins, static files, runtime.
 */
import { AUTO_THEME_NAME, getTheme, normalizeThemePalette, THEME_NAMES, } from './theme.js';
import { buildTheme, listCustomThemes, } from './customTheme.js';
function keyOf(name) {
    return name.toLowerCase();
}
function entry(name, displayName, source, theme, base, file) {
    return Object.freeze({
        name,
        displayName,
        source,
        theme,
        ...(base === undefined ? {} : { base }),
        ...(file === undefined ? {} : { file }),
    });
}
/**
 * The role each built-in plays as a `base`. The mist and sakura rows play one
 * of the three classic roles (their own names are not bases); the brand pairs
 * play the dark/light role of their brand family — the brand adaptation of
 * `dark`/`light` (their own names are bases too, see THEME_BASE_NAMES).
 * Total over THEME_NAMES, so a new built-in must decide a role to compile.
 */
const BUILT_IN_BASE = {
    dark: 'dark',
    'dark-ansi': 'dark-ansi',
    light: 'light',
    'pink-night': 'dark',
    'pink-ansi': 'dark-ansi',
    'pink-day': 'light',
    'claude-dark': 'dark',
    'claude-paper': 'light',
    'codex-lavender': 'dark',
    'codex-paper': 'light',
};
function builtInEntries() {
    return [
        entry(AUTO_THEME_NAME, AUTO_THEME_NAME, 'auto', getTheme(AUTO_THEME_NAME)),
        ...THEME_NAMES.map(name => entry(name, name, 'builtin', getTheme(name), BUILT_IN_BASE[name])),
    ];
}
function staticEntries(specs, seen) {
    const entries = [];
    for (const spec of specs) {
        const key = keyOf(spec.name);
        if (seen.has(key))
            continue;
        const item = entry(spec.name, spec.displayName, 'static', buildTheme(spec), spec.base, spec.file);
        entries.push(item);
        // Keep the on-disk alias reserved too: a runtime contribution must not
        // make a static file reachable through a different name accidentally.
        seen.add(key);
        seen.add(keyOf(spec.file));
    }
    return entries;
}
function runtimeEntries(host, seen) {
    if (host === undefined)
        return [];
    let rawSnapshot;
    try {
        rawSnapshot = host.getSnapshot();
    }
    catch {
        return [];
    }
    // A structural host may answer with anything (null, a Set, …); normalize
    // non-arrays so catalog construction never crashes picker/completion render.
    const snapshot = Array.isArray(rawSnapshot) ? rawSnapshot : [];
    const entries = [];
    // Registration order depends on plugin load timing. Sort the projection so
    // the picker and completion stay stable across equivalent compositions.
    // Filter malformed entries first: a structural host's snapshot is untrusted,
    // and the comparator must never see a non-string name. Compare on the
    // lowercased key so ordering does not depend on the runtime ICU locale.
    const ordered = snapshot
        .filter(registration => typeof registration?.name === 'string')
        .sort((a, b) => {
        const ka = keyOf(a.name);
        const kb = keyOf(b.name);
        return ka < kb ? -1 : ka > kb ? 1 : 0;
    });
    for (const registration of ordered) {
        const key = keyOf(registration.name);
        if (seen.has(key))
            continue;
        let palette;
        try {
            palette = normalizeThemePalette(host.resolve(registration.name));
        }
        catch {
            palette = undefined;
        }
        if (palette === undefined) {
            // A structural host supplied by an embedder may expose metadata before
            // its resolver is wired; still provide a safe, deterministic palette.
            if (registration.base !== 'light' && registration.base !== 'dark' && registration.base !== 'dark-ansi')
                continue;
            palette = normalizeThemePalette({ ...getTheme(registration.base), ...registration.colors });
        }
        if (palette === undefined)
            continue;
        entries.push(entry(registration.name, registration.displayName || registration.name, 'runtime', palette, registration.base));
        seen.add(key);
    }
    return entries;
}
/** List entries in precedence order: auto, built-ins, static, runtime. */
export function listThemeCatalog(host) {
    const entries = builtInEntries();
    const seen = new Set(entries.map(item => keyOf(item.name)));
    entries.push(...staticEntries(listCustomThemes(), seen));
    entries.push(...runtimeEntries(host, seen));
    return Object.freeze(entries);
}
/** Alias suited to picker/channel call sites. */
export const listThemes = listThemeCatalog;
function findStaticSpec(name) {
    try {
        return listCustomThemes().find(spec => spec.name === name || spec.file === name);
    }
    catch {
        return undefined;
    }
}
/** Resolve one catalog entry, with static JSON winning over runtime names. */
export function resolveThemeEntry(name, host) {
    if (typeof name !== 'string')
        return undefined;
    if (name === AUTO_THEME_NAME)
        return entry(name, name, 'auto', getTheme(AUTO_THEME_NAME));
    const builtIn = THEME_NAMES.find(candidate => candidate === name);
    if (builtIn !== undefined)
        return entry(builtIn, builtIn, 'builtin', getTheme(builtIn), BUILT_IN_BASE[builtIn]);
    const spec = findStaticSpec(name);
    if (spec !== undefined)
        return entry(spec.name, spec.displayName, 'static', buildTheme(spec), spec.base, spec.file);
    if (host !== undefined) {
        let registration;
        try {
            registration = host.getSnapshot().find(item => item.name === name || keyOf(item.name) === keyOf(name));
        }
        catch {
            registration = undefined;
        }
        if (registration !== undefined) {
            let palette;
            try {
                palette = normalizeThemePalette(host.resolve(registration.name));
            }
            catch {
                palette = undefined;
            }
            if (palette !== undefined) {
                return entry(registration.name, registration.displayName || registration.name, 'runtime', palette, registration.base);
            }
        }
    }
    return undefined;
}
/** Resolve to the full palette while retaining catalog precedence. */
export function resolveThemePalette(name, host) {
    return resolveThemeEntry(name, host)?.theme;
}
/** Resolve helper named for callers that want a catalog entry. */
export const resolveTheme = resolveThemeEntry;
/** Ordered selectable names for a picker or command completion surface. */
export function themeNames(host) {
    return listThemeCatalog(host).map(item => item.name);
}
/** Explicit alias for call sites that prefer the list prefix. */
export const listThemeNames = themeNames;

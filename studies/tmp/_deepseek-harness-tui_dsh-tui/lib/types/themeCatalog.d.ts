/**
 * Cordis-free theme catalog shared by the theme picker and channel actions.
 *
 * The catalog is an ordered projection, not a cache: static JSON palettes stay
 * owned by customTheme.ts, while runtime palettes stay owned by TuiThemeHost.
 * Ordering is the precedence contract: auto, built-ins, static files, runtime.
 */
import { type Theme } from './theme.js';
import { type ThemeBase } from './customTheme.js';
import type { TuiThemeHost } from './dsh-adapter/themes.js';
/** Origin of one catalog entry. */
export type ThemeCatalogSource = 'auto' | 'builtin' | 'static' | 'runtime';
/** One selectable theme and its fully resolved palette. */
export interface ThemeCatalogEntry {
    readonly name: string;
    readonly displayName: string;
    readonly source: ThemeCatalogSource;
    readonly theme: Theme;
    readonly base?: ThemeBase;
    readonly file?: string;
}
/** List entries in precedence order: auto, built-ins, static, runtime. */
export declare function listThemeCatalog(host?: TuiThemeHost): readonly ThemeCatalogEntry[];
/** Alias suited to picker/channel call sites. */
export declare const listThemes: typeof listThemeCatalog;
/** Resolve one catalog entry, with static JSON winning over runtime names. */
export declare function resolveThemeEntry(name: string, host?: TuiThemeHost): ThemeCatalogEntry | undefined;
/** Resolve to the full palette while retaining catalog precedence. */
export declare function resolveThemePalette(name: string, host?: TuiThemeHost): Theme | undefined;
/** Resolve helper named for callers that want a catalog entry. */
export declare const resolveTheme: typeof resolveThemeEntry;
/** Ordered selectable names for a picker or command completion surface. */
export declare function themeNames(host?: TuiThemeHost): readonly string[];
/** Explicit alias for call sites that prefer the list prefix. */
export declare const listThemeNames: typeof themeNames;
//# sourceMappingURL=themeCatalog.d.ts.map
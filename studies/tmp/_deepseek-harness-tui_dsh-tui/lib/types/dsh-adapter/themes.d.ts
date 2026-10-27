/**
 * Cordis-backed runtime theme contributions.
 *
 * Plugins only receive `register`; the host-facing snapshot/resolver lives in a
 * module-local WeakMap and is exposed through `getHostThemes` to host code.
 * Runtime palettes are deliberately kept separate from custom-theme file
 * caches, so a file with the same name always wins in the static resolver.
 */
import { Context, Service } from '@deepseek-ai/cordis';
import { type ThemeColorKey, type Theme } from '../theme.js';
/** The built-in palette a runtime theme overlays. */
export type TuiThemeBase = 'light' | 'dark' | 'dark-ansi' | 'claude-dark' | 'claude-paper' | 'codex-lavender' | 'codex-paper';
/** Plugin-facing runtime theme declaration. */
export interface TuiThemeDescriptor {
    readonly name: string;
    readonly displayName?: string;
    readonly base: TuiThemeBase;
    readonly colors?: Readonly<Partial<Record<ThemeColorKey, string>>>;
}
/** A validated, immutable contribution visible to host catalog consumers. */
export interface TuiThemeRegistration {
    readonly name: string;
    readonly displayName: string;
    readonly base: TuiThemeBase;
    readonly colors: Readonly<Partial<Theme>>;
}
/** Host-only read surface for runtime themes. */
export interface TuiThemeHost {
    register(descriptor: TuiThemeDescriptor): () => void;
    getSnapshot(): readonly TuiThemeRegistration[];
    resolve(name: string): Theme | undefined;
    subscribe(listener: () => void): () => void;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        tuiThemes: TuiThemeRuntime;
    }
}
/** `ctx.tuiThemes` — plugin runtime theme registry. */
export declare class TuiThemeRuntime extends Service {
    constructor(ctx: Context);
    /**
     * Register one immutable runtime palette. Invalid and duplicate declarations
     * warn and return an inert disposer; successful registrations are bound to
     * the caller's Cordis activation and disappear with that activation.
     */
    register(descriptor: TuiThemeDescriptor, identity?: Context): () => void;
}
/** Host-only accessor; intentionally omitted from `src/extensions.ts`. */
export declare function getHostThemes(runtime: TuiThemeRuntime | undefined): TuiThemeHost | undefined;
export default TuiThemeRuntime;
//# sourceMappingURL=themes.d.ts.map
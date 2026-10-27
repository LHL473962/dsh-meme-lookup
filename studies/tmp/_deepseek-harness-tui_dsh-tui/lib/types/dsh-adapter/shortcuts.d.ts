/**
 * Plugin keyboard shortcuts — pi's `pi.registerShortcut`. A plugin binds a
 * combo (`ctrl+shift+p`, `alt+k`, …) to a handler; the chat screen matches
 * combos against keypresses that survived every built-in binding and runs
 * the handler, consuming the key.
 *
 * Precedence rule (same philosophy as the command list: a plugin shadows
 * nothing built in):
 *
 * - Combos must carry ctrl or alt (meta) — bare letters are typing, and
 *   bare Esc/arrows are navigation. Rejected at registration.
 * - A RESERVED list (fixed combos the TUI itself binds globally or in the
 *   prompt editor, PLUS the effective combos of every customizable built-in
 *   action from src/utils/keymap.ts) is refused at registration with a
 *   warning. The list is the enforcement of "locals win": collisions can
 *   never reach the matcher — and it follows user remaps made in /settings.
 * - Overlays (pickers, dialogs, scenes, the session browser) own the
 *   keyboard while open; shortcuts match only in the plain chat state.
 *
 * Handlers are fire-and-forget from the UI's point of view: async handlers
 * are awaited but their rejection is caught and toasted — a throwing
 * handler must never break the keyboard for everyone else.
 */
import { Context, Service } from '@deepseek-ai/cordis';
import { comboMatchesStrict, parseCombo, type ComboKeyFlags, type ParsedCombo } from '../utils/keymap.js';
/**
 * Minimal shape of the ink Key flags the matcher reads (kept structurally
 * compatible with `Key` from the ui kit without importing React-facing
 * modules into the adapter).
 */
export type TuiShortcutKey = ComboKeyFlags;
export declare const parseShortcutCombo: typeof parseCombo;
export declare const matchShortcut: typeof comboMatchesStrict;
export type { ParsedCombo };
/** Controls that only the Chat input path may use. They are kept out of the
 * Cordis service object, so one plugin cannot synthesize an input event to
 * invoke another plugin's shortcut handler. */
export interface TuiShortcutHost {
    register(combo: string, options: TuiShortcutOptions): () => void;
    list(): readonly {
        combo: string;
        description: string;
    }[];
    dispatch(input: string, key: TuiShortcutKey): boolean;
    setErrorHandler(handler: (combo: string, error: unknown) => void): () => void;
}
export interface TuiShortcutOptions {
    /** Required one-line label returned by list() for diagnostics. */
    description: string;
    handler: () => void | Promise<void>;
}
declare module '@deepseek-ai/cordis' {
    interface Context {
        tuiShortcuts: TuiShortcutRuntime;
    }
}
/** `ctx.tuiShortcuts` — plugin keyboard shortcut registry. */
export declare class TuiShortcutRuntime extends Service {
    constructor(ctx: Context);
    /**
     * Bind `combo` to `handler`. Invalid, modifier-less, reserved, or
     * duplicate combos are refused with a logger warning rather than a throw
     * — a bad binding must not fail the plugin's whole boot.
     *
     * Returns the dispose function; the CALLER scopes it to its own fiber
     * (`ctx.effect(() => dispose)`) — the same contract as `tuiScenes`
     * registration. (A service method only sees the service's own ctx, so
     * caller-fiber cleanup cannot happen here.)
     *
     * The optional trailing `identity` (the plugin's own ctx) only feeds the
     * effect ledger's pluginId — omitting it records `undeclared` (C-060).
     */
    register(combo: string, options: TuiShortcutOptions, identity?: Context): () => void;
    /** Combos and descriptions owned by the calling plugin activation. */
    list(): readonly {
        combo: string;
        description: string;
    }[];
}
export declare function getHostShortcuts(runtime: TuiShortcutRuntime | undefined): TuiShortcutHost | undefined;
export default TuiShortcutRuntime;
//# sourceMappingURL=shortcuts.d.ts.map
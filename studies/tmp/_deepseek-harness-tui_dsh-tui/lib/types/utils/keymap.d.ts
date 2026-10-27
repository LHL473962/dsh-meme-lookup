/**
 * Built-in keyboard-shortcut keymap: the shared combo grammar, the action
 * registry, and the live override cache behind `/settings` customization.
 *
 * Split of concerns across the input stack:
 * - `dsh-adapter/shortcuts.ts` owns the PLUGIN registry (`ctx.tuiShortcuts`)
 *   and re-exports the grammar from here so both sides parse identically.
 * - This module owns what the TUI itself binds: a fixed set of named actions
 *   (paste, history, editor, …) whose combos resolve as
 *   settings.yaml user layer > cordis.yml `shortcuts` > the registry default.
 * `Chat.tsx` / `PromptInput.tsx` match keypresses against the EFFECTIVE
 * combos via {@link actionMatches} — never against a hardcoded string.
 *
 * The macOS modifier alias mirrors `isMod`: a combo spelled with `ctrl`
 * matches Cmd (`super`) on the mac too, so `ctrl+v` keeps meaning "paste
 * with the platform primary modifier" everywhere. `alt` always means the
 * ink `meta` flag. Shift must match exactly (ctrl+shift+v is the terminal's
 * native paste, never the app's clipboard read).
 */
/** Minimal structural shape of the ink Key flags the matchers read. */
export interface ComboKeyFlags {
    ctrl?: boolean;
    meta?: boolean;
    super?: boolean;
    shift?: boolean;
    return?: boolean;
    escape?: boolean;
    tab?: boolean;
    backspace?: boolean;
    delete?: boolean;
    upArrow?: boolean;
    downArrow?: boolean;
    leftArrow?: boolean;
    rightArrow?: boolean;
    home?: boolean;
    end?: boolean;
    pageUp?: boolean;
    pageDown?: boolean;
}
/** A parsed `ctrl+shift+p` style combo. */
export interface ParsedCombo {
    readonly raw: string;
    readonly ctrl: boolean;
    readonly meta: boolean;
    readonly shift: boolean;
    /** Named key flag on the Key object, or undefined for a character key. */
    readonly named?: keyof ComboKeyFlags;
    /** Character to match against the ink `input` string (lowercased). */
    readonly char?: string;
}
/**
 * Parse `ctrl+shift+p` style combos. Returns undefined on anything
 * malformed or disallowed (no ctrl/alt modifier, unknown key name, escape
 * combos — the same grammar the plugin shortcut registry enforces).
 */
export declare function parseCombo(raw: string): ParsedCombo | undefined;
/** Canonical form for dedupe/reserved checks: modifiers sorted, key last. */
export declare function canonicalCombo(combo: ParsedCombo): string;
/** Canonicalize a user-spelled combo string (`ctrl+c`); unparseable input
 *  comes back lowercased as-is so reserved sets can still carry entries the
 *  grammar itself refuses (bare escape, tab…). */
export declare function canonicalComboString(raw: string): string;
/**
 * Strict matcher (plugin registry semantics): every modifier flag must equal
 * the combo's. `ctrl` means the ctrl flag only — no platform alias.
 */
export declare function comboMatchesStrict(combo: ParsedCombo, input: string, key: ComboKeyFlags): boolean;
/** Identifiers of every customizable built-in action. */
export type ShortcutActionId = 'paste' | 'history' | 'editor' | 'transcript' | 'trajectory' | 'dashboard' | 'contextPanel'
/** 落地页「继续上次会话」一键（第七版）：只在启动页生效，聊天页不绑。 */
 | 'continue' | 'showAll' | 'questionFold' | 'questionDetailUp' | 'questionDetailDown' | 'redraw' | 'todoFold' | 'expandEditor' | 'star' | 'undo' | 'sidePanel' | 'sidePanelZoom';
export interface ShortcutActionSpec {
    readonly id: ShortcutActionId;
    /** Default combos; the FIRST entry is the canonical display form. */
    readonly defaults: readonly string[];
    /**
     * Opt out of the macOS ctrl↔Cmd alias for this action: the combo then needs
     * the real ctrl flag. Draft undo uses it so Cmd+Z keeps whatever meaning the
     * rest of macOS gives it.
     */
    readonly exactPrimary?: boolean;
}
/**
 * The registry. Defaults encode today's hard-wired bindings — `paste` also
 * carries the `alt+v` alias for terminals that intercept Ctrl+V before the
 * app ever sees the byte (some terminals/IMEs reserve Ctrl+V for their own
 * paste and never forward it in raw mode).
 */
export declare const SHORTCUT_ACTIONS: readonly ShortcutActionSpec[];
/**
 * Replace the whole override map. Invalid or blank entries are DROPPED
 * (the action keeps its default) — a typo in cordis.yml must never disable
 * a built-in, and the settings field's parse already refuses invalid
 * drafts before anything is written.
 */
export declare function setKeymapOverrides(overrides: Partial<Record<ShortcutActionId, string | readonly string[] | undefined>>): void;
/** Test seam: drop every override. */
export declare function resetKeymapOverrides(): void;
/** Effective combos for one action (overrides win over defaults). */
export declare function effectiveCombos(action: ShortcutActionId): readonly ParsedCombo[];
/** Effective combos as display strings (`ctrl+v, alt+v`). */
export declare function effectiveComboString(action: ShortcutActionId): string;
/** First effective combo, lowercase ('ctrl+o'): the inline-hint form, so
 *  hints follow remaps (#1028). */
export declare function primaryComboString(action: ShortcutActionId): string;
/** One combo in display capitalization ('ctrl+k' → 'Ctrl+K'). */
export declare function comboDisplay(raw: string): string;
/** Effective combos as display strings ('Ctrl+K, Alt+V'). */
export declare function effectiveComboDisplay(action: ShortcutActionId): string;
/** Match a keypress against an action's EFFECTIVE combos (platform alias
 *  included, minus the actions that opted out via `exactPrimary`). This is
 *  the one call site Chat/PromptInput should need. `platformAlias` is a test
 *  seam: a Linux CI passes `true` to assert the macOS polarity. */
export declare function actionMatches(action: ShortcutActionId, input: string, key: ComboKeyFlags, platformAlias?: boolean): boolean;
/**
 * Parse user draft text for a settings field: one or more combos separated
 * by commas/semicolons (spaces around separators tolerated). Empty/blank
 * text means "restore the default" ({ combos: [] }); a malformed token makes
 * the whole draft undefined (invalid — the settings screen blocks the save).
 */
export declare function parseComboDraft(text: string): {
    combos: string[];
} | undefined;
/**
 * Canonical combos the TUI binds but users canNOT remap — interrupt/exit,
 * the readline-style editor keys, the newline variants, and the navigation
 * keys plugins must never shadow. The customizable action combos (see
 * {@link SHORTCUT_ACTIONS}) join this set dynamically wherever both are
 * consulted. Entries the combo grammar itself refuses (bare escape, tab,
 * shift+tab) stay listed verbatim for the lowercase fallback canonical.
 */
export declare const FIXED_RESERVED_COMBOS: readonly string[];
/** The fixed reserved set in canonical form (shared with the adapter registry). */
export declare function fixedReservedCombos(): ReadonlySet<string>;
/** Whether a user-spelled combo hits a binding that no remap can free. */
export declare function isFixedReserved(raw: string): boolean;
/**
 * Draft-time conflict check for the settings fields: a combo is unusable
 * when it is fixed-reserved, or when some OTHER action currently binds it
 * (its own action's defaults are fine to restate). Without this a remap
 * like history → ctrl+v would silently shadow paste at match time.
 */
export declare function draftComboConflicts(action: ShortcutActionId, combos: readonly string[]): boolean;
/**
 * Canonical combos every customizable action currently binds (defaults ∪
 * overrides) — the `dsh-adapter` plugin registry folds these into its
 * reserved set so a plugin can never shadow a built-in, however the user
 * remapped it.
 */
export declare function reservedActionCombos(): ReadonlySet<string>;
//# sourceMappingURL=keymap.d.ts.map
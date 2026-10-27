/**
 * dsh-tui color themes — Gentle Mist Blue (雾蓝), Sakura Pink (樱), and the
 * Claude Code brand adaptation.
 *
 * Gentle Mist Blue (雾蓝) is the default family. Two truecolor palettes share
 * one identity: mist blues carry brand, focus, and interaction; body text
 * stays neutral. `light` uses white panel surfaces (#FFFFFF) and ink text
 * (#343945) for light terminals; `dark` is its dark-terminal adaptation (warm
 * off-white text, accent-soft blues). `dark-ansi` is the 16-color fallback for
 * terminals without truecolor.
 *
 * Sakura Pink (樱) is the optional second family. Sakura pink carries brand,
 * focus and interaction, and the surfaces stay warm so the palette reads soft
 * rather than neon: `pink-day` for light terminals, `pink-night` for dark
 * ones, `pink-ansi` as the 16-color fallback. The three keep the same role
 * split as the mist family, so switching families changes hue, not the
 * contrast structure every component relies on. `mascotBody` has no upstream
 * consumer, so all three keep the mist family's orange rather than a pink that
 * never renders.
 *
 * The active palette is chosen at startup by querying the terminal background
 * (OSC 11) — see ThemeProvider.
 *
 * `claude` is the Claude Code brand adaptation of `dark` (see
 * `branding.ts`): warm orange (#E8913F) carries brand/focus, panels and
 * cards sit on warm browns (#33261C family), while the semantic state
 * colors (success green / error rose / auto-accept violet / plan sage)
 * keep their hues. ThemeProvider serves it as the dark default while the
 * claude brand is active and the user has no explicit theme choice.
 *
 * `auto` is a pseudo-theme, not a palette: it resolves to `light` or `dark`
 * from the terminal background detected via OSC 11 (which tracks the system
 * theme in terminals that follow it). ThemeProvider re-runs detection every
 * time `auto` is selected and pushes the result through setAutoThemeBase(),
 * so getTheme('auto') always serves the currently detected palette. `auto`
 * spans the mist family only; the sakura family is selected explicitly.
 */
export type Theme = {
    autoAccept: string;
    bashBorder: string;
    /** Primary brand/focus color. */
    accent: string;
    toolNameMutate: string;
    toolNameExec: string;
    /** Primary brand/focus shimmer color. */
    accentShimmer: string;
    /** Working activity indicator color. */
    activity: string;
    /** Working activity indicator shimmer color. */
    activityShimmer: string;
    permission: string;
    permissionShimmer: string;
    planMode: string;
    ide: string;
    promptBorder: string;
    promptBorderShimmer: string;
    text: string;
    inverseText: string;
    inactive: string;
    inactiveShimmer: string;
    subtle: string;
    suggestion: string;
    remember: string;
    background: string;
    success: string;
    error: string;
    warning: string;
    merged: string;
    warningShimmer: string;
    diffAdded: string;
    diffRemoved: string;
    diffAddedDimmed: string;
    diffRemovedDimmed: string;
    diffAddedWord: string;
    diffRemovedWord: string;
    toolCardBackground: string;
    toolCardBackgroundDim: string;
    toolDotExec: string;
    toolDotRead: string;
    toolDotWrite: string;
    toolDotWeb: string;
    toolDotTask: string;
    syntaxKeyword: string;
    syntaxString: string;
    syntaxComment: string;
    syntaxNumber: string;
    syntaxFunction: string;
    syntaxType: string;
    syntaxVariable: string;
    syntaxOperator: string;
    syntaxPunctuation: string;
    syntaxConstant: string;
    professionalBlue: string;
    chromeYellow: string;
    contextBarSystem: string;
    contextBarPrompt: string;
    contextBarAssistant: string;
    contextBarThinking: string;
    contextBarTools: string;
    /** Effort ignition colour: the wave crest, the charged `❯` and the badge. */
    ignition: string;
    /** Where the ignition wave fades out (its resting end), i.e. the band colour. */
    ignitionDim: string;
    /**
     * Painted caret / image-token focus fill. Empty uses inverse video;
     * ordinary TTY carets inherit the terminal's cursor settings instead.
     */
    cursor: string;
    /** Mascot body color. */
    mascotBody: string;
    /** Input/editor background color. */
    inputBackground: string;
    userMessageBackground: string;
    userMessageBackgroundHover: string;
    messageActionsBackground: string;
    selectionBg: string;
    bashMessageBackgroundColor: string;
    memoryBackgroundColor: string;
    rate_limit_fill: string;
    rate_limit_empty: string;
    fastMode: string;
    fastModeShimmer: string;
    userPromptLabel: string;
    subagentBullet: string;
    subagentDescription: string;
    subagentModel: string;
    subagentElapsed: string;
    subagentToolName: string;
    subagentStatusRunning: string;
    subagentStatusCompleted: string;
    subagentStatusFailed: string;
};
/**
 * Theme keys used by pre-semantic theme files and plugin descriptors.
 * Keep this input compatibility surface separate from the resolved Theme
 * contract: palettes exposed to consumers contain semantic keys only.
 */
export type DeprecatedThemeKey = 'claude' | 'claudeShimmer' | 'claudeBlue_FOR_SYSTEM_SPINNER' | 'claudeBlueShimmer_FOR_SYSTEM_SPINNER' | 'clawd_body' | 'clawd_background' | 'briefLabelYou';
declare const RETIRED_THEME_KEYS: readonly ["briefLabelClaude", "red_FOR_SUBAGENTS_ONLY", "blue_FOR_SUBAGENTS_ONLY", "green_FOR_SUBAGENTS_ONLY", "yellow_FOR_SUBAGENTS_ONLY", "purple_FOR_SUBAGENTS_ONLY", "orange_FOR_SUBAGENTS_ONLY", "pink_FOR_SUBAGENTS_ONLY", "cyan_FOR_SUBAGENTS_ONLY", "rainbow_red", "rainbow_red_shimmer", "rainbow_orange", "rainbow_orange_shimmer", "rainbow_yellow", "rainbow_yellow_shimmer", "rainbow_green", "rainbow_green_shimmer", "rainbow_blue", "rainbow_blue_shimmer", "rainbow_indigo", "rainbow_indigo_shimmer", "rainbow_violet", "rainbow_violet_shimmer"];
export type RetiredThemeKey = (typeof RETIRED_THEME_KEYS)[number];
/** Obsolete, unused palette slots are accepted only at input boundaries. */
export declare function isRetiredThemeKey(value: string): value is RetiredThemeKey;
export type ThemeColorKey = keyof Theme | DeprecatedThemeKey | RetiredThemeKey;
export declare const DEPRECATED_THEME_KEY_ALIASES: Readonly<Record<DeprecatedThemeKey, keyof Theme>>;
/** Convert a legacy persisted/plugin key to its semantic key. */
export declare function normalizeThemeKey(value: string): keyof Theme | undefined;
/** Whether a key is accepted at a theme input boundary, including aliases. */
export declare function isThemeColorKey(value: unknown): value is ThemeColorKey;
/**
 * The built-in theme names, in display order. The sakura family repeats the
 * mist family's own ordering (dark, ansi, light) so the picker reads as two
 * parallel groups rather than an appended list; the brand pairs (claude,
 * codex) land last — they are served as brand defaults, not picked as a
 * family.
 */
export declare const THEME_NAMES: readonly ["dark", "dark-ansi", "light", "pink-night", "pink-ansi", "pink-day", "claude-dark", "claude-paper", "codex-lavender", "codex-paper"];
/**
 * Whether a name is a built-in palette (THEME_NAMES membership, never the base
 * roles a theme file may overlay).
 */
export declare function isBuiltInThemeName(name: string): boolean;
/**
 * The `auto` pseudo-theme: not a palette, but a standing request to follow
 * the terminal background (OSC 11, which tracks the system theme in
 * terminals that follow it). Selectable everywhere a theme name is
 * (/theme, DSH_TUI_THEME, ~/.dsh-tui/theme.json); getTheme() resolves it to
 * the last detected `light`/`dark` palette via the auto base below.
 */
export declare const AUTO_THEME_NAME = "auto";
/**
 * Record the palette `auto` should resolve to. Called by ThemeProvider
 * after each terminal-background detection while `auto` is active.
 * @param name - The detected base palette.
 */
export declare function setAutoThemeBase(name: 'light' | 'dark'): void;
/** The palette `auto` currently resolves to (`light` or `dark`). */
export declare function getAutoThemeBase(): 'light' | 'dark';
/**
 * Any theme name: a built-in palette (`light`/`dark`/`dark-ansi`), a user
 * theme from ~/.dsh-tui/themes/<name>.json, or a host runtime contribution.
 * Always resolvable to a concrete color palette via getTheme() (unknown names
 * fall back to `dark`).
 */
export type ThemeName = string;
/**
 * Normalize a palette returned by an older resolver or plugin. Resolvers are
 * process-local extension points, so an already loaded plugin may still
 * return the pre-semantic keys after this package has been upgraded. Canonical
 * keys win when both forms are present; aliases are removed from the resolved
 * palette so every consumer sees one stable Theme shape.
 */
export declare function normalizeThemePalette(value: unknown): Theme | undefined;
/**
 * Resolve a theme name to its concrete color palette.
 * @param themeName - The theme to resolve (built-in, `auto`, or user theme
 *   name).
 * @returns The matching palette; `auto` resolves to the detected base
 *   (light/dark), unknown names fall back to `dark`.
 */
export declare function getTheme(themeName: ThemeName): Theme;
/** A resolver for a fully built palette. Undefined means “not mine”. */
export type ThemeResolver = (name: string) => Theme | undefined;
/**
 * Whether the active theme's RESOLVED palette renders on a light background.
 * Keyed off the resolved palette's IDENTITY for the built-ins (auto resolves
 * to the shared light/dark instance, so this covers auto-with-light-terminal
 * that theme-NAME comparisons miss) and off the ink-text luminance for
 * custom and runtime themes (light palettes pair with dark ink). The palette's
 * `background` field is a badge fill, not the terminal background — never a
 * lightness signal. Colour-pair variants (effort ignition hues) consume this.
 */
export declare function isLightThemeActive(themeName: ThemeName): boolean;
/**
 * The glyph color for a solid caret block: whichever palette ink (`text` or
 * `inverseText`) contrasts better with the declared `cursor` fill. The
 * built-ins declare no fill, so every one of them answers `inverseText` and
 * keeps the inverse-video caret; a user or plugin theme that paints a light
 * block (where the near-white inverse ink sits at 2.50:1 and the ink text at
 * 4.82:1) gets the readable ink instead. A fill or ink the parser cannot read
 * (any `ansi:*` palette) keeps `inverseText` too: exactly the behavior every
 * palette had before the caret key existed.
 */
export declare function cursorGlyphColor(theme: Theme): 'text' | 'inverseText';
/**
 * Register the custom-theme resolver. Called once by ThemeProvider; the
 * resolver must return `undefined` for names it does not know so getTheme
 * falls back to `dark`.
 * @param resolver - Resolves a user theme name to a built palette.
 */
export declare function registerCustomThemeResolver(resolver: ThemeResolver): void;
/**
 * Register the host runtime resolver. The returned cleanup is generation-safe:
 * disposing an older registration cannot clear a resolver installed later;
 * nested registrations restore the previous live resolver when they leave.
 */
export declare function registerRuntimeThemeResolver(resolver: ThemeResolver): () => void;
/** Clear all runtime resolvers, primarily for isolated host teardown/tests. */
export declare function clearRuntimeThemeResolver(): void;
/**
 * Whether a name resolves through the built-ins, static custom resolver, or
 * the optional runtime resolver. This deliberately remains separate from
 * customTheme.isThemeAvailable(), whose contract is static-file-only.
 */
export declare function isThemeAvailable(themeName: ThemeName): boolean;
/**
 * Set the module-level active theme; ThemeProvider calls this once
 * background detection settles and on every runtime theme switch.
 * @param name - The theme to activate.
 */
export declare function setActiveThemeName(name: ThemeName): void;
/**
 * Resolve the currently active theme for non-React rendering.
 * @returns The palette of the module-level active theme.
 */
/** The name of the module-level active theme (mirror of setActiveThemeName). */
export declare function getActiveThemeName(): ThemeName;
export declare function getActiveTheme(): Theme;
export {};
//# sourceMappingURL=theme.d.ts.map
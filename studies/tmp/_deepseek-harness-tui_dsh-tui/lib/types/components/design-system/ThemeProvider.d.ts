import React from 'react';
import type { TuiThemeHost } from '../../dsh-adapter/themes.js';
/**
 * DSH_TUI_THEME skips terminal detection (tests, debugging). Accepts a
 * built-in, static JSON, or runtime plugin theme name; invalid
 * values are warned and ignored by the caller, falling back to detection.
 * Exported for /reload, which must respect the env override's precedence.
 */
export declare function envThemeOverride(): string | undefined;
export declare function ThemeProvider({ children, theme, themeHost, }: {
    children: React.ReactNode;
    theme?: string;
    /** Optional runtime theme host; absent in headless/static embeds. */
    themeHost?: TuiThemeHost;
}): React.ReactNode;
/**
 * Resolves the active theme name and the runtime setter. Returns
 * `[themeName, setTheme]`.
 */
export declare function useTheme(): [string, (name: string) => boolean];
/**
 * The colour the terminal shows behind the UI (`#rrggbb`): the OSC 11
 * answer when available, else white/black by palette lightness. Terminal
 * image placements use it as their opaque Sixel backing.
 */
export declare function useTerminalBackground(): `#${string}`;
//# sourceMappingURL=ThemeProvider.d.ts.map
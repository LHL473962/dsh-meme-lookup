import { jsx as _jsx } from "react/jsx-runtime";
import Box from '../../ink/components/Box.js';
import { getTheme } from '../../theme.js';
import { useTheme } from './ThemeProvider.js';
/** Resolves a color value that may be a theme key to a raw Color. */
function resolveColor(color, theme) {
    if (!color)
        return undefined;
    if (color.startsWith('rgb(') ||
        color.startsWith('#') ||
        color.startsWith('ansi256(') ||
        color.startsWith('ansi:')) {
        return color;
    }
    // Theme keys may be '' ("no color" in that theme) - collapse to undefined
    // so empty tokens render as no background/foreground instead of feeding
    // an empty color string to Ink.
    return theme[color] || undefined;
}
/**
 * Theme-aware Box component that resolves theme color keys to raw colors
 * in the dsh-TUI visual language.
 */
function ThemedBox({ borderColor, borderTopColor, borderBottomColor, borderLeftColor, borderRightColor, backgroundColor, occlusionColor, ...rest }) {
    const [themeName] = useTheme();
    const theme = getTheme(themeName);
    return (_jsx(Box, { ...rest, borderColor: resolveColor(borderColor, theme), borderTopColor: resolveColor(borderTopColor, theme), borderBottomColor: resolveColor(borderBottomColor, theme), borderLeftColor: resolveColor(borderLeftColor, theme), borderRightColor: resolveColor(borderRightColor, theme), backgroundColor: resolveColor(backgroundColor, theme), occlusionColor: resolveColor(occlusionColor, theme) }));
}
export default ThemedBox;

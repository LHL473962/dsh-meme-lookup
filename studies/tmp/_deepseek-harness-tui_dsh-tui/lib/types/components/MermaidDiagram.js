import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Box, Text } from '../ui.js';
import { useTerminalSize } from '../ink/hooks/use-terminal-size.js';
import { stringWidth } from '../ink/stringWidth.js';
import { getTheme } from '../theme.js';
import { useTheme } from './design-system/ThemeProvider.js';
import { CodeBlockFrame } from './CodeBlockFrame.js';
import { getMermaidEnginePromise, paintMermaidArt, peekMermaidEngine, renderMermaid, } from '../terminal-utils/mermaid.js';
import { getMermaidDiagrams, subscribeMermaidDiagrams } from '../tuiDisplayPrefs.js';
import { t } from '../i18n.js';
/**
 * A ```mermaid fence rendered as Unicode box-drawing art.
 *
 * The art is shown on its own, indented like a code-block body; the
 * ```mermaid fence line is a code-block affordance and a diagram needs none.
 * Whenever there is no art to show (setting off, engine still loading or
 * unavailable, unsupported diagram type, nothing parsed, or the layout is
 * wider than the viewport) the block falls back to the shared
 * CodeBlockFrame — because that IS a code block — and a too-wide diagram
 * adds a caption with the width it needs.
 */
/** Same viewport slack MarkdownTable keeps for gutters and message insets. */
const SAFETY_MARGIN = 4;
const INDENT = '  ';
/** Column budget the indent takes: display width, not string length. */
const INDENT_WIDTH = stringWidth(INDENT);
/** The lazily loaded engine: available on first render once any earlier
 *  diagram loaded it, otherwise resolved after mount. */
function useMermaidEngine() {
    const [engine, setEngine] = React.useState(() => peekMermaidEngine() ?? null);
    React.useEffect(() => {
        if (engine !== null)
            return;
        let mounted = true;
        void getMermaidEnginePromise().then(loaded => {
            if (mounted && loaded !== null)
                setEngine(loaded);
        });
        return () => {
            mounted = false;
        };
    }, [engine]);
    return engine;
}
export function MermaidDiagram({ token, highlight, dimColor, forceWidth }) {
    const enabled = React.useSyncExternalStore(subscribeMermaidDiagrams, getMermaidDiagrams);
    const engine = useMermaidEngine();
    const { columns } = useTerminalSize();
    const [themeName] = useTheme();
    const theme = getTheme(themeName);
    const width = Math.max(0, forceWidth ?? columns);
    // Layout is width-independent (the engine draws at natural size), so a
    // resize or theme switch only re-paints; streaming changes token.text
    // every frame and re-lays out — sub-millisecond for a warm engine.
    const art = React.useMemo(() => (enabled && engine !== null ? renderMermaid(engine, token.text) : null), [enabled, engine, token.text]);
    if (art === null || art.width > width - INDENT_WIDTH - SAFETY_MARGIN) {
        // No art to show: this IS a code block, so it falls back to the
        // ordinary CodeBlockFrame (shared with plain fences).
        return (_jsxs(Box, { flexDirection: "column", children: [_jsx(CodeBlockFrame, { token: token, highlight: highlight, dimColor: dimColor, forceWidth: forceWidth }), art !== null && (_jsx(Text, { color: "inactive", children: INDENT + t('mermaid-too-wide', { width: art.width }) }))] }));
    }
    return (_jsx(Text, { dimColor: dimColor, children: paintMermaidArt(art, theme).map(line => INDENT + line).join('\n') }));
}

import { jsx as _jsx } from "react/jsx-runtime";
import React from 'react';
import { Text } from '../ui.js';
import { getCliHighlightPromise } from '../terminal-utils/cliHighlight.js';
import { highlightLines, syntaxThemeSignature } from '../terminal-utils/syntaxRuns.js';
import { getTheme } from '../theme.js';
import { useTheme } from './design-system/ThemeProvider.js';
/** Async nested Text renderer. Lexes the complete payload before splitting. */
export function SyntaxText({ text, language, sourceText = text, lineIndex = 0, color, dimColor }) {
    const [highlighter, setHighlighter] = React.useState(null);
    const [themeName] = useTheme();
    React.useEffect(() => {
        let mounted = true;
        void getCliHighlightPromise().then(value => { if (mounted)
            setHighlighter(value); });
        return () => { mounted = false; };
    }, []);
    // 当次渲染解析色板，**不按名字 memo**：`auto` 明暗翻转、运行时同名重注册
    // 都不改名字，只改色板身份；按名字缓存会一直留着旧色板（getTheme 本身只是
    // 一次 switch / resolver 查表，与其它取色组件一致）。
    const theme = getTheme(themeName);
    const themeSig = React.useMemo(() => syntaxThemeSignature(theme), [theme]);
    const syntax = React.useMemo(() => highlightLines(sourceText, language, highlighter, theme, themeSig), [sourceText, language, highlighter, theme, themeSig]);
    const runs = syntax?.[lineIndex];
    if (runs === undefined || color !== undefined || dimColor) {
        return _jsx(Text, { color: color, dimColor: dimColor, children: text === '' ? ' ' : text });
    }
    let remaining = text.length;
    const visibleRuns = runs.flatMap(run => {
        if (remaining <= 0)
            return [];
        const visible = run.text.slice(0, remaining);
        remaining -= visible.length;
        return visible === '' ? [] : [{ ...run, text: visible }];
    });
    return (_jsx(Text, { children: visibleRuns.length === 0 ? text : visibleRuns.map((run, index) => (_jsx(Text, { color: run.color, children: run.text }, index))) }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Box, Text, useInput, ScrollBox, useTerminalSize } from '../ui.js';
import { SpinnerGlyph } from './Spinner/SpinnerGlyph.js';
import { Pane } from './design-system/Pane.js';
import { t } from '../i18n.js';
import { isPlainReturnInput } from '../utils/modifiers.js';
/**
 * `/recap` panel (pi-recap semantics), in the picker/dialog visual
 * language: a permission-colored Pane with a title bar (会话回顾), a
 * scrollable summary body (error / summary / answering spinner), the
 * proposed session title row (apply via `a` or clicking the chip), and a
 * dim italic hint line (click to copy, same as `c`). Owns the keyboard
 * while open, mirroring BtwPanel.
 */
export function RecapPanel({ summary, title, error, streaming, titleApplied, onClose, onCopy, onApplyTitle, }) {
    const scrollRef = React.useRef(null);
    const { rows } = useTerminalSize();
    // Spinner frame (80ms cadence, only while waiting for the first text).
    const [frame, setFrame] = React.useState(0);
    React.useEffect(() => {
        if (!streaming || summary !== '')
            return;
        const interval = setInterval(() => setFrame(f => f + 1), 80);
        return () => clearInterval(interval);
    }, [streaming, summary]);
    const canApply = title !== undefined && title !== '' && !titleApplied;
    useInput((input, key, event) => {
        if (key.escape || isPlainReturnInput(input, key) || input === ' ') {
            event.stopImmediatePropagation();
            onClose();
            return;
        }
        if (key.upArrow || key.downArrow) {
            scrollRef.current?.scrollBy(key.upArrow ? -3 : 3);
            event.stopImmediatePropagation();
            return;
        }
        if (input === 'c' && !key.ctrl) {
            event.stopImmediatePropagation();
            onCopy();
            return;
        }
        if (input === 'a' && !key.ctrl && canApply) {
            event.stopImmediatePropagation();
            onApplyTitle();
            return;
        }
        // The overlay owns the keyboard while open: swallow everything else so
        // nothing leaks into the prompt input behind it.
        event.stopImmediatePropagation();
    });
    const settled = summary !== '' || error !== undefined;
    return (_jsx(Pane, { color: "permission", children: _jsxs(Box, { flexDirection: "column", children: [_jsxs(Box, { marginBottom: 1, children: [_jsx(Text, { color: "remember", bold: true, children: t('recap-panel-title') }), _jsxs(Text, { dimColor: true, children: [" \u00B7 ", t('recap-panel-subtitle')] })] }), _jsx(Box, { flexDirection: "column", maxHeight: Math.max(5, rows - 11), children: _jsx(ScrollBox, { ref: scrollRef, flexDirection: "column", flexGrow: 1, children: error !== undefined ? (_jsx(Text, { color: "error", children: error })) : summary !== '' ? (_jsx(Text, { children: summary })) : (_jsxs(Box, { children: [_jsx(SpinnerGlyph, { frame: frame, messageColor: "warning" }), _jsxs(Text, { color: "warning", children: [" ", t('recap-answering')] })] })) }) }), title !== undefined && (_jsxs(Box, { flexDirection: "row", marginTop: 1, children: [_jsxs(Text, { dimColor: true, children: [t('recap-title-label'), ": "] }), _jsx(Text, { color: "suggestion", children: title }), titleApplied ? (_jsxs(Text, { color: "success", children: [" \u2713 ", t('recap-title-applied')] })) : (_jsx(Box, { onClick: canApply ? onApplyTitle : undefined, children: _jsxs(Text, { color: "success", bold: true, children: [' ', "[", t('recap-apply-title'), "]"] }) }))] })), _jsx(Box, { onClick: settled ? onCopy : undefined, children: _jsx(Text, { dimColor: true, italic: true, children: t('recap-hint', { apply: canApply ? ' · a ' + t('recap-apply-title') : '' }) }) })] }) }));
}

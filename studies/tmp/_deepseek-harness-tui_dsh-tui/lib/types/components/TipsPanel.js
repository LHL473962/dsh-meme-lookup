import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Box, Text, useInput, ScrollBox, useTerminalSize } from '../ui.js';
import { getLang, t } from '../i18n.js';
import { isPlainReturnInput } from '../utils/modifiers.js';
import { TIPS, TIP_GROUP_LABELS } from '../tips.js';
const GROUP_ORDER = ['keys', 'commands', 'workflow', 'display', 'pitfalls'];
/**
 * `/tips` usage-tips panel (inline-pane form like the local pickers and the
 * /btw panel): grouped one-line tips on shortcuts, commands, workflow,
 * display, and gotchas. Owns the keyboard while open — every key it sees is
 * consumed here.
 *
 * The panel is a static list (no paging): the ScrollBox keeps it bounded,
 * and tips are intentionally one-liners so the whole pool stays scannable.
 */
export function TipsPanel({ onClose }) {
    const scrollRef = React.useRef(null);
    const { rows } = useTerminalSize();
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
        // The panel owns the keyboard while open: swallow everything else so
        // nothing leaks into the prompt input behind it.
        event.stopImmediatePropagation();
    });
    const lang = getLang();
    return (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Text, { children: [_jsx(Text, { color: "warning", bold: true, children: "/tips " }), _jsx(Text, { dimColor: true, children: t('tips-title') })] }), _jsx(Box, { flexDirection: "column", maxHeight: Math.max(5, rows - 8), children: _jsx(Box, { marginLeft: 2, flexDirection: "column", flexGrow: 1, children: _jsx(ScrollBox, { ref: scrollRef, flexDirection: "column", flexGrow: 1, children: GROUP_ORDER.map(group => (_jsxs(Box, { flexDirection: "column", marginBottom: 1, children: [_jsx(Text, { bold: true, color: "accent", children: lang === 'zh' ? TIP_GROUP_LABELS[group].zh : TIP_GROUP_LABELS[group].en }), TIPS.filter(tip => tip.group === group).map(tip => (_jsxs(Text, { dimColor: true, children: ['  · ', lang === 'zh' ? tip.zh : tip.en] }, tip.id)))] }, group))) }) }) }), _jsx(Text, { dimColor: true, children: t('tips-hint') })] }));
}

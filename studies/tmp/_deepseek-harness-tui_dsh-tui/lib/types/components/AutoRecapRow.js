import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Box, Text } from '../ui.js';
import { Divider } from './design-system/Divider.js';
import { t } from '../i18n.js';
/**
 * Auto-recap row (`dsh-tui.recapOnOpen` setting): a quiet, dim recap shown
 * at the bottom of the transcript after an automatic summary on session
 * open/resume — a thin divider, then a `回顾：` line showing the session
 * tail in FULL (wraps over lines rather than truncating, like a colleague
 * catching the user up). Hover reveals the affordances on their own row;
 * click expands into the full RecapPanel; the dismiss chip hides the row
 * until the next session switch. It bows out on its own once the user
 * starts a new message (see Chat.tsx). Keyboard users keep `/recap` for
 * the full panel.
 */
export function AutoRecapRow({ summary, streaming, onExpand, onDismiss, }) {
    const [hovered, setHovered] = React.useState(false);
    const line = t('recap-auto-line', {
        summary: streaming ? t('recap-answering') : summary,
    });
    return (_jsxs(Box, { flexDirection: "column", marginTop: 1, children: [_jsx(Divider, {}), _jsxs(Box, { flexDirection: "column", marginTop: 1, marginLeft: 1, onClick: onExpand, onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false), children: [_jsx(Text, { dimColor: !hovered, children: line }), hovered && (_jsxs(Box, { flexDirection: "row", marginTop: 1, children: [_jsxs(Text, { dimColor: true, children: [" [", t('recap-auto-hint'), "]"] }), _jsx(Box, { onClick: onDismiss, children: _jsxs(Text, { color: "warning", children: [" [\u00D7 ", t('recap-auto-close'), "]"] }) })] }))] })] }));
}

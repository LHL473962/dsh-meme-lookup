import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from '../../ui.js';
import { stringWidth } from '../../ink/stringWidth.js';
import { t } from '../../i18n.js';
const MARK = '✉ ';
/**
 * An Agent Teams peer message delivered to this session: a `✉ <sender>` line
 * in the agent tint, then the body in plain text with a hanging indent — it
 * reads apart from the human's bold `❯` prompt it shares a log role with.
 * The body wraps in its own flex column, so it fits whatever column hosts it
 * (the main list, a child scene's padded page, a split with the workbench).
 */
export function TeamMessageBubble({ sender, text, marginTopOnTurn, isSelected = false }) {
    return (_jsxs(Box, { flexDirection: "column", marginTop: marginTopOnTurn ? 1 : 0, backgroundColor: isSelected ? 'messageActionsBackground' : undefined, paddingRight: 1, children: [_jsxs(Text, { color: "toolDotTask", wrap: "truncate-end", children: [MARK, _jsx(Text, { bold: true, children: sender }), _jsx(Text, { dimColor: true, children: ` · ${t('team-message-label')}` })] }), _jsxs(Box, { flexDirection: "row", children: [_jsx(Box, { width: stringWidth(MARK), flexShrink: 0 }), _jsx(Box, { flexGrow: 1, flexShrink: 1, children: _jsx(Text, { wrap: "wrap", children: text }) })] })] }));
}

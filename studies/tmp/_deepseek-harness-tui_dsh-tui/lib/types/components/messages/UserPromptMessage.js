import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { Box, Text, useTerminalSize } from '../../ui.js';
import { POINTER } from '../../terminal-utils/figures.js';
import { stringWidth } from '../../ink/stringWidth.js';
import { wrapWidth } from '../../sessions/format.js';
/**
 * User prompt bubble: `❯ text` in bold userPromptLabel tint with no background
 * fill (Kimi Code style: the user turn gets a distinct bold tint — the
 * kernel-rotated brand colour of the active theme — so it reads apart from
 * assistant text; only selection mode paints a highlight).
 */
export function UserPromptMessage({ text, marginTopOnTurn, isSelected = false, onClick, }) {
    const { columns } = useTerminalSize();
    const promptPrefix = `${POINTER} `;
    const prefixWidth = stringWidth(promptPrefix);
    // Wrap here instead of letting Ink wrap the whole Text node. Ink starts an
    // automatic continuation at column zero, while a prompt needs a hanging
    // indent for both explicit newlines and width-based visual lines.
    // Leave a small safety margin for the ScrollBox edge/scrollbar. The Text
    // nodes below are explicitly wrapped, so they must never be wrapped again by
    // Ink; a second wrap would move the continuation back to column zero.
    const lines = wrapWidth(text, Math.max(1, columns - prefixWidth - 3));
    const continuationIndent = ' '.repeat(prefixWidth);
    // No hover tooltip here, deliberately: the message is pre-wrapped so every
    // visual line is already on screen — a float would only repeat visible
    // text, and worse, the card REPLACES the cells it covers, so a drag-copy
    // crossing it yields the tooltip fragment instead of the message.
    return (_jsx(Box, { flexDirection: "column", marginTop: marginTopOnTurn ? 1 : 0, backgroundColor: isSelected ? 'messageActionsBackground' : undefined, paddingRight: 1, onClick: onClick, children: lines.map((line, index) => (_jsxs(Text, { color: "userPromptLabel", bold: true, wrap: "truncate-end", children: [index === 0 ? `${POINTER} ` : continuationIndent, line] }, index))) }));
}

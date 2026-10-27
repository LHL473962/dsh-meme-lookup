import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Box, Text } from '../../ui.js';
import { t } from '../../i18n.js';
import { AssistantTextMessage } from './AssistantTextMessage.js';
import { AssistantThinkingMessage } from './AssistantThinkingMessage.js';
import { AssistantToolUseMessage } from './AssistantToolUseMessage.js';
import { TranscriptImages } from './TranscriptImages.js';
// ── agent↔agent message flow leaves ─────────────────────────────────────────
/** Delivery-state badge color: only what the channel reported — green is
 *  reserved for an explicit `delivered` fact, dim for `unknown`/`expired`. */
export function agentMessageStateColor(state) {
    if (state === 'delivered')
        return 'success';
    if (state === 'refused')
        return 'error';
    if (state === 'issued' || state === 'queued' || state === 'held')
        return 'warning';
    return 'subtle';
}
/** The localized state word (issued/queued/delivered/held/refused/expired/
 *  unknown) — one vocabulary across composer status lines and flow rows. */
export function agentMessageStateText(state) {
    return t(`agent-message-delivery-${state}`);
}
/** One endpoint's short label: `user`/`parent`/`child` for the relations the
 *  view itself proves (own id, parentSessionId), the stable short id for any
 *  other agent. Absent ids stay unnamed — the caller decides whether that is
 *  an unknown-relation row (no arrow). */
export function agentMessagePartyLabel(id, selfAgentId, parentSessionId) {
    if (id === undefined)
        return undefined;
    if (id === 'user')
        return t('agent-message-source-user');
    if (id === selfAgentId)
        return t('agent-message-source-child');
    if (parentSessionId !== undefined && id === parentSessionId)
        return t('agent-message-source-parent');
    return id.length > 8 ? id.slice(0, 8) : id;
}
/** The localized transport word. */
export function agentMessageViaText(via) {
    return t(`agent-message-via-${via}`);
}
/**
 * One agent↔agent message as a transcript leaf: a `⇄ from → to · state`
 * header plus an indented preview, paged together with the thinking/text/
 * tool leaves. Without both endpoints it shows the unknown-relation line
 * and no arrow.
 */
export function AgentMessageLeafRow({ message, selfAgentId, marginTopOnTurn }) {
    const from = agentMessagePartyLabel(message.from, selfAgentId, message.parentSessionId);
    const to = agentMessagePartyLabel(message.to, selfAgentId, message.parentSessionId);
    const known = from !== undefined && to !== undefined;
    const stateColor = agentMessageStateColor(message.state);
    return (_jsxs(Box, { flexDirection: "column", marginTop: marginTopOnTurn ? 1 : 0, paddingLeft: 2, children: [_jsxs(Box, { flexDirection: "row", gap: 1, children: [_jsx(Text, { color: "accent", children: "\u21C4" }), known ? (_jsx(Text, { dimColor: true, wrap: "truncate-end", children: t('agent-message-from-to', { from, to }) })) : (_jsx(Text, { dimColor: true, italic: true, wrap: "truncate-end", children: t('agent-message-unknown-target') })), _jsx(Text, { dimColor: true, children: "\u00B7" }), _jsx(Box, { flexShrink: 0, children: _jsx(Text, { color: stateColor, children: agentMessageStateText(message.state) }) }), _jsx(Text, { dimColor: true, children: "\u00B7" }), _jsx(Text, { dimColor: true, wrap: "truncate-end", children: agentMessageViaText(message.via) })] }), _jsx(Box, { paddingLeft: 2, children: _jsx(Text, { dimColor: true, wrap: "wrap", children: message.text }) }), message.state === 'unknown' && (_jsx(Box, { paddingLeft: 2, children: _jsx(Text, { dimColor: true, italic: true, children: t('agent-message-no-delivery-fact') }) }))] }));
}
/**
 * Transcript leaf rows: the main MessageList and the subagent transcript
 * pages render thinking / tool / text rows through these thin adapters, so
 * a child transcript reads like the main one. Presentation only: fold
 * state, reveal cursors and row anchoring stay with the callers.
 */
/** A settled/live thinking row (`⚓ Thinking` preview or expanded body). */
export function ThinkingLeafRow({ thinking, textFull, marginTopOnTurn, streaming = false, preview = false, verbose, durationMs, reasoningTokens, isSelected = false, onClick, }) {
    return (_jsx(AssistantThinkingMessage, { thinking: thinking, textFull: textFull, marginTopOnTurn: marginTopOnTurn, streaming: streaming, preview: preview, verbose: verbose, durationMs: durationMs, reasoningTokens: reasoningTokens, isSelected: isSelected, onClick: onClick }));
}
/** A tool-call card (args / result / error / diff), optionally with images. */
export function ToolLeafRow({ tool, marginTopOnTurn, verbose, isSelected = false, isExpanded = false, footnote, diffLayout, toolBackground, smoothReveal, fresh, revealVersion, foldTerminalCommand, onClick, onOpenFile, images, onPreviewImage, suppressImageGraphics, sourceFolded, fullscreen, }) {
    return (_jsxs(_Fragment, { children: [_jsx(AssistantToolUseMessage, { tool: tool, marginTopOnTurn: marginTopOnTurn, verbose: verbose, isSelected: isSelected, isExpanded: isExpanded, footnote: footnote, diffLayout: diffLayout, toolBackground: toolBackground, smoothReveal: smoothReveal, fresh: fresh, revealVersion: revealVersion, foldTerminalCommand: foldTerminalCommand, onClick: onClick, onOpenFile: onOpenFile, sourceFolded: sourceFolded, fullscreen: fullscreen }), images !== undefined && _jsx(TranscriptImages, { images: images, indent: 4, onPreview: onPreviewImage, suppressGraphics: suppressImageGraphics })] }));
}
/** An assistant text row (`●` bullet + markdown body). */
export function AssistantTextLeafRow({ text, marginTopOnTurn, isSelected = false, isExpanded = false, }) {
    return (_jsx(AssistantTextMessage, { text: text, marginTopOnTurn: marginTopOnTurn, isSelected: isSelected, isExpanded: isExpanded }));
}

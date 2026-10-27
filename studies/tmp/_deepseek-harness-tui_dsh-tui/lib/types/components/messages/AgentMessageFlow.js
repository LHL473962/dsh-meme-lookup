import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { Box, Text } from '../../ui.js';
import { t } from '../../i18n.js';
import { agentMessagePartyLabel, agentMessageStateColor, agentMessageStateText, agentMessageViaText, } from './TranscriptLeaves.js';
function partyLabels(message, selfAgentId) {
    return {
        from: agentMessagePartyLabel(message.from, selfAgentId, message.parentSessionId),
        to: agentMessagePartyLabel(message.to, selfAgentId, message.parentSessionId),
    };
}
/**
 * One row of the Detail Messages page: sender, target, body, transport,
 * state and sourceRef, newest last. Without both endpoints it shows the
 * unknown-relation line and no arrow.
 */
export function AgentMessageFlowRow({ message, selfAgentId }) {
    const { from, to } = partyLabels(message, selfAgentId);
    const known = from !== undefined && to !== undefined;
    const stateColor = agentMessageStateColor(message.state);
    return (_jsxs(Box, { flexDirection: "column", children: [_jsxs(Box, { flexDirection: "row", gap: 1, children: [_jsx(Text, { color: "accent", children: "\u21C4" }), known
                        ? _jsx(Text, { bold: true, wrap: "truncate-end", children: t('agent-message-from-to', { from: from, to: to }) })
                        : _jsx(Text, { bold: true, italic: true, dimColor: true, children: t('agent-message-unknown-target') }), _jsx(Text, { dimColor: true, children: "\u00B7" }), _jsx(Text, { color: stateColor, children: agentMessageStateText(message.state) })] }), _jsx(Box, { paddingLeft: 2, children: _jsx(Text, { wrap: "wrap", children: message.text }) }), _jsxs(Box, { paddingLeft: 2, flexDirection: "row", gap: 1, children: [_jsx(Text, { dimColor: true, children: agentMessageViaText(message.via) }), message.intentId !== undefined && (_jsxs(_Fragment, { children: [_jsx(Text, { dimColor: true, children: "\u00B7" }), _jsx(Text, { dimColor: true, wrap: "truncate-end", children: message.intentId })] })), message.sourceRef !== undefined && (_jsxs(_Fragment, { children: [_jsx(Text, { dimColor: true, children: "\u00B7" }), _jsx(Text, { dimColor: true, wrap: "truncate-end", children: message.sourceRef })] }))] }), message.state === 'unknown' && (_jsx(Box, { paddingLeft: 2, children: _jsx(Text, { dimColor: true, italic: true, children: t('agent-message-no-delivery-fact') }) }))] }));
}
/**
 * The newest message as one dim `⇄ from → to · state` line under an agent's
 * dashboard card (no unread count: that is the panel badge's job).
 */
export function AgentMessagesSummary({ messages, selfAgentId }) {
    const last = messages[messages.length - 1];
    if (last === undefined)
        return null;
    const { from, to } = partyLabels(last, selfAgentId);
    const known = from !== undefined && to !== undefined;
    return (_jsxs(Box, { flexDirection: "row", gap: 1, paddingLeft: 2, children: [_jsx(Text, { color: "accent", children: "\u21C4" }), known
                ? _jsx(Text, { dimColor: true, wrap: "truncate-end", children: t('agent-message-from-to', { from: from, to: to }) })
                : _jsx(Text, { dimColor: true, italic: true, wrap: "truncate-end", children: t('agent-message-unknown-target') }), _jsx(Text, { dimColor: true, children: "\u00B7" }), _jsx(Text, { color: agentMessageStateColor(last.state), children: agentMessageStateText(last.state) })] }));
}

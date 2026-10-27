import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { Box, Text, useInput, ScrollBox, useTerminalSize } from '../ui.js';
import { SubagentCard, teamStatusGlyph } from './SubagentCard.js';
import { t } from '../i18n.js';
import { Divider } from './design-system/Divider.js';
import { isPlainReturnInput } from '../utils/modifiers.js';
import { usePanelInput } from './sidePanel/usePanelInput.js';
import { AgentMessagesSummary } from './messages/AgentMessageFlow.js';
import { isTeamTaskBlocked, teamDashboardModel, teamTaskProgress } from './teamRoster.js';
import { isMinimalUiMode } from '../minimalUiMode.js';
/** Accept Ink's Enter flag and the panel dispatcher's normalized alias. */
export function isPanelPlainReturn(input, key) {
    return isPlainReturnInput(input, {
        return: key.return_ === true || key.return === true,
        ctrl: key.ctrl,
        meta: key.meta,
        shift: key.shift,
    });
}
/** 可点击 ✕ 退出按钮：整屏/浮层场景的鼠标退出通道（Esc 等价）。 */
export function ExitButton({ onClick }) {
    const [hovered, setHovered] = React.useState(false);
    return (_jsx(Box, { onClick: onClick, onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false), children: _jsx(Text, { color: hovered ? 'text' : 'subtle', children: ' ✕' }) }));
}
/** A teammate the host has not announced as a subagent yet. */
function TeamRosterOnlyRow({ row, focused, panelMode, self }) {
    const { glyph, color } = teamStatusGlyph(row.status, isMinimalUiMode());
    return (_jsxs(Box, { flexDirection: "row", paddingLeft: 1, marginBottom: panelMode ? 0 : 1, children: [_jsx(Box, { flexShrink: 0, marginRight: 1, children: _jsx(Text, { color: color, children: glyph }) }), _jsx(Box, { flexGrow: 1, flexShrink: 1, overflow: "hidden", children: _jsxs(Text, { wrap: "truncate-end", children: [_jsx(Text, { bold: true, color: focused ? 'accent' : undefined, children: row.member.name }), self && _jsx(Text, { dimColor: true, children: ' · ' + t('team-self-mark') })] }) }), _jsx(Box, { flexShrink: 0, marginLeft: 1, children: _jsx(Text, { color: focused ? 'accent' : color, dimColor: row.status === 'provisioning', children: t(`team-status-${row.status}`) }) })] }));
}
const TASK_GLYPH = {
    pending: { glyph: '○', color: 'subtle' },
    in_progress: { glyph: '◐', color: 'accent' },
    completed: { glyph: '●', color: 'success' },
};
/** The team's shared task board, read-only; narrow widths drop the owner. */
function TeamTaskBoard({ tasks }) {
    const { columns } = useTerminalSize();
    return (_jsxs(Box, { flexDirection: "column", marginTop: 1, children: [_jsx(Text, { dimColor: true, wrap: "truncate-end", children: t('team-tasks-title', teamTaskProgress(tasks)) }), tasks.length === 0 && _jsx(Text, { dimColor: true, children: '  ' + t('team-tasks-empty') }), tasks.map(task => (_jsxs(Box, { flexDirection: "row", paddingLeft: 1, children: [_jsx(Box, { flexShrink: 0, marginRight: 1, children: _jsx(Text, { color: TASK_GLYPH[task.status].color, children: TASK_GLYPH[task.status].glyph }) }), _jsx(Box, { flexGrow: 1, flexShrink: 1, overflow: "hidden", children: _jsx(Text, { dimColor: task.status === 'completed', wrap: "truncate-end", children: task.subject }) }), columns >= 40 && task.ownerName !== undefined && (_jsx(Box, { flexShrink: 0, marginLeft: 1, children: _jsx(Text, { dimColor: true, children: '@' + task.ownerName }) })), isTeamTaskBlocked(task) && (_jsx(Box, { flexShrink: 0, marginLeft: 1, children: _jsx(Text, { color: "warning", children: t('team-task-blocked') }) })), task.writeScopeWarnings.length > 0 && (_jsx(Box, { flexShrink: 0, marginLeft: 1, children: _jsx(Text, { color: "warning", children: '⚠' + task.writeScopeWarnings.length }) }))] }, task.id)))] }));
}
/**
 * SubagentDashboard — overlay panel showing all active/recent subagents.
 * Keyboard: up/down to navigate, Enter to view detail, Esc to close.
 */
export function SubagentDashboard({ subagents, team, sessionId, peers, onClose, onSelect, onOpenView, messages, variant = 'default', focused = true, visible = true, }) {
    const panelMode = variant === 'panel';
    // Focus follows the row's key: team mode reorders the rows, and the roster can shrink.
    const [focus, setFocus] = React.useState({ index: 0 });
    const scrollRef = React.useRef(null);
    const { rows, columns } = useTerminalSize();
    // Keep top-level children first when the roster includes nested agents.
    const isNestedSpawn = (row) => row.parentAgentId !== undefined || (row.depth ?? 1) >= 2;
    const nestedRows = subagents.filter(isNestedSpawn);
    const flatRows = subagents.filter(row => !isNestedSpawn(row));
    const ordered = nestedRows.length === 0 ? subagents : [...flatRows, ...nestedRows];
    const model = team === undefined ? undefined : teamDashboardModel(team, subagents, sessionId);
    const others = new Set(model?.others);
    const nested = nestedRows.length;
    const rowEntry = (subagent) => ({ key: subagent.agentId, subagent, nested: nested > 0 && isNestedSpawn(subagent) });
    const entries = model === undefined
        ? ordered.map(rowEntry)
        : [
            ...model.teammates.map(row => ({ key: row.member.id, teamRow: row, nested: false, ...row.subagent === undefined ? {} : { subagent: row.subagent } })),
            ...ordered.filter(row => others.has(row)).map(rowEntry),
        ];
    const othersStart = model === undefined ? -1 : model.teammates.length;
    const focusOf = (state) => {
        const found = state.key === undefined ? -1 : entries.findIndex(entry => entry.key === state.key);
        return found >= 0 ? found : Math.min(state.index, Math.max(0, entries.length - 1));
    };
    const focusIndex = focusOf(focus);
    const moveFocus = (delta) => {
        setFocus((prev) => {
            const index = Math.max(0, Math.min(entries.length - 1, focusOf(prev) + delta));
            const key = entries[index]?.key;
            return key === undefined ? { index } : { index, key };
        });
    };
    useInput((input, key, event) => {
        if (panelMode)
            return;
        if (key.escape || (key.ctrl && input === 'c')) {
            event.stopImmediatePropagation();
            onClose?.();
            return;
        }
        if (key.upArrow) {
            event.stopImmediatePropagation();
            moveFocus(-1);
            scrollRef.current?.scrollBy(-3);
            return;
        }
        if (key.downArrow) {
            event.stopImmediatePropagation();
            moveFocus(1);
            scrollRef.current?.scrollBy(3);
            return;
        }
        if (isPlainReturnInput(input, key) && onSelect) {
            event.stopImmediatePropagation();
            const selected = entries[focusIndex]?.subagent;
            if (selected)
                onSelect(selected.agentId);
            return;
        }
        // v = 主屏查看（Enter 仍是详情）。
        if (input.toLowerCase() === 'v' && onOpenView) {
            event.stopImmediatePropagation();
            const selected = entries[focusIndex]?.subagent;
            if (selected)
                onOpenView(selected.agentId);
            return;
        }
        // Consume all input while dashboard is open
        event.stopImmediatePropagation();
    }, { isActive: !panelMode });
    // Panel keys handle roster navigation; unhandled keys remain available to the host.
    const panelKeyHandler = (input, key) => {
        if (key.escape === true || (key.ctrl === true && input === 'c'))
            return false;
        if (key.upArrow === true) {
            moveFocus(-1);
            scrollRef.current?.scrollBy(-3);
            return true;
        }
        if (key.downArrow === true) {
            moveFocus(1);
            scrollRef.current?.scrollBy(3);
            return true;
        }
        if (isPanelPlainReturn(input, key)) {
            const selected = entries[focusIndex]?.subagent;
            if (selected !== undefined)
                onSelect?.(selected.agentId);
            return true;
        }
        if (input.toLowerCase() === 'v' && onOpenView !== undefined) {
            const selected = entries[focusIndex]?.subagent;
            if (selected !== undefined)
                onOpenView(selected.agentId);
            return true;
        }
        return false;
    };
    usePanelInput(panelKeyHandler, { active: panelMode && focused && visible });
    const running = subagents.filter(s => s.status === 'running').length;
    const completed = subagents.filter(s => s.status === 'completed').length;
    const failed = subagents.filter(s => s.status === 'failed').length;
    const memberCount = (status) => model?.teammates.filter(row => row.status === status).length ?? 0;
    const teamSep = panelMode ? ' · ' : '   ';
    // Full-screen keeps its inset; the panel uses one cell on each side.
    const outer = panelMode
        ? { paddingLeft: 1, paddingRight: 1, paddingTop: 0 }
        : { paddingX: 2, paddingY: 1 };
    return (_jsxs(Box, { flexDirection: "column", ...outer, children: [!panelMode && _jsx(Divider, { color: "accent", title: t(team === undefined ? 'subagent-dashboard-title' : 'team-dashboard-title') }), _jsxs(Box, { flexDirection: "row", gap: 3, marginTop: panelMode ? 0 : 1, marginBottom: panelMode ? 0 : 1, children: [team !== undefined ? (_jsx(Box, { flexShrink: 1, overflow: "hidden", children: _jsxs(Text, { wrap: "truncate-end", children: [_jsx(Text, { color: "accent", children: memberCount('running') }), _jsx(Text, { dimColor: true, children: ' ' + t('team-status-running') + teamSep }), _jsx(Text, { color: "accent", children: memberCount('idle') }), _jsx(Text, { dimColor: true, children: ' ' + t('team-status-idle') + teamSep }), memberCount('provisioning') > 0 && (_jsxs(_Fragment, { children: [_jsx(Text, { dimColor: true, children: memberCount('provisioning') }), _jsx(Text, { dimColor: true, children: ' ' + t('team-status-provisioning') + teamSep })] })), memberCount('active') > 0 && (_jsxs(_Fragment, { children: [_jsx(Text, { color: "accent", children: memberCount('active') }), _jsx(Text, { dimColor: true, children: ' ' + t('team-status-active') + teamSep })] })), memberCount('failed') > 0 && (_jsxs(_Fragment, { children: [_jsx(Text, { color: "error", children: memberCount('failed') }), _jsx(Text, { dimColor: true, children: ' ' + t('team-status-failed') + teamSep })] })), _jsx(Text, { dimColor: true, children: t('team-tasks-count', teamTaskProgress(team.tasks)) })] }) })) : (_jsxs(_Fragment, { children: [_jsxs(Text, { children: [_jsx(Text, { color: "accent", children: running }), _jsxs(Text, { dimColor: true, children: [" ", t('subagent-count-running')] })] }), _jsxs(Text, { children: [_jsx(Text, { color: "success", children: completed }), _jsxs(Text, { dimColor: true, children: [" ", t('subagent-count-completed')] })] }), failed > 0 && (_jsxs(Text, { children: [_jsx(Text, { color: "error", children: failed }), _jsxs(Text, { dimColor: true, children: [" ", t('subagent-count-failed')] })] })), nested > 0 && (_jsxs(Text, { children: [_jsx(Text, { color: "accent", children: nested }), _jsxs(Text, { dimColor: true, children: [" ", t('subagent-count-nested')] })] }))] })), _jsx(Box, { flexGrow: 1 }), !panelMode && onClose !== undefined && _jsx(ExitButton, { onClick: onClose })] }), team?.failure !== undefined && (_jsx(Text, { color: "error", wrap: "wrap", children: '⚠ ' + t('team-failure', { failure: team.failure }) })), _jsx(Box, { flexDirection: "column", maxHeight: panelMode ? Math.max(6, rows - 4) : Math.max(10, rows - 10), marginTop: panelMode ? 0 : 1, children: _jsxs(ScrollBox, { ref: scrollRef, flexDirection: "column", flexGrow: 1, children: [model !== undefined && (_jsxs(_Fragment, { children: [_jsx(Text, { dimColor: true, children: t('team-members-title') }), _jsx(Text, { dimColor: true, wrap: "truncate-end", children: '  ◆ ' + t(model.viewedFromLead ? 'team-lead-row' : 'team-lead-row-peer') })] })), model === undefined && subagents.length === 0 ? (_jsxs(Box, { flexDirection: "column", alignItems: "center", marginTop: Math.max(2, Math.floor((rows - 16) / 3)), children: [_jsx(Text, { dimColor: true, children: '○' }), _jsx(Text, { dimColor: true, children: t('subagent-none') }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: t('subagent-empty-hint') }) })] })) : (entries.map(({ key, subagent, teamRow, nested: nestedMark }, index) => (_jsxs(Box, { flexDirection: "column", children: [index === othersStart && _jsx(Text, { dimColor: true, children: t('team-others-title') }), nestedMark && (_jsx(Text, { dimColor: true, children: '  ↳ ' + t('subagent-nested-mark') })), subagent === undefined ? (teamRow !== undefined && _jsx(TeamRosterOnlyRow, { row: teamRow, focused: index === focusIndex, panelMode: panelMode, self: teamRow.member.id === sessionId })) : (_jsx(SubagentCard, { subagent: subagent, variant: panelMode ? 'panel' : 'default', focused: index === focusIndex, onClick: onSelect !== undefined
                                        // Click = view detail, same as Enter on the focused card.
                                        ? () => onSelect(subagent.agentId)
                                        : undefined, ...teamRow === undefined ? {} : { teamMember: { name: teamRow.member.name, status: teamRow.status } } })), teamRow?.status === 'failed' && teamRow.member.error !== undefined && (_jsx(Text, { color: "error", wrap: "truncate-end", children: '  │ ' + teamRow.member.error })), teamRow?.status === 'idle' && subagent?.status === 'failed' && (_jsx(Text, { color: "error", wrap: "truncate-end", children: '  │ ' + t('team-last-run-failed', { error: subagent.error ?? '' }).trimEnd() })), subagent !== undefined && messages !== undefined && messages.length > 0 && (_jsx(AgentMessagesSummary, { messages: messages.filter(message => message.from === subagent.agentId || message.to === subagent.agentId), selfAgentId: subagent.agentId })), subagent !== undefined && onOpenView !== undefined && (!panelMode || index === focusIndex) && (_jsx(Box, { paddingLeft: 1, onClick: () => onOpenView(subagent.agentId), children: _jsx(Text, { color: "subtle", children: `⤢ ${t('agent-view-open-action')}` }) })), !panelMode && index < entries.length - 1 && index + 1 !== othersStart && (_jsx(Text, { dimColor: true, children: '─'.repeat(Math.max(20, Math.min(72, columns - 6))) }))] }, key)))), team !== undefined && _jsx(TeamTaskBoard, { tasks: team.tasks })] }) }), peers !== undefined && (!panelMode || peers.length > 0) && (_jsx(Box, { flexDirection: "column", children: panelMode ? (_jsx(Text, { dimColor: true, wrap: "truncate-end", children: t('agents-peers-title') + ' · ' + peers.length })) : (_jsxs(_Fragment, { children: [_jsx(Text, { dimColor: true, children: t('agents-peers-title') }), peers.length === 0 ? (_jsx(Text, { dimColor: true, children: '  ' + t('agents-peers-empty') })) : (_jsxs(Box, { flexDirection: "column", children: [peers.map(peer => (_jsx(Text, { dimColor: true, wrap: "truncate-end", children: '  · ' + (peer.name ?? peer.label ?? peer.agentId.slice(0, 8)) + ' · ' + peer.agentId.slice(0, 8) }, peer.agentId))), _jsx(Text, { dimColor: true, wrap: "truncate-end", children: '  ' + t('agents-peers-note') })] }))] })) })), !panelMode && (_jsxs(_Fragment, { children: [_jsx(Divider, { color: "subtle", title: "" }), _jsx(Box, { children: _jsx(Text, { dimColor: true, children: onSelect ? t('subagent-dashboard-hint-detail') : t('subagent-dashboard-hint-basic') }) })] }))] }));
}

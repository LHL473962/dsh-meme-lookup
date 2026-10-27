import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { Box, Text, useInput, ScrollBox, useTerminalSize } from '../ui.js';
import { AgentMessageLeafRow, AssistantTextLeafRow, ThinkingLeafRow, ToolLeafRow } from '../components/messages/TranscriptLeaves.js';
import { mergeLiveWindow, OUTPUT_WINDOW_CAP, TRANSCRIPT_OLDER_CHUNK, useSubagentTranscript, } from '../components/messages/subagentTranscript.js';
import { AgentMessageComposer } from '../components/AgentMessageComposer.js';
import { ExitButton } from '../components/SubagentDashboard.js';
import { t } from '../i18n.js';
import { agentNeighbourhood } from '../components/messages/agentTeam.js';
/** The workbench rail only appears on wide terminals; below this the view
 *  is the single transcript column. */
const WORKBENCH_MIN_COLUMNS = 96;
const WORKBENCH_PANEL_COLUMNS = 30;
const WORKBENCH_TOOL_ROWS = 5;
const WORKBENCH_SIBLING_ROWS = 5;
const panelStatusGlyph = (status) => status === 'running' || status === 'starting' ? { glyph: '●', color: 'warning' }
    : status === 'failed' || status === 'cancelled' ? { glyph: '×', color: 'error' }
        : status === 'unknown' ? { glyph: '○', color: 'subtle' }
            : { glyph: '✓', color: 'success' };
const panelFormatDuration = (ms) => {
    const seconds = Math.floor(ms / 1000);
    return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m${seconds % 60}s`;
};
/** One switchable neighbourhood row (a sibling, or the parent when the
 *  roster still holds it): click or panel-Enter swaps the viewed agent in
 *  place — the source stack is NOT pushed (Esc still exits to the original
 *  entry point, never to the previously viewed agent). */
function AgentSwitchRow({ agent, selected, onSelect }) {
    const [hovered, setHovered] = React.useState(false);
    const { glyph, color } = panelStatusGlyph(agent.status);
    return (_jsxs(Box, { onClick: onSelect, onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false), backgroundColor: hovered && !selected ? 'userMessageBackgroundHover' : undefined, children: [_jsx(Text, { color: selected ? 'accent' : undefined, wrap: "truncate-end", children: ` ${selected ? '▸' : ' '} ${glyph} ` }), _jsx(Text, { color: selected ? 'accent' : color, wrap: "truncate-end", children: agent.description })] }));
}
/** The parent line: a named parent, the main loop (depth 1), or unknown —
 *  never a guess. A parent the roster lost is named but not switchable. */
function AgentParentRow({ fact, rosterIds }) {
    if (fact.kind === 'main')
        return _jsx(Text, { dimColor: true, children: '  ' + t('agent-view-parent-main') });
    if (fact.kind === 'unknown')
        return _jsx(Text, { dimColor: true, children: '  ' + t('agent-view-parent-unknown') });
    if (!rosterIds.has(fact.agentId))
        return _jsx(Text, { dimColor: true, wrap: "truncate-end", children: '  ' + t('agent-view-parent-not-in-roster', { id: fact.agentId.slice(0, 8) }) });
    return _jsx(Text, { dimColor: true, wrap: "truncate-end", children: '  ' + t('agent-view-parent-agent', { id: fact.agentId.slice(0, 8) }) });
}
const sourceLabel = (source) => source.kind === 'chat' ? t('agent-view-source-chat')
    : source.kind === 'agents-dashboard' ? t('agent-view-source-dashboard')
        : source.kind === 'agent-detail' ? t('agent-view-source-detail')
            : t('agent-view-source-card');
/**
 * The main-screen read-only view of one subagent: a scene over the mounted
 * parent Chat, not a second Channel. The parent's rows, draft, pending
 * queue and usage keep living underneath; Esc returns to where the view
 * was opened from (chat, agents dashboard, agent detail, transcript card).
 * The body uses the same transcript pager as the Detail page, with the
 * live SubagentState tail merged in.
 */
export function AgentTranscriptScene({ subagent, onFailureRead, source, onExit, loadTranscript, messages = [], compose, roster, onSwitchAgent }) {
    React.useEffect(() => {
        if (subagent.status === 'failed')
            onFailureRead?.(subagent);
    }, [subagent, onFailureRead]);
    const scrollRef = React.useRef(null);
    const followRef = React.useRef(true);
    React.useEffect(() => {
        const handle = scrollRef.current;
        if (handle === null)
            return undefined;
        return handle.subscribe(() => { followRef.current = handle.isSticky(); });
    }, []);
    const { rows, columns } = useTerminalSize();
    const isRunning = subagent.status === 'running' || subagent.status === 'starting';
    // ── workbench rail: only on wide terminals, and only with a roster ──────
    const panelEnabled = roster !== undefined && columns >= WORKBENCH_MIN_COLUMNS;
    const [panelFocused, setPanelFocused] = React.useState(false);
    const [siblingCursor, setSiblingCursor] = React.useState(0);
    // ── history pages (the same pager the Detail transcript page uses) ──
    const [expandedLeaf, setExpandedLeaf] = React.useState(null);
    const agentId = subagent.agentId;
    // Settlement makes the disk copy final: the isRunning flip reloads once.
    const { transcript, loadOlder } = useSubagentTranscript(loadTranscript, agentId, true, isRunning, messages);
    React.useEffect(() => { setExpandedLeaf(null); }, [agentId, isRunning]);
    // ── workbench neighbourhood: the loaded transcript's parent fact wins
    // (the disk copy); until it loads the roster's fields speak. ────────────
    const transcriptParent = transcript.status === 'ready' ? transcript.parentAgentId : undefined;
    const neighbourhood = React.useMemo(() => roster === undefined ? { parent: { kind: 'unknown' }, siblings: [] } : agentNeighbourhood(subagent, roster, transcriptParent), [roster, subagent, transcriptParent]);
    const rosterIds = React.useMemo(() => new Set((roster ?? []).map(row => row.agentId)), [roster]);
    const parentFact = neighbourhood.parent;
    const parentRow = parentFact.kind === 'agent'
        ? (roster ?? []).find(row => row.agentId === parentFact.agentId)
        : undefined;
    // Switch targets in panel order: the parent (when still in the roster),
    // then the siblings — the keyboard cursor and clicks share this list.
    const switchTargets = React.useMemo(() => {
        const targets = [];
        if (parentRow !== undefined)
            targets.push(parentRow);
        targets.push(...neighbourhood.siblings.slice(0, WORKBENCH_SIBLING_ROWS));
        return targets;
    }, [neighbourhood, parentRow]);
    const switchTo = (agentId) => { onSwitchAgent?.(agentId); };
    // A switch re-targets the view: the transcript effect reloads per
    // agentId, and the sibling cursor + scroll origin reset so nothing from
    // the previously viewed agent lingers above the fold.
    React.useEffect(() => {
        setSiblingCursor(0);
        followRef.current = true;
        scrollRef.current?.scrollTo(0);
    }, [agentId]);
    // ── keyboard: the scene owns the whole screen while open ────────────────
    const [composerFocused, setComposerFocused] = React.useState(true);
    useInput((input, key, event) => {
        // The focused workbench rail owns every key: the arrows walk the switch
        // targets, Enter switches in place, Esc/Tab hand focus back. Esc here
        // does not exit the scene — that happens only when no inner layer
        // holds focus.
        if (panelFocused && panelEnabled) {
            event.stopImmediatePropagation();
            if (key.escape || key.tab) {
                setPanelFocused(false);
                setComposerFocused(compose !== undefined);
                return;
            }
            if (key.upArrow || key.downArrow) {
                setSiblingCursor(cursor => Math.max(0, Math.min(switchTargets.length - 1, cursor + (key.downArrow ? 1 : -1))));
                return;
            }
            if (input === '' && key.return) {
                const target = switchTargets[siblingCursor];
                if (target !== undefined)
                    switchTo(target.agentId);
                return;
            }
            return;
        }
        // Tab enters the workbench rail when it exists (the composer editor has
        // no tab stops).
        if (key.tab && panelEnabled) {
            event.stopImmediatePropagation();
            setPanelFocused(true);
            setComposerFocused(false);
            return;
        }
        // A focused composer owns plain typing; the scene still takes the
        // vertical arrows so the transcript keeps scrolling.
        if (composerFocused && compose !== undefined) {
            if (key.pageUp || key.pageDown) {
                event.stopImmediatePropagation();
                scrollRef.current?.scrollBy(key.pageUp ? -8 : 8);
                return;
            }
            if (key.upArrow || key.downArrow) {
                event.stopImmediatePropagation();
                scrollRef.current?.scrollBy(key.upArrow ? -3 : 3);
            }
            return;
        }
        if (key.escape || (key.ctrl && input === 'c')) {
            event.stopImmediatePropagation();
            onExit();
            return;
        }
        if (key.upArrow) {
            event.stopImmediatePropagation();
            scrollRef.current?.scrollBy(-3);
            return;
        }
        if (key.downArrow) {
            event.stopImmediatePropagation();
            scrollRef.current?.scrollBy(3);
            return;
        }
        if (key.pageUp || key.pageDown) {
            event.stopImmediatePropagation();
            scrollRef.current?.scrollBy(key.pageUp ? -8 : 8);
            return;
        }
        if (input.toLowerCase() === 'o') {
            event.stopImmediatePropagation();
            loadOlder();
            return;
        }
        if (input === '' && key.return && compose !== undefined) {
            event.stopImmediatePropagation();
            setComposerFocused(true);
            return;
        }
        event.stopImmediatePropagation();
    }, { isActive: true });
    // Follow the tail while the child runs, until the user scrolls away from
    // the bottom (wheel, arrows, page keys); back at the bottom it follows
    // again. The subscription reads the sticky bit when the scroll settles,
    // so the view's own scrollTo/scrollToBottom calls land correctly too.
    const tailLength = subagent.outputEvents.length;
    React.useEffect(() => {
        const handle = scrollRef.current;
        if (!isRunning || handle === null)
            return;
        if (followRef.current || handle.isSticky())
            handle.scrollToBottom();
    }, [isRunning, tailLength]);
    const headerWidth = Math.max(20, columns - 8);
    const headerLabel = `${t('subagent-card-prefix')}${subagent.description}`;
    // 没有 history 来源时不标 history（只剩有界 tail，由范围说明解释）。
    const liveBadge = isRunning ? t('agent-view-live') : loadTranscript === undefined ? '' : t('agent-view-history');
    const hasHistory = loadTranscript !== undefined && transcript.status === 'ready';
    // Narrow terminals keep the agent's name: read-only and the short id are
    // repeated below the header, so they are the first to go.
    const headerBadges = headerWidth < 64
        ? (liveBadge === '' ? '' : ` · ${liveBadge}`)
        : `${liveBadge === '' ? '' : ` · ${liveBadge}`} · ${t('agent-view-readonly')} · id ${agentId.slice(0, 8)}`;
    const fallbackTail = subagent.outputEvents;
    const retained = fallbackTail.length >= OUTPUT_WINDOW_CAP;
    return (_jsxs(Box, { flexDirection: "column", paddingX: 2, paddingY: 1, children: [_jsxs(Box, { flexDirection: "row", gap: 1, children: [_jsx(Box, { flexShrink: 0, children: _jsx(Text, { color: "accent", bold: true, children: "\u2922" }) }), _jsx(Box, { flexShrink: 1, minWidth: 0, children: _jsx(Text, { bold: true, wrap: "truncate-end", children: headerLabel }) }), _jsx(Box, { flexShrink: 0, children: _jsx(Text, { dimColor: true, children: headerBadges }) }), _jsx(Box, { flexGrow: 1 }), _jsx(Box, { flexShrink: 0, children: _jsx(ExitButton, { onClick: onExit }) })] }), _jsx(Text, { dimColor: true, wrap: "truncate-end", children: `${t('agent-view-title')} · ${sourceLabel(source)} · ${t('agent-view-back')}: Esc${headerWidth < 44 ? '' : ` · ↑/↓ ${t('subagent-hint-scroll')} · o ${t('subagent-transcript-load-older', { count: TRANSCRIPT_OLDER_CHUNK })}`}` }), _jsxs(Box, { flexDirection: "row", paddingX: 1, maxHeight: Math.max(10, rows - (compose !== undefined ? 12 : 6)), children: [_jsx(Box, { flexDirection: "column", flexGrow: 1, minWidth: panelEnabled ? 44 : 0, children: _jsx(ScrollBox, { ref: scrollRef, flexDirection: "column", flexGrow: 1, children: loadTranscript === undefined ? (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { dimColor: true, children: t('agent-view-no-transcript') }), retained && (_jsx(Text, { dimColor: true, children: t('agent-view-retained-tail', { count: fallbackTail.length }) })), fallbackTail.length === 0 && messages.length === 0 && (_jsx(Text, { dimColor: true, children: t('subagent-no-output') })), fallbackTail.map((line, index) => (_jsxs(Text, { wrap: "wrap", dimColor: line.kind === 'thinking' || line.kind === 'system', italic: line.kind === 'thinking', color: line.kind === 'error' ? 'error' : undefined, children: [line.text, !line.settled && isRunning ? ' ▍' : ''] }, `tail-${index}`))), messages.map(message => (_jsx(AgentMessageLeafRow, { message: message, selfAgentId: agentId, marginTopOnTurn: true }, `am-${message.messageId}`)))] })) : (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { dimColor: true, children: `${hasHistory ? t('agent-view-history') : t('agent-view-live')} · ${t('agent-view-readonly')}` }), transcript.status === 'ready' && transcript.parentAgentId !== null && (_jsx(Text, { dimColor: true, children: t('subagent-transcript-parent', { id: transcript.parentAgentId.slice(0, 8) }) })), transcript.status === 'ready' && transcript.parentAgentId === null && (subagent.depth ?? 1) >= 2 && (_jsx(Text, { dimColor: true, children: t('subagent-transcript-old-format', { depth: subagent.depth ?? 2 }) })), transcript.status === 'loading' && _jsx(Text, { dimColor: true, children: `⏳ ${t('subagent-transcript-loading')}` }), transcript.status === 'unavailable' && _jsx(Text, { color: "error", children: t('subagent-transcript-unavailable') }), transcript.status === 'ready' && (() => {
                                        const merged = mergeLiveWindow(transcript.leaves, subagent, true);
                                        const liveStart = merged.findIndex(row => row.kind === 'live');
                                        if (merged.length === 0)
                                            return _jsx(Text, { dimColor: true, children: t('subagent-transcript-empty') });
                                        return (_jsxs(_Fragment, { children: [transcript.hasOlder && (_jsx(Box, { onClick: loadOlder, marginTop: 1, children: _jsx(Text, { color: "accent", children: transcript.loadingOlder
                                                            ? `⏳ ${t('subagent-transcript-loading')}`
                                                            : `▸ ${t('subagent-transcript-load-older', { count: Math.min(TRANSCRIPT_OLDER_CHUNK, transcript.skippedFromStart) })}` }) })), merged.map((row, index) => {
                                                    const margin = index > 0;
                                                    if (row.kind === 'live') {
                                                        const line = row.line;
                                                        const unsettled = !line.settled && isRunning ? ' ▍' : '';
                                                        return (_jsxs(React.Fragment, { children: [index === liveStart && _jsx(Text, { dimColor: true, children: `── ${t('subagent-transcript-live')} ──` }), _jsxs(Text, { wrap: "wrap", dimColor: line.kind === 'thinking' || line.kind === 'system', italic: line.kind === 'thinking', color: line.kind === 'error' ? 'error' : undefined, children: [line.text, unsettled] })] }, `live-${index}`));
                                                    }
                                                    if (row.kind === 'thinking') {
                                                        return _jsx(ThinkingLeafRow, { thinking: row.text, marginTopOnTurn: margin, verbose: false }, `think-${row.key}`);
                                                    }
                                                    if (row.kind === 'thinking-unavailable') {
                                                        return (_jsx(Box, { marginTop: margin ? 1 : 0, children: _jsx(Text, { dimColor: true, italic: true, children: row.tokens !== undefined ? t('subagent-thinking-count-only', { tokens: row.tokens }) : t('subagent-thinking-unavailable') }) }, `ua-${row.key}`));
                                                    }
                                                    if (row.kind === 'text') {
                                                        return _jsx(AssistantTextLeafRow, { text: row.text, marginTopOnTurn: margin }, `text-${row.key}`);
                                                    }
                                                    if (row.kind === 'agent-message') {
                                                        return _jsx(AgentMessageLeafRow, { message: row.message, selfAgentId: agentId, marginTopOnTurn: margin }, `am-${row.key}`);
                                                    }
                                                    return (_jsx(ToolLeafRow, { tool: row.tool, marginTopOnTurn: margin, verbose: expandedLeaf === row.key, isExpanded: expandedLeaf === row.key, onClick: () => setExpandedLeaf(prev => prev === row.key ? null : row.key) }, `tool-${row.key}`));
                                                })] }));
                                    })()] })) }) }), panelEnabled && roster !== undefined && (_jsx(WorkbenchPanel, { subagent: subagent, parent: neighbourhood.parent, parentRow: parentRow, rosterIds: rosterIds, siblings: neighbourhood.siblings, switchTargets: switchTargets, cursor: siblingCursor, focused: panelFocused, onSwitch: switchTo }))] }), compose !== undefined && (_jsx(Box, { flexDirection: "column", marginTop: 1, children: _jsx(AgentMessageComposer, { target: compose.target, control: compose.control, messages: messages, focused: composerFocused, onFocusChange: setComposerFocused }, compose.target.agentId) }))] }));
}
/** One label/value metadata line of the workbench panel. */
function PanelMetaRow({ label, value }) {
    if (value === undefined || value === '')
        return null;
    return (_jsxs(Box, { children: [_jsx(Box, { flexShrink: 0, width: 9, children: _jsx(Text, { dimColor: true, children: label }) }), _jsx(Text, { wrap: "truncate-end", children: value })] }));
}
/**
 * The workbench rail: metadata, the tool records the roster kept (with the
 * backend's own count when it reported one), and the parent / sibling
 * neighbourhood. Switching goes through the caller's onSwitch; the rail
 * never touches the roster, the Channel or the source stack, and an
 * unknown parent stays unknown.
 */
function WorkbenchPanel({ subagent, parent, parentRow, rosterIds, siblings, switchTargets, cursor, focused, onSwitch }) {
    const running = subagent.status === 'running' || subagent.status === 'starting';
    const elapsed = running
        ? Date.now() - subagent.startedAt
        : subagent.completedAt !== undefined ? subagent.completedAt - subagent.startedAt : undefined;
    const shownDuration = subagent.reportedDurationMs ?? elapsed;
    const toolsCount = subagent.reportedToolUses ?? subagent.toolCalls.length;
    const keptTools = subagent.toolCalls.slice(-WORKBENCH_TOOL_ROWS);
    const hiddenTools = Math.max(0, subagent.toolCalls.length - keptTools.length);
    const shownSiblings = siblings.slice(0, WORKBENCH_SIBLING_ROWS);
    const hiddenSiblings = Math.max(0, siblings.length - shownSiblings.length);
    // The cursor indexes switchTargets (the parent first when it is still in
    // the roster, then the siblings); the rows below render in that same
    // order, so the marker lands on what Enter will switch to.
    const cursorOf = (agentId) => focused && switchTargets[cursor]?.agentId === agentId;
    return (_jsxs(Box, { flexDirection: "column", width: WORKBENCH_PANEL_COLUMNS, paddingLeft: 1, borderStyle: "single", borderLeft: true, borderRight: false, borderTop: false, borderBottom: false, borderColor: "inactive", children: [_jsx(Text, { bold: true, color: focused ? 'accent' : undefined, children: t('agent-view-panel-title') }), _jsx(Text, { dimColor: true, children: ' ' + t('agent-view-panel-metadata') + ' ─────' }), _jsx(PanelMetaRow, { label: t('agent-view-field-status'), value: subagent.status }), _jsx(PanelMetaRow, { label: t('agent-view-field-mode'), value: subagent.mode }), _jsx(PanelMetaRow, { label: t('agent-view-field-model'), value: subagent.model ?? subagent.provider }), _jsx(PanelMetaRow, { label: t('agent-view-field-tokens'), value: subagent.tokens === undefined ? undefined : String(subagent.tokens.total ?? ((subagent.tokens.input ?? 0) + (subagent.tokens.output ?? 0))) }), _jsx(PanelMetaRow, { label: t('agent-view-field-duration'), value: shownDuration === undefined ? undefined : panelFormatDuration(shownDuration) }), _jsx(PanelMetaRow, { label: t('agent-view-field-run'), value: subagent.runId === undefined ? undefined : subagent.runId.slice(0, 8) }), _jsx(PanelMetaRow, { label: t('agent-view-field-session'), value: subagent.sessionId === undefined ? undefined : subagent.sessionId.slice(0, 8) }), _jsx(PanelMetaRow, { label: t('agent-view-field-depth'), value: subagent.depth === undefined ? undefined : String(subagent.depth) }), _jsx(Text, { dimColor: true, children: ' ' + t('agent-view-panel-tools') + ' ────────' }), subagent.toolCalls.length === 0 && subagent.reportedToolUses === undefined && (_jsx(Text, { dimColor: true, children: '  ' + t('agent-view-tools-none') })), subagent.reportedToolUses !== undefined && subagent.reportedToolUses !== subagent.toolCalls.length && (_jsx(Text, { dimColor: true, children: '  ' + t('agent-view-tools-reported', { reported: toolsCount, kept: subagent.toolCalls.length }) })), keptTools.map(tool => (_jsxs(Box, { children: [_jsx(Box, { flexShrink: 0, children: _jsx(Text, { color: tool.status === 'failed' ? 'error' : tool.status === 'running' ? 'warning' : 'success', children: tool.status === 'failed' ? '× ' : tool.status === 'running' ? '● ' : '✓ ' }) }), _jsx(Text, { wrap: "truncate-end", dimColor: tool.status === 'completed', children: tool.name })] }, tool.id ?? tool.name + tool.startedAt))), hiddenTools > 0 && _jsx(Text, { dimColor: true, children: '  ' + t('agent-view-tools-more', { count: hiddenTools }) }), _jsx(Text, { dimColor: true, children: ' ' + t('agent-view-parent-context') + ' ──────' }), parentRow !== undefined
                ? _jsx(AgentSwitchRow, { agent: parentRow, selected: cursorOf(parentRow.agentId), onSelect: () => onSwitch(parentRow.agentId) })
                : _jsx(AgentParentRow, { fact: parent, rosterIds: rosterIds }), shownSiblings.map(agent => (_jsx(AgentSwitchRow, { agent: agent, selected: cursorOf(agent.agentId), onSelect: () => onSwitch(agent.agentId) }, agent.agentId))), hiddenSiblings > 0 && _jsx(Text, { dimColor: true, children: '  ' + t('agent-view-siblings-more', { count: hiddenSiblings }) }), siblings.length === 0 && _jsx(Text, { dimColor: true, children: '  ' + t('agent-view-siblings-none') }), _jsx(Box, { marginTop: 1, children: _jsx(Text, { dimColor: true, children: focused ? t('agent-view-select-sibling-focused') : t('agent-view-select-sibling') }) })] }));
}

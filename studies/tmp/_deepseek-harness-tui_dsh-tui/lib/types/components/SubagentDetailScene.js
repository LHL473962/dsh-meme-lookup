import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { Box, Text, useInput, ScrollBox, useTerminalSize } from '../ui.js';
import { AgentMessageLeafRow, AssistantTextLeafRow, ThinkingLeafRow, ToolLeafRow } from './messages/TranscriptLeaves.js';
import { AgentMessageFlowRow } from './messages/AgentMessageFlow.js';
import { AgentMessageComposer } from './AgentMessageComposer.js';
import { subagentDetailMemory } from './subagentDetailMemory.js';
import { mergeLiveWindow, OUTPUT_WINDOW_CAP, TRANSCRIPT_OLDER_CHUNK, useSubagentTranscript, } from './messages/subagentTranscript.js';
import { t } from '../i18n.js';
import { Divider } from './design-system/Divider.js';
import { ExitButton, isPanelPlainReturn } from './SubagentDashboard.js';
import { isPlainReturnInput } from '../utils/modifiers.js';
import { toolNameColor } from './messages/AssistantToolUseMessage.js';
import { Markdown } from './Markdown.js';
import { getCliHighlightPromise } from '../terminal-utils/cliHighlight.js';
import { isMinimalUiMode } from '../minimalUiMode.js';
import { usePanelInput } from './sidePanel/usePanelInput.js';
import { THINKING_SETTLED_MARKER } from '../terminal-utils/figures.js';
function formatDuration(ms) {
    if (ms < 1000)
        return `${ms}ms`;
    if (ms < 60000)
        return `${(ms / 1000).toFixed(1)}s`;
    const min = Math.floor(ms / 60000);
    const sec = Math.floor((ms % 60000) / 1000);
    return `${min}m${sec}s`;
}
function formatTimestamp(ts) {
    return new Date(ts).toLocaleTimeString();
}
function statusGlyph(status) {
    const minimalUi = isMinimalUiMode();
    if (status === 'completed')
        return { glyph: minimalUi ? '✓' : '🟢', color: minimalUi ? undefined : 'success', label: 'done' };
    if (status === 'failed')
        return { glyph: minimalUi ? '×' : '🔴', color: minimalUi ? undefined : 'error', label: 'failed' };
    if (status === 'cancelled')
        return { glyph: minimalUi ? '×' : '🔴', color: minimalUi ? undefined : 'error', label: 'cancelled' };
    if (status === 'unknown')
        return { glyph: minimalUi ? '·' : '⚪', color: minimalUi ? undefined : 'subtle', label: 'history' };
    return { glyph: minimalUi ? '·' : '🟡', color: minimalUi ? undefined : 'warning', label: 'running' };
}
const PAGES_WITHOUT_TRANSCRIPT = ['summary', 'output', 'tools'];
const PAGES_WITH_TRANSCRIPT = ['summary', 'output', 'transcript', 'tools'];
/** One label/value row of the summary stats card. */
function StatRow({ label, children }) {
    return (_jsxs(Box, { flexDirection: "row", children: [_jsx(Box, { width: 14, flexShrink: 0, children: _jsx(Text, { dimColor: true, children: label }) }), _jsx(Box, { flexDirection: "row", flexGrow: 1, children: children })] }));
}
/** Two-column key/value stats grid (Kimi Code settled summary style). */
function StatGrid({ subagent, totalTokens, elapsed, statusLabel, statusColor }) {
    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(StatRow, { label: t('subagent-status-label'), children: _jsx(Text, { color: statusColor, children: statusLabel }) }), _jsx(StatRow, { label: t('subagent-model'), children: _jsx(Text, { children: subagent.model ?? subagent.provider ?? 'default' }) }), _jsx(StatRow, { label: t('subagent-duration'), children: _jsx(Text, { children: elapsed !== undefined ? formatDuration(elapsed) : '—' }) }), _jsx(StatRow, { label: "tokens", children: _jsxs(Text, { children: [totalTokens || '—', subagent.tokens?.input !== undefined ? ` (in ${subagent.tokens.input} · out ${subagent.tokens.output ?? 0})` : ''] }) }), _jsx(StatRow, { label: t('subagent-tools'), children: _jsx(Text, { children: subagent.reportedToolUses ?? subagent.toolCalls.length }) }), subagent.lastTool !== undefined && (_jsx(StatRow, { label: t('subagent-last-tool'), children: _jsx(Text, { children: subagent.lastTool }) })), _jsx(StatRow, { label: t('subagent-started'), children: _jsx(Text, { children: formatTimestamp(subagent.startedAt) }) }), subagent.completedAt !== undefined && (_jsx(StatRow, { label: t('subagent-completed'), children: _jsx(Text, { children: formatTimestamp(subagent.completedAt) }) }))] }));
}
/** Tool args line: JSON-looking args get cli-highlight syntax colors (loaded
 * lazily through the shared promise); anything else stays a dim flat line. */
function JsonArgsText({ raw }) {
    const flat = raw.replace(/\s+/g, ' ').trim();
    const json = flat.startsWith('{') || flat.startsWith('[');
    const [highlighted, setHighlighted] = React.useState(null);
    React.useEffect(() => {
        if (!json)
            return;
        let alive = true;
        void getCliHighlightPromise().then(cli => {
            if (!alive || cli === null)
                return;
            try {
                setHighlighted(cli.highlight(flat, { language: 'json' }));
            }
            catch {
                // Not parseable JSON after all — keep the dim fallback.
            }
        });
        return () => { alive = false; };
    }, [flat, json]);
    if (json && highlighted !== null)
        return _jsx(Text, { wrap: "wrap", children: highlighted });
    return _jsx(Text, { dimColor: true, wrap: "wrap", children: flat });
}
function groupOutputEvents(events) {
    const blocks = [];
    for (const line of events) {
        if (line.kind === 'thinking') {
            const last = blocks[blocks.length - 1];
            if (last !== undefined && last.kind === 'thinking')
                last.lines.push(line);
            else
                blocks.push({ kind: 'thinking', lines: [line] });
            continue;
        }
        // Consecutive prose lines are ONE markdown document: without the fold a
        // `**bold**` line, its list items and its paragraph break would render as
        // raw syntax separated by blank rows. Activity pointers and tool/error
        // rows stay independent single lines.
        if (line.kind === 'text' && !isActivityLine(line.text)) {
            const last = blocks[blocks.length - 1];
            if (last !== undefined && last.kind === 'prose')
                last.lines.push(line);
            else
                blocks.push({ kind: 'prose', lines: [line] });
            continue;
        }
        blocks.push({ kind: 'line', line });
    }
    return blocks;
}
/** The child's own status line reaches us as a text delta (\`⏵ reading …\`);
 *  it is activity, not prose, so it renders as a dim pointer row. */
const ACTIVITY_GLYPHS = ['⏵', '▶', '▸', '»'];
function isActivityLine(text) {
    return ACTIVITY_GLYPHS.includes(text.trimStart().slice(0, 1));
}
/**
 * SubagentDetailScene — full-screen paged detail view for one subagent.
 * Header block (identity + stats) stays fixed; the body pages through
 * 摘要 / 输出 / 工具 with ←/→. Follow-up delivery was removed: the official
 * seam only accepts continuable children, and one-shot spawn children are
 * disposed at settlement, so the affordance would be a dead control.
 */
export function SubagentDetailScene({ subagent, onFailureRead, onBack, onInterrupt, loadTranscript, onOpenView, messages = [], compose, variant = 'default', focused = true, visible = true, }) {
    React.useEffect(() => {
        if (visible && subagent.status === 'failed')
            onFailureRead?.(subagent);
    }, [visible, subagent, onFailureRead]);
    const panelMode = variant === 'panel';
    const scrollRef = React.useRef(null);
    const { rows, columns } = useTerminalSize();
    // 主屏 Agent View 盖过 Detail 时组件会卸载；从 Agent View 回来时按记忆
    // 恢复页码与滚动位置。
    const remembered = subagentDetailMemory.read(subagent.agentId);
    const [page, setPage] = React.useState(remembered === undefined ? 'summary' : remembered.page);
    // Pages follow the capabilities: no transcript source, no Transcript page;
    // no agent messages, no Messages page.
    const pages = [
        ...(loadTranscript === undefined ? PAGES_WITHOUT_TRANSCRIPT : PAGES_WITH_TRANSCRIPT),
        ...(messages.length > 0 ? ['messages'] : []),
    ];
    const rememberedPageValid = pages.includes(page);
    const activePage = rememberedPageValid ? page : pages[0];
    const setPageSafe = (next) => { setPage(pages.includes(next) ? next : pages[0]); };
    // 记忆只在主屏 Agent View 往返间生效：打开视图时置位，卸载时据位决定
    // 保存（page+scroll）还是清除（常规返回 Dashboard = 全新一次浏览）。
    const activePageRef = React.useRef(activePage);
    activePageRef.current = activePage;
    const viewOpenedRef = React.useRef(false);
    const openMainView = () => {
        if (onOpenView === undefined)
            return;
        viewOpenedRef.current = true;
        onOpenView();
    };
    React.useEffect(() => {
        if (remembered !== undefined && remembered.scrollTop > 0)
            scrollRef.current?.scrollTo?.(remembered.scrollTop);
        return () => {
            if (viewOpenedRef.current) {
                const top = scrollRef.current?.getScrollTop?.() ?? 0;
                subagentDetailMemory.save(subagent.agentId, { page: activePageRef.current, scrollTop: top });
            }
            else {
                subagentDetailMemory.clear(subagent.agentId);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps -- save-on-unmount only
    }, []);
    const isRunning = subagent.status === 'running' || subagent.status === 'starting';
    // Only a live run ticks; discovered history (`unknown`) shows no duration.
    const elapsed = isRunning
        ? Date.now() - subagent.startedAt
        : subagent.completedAt !== undefined ? subagent.completedAt - subagent.startedAt : undefined;
    const info = statusGlyph(subagent.status);
    const totalTokens = subagent.tokens?.total ?? ((subagent.tokens?.input ?? 0) + (subagent.tokens?.output ?? 0) || 0);
    // The backend's own counts win over the locally kept records (a missed
    // lane frame must not undercount); no report → the local records.
    const toolsCount = subagent.reportedToolUses ?? subagent.toolCalls.length;
    const shownDuration = subagent.reportedDurationMs ?? elapsed;
    const pageIndex = pages.indexOf(activePage);
    /** Folded reasoning runs (the transcript's thinking grammar). Enter flips
     *  every run at once so one key stays predictable across thought steps. */
    const [thinkingOpen, setThinkingOpen] = React.useState(false);
    const blocks = groupOutputEvents(subagent.outputEvents);
    const hasThinking = blocks.some(block => block.kind === 'thinking');
    const settled = !isRunning;
    // The deliverable is the LAST prose block: a `── Conclusion ──` rule goes in
    // front of it once the run settles, so the answer is never the last line of
    // a wall of reasoning.
    const answerBlock = (() => {
        if (!settled)
            return -1;
        for (let i = blocks.length - 1; i >= 0; i--) {
            const block = blocks[i];
            if (block.kind === 'prose' && block.lines.some(p => p.text.trim() !== ''))
                return i;
            if (block.kind === 'line' && block.line.kind === 'text' && block.line.text.trim() !== '')
                return i;
        }
        return -1;
    })();
    // ── the Agent-Transcript page (only with a transcript source) ─────────
    /** The transcript page's one expanded tool card (a click toggles; the
     *  output page's single-fold rhythm, applied to cards). */
    const [expandedLeaf, setExpandedLeaf] = React.useState(null);
    // Settlement makes the disk copy final: the isRunning flip reloads the
    // page once, picking up what streamed in live.
    const transcriptActive = activePage === 'transcript';
    const { transcript, loadOlder: loadOlderTranscript } = useSubagentTranscript(loadTranscript, subagent.agentId, transcriptActive, isRunning, messages);
    React.useEffect(() => {
        if (transcriptActive)
            setExpandedLeaf(null);
    }, [transcriptActive, subagent.agentId, isRunning]);
    const hasTranscriptThinking = transcript.status === 'ready' && transcript.leaves.some(leaf => leaf.kind === 'thinking' || leaf.kind === 'thinking-unavailable');
    const turnPage = (delta) => {
        const next = (pageIndex + delta + pages.length) % pages.length;
        setPageSafe(pages[next]);
        scrollRef.current?.scrollTo?.(0);
    };
    // tail -f: while the subagent runs and the output page is showing, follow
    // the newest streamed line. Page switches or settlement stop the follow so
    // manual ↑ scrolling wins.
    // Expanding the reasoning grows the box past its viewport, and the renderer
    // then treats the growth as "was at bottom" (maxScroll was 0 while the folded
    // body fit) and re-pins the view to the bottom — pushing the fold header out
    // of sight. Re-anchor AFTER that frame: the first immediate lands behind the
    // renderer's own scheduling, and the second behind the re-pin frame it caused.
    React.useEffect(() => {
        if (page !== 'output' && activePage !== 'transcript')
            return;
        const first = setImmediate(() => scrollRef.current?.scrollTo?.(0));
        return () => clearImmediate(first);
    }, [thinkingOpen, page]);
    const outputLength = subagent.outputEvents.length;
    React.useEffect(() => {
        if (!isRunning)
            return;
        if (page === 'output') {
            scrollRef.current?.scrollToBottom();
            return;
        }
        // The transcript page follows only while it is pinned to the bottom: a
        // reader who scrolled up into the history (or towards "load older")
        // must not be pulled back down by every streamed line.
        const handle = scrollRef.current;
        if (activePage === 'transcript' && handle !== null && handle.isSticky())
            handle.scrollToBottom();
    }, [page, isRunning, outputLength]);
    // Detail 的主手势是翻页阅读，composer 默认不聚焦（'i' 聚焦、Esc 让焦）；
    // 聚焦期 ←/→/Esc/Enter 归编辑器，↑/↓ 仍滚动正文。
    const [composerFocused, setComposerFocused] = React.useState(false);
    const composerKeys = React.useRef(null);
    useInput((input, key, event) => {
        if (panelMode)
            return;
        if (compose !== undefined && composerFocused) {
            if (key.upArrow || key.downArrow) {
                event.stopImmediatePropagation();
                scrollRef.current?.scrollBy(key.upArrow ? -3 : 3);
            }
            return;
        }
        if (key.escape || (key.ctrl && input === 'c')) {
            event.stopImmediatePropagation();
            onBack();
            return;
        }
        if (key.leftArrow) {
            event.stopImmediatePropagation();
            turnPage(-1);
            return;
        }
        if (key.rightArrow) {
            event.stopImmediatePropagation();
            turnPage(1);
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
        if (input.toLowerCase() === 'x' && isRunning && onInterrupt) {
            event.stopImmediatePropagation();
            onInterrupt(subagent.agentId);
            return;
        }
        // v = 主屏查看。
        if (input.toLowerCase() === 'v' && onOpenView) {
            event.stopImmediatePropagation();
            openMainView();
            return;
        }
        // i = 聚焦 composer（发送输入的入口；Esc 让焦回来）。
        if (input.toLowerCase() === 'i' && compose !== undefined) {
            event.stopImmediatePropagation();
            setComposerFocused(true);
            return;
        }
        // o = 转录页载入更早一页（与页首按钮同一动作）。
        if (input.toLowerCase() === 'o' && activePage === 'transcript') {
            event.stopImmediatePropagation();
            loadOlderTranscript();
            return;
        }
        if (isPlainReturnInput(input, key)) {
            event.stopImmediatePropagation();
            // Enter folds the reasoning while the output or transcript page is
            // showing (the transcript's ctrl+o equivalent). Elsewhere it keeps its
            // "leave the detail" meaning, which Esc and the ✕ button still provide.
            if ((activePage === 'output' && hasThinking) || (activePage === 'transcript' && hasTranscriptThinking))
                setThinkingOpen(open => !open);
            else
                onBack();
            return;
        }
        event.stopImmediatePropagation();
    }, { isActive: !panelMode });
    // Panel form（v2.1 键盘契约）：这一层自己吃掉整个业务键面。Esc/Ctrl+C 必须
    // 返回 true —— Detail → Dashboard 是面板内部的一级，绝不能落给宿主（宿主
    // 的 Esc 回退是「焦点回聊天」）。其余未认的键返回 false，让 [/]、数字、
    // z、+/- 继续可用。
    const panelKeyHandler = (input, key) => {
        // composer 聚焦时键先给编辑器（含 Esc）；↑/↓ 仍滚动正文。
        if (compose !== undefined && composerFocused) {
            if (key.upArrow === true || key.downArrow === true) {
                scrollRef.current?.scrollBy(key.upArrow === true ? -3 : 3);
                return true;
            }
            return composerKeys.current?.(input, key) ?? false;
        }
        if (key.escape === true || (key.ctrl === true && input === 'c')) {
            onBack();
            return true;
        }
        if (key.leftArrow === true) {
            turnPage(-1);
            return true;
        }
        if (key.rightArrow === true) {
            turnPage(1);
            return true;
        }
        if (key.upArrow === true) {
            scrollRef.current?.scrollBy(-3);
            return true;
        }
        if (key.downArrow === true) {
            scrollRef.current?.scrollBy(3);
            return true;
        }
        if (input.toLowerCase() === 'x' && isRunning && onInterrupt !== undefined) {
            onInterrupt(subagent.agentId);
            return true;
        }
        if (input.toLowerCase() === 'v' && onOpenView !== undefined) {
            openMainView();
            return true;
        }
        if (input.toLowerCase() === 'i' && compose !== undefined) {
            setComposerFocused(true);
            return true;
        }
        if (input.toLowerCase() === 'o' && activePage === 'transcript') {
            loadOlderTranscript();
            return true;
        }
        if (isPanelPlainReturn(input, key)) {
            // Enter 与整屏形态同义：输出/转录页有思考块时先折叠它，别处退回 Dashboard。
            if ((activePage === 'output' && hasThinking) || (activePage === 'transcript' && hasTranscriptThinking))
                setThinkingOpen(open => !open);
            else
                onBack();
            return true;
        }
        return false;
    };
    usePanelInput(panelKeyHandler, { active: panelMode && focused && visible });
    const tab = (name, label) => {
        const active = activePage === name;
        return (_jsxs(React.Fragment, { children: [_jsx(Box, { onClick: () => setPageSafe(name), backgroundColor: !active ? 'userMessageBackgroundHover' : undefined, children: _jsx(Text, { color: active ? 'accent' : undefined, bold: active, inverse: active, children: ` ${label} ` }) }), _jsx(Text, { dimColor: true, children: name === pages[pages.length - 1] ? '' : '│' })] }, name));
    };
    // 外层留白：整屏形态保持原样；侧栏形态只留左右各 1 格（PanelBar 与宿主
    // 提示行已经承担其余 chrome）。
    const outer = panelMode
        ? { paddingLeft: 1, paddingRight: 1, paddingTop: 0 }
        : { paddingX: 2, paddingY: 1 };
    return (_jsxs(Box, { flexDirection: "column", ...outer, children: [_jsxs(Box, { flexDirection: "row", gap: 1, children: [_jsx(Text, { color: info.color, bold: true, children: info.glyph }), _jsx(Text, { bold: true, children: `${t('subagent-card-prefix')}${subagent.description}` }), _jsx(Text, { dimColor: true, children: "\u00B7" }), _jsx(Text, { color: info.color, children: info.label }), subagent.mode === 'continuable' && _jsx(Text, { color: "warning", children: t('subagent-mode-continuable') }), subagent.mode === 'one-shot' && _jsx(Text, { dimColor: true, children: t('subagent-mode-one-shot') }), _jsx(Box, { flexGrow: 1 }), onOpenView !== undefined && (_jsx(Box, { onClick: openMainView, children: _jsx(Text, { color: "subtle", children: "\u2922" }) })), _jsx(ExitButton, { onClick: onBack })] }), _jsxs(Text, { children: [_jsx(Text, { children: subagent.model ?? subagent.provider ?? 'default' }), _jsxs(Text, { dimColor: true, children: [shownDuration !== undefined ? ` · ${formatDuration(shownDuration)} · ` : ' · ', totalTokens || '—', " tok \u00B7 ", toolsCount, " tools"] })] }), _jsxs(Text, { dimColor: true, children: [`${t('subagent-started')} ${formatTimestamp(subagent.startedAt)}`
                        + (subagent.completedAt ? ` · ${t('subagent-completed')} ${formatTimestamp(subagent.completedAt)}` : ''), ` · id ${subagent.agentId.slice(0, 8)}`] }), subagent.error && (_jsx(Box, { marginTop: 0, children: _jsx(Text, { color: "error", wrap: "wrap", children: `${t('subagent-error-label')}: ${subagent.error}` }) })), _jsxs(Box, { flexDirection: "row", gap: 0, marginTop: 1, children: [tab('summary', t('subagent-tab-summary')), tab('output', subagent.outputEvents.length > 0 ? `${t('subagent-output-label')} ${subagent.outputEvents.length}` : t('subagent-output-label')), loadTranscript !== undefined && tab('transcript', t('subagent-tab-transcript')), tab('tools', toolsCount > 0 ? `${t('subagent-tools')} ${toolsCount}` : t('subagent-tools')), messages.length > 0 && tab('messages', `${t('agent-messages-tab')} ${messages.length}`), _jsx(Text, { dimColor: true, children: `  ${pageIndex + 1}/${pages.length}` })] }), _jsx(Text, { dimColor: true, children: '─'.repeat(Math.max(20, Math.min(72, columns - 6))) }), activePage === 'output' && loadTranscript === undefined && subagent.outputEvents.length >= OUTPUT_WINDOW_CAP && (_jsx(Text, { dimColor: true, children: t('subagent-transcript-retained', { count: subagent.outputEvents.length }) })), _jsx(Box, { flexDirection: "column", paddingX: 1, maxHeight: panelMode ? Math.max(6, rows - 10) : Math.max(10, rows - 14), children: _jsxs(ScrollBox, { ref: scrollRef, flexDirection: "column", flexGrow: 1, children: [activePage === 'summary' && (_jsxs(Box, { flexDirection: "column", children: [_jsx(StatGrid, { subagent: subagent, totalTokens: totalTokens, elapsed: elapsed, statusLabel: info.label, statusColor: info.color }), subagent.summary && (_jsxs(Box, { flexDirection: "column", marginTop: 1, children: [_jsx(Text, { dimColor: true, bold: true, children: '─ summary ' }), _jsx(Text, { wrap: "wrap", children: subagent.summary })] })), !subagent.summary && (_jsx(Text, { dimColor: true, children: isRunning ? t('subagent-no-output') : t('subagent-no-summary') }))] })), activePage === 'output' && (subagent.outputEvents.length === 0 && subagent.output.length === 0 ? (_jsx(Text, { dimColor: true, children: t('subagent-no-output') })) : (_jsx(_Fragment, { children: blocks.map((block, index) => {
                                if (block.kind === 'thinking') {
                                    const text = block.lines.map(line => line.text).join('\n');
                                    const chars = text.replace(/\s+/g, '').length;
                                    const label = `${THINKING_SETTLED_MARKER} ${t('subagent-thinking-fold', { count: block.lines.length, chars })}`;
                                    const hint = thinkingOpen ? t('subagent-thinking-collapse') : t('subagent-thinking-expand');
                                    return (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { italic: true, dimColor: true, children: `${label}  ·  ${hint}` }), thinkingOpen ? (_jsx(Box, { flexDirection: "column", paddingLeft: 2, children: block.lines.map((line, i) => (_jsx(Text, { dimColor: true, italic: true, wrap: "wrap", children: line.text }, i))) })) : (_jsx(Text, { dimColor: true, italic: true, wrap: "truncate-end", children: `  ${block.lines[0]?.text.replace(/\s+/g, ' ').trim() ?? ''}` }))] }, `think-${index}`));
                                }
                                if (block.kind === 'prose') {
                                    const proseText = block.lines.map(p => p.text).join('\n');
                                    const proseUnsettled = isRunning && block.lines.some(p => p.settled === false);
                                    const isProseAnswer = index === answerBlock;
                                    return (_jsxs(Box, { flexDirection: "column", marginTop: index === 0 ? 0 : 1, children: [isProseAnswer && (_jsx(Text, { dimColor: true, children: `── ${t('subagent-conclusion')} ${'─'.repeat(Math.max(8, Math.min(60, columns - 16)))}` })), _jsx(Markdown, { dimColor: false, cacheTokens: true, children: proseText }), proseUnsettled && _jsx(Text, { dimColor: true, children: '▌' })] }, `prose-${index}`));
                                }
                                const line = block.line;
                                const unsettled = !line.settled && isRunning ? ' ▍' : '';
                                if (line.kind === 'text' && isActivityLine(line.text)) {
                                    return (_jsxs(Box, { flexDirection: "row", gap: 1, children: [_jsx(Text, { color: "accent", children: '⏵' }), _jsxs(Text, { dimColor: true, wrap: "truncate-end", children: [line.text.replace(/^[\s⏵▶▸»]+/, ''), unsettled] })] }, `act-${index}`));
                                }
                                const isAnswer = index === answerBlock;
                                // Tool / error / system rows get a leading row gap so a wall
                                // of streamed rows stops reading as one cramped paragraph.
                                const rowGap = line.kind === 'tool' || line.kind === 'error' || line.kind === 'system';
                                return (_jsxs(Box, { flexDirection: "column", marginTop: rowGap && index !== 0 ? 1 : 0, children: [isAnswer && (_jsx(Text, { dimColor: true, children: `── ${t('subagent-conclusion')} ${'─'.repeat(Math.max(8, Math.min(60, columns - 16)))}` })), _jsxs(Text, { wrap: "wrap", bold: isAnswer, dimColor: line.kind === 'system', color: line.kind === 'error' ? 'error' : line.kind === 'tool' ? 'accent' : undefined, children: [line.kind === 'tool' ? `● ${line.text}` : line.text, unsettled] })] }, `line-${index}`));
                            }) }))), activePage === 'transcript' && loadTranscript !== undefined && (_jsxs(Box, { flexDirection: "column", children: [_jsx(Text, { dimColor: true, children: `${t('subagent-transcript-history')} · ${t('subagent-transcript-readonly')}` }), transcript.status === 'ready' && transcript.parentAgentId !== null && (_jsx(Text, { dimColor: true, children: t('subagent-transcript-parent', { id: transcript.parentAgentId.slice(0, 8) }) })), transcript.status === 'ready' && transcript.parentAgentId === null && (subagent.depth ?? 1) >= 2 && (_jsx(Text, { dimColor: true, children: t('subagent-transcript-old-format', { depth: subagent.depth ?? 2 }) })), transcript.status === 'loading' && _jsx(Text, { dimColor: true, children: `⏳ ${t('subagent-transcript-loading')}` }), transcript.status === 'unavailable' && _jsx(Text, { color: "error", children: t('subagent-transcript-unavailable') }), transcript.status === 'ready' && (() => {
                                    const merged = mergeLiveWindow(transcript.leaves, subagent, true);
                                    const liveStart = merged.findIndex(row => row.kind === 'live');
                                    if (merged.length === 0)
                                        return _jsx(Text, { dimColor: true, children: t('subagent-transcript-empty') });
                                    return (_jsxs(_Fragment, { children: [transcript.hasOlder && (_jsx(Box, { onClick: loadOlderTranscript, marginTop: 1, children: _jsx(Text, { color: "accent", children: transcript.loadingOlder
                                                        ? `⏳ ${t('subagent-transcript-loading')}`
                                                        : `▸ ${t('subagent-transcript-load-older', { count: transcript.sourceCursor === undefined ? Math.min(TRANSCRIPT_OLDER_CHUNK, transcript.skippedFromStart) : TRANSCRIPT_OLDER_CHUNK })}` }) })), merged.map((row, index) => {
                                                const margin = index > 0;
                                                if (row.kind === 'live') {
                                                    const line = row.line;
                                                    const unsettled = !line.settled && isRunning ? ' ▍' : '';
                                                    return (_jsxs(React.Fragment, { children: [index === liveStart && _jsx(Text, { dimColor: true, children: `── ${t('subagent-transcript-live')} ──` }), line.kind === 'text' && isActivityLine(line.text)
                                                                ? (_jsxs(Box, { flexDirection: "row", gap: 1, children: [_jsx(Text, { color: "accent", children: '⏵' }), _jsxs(Text, { dimColor: true, wrap: "truncate-end", children: [line.text.replace(/^[\s⏵▶▸»]+/, ''), unsettled] })] }))
                                                                : (_jsxs(Text, { wrap: "wrap", dimColor: line.kind === 'thinking' || line.kind === 'system', italic: line.kind === 'thinking', color: line.kind === 'error' ? 'error' : undefined, children: [line.text, unsettled] }))] }, `live-${index}`));
                                                }
                                                if (row.kind === 'thinking') {
                                                    return _jsx(ThinkingLeafRow, { thinking: row.text, marginTopOnTurn: margin, verbose: thinkingOpen }, `think-${row.key}`);
                                                }
                                                if (row.kind === 'thinking-unavailable') {
                                                    return (_jsx(Box, { marginTop: margin ? 1 : 0, children: _jsx(Text, { dimColor: true, italic: true, children: row.tokens !== undefined ? t('subagent-thinking-count-only', { tokens: row.tokens }) : t('subagent-thinking-unavailable') }) }, `ua-${row.key}`));
                                                }
                                                if (row.kind === 'text') {
                                                    return _jsx(AssistantTextLeafRow, { text: row.text, marginTopOnTurn: margin }, `text-${row.key}`);
                                                }
                                                if (row.kind === 'agent-message') {
                                                    return _jsx(AgentMessageLeafRow, { message: row.message, selfAgentId: subagent.agentId, marginTopOnTurn: margin }, `am-${row.key}`);
                                                }
                                                return (_jsx(ToolLeafRow, { tool: row.tool, marginTopOnTurn: margin, verbose: expandedLeaf === row.key, isExpanded: expandedLeaf === row.key, onClick: () => setExpandedLeaf(prev => prev === row.key ? null : row.key) }, `tool-${row.key}`));
                                            })] }));
                                })()] })), activePage === 'tools' && (subagent.toolCalls.length === 0 && subagent.reportedToolUses === undefined ? (_jsx(Text, { dimColor: true, children: t('subagent-no-tools') })) : (_jsxs(Box, { flexDirection: "column", children: [subagent.reportedToolUses !== undefined && subagent.reportedToolUses !== subagent.toolCalls.length && (_jsx(Text, { dimColor: true, children: t('subagent-tools-kept', { kept: subagent.toolCalls.length, reported: subagent.reportedToolUses }) })), subagent.toolCalls.map((tool, index) => (_jsxs(Box, { flexDirection: "column", marginTop: index === 0 ? 0 : 1, children: [_jsxs(Box, { flexDirection: "row", gap: 1, children: [_jsx(Text, { color: tool.status === 'failed' ? 'error' : tool.status === 'running' ? 'warning' : 'success', children: tool.status === 'running' ? '·' : tool.status === 'failed' ? '×' : '✓' }), _jsx(Text, { color: toolNameColor(tool.name), children: tool.name }), tool.endedAt && _jsx(Text, { dimColor: true, children: formatDuration(tool.endedAt - tool.startedAt) })] }), tool.argsPreview && (_jsx(Box, { flexDirection: "row", paddingLeft: 2, children: _jsx(JsonArgsText, { raw: tool.argsPreview }) })), tool.resultPreview && (_jsx(Box, { flexDirection: "row", paddingLeft: 2, children: _jsx(Text, { dimColor: true, wrap: "wrap", children: `⎿ ${tool.resultPreview}` }) })), tool.error && (_jsx(Box, { flexDirection: "row", paddingLeft: 2, children: _jsx(Text, { color: "error", wrap: "wrap", children: tool.error }) }))] }, tool.id ?? index)))] }))), activePage === 'messages' && messages.length > 0 && (_jsx(Box, { flexDirection: "column", children: messages.map((message, index) => (_jsx(Box, { marginTop: index === 0 ? 0 : 1, children: _jsx(AgentMessageFlowRow, { message: message, selfAgentId: subagent.agentId }) }, message.messageId))) }))] }) }), compose !== undefined && (_jsx(Box, { flexDirection: "column", marginTop: 1, children: _jsx(AgentMessageComposer, { target: compose.target, control: compose.control, messages: messages, focused: composerFocused && (!panelMode || (focused && visible)), onFocusChange: setComposerFocused, ...(panelMode ? { keyHandlerRef: composerKeys } : {}) }) })), _jsx(Divider, { color: "subtle", title: "" }), _jsxs(Box, { marginTop: 0, flexDirection: "row", children: [_jsx(Text, { dimColor: true, children: `←/→ ${t('subagent-hint-page')} · ↑/↓ ${t('subagent-hint-scroll')}`
                            + ((activePage === 'output' && hasThinking) || (activePage === 'transcript' && hasTranscriptThinking) ? ` · ${t('subagent-hint-fold')}` : '')
                            + (activePage === 'transcript' && transcript.status === 'ready' && transcript.hasOlder
                                ? ` · o ${t('subagent-transcript-load-older', { count: transcript.sourceCursor === undefined ? Math.min(TRANSCRIPT_OLDER_CHUNK, transcript.skippedFromStart) : TRANSCRIPT_OLDER_CHUNK })}`
                                : '') }), isRunning && onInterrupt && (_jsxs(_Fragment, { children: [_jsx(Text, { dimColor: true, children: ' · ' }), _jsx(Box, { onClick: () => onInterrupt(subagent.agentId), children: _jsx(Text, { dimColor: true, bold: true, color: "warning", children: "X interrupt" }) })] })), compose !== undefined && _jsx(Text, { dimColor: true, children: ` · i ${t('subagent-hint-compose')}` }), _jsx(Text, { dimColor: true, children: ` · Esc ${t('subagent-hint-back')}` })] })] }));
}

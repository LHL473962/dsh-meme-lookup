import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Box, Text } from '../../ui.js';
import { t } from '../../i18n.js';
import { truncateWidth, spreadRow } from '../../sessions/format.js';
import { stringWidth } from '../../ink/stringWidth.js';
import { normalizeWorkspaceCwd } from '../../sessions/view.js';
import { visibleWorkspaceSessions, workspaceSessionCounts } from '../../sessions/workspaceCounts.js';
import { useSidePanelChannel, useSidePanelFullscreen } from './SidePanelRuntimeContext.js';
import { usePanelInput } from './usePanelInput.js';
/**
 * 工作目录（工作区）面板：侧栏里的当前 cwd 概览 + 持久工作区账本
 * （channel.listWorkspaceRegistry()——整屏工作区主页左栏用的同一份数据，
 * 见 SessionSupervisor），同时是进入整屏「工作区主页」的入口
 * （Enter → openFullscreen('workspace')；⬢ 按钮由宿主 PanelBar 画）。
 *
 * 行契约：每行恒定 2 行（标题+会话数 / 路径+缺失标记），所有文本经
 * truncateWidth / spreadRow / elideMiddle 按列宽裁剪——28 列也不折行、
 * 不裸 slice。当前工作区行用 normalizeWorkspaceCwd 归一化后比较（与
 * /resume 的工作区分组同一口径，不自己写路径比较）。
 */
/** Each ledger row is exactly two terminal lines (selection math depends on it). */
const ROW_LINES = 2;
/** Middle elision for one unbreakable path line: keep both ends, drop the
 * middle. Cheaper to scan than a two-line hanging indent and keeps the
 * drive prefix and the leaf directory visible at once. CJK-aware via
 * stringWidth; never a bare slice. */
function elideMiddle(text, maxWidth) {
    if (maxWidth <= 1)
        return maxWidth <= 0 ? '' : '…';
    if (stringWidth(text) <= maxWidth)
        return text;
    const chars = [...text];
    // Keep roughly 40% head / 60% tail (the leaf matters more than the root).
    const headRoom = Math.max(1, Math.floor((maxWidth - 1) * 0.4));
    let head = '';
    let headWidth = 0;
    for (const char of chars) {
        const w = stringWidth(char);
        if (headWidth + w > headRoom)
            break;
        head += char;
        headWidth += w;
    }
    let tail = '';
    let tailWidth = 0;
    const tailRoom = maxWidth - 1 - headWidth;
    for (let at = chars.length - 1; at >= 0; at -= 1) {
        const char = chars[at];
        const w = stringWidth(char);
        if (tailWidth + w > tailRoom)
            break;
        tail = char + tail;
        tailWidth += w;
    }
    return head + '…' + tail;
}
export function WorkspacePanel({ width, height, focused, visible }) {
    const channel = useSidePanelChannel();
    const openFullscreen = useSidePanelFullscreen();
    // ── 数据：只在首次 visible 时起第一次拉取（visible=false 不发请求）；
    //    'r' 手动重拉；nonce 过期或卸载后不落 state。 ───────────────────────
    const [entries, setEntries] = React.useState(null);
    const [loadError, setLoadError] = React.useState(null);
    const [fetchTick, setFetchTick] = React.useState(0);
    const startedRef = React.useRef(false);
    const nonceRef = React.useRef(0);
    React.useEffect(() => {
        if (visible === false || startedRef.current)
            return;
        startedRef.current = true;
        setFetchTick(tick => tick + 1);
    }, [visible]);
    React.useEffect(() => {
        if (fetchTick === 0 || visible === false)
            return;
        const nonce = nonceRef.current + 1;
        nonceRef.current = nonce;
        let live = true;
        const bindingGeneration = channel.agentBindingGeneration;
        const agentId = channel.agentId;
        const sessionId = channel.sessionId;
        const cwd = channel.cwd;
        const backendId = channel.backendCapabilities?.backendId;
        const current = () => live && nonce === nonceRef.current
            && channel.agentBindingGeneration === bindingGeneration
            && channel.agentId === agentId && channel.sessionId === sessionId
            && channel.cwd === cwd && channel.backendCapabilities?.backendId === backendId;
        setLoadError(null);
        setEntries(null);
        Promise.all([channel.listWorkspaceRegistry(), channel.listSessions()])
            .then(([list, sessions]) => {
            if (!current())
                return;
            const counts = workspaceSessionCounts(visibleWorkspaceSessions(sessions, agentId));
            setEntries(list.map(entry => ({ ...entry, sessionCount: counts.get(normalizeWorkspaceCwd(entry.path)) ?? 0 })));
        })
            .catch((error) => {
            if (!current())
                return;
            setLoadError(error instanceof Error ? error.message : String(error));
        });
        return () => { live = false; };
    }, [channel, fetchTick, visible, channel.agentBindingGeneration, channel.agentId, channel.sessionId, channel.cwd, channel.backendCapabilities?.backendId, channel.ready]);
    // ── 选中 / hover / 自管窗口滚动 ──────────────────────────────────────────
    // 不用 ScrollBox：它的内容平移/裁剪会让滚动后的指针事件错位
    // （TrajectoryPanel 的 ledger 同样自己管窗口）。行恒定 2 行，
    // 窗口按面板高度算出，滚轮/↑↓/点击都在同一个 scrollTop 上收口。
    const [selected, setSelected] = React.useState(0);
    const [hovered, setHovered] = React.useState(null);
    const [scrollTop, setScrollTop] = React.useState(0);
    const list = entries ?? [];
    const listEmpty = entries !== null && entries.length === 0;
    const currentKey = normalizeWorkspaceCwd(channel.cwd);
    const focus = list.length === 0 ? 0 : Math.min(selected, list.length - 1);
    const contentWidth = Math.max(4, width - 2);
    const branch = channel.gitBranch;
    // header(1) + cwd(1) + branch(0/1) + margin(1) + list title(1) + hint(1)
    const chromeRows = 5 + (branch !== undefined && branch !== '' ? 1 : 0);
    const visibleRows = Math.max(1, Math.floor(Math.max(4, height - chromeRows) / ROW_LINES));
    const maxScroll = Math.max(0, list.length - visibleRows);
    const top = Math.min(scrollTop, maxScroll);
    const clampScroll = (next) => Math.max(0, Math.min(maxScroll, next));
    // 选中跟随：↑/↓ 把窗口带过去。
    const bringIntoView = (index) => {
        setScrollTop(current => {
            const base = Math.min(current, maxScroll);
            if (index < base)
                return index;
            if (index >= base + visibleRows)
                return index - visibleRows + 1;
            return current;
        });
    };
    React.useEffect(() => { bringIntoView(focus); }, [focus]); // eslint-disable-line react-hooks/exhaustive-deps -- 窗口跟随只看选中位
    // ── 键盘（v2.1 分发器）：↑/↓ 移动选中、Enter 开整屏主页、r 重拉；
    //    Esc 返回 false 让宿主把焦点还回聊天。 ─────────────────────────────────────
    usePanelInput((input, key) => {
        if (key.escape === true)
            return false;
        if (key.upArrow === true) {
            setSelected(i => Math.max(0, (list.length === 0 ? 0 : Math.min(i, list.length - 1)) - 1));
            return true;
        }
        if (key.downArrow === true) {
            setSelected(i => list.length === 0 ? 0 : Math.min(list.length - 1, Math.min(i, list.length - 1) + 1));
            return true;
        }
        if (key.return_ === true) {
            openFullscreen?.('workspace');
            return true;
        }
        // ctrl/meta 修饰时不认（Ctrl+R 是输入历史搜索，落到面板会变成误重拉）。
        if (input === 'r' && !key.ctrl && !key.meta) {
            setFetchTick(tick => tick + 1);
            return true;
        }
        return false;
    }, { active: focused && visible });
    // ── 几何：只按面板自身的 width/height，不读终端尺寸 ─────────────────────────────
    const cwd = channel.displayCwd !== '' ? channel.displayCwd : channel.cwd;
    const branchLabel = t('info-row-branch');
    return (_jsxs(Box, { flexDirection: "column", paddingX: 1, width: width, height: height, overflow: "hidden", children: [_jsxs(Box, { flexDirection: "column", flexShrink: 0, marginBottom: 1, children: [_jsx(Text, { color: "accent", bold: true, children: t('panel-workspace-current') }), _jsx(Box, { paddingLeft: 1, children: _jsx(Text, { color: "inactive", wrap: "truncate", children: elideMiddle(cwd, contentWidth - 1) }) }), branch !== undefined && branch !== '' && (_jsxs(Box, { paddingLeft: 1, flexDirection: "row", gap: 1, children: [_jsx(Text, { color: "inactive", children: branchLabel }), _jsx(Text, { wrap: "truncate", children: truncateWidth(branch, Math.max(1, contentWidth - stringWidth(branchLabel) - 3)) })] }))] }), _jsx(Box, { flexShrink: 0, children: _jsx(Text, { dimColor: true, children: truncateWidth(t('panel-workspace-list', { n: list.length }), contentWidth) }) }), loadError !== null ? (_jsx(Box, { paddingLeft: 1, marginTop: 1, children: _jsx(Text, { color: "error", wrap: "truncate", children: truncateWidth(t('panel-workspace-failed', { err: loadError }), contentWidth - 1) }) })) : entries === null ? (_jsx(Box, { paddingLeft: 1, marginTop: 1, children: _jsx(Text, { dimColor: true, children: truncateWidth(t('panel-workspace-loading'), contentWidth - 1) }) })) : listEmpty ? (_jsx(Box, { paddingLeft: 1, marginTop: 1, children: _jsx(Text, { dimColor: true, wrap: "truncate", children: truncateWidth(t('panel-workspace-empty'), contentWidth - 1) }) })) : (_jsx(Box, { flexDirection: "column", flexGrow: 1, flexShrink: 1, overflow: "hidden", onWheel: (event) => {
                    setScrollTop(current => clampScroll(Math.min(current, maxScroll) + (event.deltaY > 0 ? 1 : event.deltaY < 0 ? -1 : 0)));
                }, children: list.slice(top, top + visibleRows).map((entry, offset) => {
                    const index = top + offset;
                    return (_jsx(WorkspaceRow, { index: index, entry: entry, current: normalizeWorkspaceCwd(entry.path) === currentKey, selected: index === focus, hovered: hovered === index, width: contentWidth, onSelect: () => { setSelected(index); setScrollTop(clampScroll(Math.min(top, maxScroll))); setHovered(index); }, onHoverChange: setHovered }, entry.id));
                }) })), _jsx(Box, { flexShrink: 0, children: _jsx(Text, { dimColor: true, italic: true, wrap: "truncate", children: truncateWidth(t('panel-workspace-hint'), contentWidth) }) })] }));
}
/** One registered-workspace ledger row: title + session count on line 1,
 * directory (dim) + missing marker on line 2. Exactly two lines, always —
 * spreadRow/truncateWidth everywhere, never a bare slice, never a fold. */
function WorkspaceRow({ entry, index, current, selected, hovered, width, onSelect, onHoverChange }) {
    const body = Math.max(4, width - 2);
    const countLabel = t('panel-workspace-sessions', { n: entry.sessionCount });
    const head = spreadRow(entry.title, countLabel, body);
    const missingLabel = entry.present === false ? t('panel-workspace-missing') : '';
    const tail = spreadRow(entry.path, missingLabel, body);
    return (_jsxs(Box, { flexDirection: "column", flexShrink: 0, onClick: (event) => {
            event.stopImmediatePropagation();
            onSelect();
        }, onMouseEnter: () => onHoverChange(index), onMouseLeave: () => onHoverChange(prev => (prev === index ? null : prev)), children: [_jsxs(Box, { height: 1, flexShrink: 0, overflow: "hidden", children: [_jsx(Box, { width: 2, flexShrink: 0, children: _jsxs(Text, { color: selected || hovered ? 'accent' : undefined, children: [selected || hovered ? '❯' : ' ', current ? '●' : ' '] }) }), _jsx(Text, { bold: selected, color: selected || hovered ? 'accent' : undefined, wrap: "truncate-end", children: head.left + ' '.repeat(head.gap) + head.right })] }), _jsxs(Box, { height: 1, paddingLeft: 2, flexShrink: 0, overflow: "hidden", children: [_jsx(Text, { dimColor: true, wrap: "truncate-end", children: tail.left + ' '.repeat(tail.gap) }), tail.right !== '' && _jsx(Text, { color: "warning", children: tail.right })] })] }));
}

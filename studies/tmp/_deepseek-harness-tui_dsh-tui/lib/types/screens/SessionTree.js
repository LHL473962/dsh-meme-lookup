import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Box, Text, useInput, useTerminalSize } from '../ui.js';
import { Divider } from '../components/design-system/Divider.js';
import { HintLine } from '../components/design-system/HintLine.js';
import { SearchBox } from '../components/SearchBox.js';
import { useTerminalFocus } from '../ink/hooks/use-terminal-focus.js';
import { isMod, isPlainReturn, modLabel } from '../utils/modifiers.js';
import { spreadRow, tailWidth, truncateWidth, wrapWidth } from '../sessions/format.js';
import { stringWidth } from '../ink/stringWidth.js';
import { TICK, MULTIPLICATION_X } from '../terminal-utils/figures.js';
import { t } from '../i18n.js';
import { droppedTurnInfo, filterTree, flattenTree, nearestVisibleIndex, TREE_FILTERS, } from '../dsh-adapter/sessionTree.js';
/** Local HH:MM (or MM/DD HH:MM when older than this year). */
function formatTime(at, now) {
    const date = new Date(at);
    const pad = (n) => String(n).padStart(2, '0');
    const time = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    const sameYear = new Date(now).getFullYear() === date.getFullYear();
    return sameYear ? time : `${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${time}`;
}
/** A thrown value's message, for a notification that has to say something. */
function message(error) {
    return error instanceof Error ? error.message : String(error);
}
/** Rendered width of a hint: `HintLine` strips the `**` emphasis markers. */
function hintWidth(text) {
    return stringWidth(text.replace(/\*\*/gu, ''));
}
/** The widest hint that fits; cut only when even the shortest will not. */
function fitHint(candidates, budget) {
    for (const candidate of candidates) {
        if (hintWidth(candidate) <= budget)
            return candidate;
    }
    return truncateWidth((candidates[candidates.length - 1] ?? '').replace(/\*\*/gu, ''), budget);
}
/** Terminal cells of each kind prefix shown before the entry text. */
const KIND_PREFIX = {
    user: { text: 'user: ', color: 'suggestion' },
    assistant: { text: 'assistant: ', color: 'success' },
    tool: { text: '', color: 'subtle' },
    compact: { text: '[compact] ', color: 'planMode' },
    interrupt: { text: '', color: 'warning' },
    notice: { text: '', color: 'warning' },
};
/** Tool outcome glyph appended to a tool row. */
function toolGlyph(entry) {
    if (entry.toolStatus === 'ok')
        return { glyph: ' ✓', color: 'success' };
    if (entry.toolStatus === 'error')
        return { glyph: ' ✗', color: 'error' };
    if (entry.toolStatus === 'running')
        return { glyph: ' …', color: 'warning' };
    return undefined;
}
/**
 * pi's tree prefix: gutters at recorded positions, connector at indent-1.
 * Each indent level is 3 cells (`│  `, `├─ `, `└─ `).
 */
function treePrefix(flatNode) {
    const displayIndent = flatNode.multipleRoots ? Math.max(0, flatNode.indent - 1) : flatNode.indent;
    const hasConnector = flatNode.showConnector && !flatNode.isVirtualRootChild;
    const connectorPosition = hasConnector ? displayIndent - 1 : -1;
    const chars = [];
    for (let i = 0; i < displayIndent * 3; i++) {
        const level = Math.floor(i / 3);
        const posInLevel = i % 3;
        const gutter = flatNode.gutters.find(g => g.position === level);
        if (gutter !== undefined) {
            chars.push(posInLevel === 0 ? (gutter.show ? '│' : ' ') : ' ');
        }
        else if (level === connectorPosition) {
            if (posInLevel === 0)
                chars.push(flatNode.isLast ? '└' : '├');
            else if (posInLevel === 1)
                chars.push('─');
            else
                chars.push(' ');
        }
        else {
            chars.push(' ');
        }
    }
    return chars.join('');
}
/**
 * Keep the LAST `budget` display cells of a prefix, prefixing '…' when any
 * level was cut — narrow terminals sacrifice the oldest ancestors, never the
 * branch geometry next to the entry.
 */
function clampPrefix(prefix, budget) {
    if (stringWidth(prefix) <= budget)
        return prefix;
    if (budget <= 1)
        return '…';
    return `…${tailWidth(prefix, budget - 1)}`;
}
/**
 * Rows the layout cannot do without: the header, the bordered search card
 * (three rows), the notice slot, and the hints. Everything else — the rule,
 * the tree itself — yields before these do.
 */
const MANDATORY_LINES = 6;
/**
 * The one horizontal rule, above the hints. The search card's own border
 * separates it from the header and the tree (the two rules that used to
 * flank it are gone); the rule that remains lifts the hints off the content —
 * decoration, and the first thing a short terminal drops.
 */
const RULE_PRIORITY = [2];
/** Width from which the preview pane sits beside the list instead of below. */
const SPLIT_MIN_COLUMNS = 100;
/** Lines the bottom preview block may take on narrow terminals. */
const PREVIEW_BLOCK_LINES = 5;
/**
 * The session family tree — `/tree` as a screen of its own (pi's Session
 * Tree over DSH's cross-session fork model).
 *
 * The tree shows every branch the conversation ever took: each rewind fork
 * is stitched back onto the message it diverged from, the live path is
 * marked with `•`, and every other branch stays reachable. Picking a node
 * offers the ways DSH can act on it — rewind (drop the turn, edit its
 * prompt), fork (keep the entry, branch here), adopt (switch to a dead
 * branch whole).
 *
 * Interaction is mouse-first but keyboard-complete: hovering a row shows its
 * full text in the preview pane, clicking it opens the action menu, and the
 * same actions sit on Enter / Ctrl+F / Ctrl+B for the keyboard path. The
 * confirm seat stands between every high-risk action and the fork.
 */
export function SessionTree({ channel, currentSessionId, onClose, onRestoreText, }) {
    const { columns, rows } = useTerminalSize();
    const isTerminalFocused = useTerminalFocus();
    const [data, setData] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    /** A rewind/fork/adopt is in flight — the seat stays up until it settles. */
    const [busy, setBusy] = React.useState(false);
    const [notice, setNotice] = React.useState();
    // The cursor is a node id, not an index: filters and searches rebuild the
    // row list, and an index would silently land on a different node.
    const [selectedId, setSelectedId] = React.useState(null);
    const [filter, setFilter] = React.useState('default');
    const [query, setQuery] = React.useState('');
    /** The hovered node id — drives the preview pane alongside the cursor. */
    const [hoverId, setHoverId] = React.useState(null);
    const [menuNodeId, setMenuNodeId] = React.useState(null);
    const [menuIndex, setMenuIndex] = React.useState(0);
    const [confirmHovered, setConfirmHovered] = React.useState(false);
    const [confirmState, setConfirmState] = React.useState(null);
    // React batches every parsed key from one stdin chunk; actions lock in a
    // ref so a repeated Enter cannot start the same async operation twice.
    const actionPendingRef = React.useRef(false);
    // ── Load ────────────────────────────────────────────────────────────────
    // A build that settles null/undefined closes the screen: the channel
    // already toasted the reason (persistence absent) or the live session
    // swapped mid-build (silent by design — the reopened tree rebuilds on the
    // new session).
    React.useEffect(() => {
        let live = true;
        void channel
            .buildSessionTree()
            .then(result => (live ? result : undefined))
            .catch(() => undefined)
            .then(result => {
            if (!live)
                return;
            if (result === null || result === undefined) {
                onClose();
                return;
            }
            setData(result);
            setLoading(false);
        });
        return () => {
            live = false;
        };
    }, [channel, onClose]);
    // ── Derived view ────────────────────────────────────────────────────────
    const full = React.useMemo(() => (data === null ? [] : flattenTree(data.roots, data.activeLeafId)), [data]);
    const visible = React.useMemo(() => (data === null ? [] : filterTree(full, data.activeLeafId, filter, query)), [data, full, filter, query]);
    const focusIndex = React.useMemo(() => {
        if (visible.length === 0)
            return 0;
        return nearestVisibleIndex(visible, full, selectedId ?? data?.activeLeafId ?? null);
    }, [visible, full, selectedId, data?.activeLeafId]);
    const focusedNode = visible[focusIndex];
    const focusedEntry = focusedNode?.node.entry ?? null;
    // The menu rides the PICKED node id (not the cursor): moving the cursor
    // while the menu is open must not retarget an action.
    const menuNode = menuNodeId === null
        ? undefined
        : visible.find(n => n.node.id === menuNodeId) ?? full.find(n => n.node.id === menuNodeId);
    const menuEntry = menuNode?.node.entry ?? null;
    const menuOpen = menuNode !== undefined && menuEntry !== null;
    const seat = confirmState !== null ? 'confirm' : menuOpen ? 'menu' : 'tree';
    // Preview target: the hovered row wins (that is what the eye is asking
    // about), the focused row backs it up so keyboard users see one too.
    const previewNode = (hoverId !== null ? visible.find(n => n.node.id === hoverId) : undefined) ?? focusedNode;
    const previewEntry = previewNode?.node.entry ?? null;
    // ── Actions ─────────────────────────────────────────────────────────────
    /** Pre-validate a rewind pick the way rewindToNode will refuse it. */
    const rewindBlockedReason = (entry) => {
        if (entry.firstTurn === true && entry.kind === 'user')
            return t('tree-first-message');
        return undefined;
    };
    /** Build the click menu's options for one entry. */
    const menuOptionsFor = (entry) => {
        const options = [];
        const blocked = rewindBlockedReason(entry);
        options.push({
            id: 'rewind',
            label: t('tree-menu-rewind'),
            detail: blocked ?? t('tree-menu-rewind-detail'),
            ...(blocked !== undefined ? { disabled: true } : {}),
        });
        options.push({ id: 'fork', label: t('tree-menu-fork'), detail: t('tree-menu-fork-detail') });
        const tip = data?.rewindFacts.get(entry.sessionId)?.tipBoundary;
        if (entry.sessionId !== currentSessionId) {
            options.push(tip === undefined
                ? { id: 'adopt', label: t('tree-menu-adopt'), detail: t('tree-adopt-unavailable'), disabled: true }
                : { id: 'adopt', label: t('tree-menu-adopt'), detail: t('tree-menu-adopt-detail') });
        }
        options.push({ id: 'cancel', label: t('tree-menu-cancel'), detail: '' });
        return options;
    };
    const options = menuOpen && menuEntry !== null ? menuOptionsFor(menuEntry) : [];
    const runAction = (action) => {
        if (actionPendingRef.current)
            return;
        actionPendingRef.current = true;
        void action().finally(() => {
            actionPendingRef.current = false;
        });
    };
    /**
     * Execute a rewind/fork at an entry (menu rows, Ctrl+F). The seat stays up
     * while the swap runs; success closes the screen and hands the dropped
     * turn's prompt back to the input.
     */
    const executeAt = (entry, mode) => {
        runAction(async () => {
            setBusy(true);
            try {
                const text = await channel.rewindToNode(entry.sessionId, entry.seq, mode);
                if (text === null) {
                    // The channel notified the transcript (hidden behind this screen),
                    // so repeat the refusal on screen and stay put.
                    setNotice({ text: t('tree-refused'), tone: 'error' });
                    setBusy(false);
                    return;
                }
                if (text !== '')
                    onRestoreText(text);
                channel.notify(mode === 'fork' ? t('tree-forked') : t('tree-rewound'));
                onClose();
            }
            catch (error) {
                setNotice({ text: t('tree-rewind-failed', { message: message(error) }), tone: 'error' });
                setBusy(false);
            }
        });
    };
    /** Adopt = fork the branch at its tip with the whole log kept. */
    const executeAdopt = (entry, tipSeq) => {
        runAction(async () => {
            setBusy(true);
            try {
                const text = await channel.rewindToNode(entry.sessionId, tipSeq, 'rewind');
                if (text === null) {
                    setNotice({ text: t('tree-refused'), tone: 'error' });
                    setBusy(false);
                    return;
                }
                channel.notify(t('tree-adopted'));
                onClose();
            }
            catch (error) {
                setNotice({ text: t('tree-rewind-failed', { message: message(error) }), tone: 'error' });
                setBusy(false);
            }
        });
    };
    /** A rewind pick (Enter path and the menu's rewind option): confirm seat. */
    const askRewind = (entry) => {
        const blocked = rewindBlockedReason(entry);
        if (blocked !== undefined) {
            setNotice({ text: blocked, tone: 'error' });
            return;
        }
        const drop = data === null ? undefined : droppedTurnInfo(data, entry);
        setConfirmState({
            kind: 'rewind',
            entry,
            ...(drop?.coversBranch === true ? { dropsBranch: true } : {}),
            ...(drop !== undefined ? { droppedEntries: drop.droppedEntries } : {}),
        });
    };
    /** Ctrl+B (and the menu's adopt option): the confirm seat. */
    const askAdopt = (entry) => {
        if (entry.sessionId === currentSessionId) {
            setNotice({ text: t('tree-adopt-live'), tone: 'info' });
            return;
        }
        const tip = data?.rewindFacts.get(entry.sessionId)?.tipBoundary;
        if (tip === undefined) {
            setNotice({ text: t('tree-adopt-unavailable'), tone: 'error' });
            return;
        }
        setConfirmState({ kind: 'adopt', entry, tipSeq: tip });
    };
    const performConfirm = (confirm) => {
        setConfirmState(null);
        if (confirm.kind === 'adopt') {
            if (confirm.tipSeq !== undefined)
                executeAdopt(confirm.entry, confirm.tipSeq);
            return;
        }
        executeAt(confirm.entry, 'rewind');
    };
    /** Run one menu option (click path and Enter path share this). */
    const runMenuOption = (option) => {
        if (option.disabled === true || !menuOpen || menuEntry === null)
            return;
        const entry = menuEntry;
        setMenuNodeId(null);
        if (option.id === 'cancel')
            return;
        if (option.id === 'rewind')
            askRewind(entry);
        else if (option.id === 'fork')
            executeAt(entry, 'fork');
        else
            askAdopt(entry);
    };
    // ── Keyboard ────────────────────────────────────────────────────────────
    // Keys are read through refs for the same reason the other keyed screens do
    // it: several key events can arrive in one stdin chunk before React re-renders.
    const focusIndexRef = React.useRef(focusIndex);
    focusIndexRef.current = focusIndex;
    const visibleRef = React.useRef(visible);
    visibleRef.current = visible;
    const listHeightRef = React.useRef(1);
    const step = (by, times = 1, wrap = true) => {
        const list = visibleRef.current;
        if (list.length === 0)
            return;
        let at = focusIndexRef.current;
        for (let taken = 0; taken < times; taken++) {
            at = at + by;
            if (at < 0)
                at = wrap ? list.length - 1 : 0;
            if (at >= list.length)
                at = wrap ? 0 : list.length - 1;
        }
        focusIndexRef.current = at;
        setSelectedId(list[at]?.node.id ?? null);
    };
    /**
     * Mouse wheel over the tree walks the cursor (cursor-centered window, so
     * rolling IS scrolling; the hover-driven preview rides along). The menu /
     * confirm seats keep the keyboard as sole owner.
     */
    const handleWheel = (event) => {
        if (seat !== 'tree')
            return;
        step(event.deltaY >= 0 ? 1 : -1, 1, false);
    };
    useInput((input, key) => {
        // While an action is in flight the seat swallows every key — closing now
        // would drop the user back into a half-swapped session.
        if (busy)
            return;
        if (notice !== undefined)
            setNotice(undefined);
        if (seat === 'confirm' && confirmState !== null) {
            if (isPlainReturn(key))
                performConfirm(confirmState);
            else if (key.escape)
                setConfirmState(null);
            return;
        }
        if (seat === 'menu') {
            if (key.upArrow)
                setMenuIndex(index => wrapIndex(index, -1, options.length));
            else if (key.downArrow)
                setMenuIndex(index => wrapIndex(index, 1, options.length));
            else if (key.escape)
                setMenuNodeId(null);
            else if (isPlainReturn(key)) {
                const option = options[menuIndex];
                if (option !== undefined)
                    runMenuOption(option);
            }
            else if (!isMod(key) && !key.meta && input) {
                const lower = input.toLowerCase();
                const hit = options.find(option => option.id !== 'cancel' && option.id.startsWith(lower));
                if (hit !== undefined)
                    runMenuOption(hit);
            }
            return;
        }
        if (key.upArrow)
            step(-1);
        else if (key.downArrow)
            step(1);
        else if (key.wheelUp)
            step(-1, 1, false);
        else if (key.wheelDown)
            step(1, 1, false);
        else if (key.pageUp || key.leftArrow)
            step(-1, Math.max(1, Math.floor(listHeightRef.current / 2)));
        else if (key.pageDown || key.rightArrow)
            step(1, Math.max(1, Math.floor(listHeightRef.current / 2)));
        else if (key.escape) {
            // Esc backs out one layer at a time: a live query first, the screen
            // second — closing on the first Esc would discard a search still being
            // refined.
            if (query !== '')
                setQuery('');
            else
                onClose();
        }
        else if (isPlainReturn(key)) {
            if (focusedEntry !== null && focusedNode !== undefined) {
                setSelectedId(focusedNode.node.id);
                setMenuNodeId(focusedNode.node.id);
                setMenuIndex(0);
            }
        }
        else if (isMod(key) && input === 'o') {
            const index = TREE_FILTERS.indexOf(filter);
            setFilter(TREE_FILTERS[(index + 1) % TREE_FILTERS.length] ?? 'default');
        }
        else if (isMod(key) && input === 'f' && focusedEntry !== null) {
            executeAt(focusedEntry, 'fork');
        }
        else if (isMod(key) && input === 'b' && focusedEntry !== null) {
            askAdopt(focusedEntry);
        }
        else if (key.backspace || key.delete) {
            setQuery(text => text.slice(0, -1));
        }
        else if (!isMod(key) && !key.meta && !key.super && input && !key.return) {
            // Only real characters reach the query — anything else the terminal
            // delivers would be typed into the search invisibly.
            const typed = input.replace(/\p{Cc}/gu, '');
            if (typed.length > 0)
                setQuery(text => text + typed);
        }
    });
    // ── Layout arithmetic ───────────────────────────────────────────────────
    const inputBudget = Math.max(0, columns - 2);
    const menuLines = seat === 'menu' ? 1 + options.length : 0;
    const confirmLines = confirmState === null ? 0 : 1 + (confirmState.dropsBranch === true ? 1 : 0);
    const previewBlock = seat === 'tree' && previewEntry !== null && columns < SPLIT_MIN_COLUMNS && hoverId !== null
        ? PREVIEW_BLOCK_LINES
        : 0;
    // The notice slot is mandatory (permanent): a rewind/fork report must never
    // shift the tree by arriving.
    const extraLines = menuLines + confirmLines + previewBlock;
    const ruleBudget = Math.max(0, Math.min(RULE_PRIORITY.length, rows - MANDATORY_LINES - extraLines));
    const rules = new Set(RULE_PRIORITY.slice(0, ruleBudget));
    const listHeight = Math.max(0, rows - MANDATORY_LINES - extraLines - rules.size);
    listHeightRef.current = listHeight;
    const splitPreview = seat === 'tree' && previewEntry !== null && columns >= SPLIT_MIN_COLUMNS;
    const previewWidth = splitPreview ? Math.min(52, Math.floor(columns * 0.38)) : columns;
    const listWidth = Math.max(20, columns - (splitPreview ? previewWidth : 0));
    // Cursor-centered window over single-line rows.
    const windowStart = visible.length <= listHeight
        ? 0
        : Math.max(0, Math.min(focusIndex - Math.floor(listHeight / 2), visible.length - listHeight));
    const windowed = visible.slice(windowStart, windowStart + Math.max(0, listHeight));
    const heading = ` ${t('tree-title')}`;
    const right = [
        `${focusIndex + 1}/${visible.length}`,
        t(`tree-filter-${filter}`),
        `${data?.sessionCount ?? 0} ${t('tree-sessions')}`,
        ...(data?.truncated === true ? [t('tree-truncated')] : []),
    ].join(' · ');
    const header = spreadRow(heading, right, Math.max(0, columns - 1));
    const hint = seat === 'confirm'
        ? fitHint([t('tree-hint-confirm')], inputBudget)
        : seat === 'menu'
            ? fitHint([t('tree-hint-menu')], inputBudget)
            : fitHint([t('tree-hint', { mod: modLabel }), t('tree-hint-short')], inputBudget);
    // ── Loading / busy seats ────────────────────────────────────────────────
    if (loading || busy) {
        return (_jsxs(Box, { flexDirection: "column", width: columns, height: rows, children: [_jsx(Box, { flexShrink: 0, children: _jsx(Text, { color: "remember", bold: true, children: truncateWidth(` ${t('tree-title')}`, inputBudget) }) }), _jsx(Box, { flexShrink: 0, children: _jsx(Text, { dimColor: true, italic: true, children: ` ${truncateWidth(busy ? t('tree-rewinding') : t('tree-loading'), inputBudget)}` }) })] }));
    }
    // ── Render ──────────────────────────────────────────────────────────────
    return (_jsxs(Box, { flexDirection: "column", width: columns, height: rows, children: [_jsxs(Box, { flexShrink: 0, children: [_jsx(Text, { color: "remember", bold: true, children: header.left }), _jsx(Text, { dimColor: true, children: `${' '.repeat(header.gap)}${header.right}` })] }), _jsx(Box, { flexShrink: 0, children: _jsx(SearchBox, { query: tailWidth(query, inputBudget), isFocused: seat === 'tree', isTerminalFocused: isTerminalFocused, placeholder: truncateWidth(t('tree-search'), inputBudget), 
                    // 定宽是正确性前提：SearchBox 的单行窗口化预算取自实测自身宽度，
                    // 自适应宽度（默认 row 包裹、无 width）会让预算跟随内容收缩，
                    // 收敛到只显示最新一个字符。
                    width: "100%" }) }), _jsxs("ink-box", { style: { flexDirection: 'row', flexGrow: 1, flexShrink: 1, overflow: 'hidden' }, onWheel: handleWheel, children: [_jsxs(Box, { flexDirection: "column", width: listWidth, height: listHeight, flexShrink: 0, children: [visible.length === 0 && (_jsx(Text, { dimColor: true, italic: true, children: ` ${truncateWidth(t('tree-empty'), Math.max(0, listWidth - 2))}` })), windowed.map((flatNode, index) => (_jsx(TreeRow, { flatNode: flatNode, meta: data?.sessions.get(flatNode.node.sessionId), liveSessionId: currentSessionId, width: listWidth, focused: windowStart + index === focusIndex, onActivePath: data?.activePath.has(flatNode.node.id) === true, onHover: setHoverId, onClick: () => {
                                    // Click = focus + open the action menu (the mouse path to
                                    // every action this screen offers); the menu's own rows
                                    // execute.
                                    setSelectedId(flatNode.node.id);
                                    setMenuNodeId(flatNode.node.id);
                                    setMenuIndex(0);
                                } }, flatNode.node.id)))] }), splitPreview && previewEntry !== null && (_jsx(PreviewPane, { entry: previewEntry, meta: data?.sessions.get(previewEntry.sessionId), width: previewWidth, height: listHeight, liveSessionId: currentSessionId, now: Date.now() }))] }), previewBlock > 0 && previewEntry !== null && (_jsx(PreviewPane, { entry: previewEntry, meta: data?.sessions.get(previewEntry.sessionId), width: columns, height: previewBlock, liveSessionId: currentSessionId, now: Date.now(), compact: true })), _jsx(Box, { flexShrink: 0, children: _jsx(Text, { color: notice?.tone === 'error' ? 'error' : 'success', children: notice === undefined
                        ? ' '
                        : ` ${notice.tone === 'error' ? MULTIPLICATION_X : TICK} ${truncateWidth(notice.text, inputBudget - 2)}` }) }), seat === 'menu' && menuEntry !== null && (_jsxs(Box, { flexDirection: "column", flexShrink: 0, children: [_jsx(Box, { flexShrink: 0, children: _jsx(Text, { color: "remember", children: ` ${truncateWidth(`❰ ${menuEntry.text}`, inputBudget)}` }) }), options.map((option, index) => (_jsx(MenuOptionRow, { option: option, highlighted: index === menuIndex, width: inputBudget, onClick: () => {
                            setMenuIndex(index);
                            runMenuOption(option);
                        }, onHover: () => setMenuIndex(index) }, option.id)))] })), seat === 'confirm' && confirmState !== null && (_jsxs(Box, { flexShrink: 0, flexDirection: "column", 
                // 点击确认行 = 确认执行（与 Enter 同路径）；取消保留键盘 Esc，防误点
                onClick: () => performConfirm(confirmState), onMouseEnter: () => setConfirmHovered(true), onMouseLeave: () => setConfirmHovered(false), backgroundColor: confirmHovered ? 'userMessageBackgroundHover' : undefined, children: [_jsx(Text, { color: "warning", children: ` ${truncateWidth(confirmState.kind === 'adopt'
                            ? t('tree-confirm-adopt', { text: confirmState.entry.text })
                            : confirmState.droppedEntries !== undefined && confirmState.droppedEntries > 0
                                ? t('tree-confirm-drop', { text: confirmState.entry.text, n: confirmState.droppedEntries })
                                : t('tree-confirm-rewind', { text: confirmState.entry.text }), inputBudget)}` }), confirmState.dropsBranch === true && (_jsx(Text, { color: "error", children: ` ${truncateWidth(t('tree-confirm-drops-branch'), inputBudget)}` }))] })), rules.has(2) && (_jsx(Box, { flexShrink: 0, children: _jsx(Divider, { bleed: true }) })), _jsx(Box, { flexShrink: 0, children: _jsx(Text, { dimColor: true, italic: true, children: _jsx(HintLine, { text: hint }) }) })] }));
}
/** Index wrap helper for the menu cursor. */
function wrapIndex(current, by, count) {
    if (count <= 0)
        return 0;
    return (current + by + count) % count;
}
/**
 * One tree row: focus pointer, tree-drawing prefix, active-path bullet,
 * branch badge, then the entry text in its kind's colours. Hover highlights
 * the row and drives the preview pane; click opens the action menu.
 */
function TreeRow({ flatNode, meta, liveSessionId, width, focused, onActivePath, onHover, onClick, }) {
    const [hovered, setHovered] = React.useState(false);
    const entry = flatNode.node.entry;
    if (entry === null) {
        // Placeholder rows: an empty fork, an unreadable log, an unloaded one.
        // They carry no action, but keep the branch structure visible.
        const label = meta?.unreadable === true
            ? t('tree-unreadable')
            : meta?.unloaded === true
                ? t('tree-unloaded')
                : t('tree-empty-fork');
        return (_jsxs(Box, { flexShrink: 0, onClick: onClick, onMouseEnter: () => {
                setHovered(true);
                onHover(null);
            }, onMouseLeave: () => setHovered(false), backgroundColor: hovered ? 'userMessageBackgroundHover' : undefined, children: [_jsx(Text, { color: "subtle", children: '  ' }), _jsx(Text, { dimColor: true, children: clampPrefix(treePrefix(flatNode), Math.max(0, width - 4)) }), _jsx(Text, { dimColor: true, italic: true, children: truncateWidth(`⎇ ${label}`, Math.max(0, width - 6)) })] }));
    }
    const kind = KIND_PREFIX[entry.kind];
    const glyph = entry.kind === 'tool' ? toolGlyph(entry) : undefined;
    // Branch badge: the first row of a session chain names the branch it
    // starts — the live session wears its own mark.
    const badge = flatNode.node.branchHead
        ? `${flatNode.node.sessionId === liveSessionId ? '●' : '⎇'} ${truncateWidth(meta?.title ?? flatNode.node.sessionId.slice(0, 8), 16)} › `
        : '';
    const budget = Math.max(4, width - 2 - stringWidth(clampPrefix(treePrefix(flatNode), Math.max(0, width - 8))) - (onActivePath ? 2 : 0) - stringWidth(badge) - stringWidth(kind.text) - (glyph === undefined ? 0 : 2));
    return (_jsxs(Box, { flexShrink: 0, onClick: onClick, onMouseEnter: () => {
            setHovered(true);
            onHover(flatNode.node.id);
        }, onMouseLeave: () => {
            setHovered(false);
            onHover(null);
        }, backgroundColor: hovered && !focused ? 'userMessageBackgroundHover' : undefined, children: [_jsx(Text, { color: focused ? 'suggestion' : 'subtle', children: focused ? '❯ ' : '  ' }), _jsx(Text, { dimColor: true, children: clampPrefix(treePrefix(flatNode), Math.max(0, width - 8)) }), onActivePath && _jsx(Text, { color: "suggestion", children: '• ' }), badge !== '' && _jsx(Text, { color: flatNode.node.sessionId === liveSessionId ? 'remember' : 'planMode', dimColor: true, children: badge }), kind.text !== '' && (_jsx(Text, { color: entry.label === 'aborted' ? 'warning' : kind.color, children: kind.text })), _jsx(Text, { color: entry.kind === 'interrupt' || entry.kind === 'notice' ? 'warning' : entry.kind === 'tool' ? 'subtle' : undefined, bold: focused, dimColor: entry.kind === 'tool', children: truncateWidth(`${entry.text}${entry.label === 'aborted' ? ` (${entry.label})` : ''}`, budget) }), glyph !== undefined && _jsx(Text, { color: glyph.color, children: glyph.glyph })] }));
}
/** One option row of the click menu: marker, label, detail. */
function MenuOptionRow({ option, highlighted, width, onClick, onHover, }) {
    const dim = option.disabled === true;
    const labelWidth = 14;
    const detailBudget = Math.max(0, width - 4 - labelWidth);
    return (_jsxs(Box, { flexShrink: 0, onClick: dim ? undefined : onClick, onMouseEnter: dim ? undefined : onHover, backgroundColor: highlighted && !dim ? 'userMessageBackgroundHover' : undefined, children: [_jsx(Text, { color: highlighted ? 'suggestion' : 'subtle', children: highlighted ? '❯ ' : '  ' }), _jsx(Text, { color: dim ? 'inactive' : option.id === 'rewind' ? 'warning' : option.id === 'fork' ? 'remember' : option.id === 'adopt' ? 'planMode' : 'subtle', bold: highlighted && !dim, children: truncateWidth(option.label, labelWidth) }), _jsx(Text, { dimColor: true, children: ` ${truncateWidth(option.detail, detailBudget)}` })] }));
}
/**
 * The preview pane: the hovered (or focused) entry's full text, wrapped,
 * with the facts that place it — kind, time, branch, seq.
 */
function PreviewPane({ entry, meta, width, height, liveSessionId, now, compact, }) {
    const bodyWidth = Math.max(8, width - 2);
    const kindLabel = t(`tree-kind-${entry.kind}`);
    const head = `${kindLabel} · ${formatTime(entry.time, now)}`;
    const lines = wrapWidth(entry.text, bodyWidth).slice(0, Math.max(0, height - (compact === true ? 2 : 4)));
    const cut = wrapWidth(entry.text, bodyWidth).length > lines.length;
    const branch = entry.sessionId === liveSessionId
        ? t('tree-branch-live')
        : meta?.title !== undefined
            ? truncateWidth(meta.title, Math.max(0, bodyWidth - head.length - 3))
            : entry.sessionId.slice(0, 8);
    return (_jsxs(Box, { flexDirection: "column", width: width, height: height, flexShrink: 0, children: [!compact && (_jsx(Box, { flexShrink: 0, children: _jsx(Text, { color: "remember", bold: true, children: ` ${truncateWidth(t('tree-preview-title'), Math.max(0, width - 1))}` }) })), _jsxs(Box, { flexShrink: 0, children: [_jsx(Text, { color: "planMode", children: ` ${truncateWidth(head, Math.max(0, width - 1))}` }), _jsx(Text, { dimColor: true, children: ` ${truncateWidth(branch, Math.max(0, width - 1 - stringWidth(head)))}` })] }), !compact && _jsx(Divider, { width: width }), lines.map((line, index) => (_jsx(Box, { flexShrink: 0, children: _jsx(Text, { children: ` ${truncateWidth(line, bodyWidth)}` }) }, index))), cut && (_jsx(Box, { flexShrink: 0, children: _jsx(Text, { dimColor: true, children: ` ${'…'}` }) }))] }));
}

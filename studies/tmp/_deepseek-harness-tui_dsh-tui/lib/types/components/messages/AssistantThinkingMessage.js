import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import chalk from 'chalk';
import { Box, Text } from '../../ui.js';
import { t } from '../../i18n.js';
import { StreamingMarkdown } from '../StreamingMarkdown.js';
import { formatDuration, formatTokens } from '../../terminal-utils/format.js';
import { THINKING_SPINNER_FRAMES, THINKING_SPINNER_INTERVAL_MS, THINKING_SETTLED_MARKER, } from '../../terminal-utils/figures.js';
import { BRAND, ICE } from '../shimmer.js';
import { interpolateColor } from '../Spinner/spinnerUtils.js';
import { isMinimalUiMode } from '../../minimalUiMode.js';
import { primaryComboString } from '../../utils/keymap.js';
/** Preview body rows — a FIXED row count (kimicode-style constant-height
 *  ticker). Ink's truncate slices the whole string across newlines as one
 *  logical line, so a single joined Text collapses to 1-2 rows whenever
 *  the combined width passes the terminal width, then bounces back as
 *  lines shift. One Text per row, each truncated to the width and padded
 *  to exactly this many rows, keeps the block height stream-independent. */
const PREVIEW_ROWS = 3;
/**
 * Thinking block: settled rows fold to `⚓ Thinking` plus the localized
 * ctrl+o expand hint (hint-expand-ctrl-o);
 * streaming rows switch between a three-line preview and the full reasoning
 * text on click. The live leading mark is a rotating braille spinner
 * (`⠋⠙⠹…`, Kimi Code style), settling back to the static anchor (`⚓`). When
 * the channel records the reasoning duration, the label carries it
 * (`⚓ Thinking · 12s …`) — dsh-tui's take on making thinking time visible in
 * the transcript.
 */
export function AssistantThinkingMessage({ thinking, textFull, marginTopOnTurn, verbose, streaming = false, preview = false, durationMs, reasoningTokens, isSelected = false, onClick, }) {
    if (!thinking) {
        if (reasoningTokens === undefined)
            return null;
        return (_jsx(ThinkingTokensHeader, { tokens: reasoningTokens, streaming: streaming, marginTopOnTurn: marginTopOnTurn, isSelected: isSelected, onClick: onClick }));
    }
    // The preview ticker tracks the newest ARRIVED line (smooth streaming must
    // not lag it behind the reveal); the expanded body below paints `thinking`
    // — the revealed slice under smooth streaming, the full text otherwise.
    const tickerText = textFull ?? thinking;
    // Spinner frame (80ms cadence, only while the reasoning is still
    // streaming — same pattern as BtwPanel's answering spinner).
    const [frame, setFrame] = React.useState(0);
    React.useEffect(() => {
        if (!streaming)
            return;
        const interval = setInterval(() => setFrame(f => f + 1), THINKING_SPINNER_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [streaming]);
    const duration = durationMs !== undefined && durationMs >= 1000
        ? ` · ${formatDuration(durationMs)}`
        : '';
    // Kimi Code style blue pulse: the streaming glyph breathes along the
    // header's brand→ice ladder, one sine period per ~7 frames (≈0.56s) —
    // lively without strobing. The minimal UI drops the color (plain glyph);
    // settled always keeps the plain dim anchor.
    const label = `${t('thinking-label')}${duration}${streaming ? '…' : ` ${t('hint-expand-ctrl-o', { key: primaryComboString('transcript') })}`}`;
    const minimalUi = isMinimalUiMode();
    const pulse = (Math.sin(frame * 0.9) + 1) / 2;
    const pulseColor = interpolateColor(BRAND, ICE, pulse);
    const frameText = THINKING_SPINNER_FRAMES[frame % THINKING_SPINNER_FRAMES.length];
    // Hover 轻指示：可点击折叠时折叠头从 dim 提亮为正常色（不刷整行背景，
    // 转录视觉保持安静）。
    const [hovered, setHovered] = React.useState(false);
    const hoverProps = onClick !== undefined
        ? { onMouseEnter: () => setHovered(true), onMouseLeave: () => setHovered(false) }
        : {};
    const header = streaming ? (_jsxs(Box, { flexDirection: "row", children: [_jsx(Text, { children: minimalUi ? frameText : chalk.rgb(pulseColor.r, pulseColor.g, pulseColor.b).bold(frameText) }), _jsx(Text, { dimColor: !hovered, color: hovered ? 'text' : undefined, italic: true, children: ` ${label}` })] })) : (_jsx(Text, { italic: true, dimColor: !hovered, color: hovered ? 'text' : undefined, children: `${minimalUi ? '*' : THINKING_SETTLED_MARKER} ${label}` }));
    if (preview) {
        // Live ticker: the model's last few reasoning lines, dimmed, one Text
        // per row so each truncates to the width independently, padded to a
        // constant PREVIEW_ROWS-tall block that follows the stream. The folded
        // summary takes over when the step settles. The LAST row truncates
        // from the start (leading ellipsis) so the newest tokens — which grow
        // at the line's end — stay visible while the line is longer than the
        // width.
        const lines = tickerText.split('\n');
        const visible = lines.slice(-PREVIEW_ROWS);
        const clipped = lines.length > visible.length;
        // Pad with single spaces — an empty-string Text renders with zero
        // height in ink, so '' padding would not hold the row open.
        const rows = Array.from({ length: PREVIEW_ROWS }, (_, i) => visible[i] ?? ' ');
        return (_jsxs(Box, { flexDirection: "column", marginTop: marginTopOnTurn ? 1 : 0, backgroundColor: isSelected ? 'messageActionsBackground' : undefined, onClick: onClick, ...hoverProps, children: [header, _jsx(Box, { flexDirection: "column", paddingLeft: 2, height: PREVIEW_ROWS, flexShrink: 0, overflow: "hidden", children: rows.map((line, i) => (_jsxs(Box, { flexDirection: "row", height: 1, children: [_jsx(Text, { dimColor: true, italic: true, children: '│ ' }), _jsx(Box, { flexDirection: "row", flexGrow: 1, children: _jsx(Text, { dimColor: true, italic: true, wrap: i === rows.length - 1 ? 'truncate-start' : 'truncate', children: i === 0 && clipped ? `…${line}` : line }) })] }, i))) })] }));
    }
    if (!verbose) {
        return (_jsx(Box, { marginTop: marginTopOnTurn ? 1 : 0, backgroundColor: isSelected ? 'messageActionsBackground' : undefined, onClick: onClick, ...hoverProps, children: header }));
    }
    return (_jsxs(Box, { flexDirection: "column", gap: 1, marginTop: marginTopOnTurn ? 1 : 0, width: "100%", backgroundColor: isSelected ? 'messageActionsBackground' : undefined, onClick: onClick, ...hoverProps, children: [header, _jsx(Box, { paddingLeft: 2, children: _jsx(StreamingMarkdown, { dimColor: true, children: thinking }) })] }));
}
/**
 * Count-only thinking: the backend streams an
 * estimated token count but no thinking text. One header line in the same
 * visual language as a text block — the pulsing braille spinner while live,
 * the settled anchor afterwards — with nothing to expand.
 */
function ThinkingTokensHeader({ tokens, streaming, marginTopOnTurn, isSelected, onClick, }) {
    const [frame, setFrame] = React.useState(0);
    React.useEffect(() => {
        if (!streaming)
            return;
        const interval = setInterval(() => setFrame(f => f + 1), THINKING_SPINNER_INTERVAL_MS);
        return () => clearInterval(interval);
    }, [streaming]);
    const minimalUi = isMinimalUiMode();
    const n = formatTokens(tokens);
    const pulse = (Math.sin(frame * 0.9) + 1) / 2;
    const pulseColor = interpolateColor(BRAND, ICE, pulse);
    const frameText = THINKING_SPINNER_FRAMES[frame % THINKING_SPINNER_FRAMES.length];
    return (_jsx(Box, { flexDirection: "row", marginTop: marginTopOnTurn ? 1 : 0, backgroundColor: isSelected ? 'messageActionsBackground' : undefined, onClick: onClick, children: streaming ? (_jsxs(_Fragment, { children: [_jsx(Text, { children: minimalUi ? frameText : chalk.rgb(pulseColor.r, pulseColor.g, pulseColor.b).bold(frameText) }), _jsx(Text, { dimColor: true, italic: true, children: ` ${t('thinking-tokens-live', { n })}` })] })) : (_jsx(Text, { dimColor: true, italic: true, children: `${minimalUi ? '*' : THINKING_SETTLED_MARKER} ${t('thinking-tokens-done', { n })}` })) }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Box, Image, Text, useTerminalImageCellSize, useTerminalImageProtocol, useTerminalImages } from '../ui.js';
import measureElement from '../ink/measure-element.js';
import { useTerminalSize } from '../ink/hooks/use-terminal-size.js';
import { INLINE_MEDIA_MAX, inlineMediaPlaceholder, layoutInlineMedia } from '../math/inline-layout.js';
import { peekMathRaster, renderMathRaster } from '../math/renderer.js';
import { getTheme } from '../theme.js';
import { formatToken } from '../terminal-utils/markdown.js';
import { isMathToken, renderInlineMath } from '../terminal-utils/math.js';
import { useTerminalBackground, useTheme } from './design-system/ThemeProvider.js';
import { themeInkHex } from './MathBlock.js';
import { getMathImageBacking, subscribeMathImageBacking } from '../tuiDisplayPrefs.js';
import { useMathPreviewOpener } from './mathPreview.js';
const WIDTH_PROBE = ' '.repeat(1024);
/** Distinct widths applied before measurement freezes (see Divider). */
const MAX_APPLIED_MEASUREMENTS = 4;
export function InlineMathParagraph({ token, highlight }) {
    const plain = React.useMemo(() => formatToken(token, 0, null, null, highlight).trim(), [token, highlight]);
    const formulas = React.useMemo(() => collectInlineMath(token).slice(0, INLINE_MEDIA_MAX), [token]);
    const graphics = useTerminalImages(formulas.length > 0);
    const protocol = useTerminalImageProtocol();
    const cellSize = useTerminalImageCellSize();
    const [themeName] = useTheme();
    const color = themeInkHex(getTheme(themeName).text);
    const previewMath = useMathPreviewOpener();
    const backdrop = React.useSyncExternalStore(subscribeMathImageBacking, getMathImageBacking);
    const composited = backdrop === 'terminal';
    const terminalBackground = useTerminalBackground();
    const width = useMeasuredWidth();
    const requests = React.useMemo(() => {
        if (!graphics || (protocol !== 'kitty' && protocol !== 'sixel') || cellSize === undefined || color === undefined)
            return undefined;
        if (width.value === undefined || formulas.length === 0)
            return undefined;
        return formulas.map(formula => ({
            tex: formula.text, display: false, color, cellSize, maxColumns: width.value, maxRows: 1,
        }));
    }, [graphics, protocol, cellSize, color, width.value, formulas]);
    const results = useSettledRasters(requests);
    const layout = React.useMemo(() => {
        if (results === undefined || width.value === undefined)
            return undefined;
        const media = [];
        const slot = new Map();
        formulas.forEach((formula, index) => {
            const result = results[index];
            // Failures and formulas that did not fit one row keep their Unicode.
            if (!result.ok || result.raster.rows !== 1)
                return;
            slot.set(formula, inlineMediaPlaceholder(media.length, result.raster.columns));
            media.push({ formula, raster: result.raster });
        });
        if (media.length === 0)
            return undefined;
        const formatted = formatToken(withPlaceholders(token, slot), 0, null, null, highlight).trim();
        const rows = layoutInlineMedia(formatted, width.value, media.map(entry => entry.raster.columns));
        return rows === undefined ? undefined : { rows, media };
    }, [results, width.value, formulas, token, highlight]);
    return (_jsxs(Box, { ref: width.ref, flexDirection: "column", children: [_jsx(Box, { height: 0, overflow: "hidden", children: _jsx(Text, { wrap: "truncate", children: WIDTH_PROBE }) }), layout === undefined
                ? _jsx(Text, { children: plain })
                : layout.rows.map((row, rowIndex) => (_jsx(Box, { flexDirection: "row", height: 1, softWrapContinuation: row.continuation ? (row.gap ? -1 : 1) * layout.rows[rowIndex - 1].width : undefined, children: row.pieces.map((piece, pieceIndex) => {
                        if (piece.kind === 'text') {
                            return (_jsx(Box, { width: piece.width, flexShrink: 0, children: _jsx(Text, { wrap: "truncate", children: piece.text }) }, `t${pieceIndex}`));
                        }
                        const { formula, raster } = layout.media[piece.index];
                        // Keyed by the formula slot, so an unchanged layout keeps the
                        // same image node (placements follow node identity). The
                        // transcript presentation is what lets Sixel paint the one-row
                        // slot at all, and crops instead of dropping it at a viewport
                        // edge — the same contract block formulas use.
                        const formulaRequest = requests?.[piece.index];
                        const painted = (_jsx(Image, { ...(composited ? {} : { transparent: true }), lineArt: true, presentation: "transcript", source: raster.source, width: piece.columns, height: 1, alt: formula.text, copyText: formula.raw, children: _jsx(Text, { dimColor: true, wrap: "truncate", children: renderInlineMath(formula.text) ?? formula.raw }) }));
                        const image = composited
                            ? (_jsx(Box, { width: piece.columns, height: 1, flexShrink: 0, backgroundColor: terminalBackground, children: painted }))
                            : painted;
                        return previewMath === undefined || formulaRequest === undefined
                            ? _jsx(React.Fragment, { children: image }, `m${piece.index}:${raster.key}`)
                            : (_jsx(Box, { onClick: event => { event.stopImmediatePropagation(); previewMath({ tex: formula.text, request: formulaRequest, source: raster.source }); }, children: image }, `m${piece.index}:${raster.key}`));
                    }) }, rowIndex)))] }));
}
/** Inline math tokens of a paragraph, in reading order. */
function collectInlineMath(token) {
    const found = [];
    const walk = (tokens) => {
        for (const child of tokens ?? []) {
            if (isMathToken(child))
                found.push(child);
            else
                walk(child.tokens);
        }
    };
    walk(token.tokens);
    return found;
}
/** A copy of `token` whose listed math tokens format as placeholder runs. */
function withPlaceholders(token, slot) {
    const children = token.tokens;
    if (children === undefined)
        return token;
    return {
        ...token,
        tokens: children.map(child => {
            const placeholder = isMathToken(child) ? slot.get(child) : undefined;
            return placeholder !== undefined
                ? { type: 'escape', raw: child.raw, text: placeholder }
                : withPlaceholders(child, slot);
        }),
    };
}
/**
 * Results for every request once all have settled; a cached set is used on
 * the first render (a paragraph scrolled back into view switches at once).
 */
function useSettledRasters(requests) {
    const key = requests === undefined ? undefined : requests.map(requestKey).join('\u0001');
    const cached = React.useMemo(() => {
        if (requests === undefined)
            return undefined;
        const peeked = requests.map(peekMathRaster);
        return peeked.every(result => result !== undefined) ? peeked : undefined;
        // `key` captures every field of every request.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);
    const [settled, setSettled] = React.useState();
    React.useEffect(() => {
        if (requests === undefined || cached !== undefined || key === undefined)
            return;
        let live = true;
        void Promise.all(requests.map(renderMathRaster)).then(results => {
            if (live)
                setSettled({ key, results });
        });
        return () => { live = false; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [key]);
    if (cached !== undefined)
        return cached;
    return settled !== undefined && settled.key === key ? settled.results : undefined;
}
function requestKey(request) {
    return [request.tex, request.color, request.cellSize.width, request.cellSize.height, request.maxColumns, request.maxRows].join('\u0000');
}
/**
 * The laid-out width of the paragraph box. Its width comes from the parent,
 * not from its content, but the guard from Divider still bounds how many
 * distinct widths are applied per terminal width in case a layout ever
 * feeds back.
 */
function useMeasuredWidth() {
    const { columns } = useTerminalSize();
    const ref = React.useRef(null);
    const [value, setValue] = React.useState();
    const negotiation = React.useRef({ columns, applied: [], frozen: false });
    React.useLayoutEffect(() => {
        const node = ref.current;
        if (node === null)
            return;
        const state = negotiation.current;
        if (state.columns !== columns) {
            state.columns = columns;
            state.applied = [];
            state.frozen = false;
        }
        if (state.frozen)
            return;
        const measured = Math.floor(measureElement(node).width);
        if (measured <= 0 || measured === value)
            return;
        if (state.applied.includes(measured) || state.applied.length >= MAX_APPLIED_MEASUREMENTS) {
            state.frozen = true;
            return;
        }
        state.applied.push(measured);
        setValue(measured);
    });
    return { ref, value };
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Box, Text } from '../ui.js';
import * as JsDiff from 'diff';
import { extname } from 'node:path';
import { stringWidth } from '../ink/stringWidth.js';
import { getCliHighlightPromise } from '../terminal-utils/cliHighlight.js';
import { highlightLines, syntaxThemeSignature } from '../terminal-utils/syntaxRuns.js';
// Backward-compatible re-export: repro scripts import chalkFromToken from
// this module's old home.
export { chalkFromToken } from '../terminal-utils/syntaxTheme.js';
export { parseAnsiRuns, highlightLines } from '../terminal-utils/syntaxRuns.js';
import { getTheme } from '../theme.js';
import { t } from '../i18n.js';
import { useTheme } from './design-system/ThemeProvider.js';
import { revealLinesOf } from './smoothReveal.js';
import { getGraphemeSegmenter } from '../utils/intl.js';
import { primaryComboString } from '../utils/keymap.js';
import { isPatchDiff, parseFilePatch, patchHeader, patchHeaderText } from './diffPatch.js';
/** Replace tabs so width math and alignment hold (pi convention). */
const expandTabs = (text) => text.replaceAll('\t', '   ');
/**
 * Merge syntax runs with word-diff change flags over the same string: both
 * partition it, so an offset sweep yields runs carrying a syntax color AND
 * a changed flag. The render layer lets `changed` override the color.
 */
function mergeRuns(syntax, words) {
    const out = [];
    let si = 0;
    let wi = 0;
    let sOff = 0;
    let wOff = 0;
    while (si < syntax.length && wi < words.length) {
        const s = syntax[si];
        const w = words[wi];
        const sLen = s.text.length - sOff;
        const wLen = w.text.length - wOff;
        const take = Math.min(sLen, wLen);
        if (take > 0) {
            out.push({
                text: w.text.slice(wOff, wOff + take),
                changed: w.changed,
                color: w.changed ? undefined : s.color,
            });
        }
        sOff += take;
        wOff += take;
        if (sOff >= s.text.length) {
            si++;
            sOff = 0;
        }
        if (wOff >= w.text.length) {
            wi++;
            wOff = 0;
        }
    }
    return out;
}
// --- word-level diff --------------------------------------------------------
/** Strip the shared leading whitespace before word-diffing: otherwise the
 *  whole indent reads as one changed blob (pi's renderIntraLineDiff trick). */
function wordSegments(oldLine, newLine) {
    const oldIndent = /^\s*/.exec(oldLine)?.[0] ?? '';
    const newIndent = /^\s*/.exec(newLine)?.[0] ?? '';
    const sharedIndent = oldIndent === newIndent ? oldIndent : '';
    const parts = JsDiff.diffWords(oldLine.slice(sharedIndent.length), newLine.slice(sharedIndent.length));
    const oldSegments = sharedIndent === '' ? [] : [{ text: sharedIndent, changed: false }];
    const newSegments = sharedIndent === '' ? [] : [{ text: sharedIndent, changed: false }];
    for (const part of parts) {
        if (part.added)
            newSegments.push({ text: part.value, changed: true });
        else if (part.removed)
            oldSegments.push({ text: part.value, changed: true });
        else {
            oldSegments.push({ text: part.value, changed: false });
            newSegments.push({ text: part.value, changed: false });
        }
    }
    return { old: oldSegments, new: newSegments };
}
const plainSegments = (line) => [{ text: line, changed: false }];
// --- hunk alignment ---------------------------------------------------------
/**
 * Pair the lines of an unequal removed+added block via a case-insensitive
 * LCS: lines equal modulo case align as change pairs, everything before the
 * first match stays block order. An inserted line above an edited one
 * (`foo,bar` → `insert,FOO,bar`) therefore yields `insert` add-only, then
 * `foo ↔ FOO`, instead of the index-zip misalignment (issue #250, P2-4).
 */
function lcsPairs(oldLines, newLines) {
    const m = oldLines.length;
    const n = newLines.length;
    // dp[i][j] = LCS length of oldLines[i:] and newLines[j:].
    const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
    const eq = (a, b) => a.toLowerCase() === b.toLowerCase();
    for (let i = m - 1; i >= 0; i--) {
        for (let j = n - 1; j >= 0; j--) {
            dp[i][j] = eq(oldLines[i], newLines[j])
                ? dp[i + 1][j + 1] + 1
                : Math.max(dp[i + 1][j], dp[i][j + 1]);
        }
    }
    const pairs = [];
    let i = 0;
    let j = 0;
    while (i < m && j < n) {
        if (eq(oldLines[i], newLines[j])) {
            pairs.push([i, j]);
            i++;
            j++;
        }
        else if (dp[i + 1][j] >= dp[i][j + 1]) {
            i++;
        }
        else {
            j++;
        }
    }
    return pairs;
}
/** Align one file's hunks into rows (plain text + word flags; styling is a
 *  render-time concern over the visible slice). */
function alignFileDiff(fileIndex, oldText, newText) {
    const rows = [];
    const parts = JsDiff.diffLines(expandTabs(oldText ?? ''), expandTabs(newText));
    let oldIndex = 0;
    let newIndex = 0;
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const lines = part.value.replace(/\n$/, '').split('\n');
        if (!part.added && !part.removed) {
            for (const line of lines) {
                rows.push({
                    kind: 'context',
                    fileIndex,
                    oldIndex: oldIndex++,
                    newIndex: newIndex++,
                    oldWords: plainSegments(line),
                    newWords: plainSegments(line),
                });
            }
            continue;
        }
        if (part.removed) {
            const addedPart = parts[i + 1]?.added === true ? parts[i + 1] : undefined;
            const addedLines = addedPart === undefined ? [] : addedPart.value.replace(/\n$/, '').split('\n');
            // Same-length replacement blocks zip index-for-index (the common
            // edit case); unequal blocks pair through the ci-LCS so an inserted
            // line cannot shift the alignment (issue #250, P2-4).
            const pairs = lines.length === addedLines.length
                ? lines.map((_, index) => [index, index])
                : lcsPairs(lines, addedLines);
            // Block order: walk both lists; unpaired entries emit in place, pairs
            // emit at the later of the two positions.
            const events = [];
            let oi = 0;
            let ai = 0;
            for (const [o, a] of pairs) {
                while (oi < o)
                    events.push({ kind: 'del', o: oi++ });
                while (ai < a)
                    events.push({ kind: 'add', a: ai++ });
                events.push({ kind: 'change', o: oi++, a: ai++ });
            }
            while (oi < lines.length)
                events.push({ kind: 'del', o: oi++ });
            while (ai < addedLines.length)
                events.push({ kind: 'add', a: ai++ });
            for (const event of events) {
                if (event.kind === 'change') {
                    const segments = wordSegments(lines[event.o], addedLines[event.a]);
                    rows.push({
                        kind: 'change',
                        fileIndex,
                        oldIndex: oldIndex++,
                        newIndex: newIndex++,
                        oldWords: segments.old,
                        newWords: segments.new,
                    });
                }
                else if (event.kind === 'del') {
                    rows.push({ kind: 'del', fileIndex, oldIndex: oldIndex++, oldWords: plainSegments(lines[event.o]) });
                }
                else {
                    rows.push({ kind: 'add', fileIndex, newIndex: newIndex++, newWords: plainSegments(addedLines[event.a]) });
                }
            }
            if (addedPart !== undefined)
                i++;
            continue;
        }
        for (const line of lines) {
            rows.push({ kind: 'add', fileIndex, newIndex: newIndex++, newWords: plainSegments(line) });
        }
    }
    return rows;
}
/** A patch file's hunks aligned into rows (the same pairing rules as
 *  {@link alignFileDiff}, applied per removed+added block of each hunk),
 *  plus the old / new side texts the rows index (syntax highlighting reads
 *  them like a whole file's texts). A patch with no readable hunk aligns
 *  its raw lines by their marker, unnumbered. */
function alignPatchFile(fileIndex, parsed) {
    const rows = [];
    const oldSide = [];
    const newSide = [];
    const hunks = parsed.raw === undefined
        ? parsed.hunks.map(hunk => hunk.lines)
        : [parsed.raw.map((line) => line.startsWith('-') ? { kind: 'del', text: line.slice(1) } : line.startsWith('+') ? { kind: 'add', text: line.slice(1) } : { kind: 'context', text: line })];
    hunks.forEach((lines, hunkIndex) => {
        if (hunkIndex > 0)
            rows.push({ separator: '⋯' });
        let at = 0;
        while (at < lines.length) {
            const line = lines[at];
            if (line.kind === 'context') {
                const text = expandTabs(line.text);
                rows.push({
                    kind: 'context',
                    fileIndex,
                    oldIndex: oldSide.push(text) - 1,
                    newIndex: newSide.push(text) - 1,
                    oldWords: plainSegments(text),
                    newWords: plainSegments(text),
                    ...(line.oldNo === undefined ? {} : { oldNo: line.oldNo }),
                    ...(line.newNo === undefined ? {} : { newNo: line.newNo }),
                });
                at += 1;
                continue;
            }
            const removed = [];
            while (at < lines.length && lines[at].kind === 'del')
                removed.push(lines[at++]);
            const added = [];
            while (at < lines.length && lines[at].kind === 'add')
                added.push(lines[at++]);
            const oldTexts = removed.map(item => expandTabs(item.text));
            const newTexts = added.map(item => expandTabs(item.text));
            const pairs = oldTexts.length === newTexts.length
                ? oldTexts.map((_, index) => [index, index])
                : lcsPairs(oldTexts, newTexts);
            const events = [];
            let oi = 0;
            let ai = 0;
            for (const [o, a] of pairs) {
                while (oi < o)
                    events.push({ kind: 'del', o: oi++ });
                while (ai < a)
                    events.push({ kind: 'add', a: ai++ });
                events.push({ kind: 'change', o: oi++, a: ai++ });
            }
            while (oi < oldTexts.length)
                events.push({ kind: 'del', o: oi++ });
            while (ai < newTexts.length)
                events.push({ kind: 'add', a: ai++ });
            for (const event of events) {
                const oldNo = event.o === undefined ? undefined : removed[event.o].oldNo;
                const newNo = event.a === undefined ? undefined : added[event.a].newNo;
                const numbers = { ...(oldNo === undefined ? {} : { oldNo }), ...(newNo === undefined ? {} : { newNo }) };
                if (event.kind === 'change') {
                    const segments = wordSegments(oldTexts[event.o], newTexts[event.a]);
                    rows.push({ kind: 'change', fileIndex, oldIndex: oldSide.push(oldTexts[event.o]) - 1, newIndex: newSide.push(newTexts[event.a]) - 1, oldWords: segments.old, newWords: segments.new, ...numbers });
                }
                else if (event.kind === 'del') {
                    rows.push({ kind: 'del', fileIndex, oldIndex: oldSide.push(oldTexts[event.o]) - 1, oldWords: plainSegments(oldTexts[event.o]), ...numbers });
                }
                else {
                    rows.push({ kind: 'add', fileIndex, newIndex: newSide.push(newTexts[event.a]) - 1, newWords: plainSegments(newTexts[event.a]), ...numbers });
                }
            }
        }
    });
    return { rows, oldSide, newSide };
}
// --- visual rows ------------------------------------------------------------
/** Expanded bodies walk a bounded VISUAL-row window — the two-pane twin of the
 *  unified body's 400-line window. It bounds PAINTED rows, not the work: every
 *  shown line is still wrapped on each frame (O(body) per render). The row
 *  that crosses the window edge is cut there, so the painted body never
 *  exceeds the window; the rows above that edge are painted whole. */
const VERBOSE_VISUAL_ROW_WINDOW = 400;
/** Flatten styled runs into styled graphemes, segmenting the JOINED line.
 *
 *  Cutting a run by code unit would split a surrogate pair or a combining
 *  sequence, so the wrap walks graphemes instead. Segmenting each run on its
 *  own is not enough either: the word diff tokenizes non-Latin text per code
 *  point (jsdiff's `extendedWordChars` only covers Latin-1 / Latin Extended),
 *  so a changed family emoji or an edited combining mark leaves runs that end
 *  inside one grapheme cluster — the ZWJ or the accent lands in the next run.
 *  Segmenting the flattened text reunites the cluster; each grapheme keeps the
 *  style of the run its first code unit came from. */
function graphemes(segments) {
    if (segments.length === 0)
        return [];
    const text = segments.map(segment => segment.text).join('');
    // One style slot per UTF-16 code unit: Intl.Segmenter reports code-unit
    // indices, so this maps a cluster back to the run it starts in.
    const styles = new Array(text.length);
    let at = 0;
    for (const segment of segments) {
        for (let index = 0; index < segment.text.length; index++)
            styles[at + index] = segment;
        at += segment.text.length;
    }
    const out = [];
    for (const { segment, index } of getGraphemeSegmenter().segment(text)) {
        const style = styles[index];
        out.push({ text: segment, changed: style.changed, color: style.color });
    }
    return out;
}
/** Join graphemes back into runs, merging neighbours that share a style so a
 *  wrapped row paints the same runs it would have painted unwrapped. */
function toSegments(line) {
    const out = [];
    for (const grapheme of line) {
        const last = out[out.length - 1];
        if (last !== undefined && last.changed === grapheme.changed && last.color === grapheme.color) {
            out[out.length - 1] = { text: last.text + grapheme.text, changed: last.changed, color: last.color };
        }
        else {
            out.push({ text: grapheme.text, changed: grapheme.changed, color: grapheme.color });
        }
    }
    return out;
}
/**
 * Split one logical line into visual rows no wider than `budget` display
 * cells. A row prefers to end at the last space that fits, so prose breaks
 * between words and only an unbroken run (a URL, a minified line) is cut
 * mid-word. The space a break lands on stays at the end of the row it closes,
 * so joining the rows reproduces the input exactly.
 *
 * Empty source text still occupies one row; only a missing side has no rows.
 */
function wrapSegments(segments, budget) {
    const all = graphemes(segments);
    const rows = [];
    let start = 0;
    while (start < all.length) {
        let width = 0;
        let end = start;
        /** Exclusive index just past the last space that fits on this row. */
        let breakAt = -1;
        while (end < all.length) {
            const grapheme = all[end];
            const graphemeWidth = stringWidth(grapheme.text);
            // A single grapheme wider than the whole budget still has to land
            // somewhere: it keeps a row of its own instead of disappearing.
            if (width + graphemeWidth > budget && end > start)
                break;
            width += graphemeWidth;
            end += 1;
            if (/^\s+$/u.test(grapheme.text) && end < all.length)
                breakAt = end;
        }
        if (end < all.length && breakAt > start)
            end = breakAt;
        rows.push(toSegments(all.slice(start, end)));
        start = end;
    }
    return rows.length > 0 ? rows : [[]];
}
/** How many graphemes of a pane line the renderer's `truncate` drops. It cuts
 *  only a line WIDER than the columns it is handed (`src/ink/wrap-text.ts`
 *  returns the text untouched when it fits); once it does cut, it spends one
 *  of those columns on `…` and keeps `budget - 1` cells of text. That "-1" is
 *  the renderer's, not this file's — so a line that fits its budget whole
 *  loses nothing. */
function clippedGraphemes(segments, budget) {
    if (segments === undefined)
        return 0;
    const all = graphemes(segments);
    const widths = all.map(grapheme => stringWidth(grapheme.text));
    if (widths.reduce((total, width) => total + width, 0) <= budget)
        return 0;
    const fits = budget - 1;
    let width = 0;
    let visible = 0;
    while (visible < all.length) {
        const next = width + widths[visible];
        if (next > fits)
            break;
        width = next;
        visible += 1;
    }
    return all.length - visible;
}
// --- rendering --------------------------------------------------------------
/** Gutter text of one painted row: the status marker alone, or a right-aligned
 *  real line number plus the marker (patch diffs). The new pane keeps the
 *  leading cell the old pane spends on nothing, so the two text columns start
 *  the same distance from their divider; the one-cell gap between gutter and
 *  text is the caller's. */
function gutterText(kind, tone, lineNo, hasContent, lineNoWidth) {
    // Status gutter instead of line numbers: ToolFileDiff has no file
    // offsets, and an invented number misleads (issue #250, P2-3).
    const marker = kind === 'context' ? ' ' : tone === 'old' ? '−' : '+';
    const numbered = lineNoWidth > 0
        ? `${(lineNo === undefined || !hasContent ? '' : String(lineNo)).padStart(lineNoWidth)} ${marker}`
        : marker;
    return tone === 'new' ? ` ${numbered}` : numbered;
}
/** One pane of one terminal row. `prefix` is the gutter already padded to its
 *  final width — a continuation row of a wrapped line repeats that width in
 *  spaces so its text lines up with the row above. `segments` is undefined
 *  when this pane has nothing to paint here (blank side, or a shorter wrap). */
function PaneLine({ segments, prefix, kind, width, tone, toolBackground, paneId, padding, continuation, }) {
    const ordinaryBackground = toolBackground === 'subtle'
        ? 'toolCardBackgroundDim'
        : toolBackground === 'strong'
            ? 'toolCardBackground'
            : undefined;
    // Additions/removals keep their semantic tint; unchanged and empty panes
    // inherit the configured ordinary tool-card surface.
    const backgroundColor = kind === 'context'
        ? ordinaryBackground
        : tone === 'old'
            ? 'diffRemovedDimmed'
            : 'diffAddedDimmed';
    const wordColor = tone === 'old' ? 'diffRemovedWord' : 'diffAddedWord';
    return (_jsxs(Box, { width: width, flexShrink: 0, backgroundColor: backgroundColor, selectionPane: paneId, noSelect: padding, softWrapContinuation: continuation, children: [_jsx(Box, { noSelect: true, children: _jsx(Text, { dimColor: true, backgroundColor: backgroundColor, children: prefix }) }), segments === undefined ? (_jsx(Text, { backgroundColor: backgroundColor, children: " " })) : (_jsx(Text, { wrap: "truncate", backgroundColor: backgroundColor, children: segments.map((segment, index) => segment.changed ? (_jsx(Text, { color: wordColor, bold: true, backgroundColor: backgroundColor, children: segment.text }, index)) : (_jsx(Text, { color: segment.color, backgroundColor: backgroundColor, children: segment.text }, index))) }))] }));
}
export function SplitDiffView({ diffs, width, maxRows, verbose, toolBackground = 'none', reveal, }) {
    const paneId = React.useId();
    const [hl, setHl] = React.useState(null);
    React.useEffect(() => {
        let mounted = true;
        void getCliHighlightPromise().then(loaded => {
            if (mounted)
                setHl(loaded);
        });
        return () => { mounted = false; };
    }, []);
    const [themeName] = useTheme();
    // Resolved-palette signature: covers dark→light, light→dark, AND the
    // `auto` base flip where the name never changes (issue #250, P1-2).
    // 按当次渲染的色板身份读，**不按名字 memo**：名字不变而色板换掉（auto 翻转、
    // 运行时同名重注册）时，按名字缓存会让签名一直算出旧值。
    const syntaxTheme = getTheme(themeName);
    const themeSig = React.useMemo(() => syntaxThemeSignature(syntaxTheme), [syntaxTheme]);
    // Alignment is text-only and capped BEFORE styling: the highlighter and
    // word-diff work lands only on the visible slice (issue #250, P2-8).
    const rows = [];
    /** Patch files: their side texts (syntax lookup) and number gutter width. */
    const patchFiles = new Map();
    let prevPath;
    diffs.forEach((diff, fileIndex) => {
        if (isPatchDiff(diff)) {
            const parsed = parseFilePatch(diff);
            rows.push({ separator: patchHeaderText(patchHeader(diff, parsed, diffs.length > 1)) });
            const aligned = alignPatchFile(fileIndex, parsed);
            rows.push(...aligned.rows);
            patchFiles.set(fileIndex, {
                old: aligned.oldSide.join('\n'),
                next: aligned.newSide.join('\n'),
                lineNoWidth: parsed.raw === undefined ? String(parsed.maxLineNo).length : 0,
            });
            prevPath = diff.path;
            return;
        }
        if (diffs.length > 1) {
            if (diff.path !== prevPath)
                rows.push({ separator: diff.path });
            else
                rows.push({ separator: '⋯' });
        }
        prevPath = diff.path;
        rows.push(...alignFileDiff(fileIndex, diff.oldText, diff.newText));
    });
    // Determine each file's sides from its complete alignment, before folding
    // or smooth reveal can hide the opposite side and make the layout jump.
    const oldFiles = new Set();
    const newFiles = new Set();
    for (const row of rows) {
        if ('separator' in row)
            continue;
        if (row.oldIndex !== undefined)
            oldFiles.add(row.fileIndex);
        if (row.newIndex !== undefined)
            newFiles.add(row.fileIndex);
    }
    const totalRows = rows.length;
    const capped = verbose || totalRows <= maxRows || totalRows - maxRows === 1;
    const visible = capped ? rows : rows.slice(0, maxRows);
    const hidden = totalRows - visible.length;
    // Smooth reveal reads happen during render (the owning card subscribes to
    // the scheduler's version, so its re-render drives this view too).
    const revealedRows = reveal !== undefined
        ? revealLinesOf(reveal.key, visible.length, { enabled: true, active: true })
        : visible.length;
    const shown = revealedRows >= visible.length ? visible : visible.slice(0, revealedRows);
    const paneWidth = Math.max(20, Math.floor((width - 1) / 2));
    const blockWidth = Math.max(width, paneWidth * 2 + 1);
    // Whole-hunk highlight per file (multi-line lexer state preserved);
    // only the visible rows merge syntax runs with word flags below.
    const fileSyntax = diffs.map((diff, fileIndex) => {
        const language = extname(isPatchDiff(diff) ? diff.movePath ?? diff.path : diff.path).replace(/^\./, '') || undefined;
        const patch = patchFiles.get(fileIndex);
        if (patch !== undefined) {
            // Side texts are already tab-expanded (alignPatchFile).
            return {
                old: highlightLines(patch.old, language, hl, syntaxTheme, themeSig),
                next: highlightLines(patch.next, language, hl, syntaxTheme, themeSig),
            };
        }
        if (isPatchDiff(diff))
            return { old: undefined, next: undefined };
        return {
            old: highlightLines(expandTabs(diff.oldText ?? ''), language, hl, syntaxTheme, themeSig),
            next: highlightLines(expandTabs(diff.newText), language, hl, syntaxTheme, themeSig),
        };
    });
    // Resolve the shown rows into paint plans. Collapsed paints one terminal row
    // per logical row (#245's height contract); expanded pre-wraps each pane and
    // both panes paint the taller column's row count.
    const windowLimit = verbose ? VERBOSE_VISUAL_ROW_WINDOW : Number.POSITIVE_INFINITY;
    const paint = [];
    /** Collapsed: graphemes the renderer clipped on the painted rows of both
     *  panes (0 = nothing was clipped, so no hint). */
    let clippedChars = 0;
    let paintedRows = 0;
    /** Visual rows the whole shown body needs — what the window reports. */
    let totalVisualRows = 0;
    for (const row of shown) {
        if ('separator' in row) {
            totalVisualRows += 1;
            if (paintedRows < windowLimit) {
                paint.push({ separator: row.separator });
                paintedRows += 1;
            }
            continue;
        }
        const syntax = fileSyntax[row.fileIndex];
        const oldRuns = row.oldIndex !== undefined ? syntax?.old?.[row.oldIndex] : undefined;
        const newRuns = row.newIndex !== undefined ? syntax?.next?.[row.newIndex] : undefined;
        const oldSegments = row.oldWords === undefined
            ? undefined
            : oldRuns !== undefined ? mergeRuns(oldRuns, row.oldWords) : row.oldWords;
        const newSegments = row.newWords === undefined
            ? undefined
            : newRuns !== undefined ? mergeRuns(newRuns, row.newWords) : row.newWords;
        const lineNoWidth = patchFiles.get(row.fileIndex)?.lineNoWidth ?? 0;
        // An add row leaves the old pane blank and vice versa, so the blank side
        // paints the "context" tone there — and, being empty, no line number.
        const leftKind = row.kind === 'add' ? 'context' : row.kind;
        const rightKind = row.kind === 'del' ? 'context' : row.kind;
        const leftPrefix = `${gutterText(leftKind, 'old', row.oldNo, oldSegments !== undefined, lineNoWidth)} `;
        const rightPrefix = `${gutterText(rightKind, 'new', row.newNo, newSegments !== undefined, lineNoWidth)} `;
        const singleSide = oldFiles.has(row.fileIndex) === newFiles.has(row.fileIndex)
            ? undefined : oldFiles.has(row.fileIndex) ? 'old' : 'new';
        const rowPaneWidth = singleSide === undefined ? paneWidth : blockWidth;
        const leftBudget = rowPaneWidth - stringWidth(leftPrefix);
        const rightBudget = rowPaneWidth - stringWidth(rightPrefix);
        if (!verbose) {
            clippedChars += clippedGraphemes(oldSegments, leftBudget);
            clippedChars += clippedGraphemes(newSegments, rightBudget);
        }
        const leftRows = oldSegments === undefined
            ? []
            : verbose ? wrapSegments(oldSegments, leftBudget) : [oldSegments];
        const rightRows = newSegments === undefined
            ? []
            : verbose ? wrapSegments(newSegments, rightBudget) : [newSegments];
        // Neither pane can run ahead: the next logical row starts below the
        // taller column. A row with no content on either side still paints one.
        const height = Math.max(leftRows.length, rightRows.length, 1);
        totalVisualRows += height;
        if (paintedRows < windowLimit) {
            // One logical line has no height bound of its own (a single 40k-cell
            // line wraps into ~740 rows), so the row that crosses the window edge is
            // cut to the rows left in it. Only that last row is ever cut; leaving
            // paintedRows short of totalVisualRows is what shows the window notice.
            const take = Math.min(height, windowLimit - paintedRows);
            paint.push({
                singleSide,
                paneWidth: rowPaneWidth,
                leftPrefix,
                rightPrefix,
                leftRows: take < height ? leftRows.slice(0, take) : leftRows,
                rightRows: take < height ? rightRows.slice(0, take) : rightRows,
                leftKind,
                rightKind,
                height: take,
            });
            paintedRows += take;
        }
    }
    return (_jsxs(Box, { flexDirection: "column", width: blockWidth, children: [paint.map((plan, index) => {
                if ('separator' in plan) {
                    return (_jsx(Box, { width: blockWidth, children: _jsx(Text, { dimColor: true, wrap: "truncate", children: plan.separator === '⋯' ? '⋯' : `  ${plan.separator}` }) }, index));
                }
                const leftPad = ' '.repeat(stringWidth(plan.leftPrefix));
                const rightPad = ' '.repeat(stringWidth(plan.rightPrefix));
                return Array.from({ length: plan.height }, (_, visual) => (_jsxs(Box, { flexDirection: "row", children: [plan.singleSide !== 'new' && _jsx(PaneLine, { padding: plan.leftRows[visual] === undefined, paneId: paneId + '-old', continuation: visual > 0 && plan.leftRows[visual] !== undefined ? stringWidth(plan.leftPrefix) + stringWidth(plan.leftRows[visual - 1].map(s => s.text).join('')) : undefined, segments: plan.leftRows[visual], prefix: visual === 0 ? plan.leftPrefix : leftPad, kind: plan.leftKind, tone: "old", width: plan.paneWidth, toolBackground: toolBackground }), plan.singleSide === undefined && _jsx(Box, { width: 1, flexShrink: 0, noSelect: true, children: _jsx(Text, { dimColor: true, children: "\u2502" }) }), plan.singleSide !== 'old' && _jsx(PaneLine, { padding: plan.rightRows[visual] === undefined, paneId: paneId + '-new', continuation: visual > 0 && plan.rightRows[visual] !== undefined ? stringWidth(plan.rightPrefix) + stringWidth(plan.rightRows[visual - 1].map(s => s.text).join('')) : undefined, segments: plan.rightRows[visual], prefix: visual === 0 ? plan.rightPrefix : rightPad, kind: plan.rightKind, tone: "new", width: plan.paneWidth, toolBackground: toolBackground })] }, `${index}-${visual}`)));
            }), hidden > 0 && (_jsx(Text, { dimColor: true, children: t('lines-folded-expand', { n: hidden, key: primaryComboString('transcript') }) })), clippedChars > 0 && (_jsx(Text, { dimColor: true, children: t('tool-card-lines-hidden', { parts: t('tool-card-chars-unit', { n: clippedChars }), key: primaryComboString('transcript') }) })), paintedRows < totalVisualRows && (_jsx(Text, { dimColor: true, children: t('tool-card-window-shown-wrapped', { shown: paintedRows, total: totalVisualRows }) }))] }));
}

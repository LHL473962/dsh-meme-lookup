import { jsx as _jsx } from "react/jsx-runtime";
import wrapAnsi from 'wrap-ansi';
import { useTerminalSize } from '../ink/hooks/use-terminal-size.js';
import Text from './design-system/ThemedText.js';
import { stringWidth } from '../ink/stringWidth.js';
import { wrapTextLines } from '../ink/wrap-text.js';
import stripAnsi from 'strip-ansi';
import { truncateToWidth } from '../ink/truncateToWidth.js';
import { formatToken, padAligned } from '../terminal-utils/markdown.js';
const SAFETY_MARGIN = 4;
const MIN_COLUMN_WIDTH = 3;
const MAX_ROW_LINES = 4;
function wrapText(text, width, hard) {
    if (width <= 0)
        return [''];
    const wrapped = wrapTextLines(text.trimEnd(), width, line => wrapAnsi(line, width, {
        hard,
        trim: false,
        wordWrap: true,
    }));
    const lines = wrapped.filter(line => line.text.length > 0 || line.gap).map(line => line.text);
    return lines.length > 0 ? lines : [''];
}
function lineWidth(text) {
    return Math.max(...text.split(/\r?\n/).map(stringWidth), 0);
}
function makeCell(tokens, highlight) {
    const formatted = tokens?.map(token => formatToken(token, 0, null, null, highlight)).join('') ?? '';
    const plain = stripAnsi(formatted);
    const words = plain.split(/\s+/).filter(Boolean);
    const minWidth = Math.max(MIN_COLUMN_WIDTH, ...words.map(word => stringWidth(word)));
    return {
        formatted,
        plain,
        minWidth,
        idealWidth: Math.max(MIN_COLUMN_WIDTH, lineWidth(plain)),
    };
}
function allocateWidths(minWidths, idealWidths, budget) {
    const minTotal = minWidths.reduce((sum, width) => sum + width, 0);
    const idealTotal = idealWidths.reduce((sum, width) => sum + width, 0);
    if (idealTotal <= budget)
        return { widths: idealWidths, hardWrap: false };
    if (minTotal > budget)
        return { widths: minWidths, hardWrap: true };
    const widths = [...minWidths];
    let remaining = budget - minTotal;
    const room = idealWidths.map((ideal, index) => Math.max(0, ideal - minWidths[index]));
    while (remaining > 0) {
        let selected = -1;
        for (let index = 0; index < room.length; index++) {
            if (room[index] > 0 && (selected < 0 || room[index] > room[selected]))
                selected = index;
        }
        if (selected < 0)
            break;
        widths[selected]++;
        room[selected]--;
        remaining--;
    }
    return { widths, hardWrap: false };
}
function renderBorder(widths, type) {
    const [left, fill, join, right] = {
        top: ['┌', '─', '┬', '┐'],
        middle: ['├', '─', '┼', '┤'],
        bottom: ['└', '─', '┴', '┘'],
    }[type];
    return left + widths.map(width => fill.repeat(width + 2)).join(join) + right;
}
function renderRow(cells, widths, alignments, isHeader) {
    const maxLines = Math.max(...cells.map(cell => cell.lines.length), 1);
    const offsets = cells.map(cell => Math.floor((maxLines - cell.lines.length) / 2));
    const output = [];
    for (let lineIndex = 0; lineIndex < maxLines; lineIndex++) {
        let line = '│';
        cells.forEach((cell, columnIndex) => {
            const contentIndex = lineIndex - offsets[columnIndex];
            const content = contentIndex >= 0 && contentIndex < cell.lines.length
                ? cell.lines[contentIndex]
                : '';
            const visibleWidth = stringWidth(stripAnsi(content));
            const align = isHeader ? 'center' : alignments[columnIndex];
            const aligned = padAligned(content, visibleWidth, widths[columnIndex], align);
            line += ` ${isHeader ? `\x1b[1m${aligned}\x1b[22m` : aligned} │`;
        });
        output.push(line);
    }
    return output;
}
function collapseWhitespace(text) {
    return text.trimEnd().replace(/\n+/g, ' ').replace(/\s+/g, ' ').trim();
}
function renderVertical(rows, headers, terminalWidth) {
    const separator = '─'.repeat(Math.max(0, Math.min(terminalWidth - 1, 40)));
    const output = [];
    rows.forEach((row, rowIndex) => {
        if (rowIndex > 0)
            output.push(separator);
        row.forEach((cell, columnIndex) => {
            const rawLabel = headers[columnIndex]?.plain || `Column ${columnIndex + 1}`;
            const label = truncateToWidth(rawLabel, Math.max(1, terminalWidth - 3));
            const firstWidth = Math.max(1, terminalWidth - stringWidth(label) - 3);
            const value = collapseWhitespace(cell.formatted);
            const firstPass = wrapText(value, firstWidth, true);
            const firstLine = firstPass[0] ?? '';
            // Keep each wrapped segment intact: joining them with spaces changes
            // paths, hashes and other words that were split by hard wrapping.
            const continuation = firstPass.slice(1);
            output.push(`\x1b[1m${label}:\x1b[22m ${firstLine}`);
            continuation.forEach(line => output.push(`  ${line}`));
        });
    });
    return output.join('\n');
}
/** Render a markdown table with ANSI-aware cells and a narrow-terminal fallback. */
export function MarkdownTable({ token, highlight, forceWidth }) {
    const { columns: actualWidth } = useTerminalSize();
    const terminalWidth = Math.max(0, forceWidth ?? actualWidth);
    const columnCount = Math.max(token.header.length, ...token.rows.map(row => row.length), 0);
    if (columnCount === 0)
        return _jsx(Text, { children: '' });
    const emptyCell = () => makeCell(undefined, highlight);
    const headerCells = Array.from({ length: columnCount }, (_, index) => index < token.header.length ? makeCell(token.header[index].tokens, highlight) : emptyCell());
    const rowCells = token.rows.map(row => Array.from({ length: columnCount }, (_, index) => row[index] ? makeCell(row[index].tokens, highlight) : emptyCell()));
    const allColumns = [headerCells, ...rowCells];
    const minWidths = Array.from({ length: columnCount }, (_, index) => Math.max(...allColumns.map(row => row[index].minWidth)));
    const idealWidths = Array.from({ length: columnCount }, (_, index) => Math.max(...allColumns.map(row => row[index].idealWidth)));
    const borderOverhead = 1 + columnCount * 3;
    const budget = Math.max(0, terminalWidth - borderOverhead - SAFETY_MARGIN);
    const allocation = allocateWidths(minWidths, idealWidths, budget);
    const wrap = (cell, width) => ({
        ...cell,
        lines: wrapText(cell.formatted, width, allocation.hardWrap),
    });
    const wrappedHeader = headerCells.map((cell, index) => wrap(cell, allocation.widths[index]));
    const wrappedRows = rowCells.map(row => row.map((cell, index) => wrap(cell, allocation.widths[index])));
    const maxRowLines = Math.max(...wrappedHeader.map(cell => cell.lines.length), ...wrappedRows.flat().map(cell => cell.lines.length), 1);
    if (maxRowLines > MAX_ROW_LINES) {
        return _jsx(Text, { children: renderVertical(rowCells, headerCells, terminalWidth) });
    }
    const tableLines = [renderBorder(allocation.widths, 'top')];
    tableLines.push(...renderRow(wrappedHeader, allocation.widths, token.align, true));
    tableLines.push(renderBorder(allocation.widths, 'middle'));
    wrappedRows.forEach((row, rowIndex) => {
        tableLines.push(...renderRow(row, allocation.widths, token.align, false));
        if (rowIndex < wrappedRows.length - 1)
            tableLines.push(renderBorder(allocation.widths, 'middle'));
    });
    tableLines.push(renderBorder(allocation.widths, 'bottom'));
    const maxLineWidth = Math.max(...tableLines.map(line => stringWidth(stripAnsi(line))));
    if (maxLineWidth > terminalWidth - SAFETY_MARGIN) {
        return _jsx(Text, { children: renderVertical(rowCells, headerCells, terminalWidth) });
    }
    return _jsx(Text, { children: tableLines.join('\n') });
}

import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { Box, Text } from '../ui.js';
import { stringWidth } from '../ink/stringWidth.js';
import { truncateToWidth } from '../ink/truncateToWidth.js';
import { t } from '../i18n.js';
import { POINTER } from '../terminal-utils/figures.js';
import { SuggestionCard, cardContentWidth, splitQueryMatch } from './SuggestionCard.js';
import { useTooltip } from './Tooltip.js';
/**
 * The `@` file-completion overlay, wrapped in the
 * shared rounded `SuggestionCard` (与 `/` 命令菜单同一视觉语言):
 *
 *   ╭─ 文件 · 共 12 项 ──────────────────────╮
 *   │ ❯ ▸ src/components/     directory     │
 *   │   + README.md           file          │
 *   ╰─────────────────────────────────────────╯
 *
 * Full relative path (directory suffix stripped) + a `file`/`directory`
 * description; the selected row renders `❯` + bold in the theme's
 * `suggestion` color, others dim with the query-matched prefix of the name
 * highlighted (non-dim). The name column is padded to a fixed display width
 * so the description column keeps its contract at narrow terminals (pinned
 * by verify-cjk-truncate.tsx); every pad/truncate uses display width, so CJK
 * names never split a glyph.
 */
const NAME_COLUMN = 20;
/** Display name: directories show without the trailing slash. */
function nameOf(file) {
    return file.kind === 'directory' && file.path.endsWith('/') ? file.path.slice(0, -1) : file.path;
}
/**
 * One candidate row: fixed-width name column + kind description. When the
 * name runs past the row's text budget (`wrap="truncate"` cuts the tail),
 * hovering pops the full path plus its kind — the 20-cell name column and
 * the trailing description can both hide on a narrow terminal, and the
 * path is exactly the piece that decides which candidate to pick.
 */
function FileSuggestionRow({ file, isSelected, query, usable, descriptionWidth }) {
    const name = nameOf(file);
    const icon = file.kind === 'directory' ? '▸ ' : '+ ';
    const description = file.kind === 'directory' ? 'directory' : 'file';
    const renderedDescription = stringWidth(description) > descriptionWidth
        ? truncateToWidth(description, Math.max(0, descriptionWidth - 1)) + '…'
        : description;
    // Row prefix = leading space + pointer/gutter + icon = 5 cells. The name
    // is hidden exactly when it runs past the remaining budget; otherwise the
    // full path is already on screen and a float would just repeat it.
    const tooltip = useTooltip(() => 5 + stringWidth(name) > usable
        ? `${file.path}\n${description}`
        : '');
    const padded = name + ' '.repeat(Math.max(1, NAME_COLUMN - stringWidth(name)));
    const parts = splitQueryMatch(name, query);
    const pad = ' '.repeat(Math.max(1, NAME_COLUMN - stringWidth(name)));
    return (_jsx(Box, { ...tooltip, children: _jsxs(Text, { wrap: "truncate", children: [' ', isSelected ? (_jsx(Text, { color: "suggestion", bold: true, children: `${POINTER} ${icon}${padded}` })) : parts ? (_jsxs(_Fragment, { children: [_jsx(Text, { dimColor: true, children: `  ${icon}${parts.before}` }), _jsx(Text, { children: parts.match }), _jsx(Text, { dimColor: true, children: `${parts.after}${pad}` })] })) : (_jsx(Text, { dimColor: true, children: `  ${icon}${padded}` })), _jsx(Text, { color: isSelected ? 'suggestion' : undefined, dimColor: !isSelected, children: renderedDescription })] }) }));
}
export function FileSuggestions({ files, selectedIndex, columns, query = '', accent, onPick, onWheelStep, }) {
    if (files.length === 0)
        return null;
    const usable = cardContentWidth(columns);
    const maxVisible = 6;
    const safeIndex = Math.min(Math.max(0, selectedIndex), files.length - 1);
    const startIndex = Math.max(0, Math.min(safeIndex - Math.floor(maxVisible / 2), Math.max(0, files.length - maxVisible)));
    const visible = files.slice(startIndex, startIndex + maxVisible);
    const above = startIndex;
    const below = files.length - (startIndex + visible.length);
    // 行预算：内容宽 − 前导空格 1 − 指针列 2 − 图标列 2。
    const descriptionWidth = Math.max(0, usable - 25);
    const title = `${t('sugg-files-title')} · ${t('sugg-count', { n: files.length })}`;
    const footer = above > 0 || below > 0
        ? [
            above > 0 ? t('sugg-more-above', { n: above }) : null,
            below > 0 ? t('sugg-more-below', { n: below }) : null,
        ]
            .filter((part) => part !== null)
            .join(' · ')
        : null;
    return (_jsx(SuggestionCard, { title: title, columns: columns, accent: accent, footer: footer, onRowPick: onPick ? index => onPick(startIndex + index) : undefined, onWheelStep: onWheelStep, rows: visible.map(file => (_jsx(FileSuggestionRow, { file: file, isSelected: file.id === files[safeIndex]?.id, query: query, usable: usable, descriptionWidth: descriptionWidth }, file.id))) }));
}

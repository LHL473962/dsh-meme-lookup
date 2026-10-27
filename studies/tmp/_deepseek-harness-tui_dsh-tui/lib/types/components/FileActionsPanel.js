import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { t } from '../i18n.js';
import { Box, Text } from '../ui.js';
import { Pane } from './design-system/Pane.js';
import { Select } from './Select.js';
import { HintLine } from './design-system/HintLine.js';
import { truncateToWidth } from '../ink/truncateToWidth.js';
/**
 * Click-to-act file menu (fullscreen): opened by clicking a file path in
 * the transcript (tool cards, markdown code spans / plain text, file://
 * links). Rows: open the target, reveal it in the file manager, copy its
 * absolute path. The path shown is already resolved to an absolute path by
 * the caller (Chat.tsx resolves against the channel cwd at click time).
 * When the target is a directory, the first row reads "open folder" — the
 * same action (default handler), just honest about what it opens.
 */
export const FILE_ACTION_COUNT = 3;
/** How many terminal cells of the path fit next to the title. */
const PATH_DISPLAY_BUDGET = 48;
export function FileActionsPanel({ path, isDir, focusIndex, onPick, }) {
    const options = React.useMemo(() => [
        { value: 'open', label: t(isDir ? 'file-actions-open-dir' : 'file-actions-open') },
        { value: 'reveal', label: t('file-actions-reveal') },
        { value: 'copy', label: t('file-actions-copy') },
    ], [isDir]);
    return (_jsx(Pane, { color: "permission", children: _jsxs(Box, { flexDirection: "column", children: [_jsxs(Box, { flexDirection: "row", marginBottom: 1, children: [_jsx(Text, { color: "remember", bold: true, children: t('file-actions-title') }), _jsxs(Text, { dimColor: true, wrap: "truncate-end", children: [' ', truncateToWidth(path, PATH_DISPLAY_BUDGET)] })] }), _jsx(Select, { options: options, focusIndex: focusIndex, selectedValue: undefined, visibleOptionCount: FILE_ACTION_COUNT, onPick: onPick ? index => onPick(index) : undefined }), _jsx(Text, { dimColor: true, italic: true, children: _jsx(HintLine, { text: t('hint-confirm-exit') }) })] }) }));
}

import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { t } from '../i18n.js';
import { Box, Text } from '../ui.js';
import { Pane } from './design-system/Pane.js';
import { Select } from './Select.js';
import { HintLine } from './design-system/HintLine.js';
/**
 * `/permission` picker over a backend's native permission modes (the typed
 * `modes` capability). Same visual family as the DSH preset picker
 * (PermissionsPicker): one Pane + Select + hint line, the roster swapped
 * for the backend's own mode list. The list is rendered verbatim —
 * whatever `modes.list()` offers (including a session-start bypass
 * opt-in) is what the user may pick; the TUI adds no filtering of its own.
 */
export function ModePicker({ modes, focusIndex, currentId, onPick, }) {
    return (_jsx(Pane, { color: "permission", children: _jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: "remember", bold: true, children: t('permission-mode-picker-title') }) }), _jsx(Select, { options: modes.map(mode => ({ value: mode.id, label: mode.name, description: mode.description ?? mode.name })), focusIndex: focusIndex, selectedValue: currentId, onPick: onPick ? index => onPick(index) : undefined }), _jsx(Text, { dimColor: true, italic: true, children: _jsx(HintLine, { text: t('hint-confirm-exit') }) })] }) }));
}

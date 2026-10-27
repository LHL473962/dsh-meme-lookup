import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { t } from '../i18n.js';
import { Box, Text } from '../ui.js';
import { Pane } from './design-system/Pane.js';
import { Select } from './Select.js';
import { HintLine } from './design-system/HintLine.js';
/**
 * Bare `/workspace` action menu: the built-in subcommands (resume / rename /
 * open) plus any dynamically registered workspace extensions. Enter runs the
 * focused action through the same paths a hand-typed subcommand takes;
 * actions needing free text (rename/open) fall back to their usage notice.
 */
export function WorkspaceMenuPicker({ options, focusIndex, onPick, }) {
    return (_jsx(Pane, { color: "permission", children: _jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: "remember", bold: true, children: t('workspace-menu-title') }) }), _jsx(Select, { options: options.map(option => ({
                        value: option.id,
                        label: option.label,
                        description: option.description,
                    })), focusIndex: focusIndex, selectedValue: undefined, onPick: onPick === undefined ? undefined : (index) => onPick(index) }), _jsx(Text, { dimColor: true, italic: true, children: _jsx(HintLine, { text: t('hint-confirm-exit') }) })] }) }));
}

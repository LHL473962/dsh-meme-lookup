import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { t } from '../i18n.js';
import { Box, Text } from '../ui.js';
import { Pane } from './design-system/Pane.js';
import { Select } from './Select.js';
import { HintLine } from './design-system/HintLine.js';
/**
 * The `/thinking` display dialog: a permission-colored Pane with a bold
 * title, the Shown/Hidden select, and the Enter/Esc hint line.
 */
export function ThinkingToggle({ currentValue, focusIndex, onPick, }) {
    const options = [
        {
            value: 'true',
            label: t('thinking-enabled'),
            description: t('thinking-enabled-desc'),
        },
        {
            value: 'false',
            label: t('thinking-disabled'),
            description: t('thinking-disabled-desc'),
        },
    ];
    return (_jsxs(Pane, { color: "permission", children: [_jsxs(Box, { flexDirection: "column", children: [_jsxs(Box, { marginBottom: 1, flexDirection: "column", children: [_jsx(Text, { color: "remember", bold: true, children: t('thinking-title') }), _jsx(Text, { dimColor: true, children: t('thinking-subtitle') })] }), _jsx(Box, { flexDirection: "column", marginBottom: 1, children: _jsx(Select, { options: options, focusIndex: focusIndex, selectedValue: currentValue ? 'true' : 'false', visibleOptionCount: 2, onPick: onPick === undefined ? undefined : (index) => onPick(index) }) })] }), _jsx(Text, { dimColor: true, italic: true, children: _jsx(HintLine, { text: t('hint-confirm-exit') }) })] }));
}

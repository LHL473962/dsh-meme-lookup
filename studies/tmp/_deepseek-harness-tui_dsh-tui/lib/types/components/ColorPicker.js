import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { t } from '../i18n.js';
import { Box, Text } from '../ui.js';
import { Pane } from './design-system/Pane.js';
import { Select } from './Select.js';
import { HintLine } from './design-system/HintLine.js';
import { SESSION_COLOR_NAMES, SESSION_COLORS } from '../terminal-utils/sessionColors.js';
/**
 * Session accent color picker (bare `/color`): a permission-colored Pane
 * listing the whole palette with a colored swatch per row, `❯` focus
 * pointer and `✓` on the session's current color. Enter applies through
 * `channel.setSessionColor`, Esc cancels. The palette is static, so the
 * picker never needs an async list.
 */
export function ColorPicker({ focusIndex, currentColor, onPick, }) {
    return (_jsx(Pane, { color: "permission", children: _jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: "remember", bold: true, children: t('picker-title-color') }) }), _jsx(Select, { options: SESSION_COLOR_NAMES.map(name => ({
                        value: name,
                        label: (_jsxs(Text, { children: [_jsx(Text, { color: SESSION_COLORS[name], children: "\u25CF " }), name] })),
                    })), focusIndex: focusIndex, selectedValue: currentColor === '' ? undefined : currentColor, onPick: onPick ? index => onPick(index) : undefined }), _jsx(Text, { dimColor: true, italic: true, children: _jsx(HintLine, { text: t('hint-confirm-exit') }) })] }) }));
}

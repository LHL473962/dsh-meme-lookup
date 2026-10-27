import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { t } from '../i18n.js';
import { Box, Text } from '../ui.js';
import { Pane } from './design-system/Pane.js';
import { Select } from './Select.js';
import { HintLine } from './design-system/HintLine.js';
/**
 * `/plan` on/off picker. The command itself is registered by dsh-plan-mode
 * on the harness side; bare `/plan` opens this picker (with the current
 * state marked) and Enter dispatches `/plan` or `/plan off` through the
 * same external-command path a hand-typed argument takes.
 */
export function PlanPicker({ focusIndex, currentOn, onPick, }) {
    return (_jsx(Pane, { color: "permission", children: _jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: "remember", bold: true, children: t('plan-picker-title') }) }), _jsx(Select, { options: [
                        { value: 'on', label: t('plan-mode-on'), description: t('plan-mode-on-desc') },
                        { value: 'off', label: t('plan-mode-off'), description: t('plan-mode-off-desc') },
                    ], focusIndex: focusIndex, selectedValue: currentOn ? 'on' : 'off', onPick: onPick ? index => onPick(index) : undefined }), _jsx(Text, { dimColor: true, italic: true, children: _jsx(HintLine, { text: t('hint-confirm-exit') }) })] }) }));
}

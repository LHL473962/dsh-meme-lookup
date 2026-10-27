import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { t } from '../i18n.js';
import { PERMISSION_PRESET_AUTO, permissionPresetDescription, permissionPresetLabel } from '../permissionPresetLabels.js';
import { Box, Text } from '../ui.js';
import { Pane } from './design-system/Pane.js';
import { Select } from './Select.js';
import { HintLine } from './design-system/HintLine.js';
/**
 * `/permission` sandbox-preset picker. The command itself is registered by
 * the harness side (dsh-sandbox-policy / dsh-base permission-presets row);
 * bare `/permission` opens this picker and Enter dispatches
 * `/permission <preset>` through the same external-command path a hand-typed
 * argument takes. The roster comes from the adapter snapshot so host plugins
 * can contribute additional preset identities without UI changes.
 *
 * DSH's experimental `auto` preset is tagged EXP, and picking it first shows
 * a session-scoped risk confirmation (`confirming`); Chat owns the keys.
 */
export function PermissionsPicker({ options, focusIndex, currentValue, cwd, confirming = false, onPick, onConfirm, onCancelConfirm, }) {
    if (confirming)
        return _jsx(AutoReviewConfirm, { onConfirm: onConfirm, onCancel: onCancelConfirm });
    return (_jsx(Pane, { color: "permission", children: _jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: "remember", bold: true, children: t('permission-picker-title') }) }), _jsx(Select, { options: options.map(option => ({
                        value: option.value,
                        label: option.value === PERMISSION_PRESET_AUTO
                            ? _jsxs(_Fragment, { children: [permissionPresetLabel(option), " ", _jsx(Text, { color: "warning", children: t('permission-preset-exp-tag') })] })
                            : permissionPresetLabel(option),
                        description: permissionPresetDescription(option),
                    })), focusIndex: focusIndex, selectedValue: currentValue, onPick: onPick ? index => onPick(index) : undefined }), _jsx(Text, { dimColor: true, italic: true, children: _jsx(HintLine, { text: t('hint-confirm-exit') }) }), _jsx(Text, { dimColor: true, children: t('permission-root-hint', { cwd }) })] }) }));
}
const AUTO_CONFIRM_POINTS = [
    'permission-auto-confirm-session',
    'permission-auto-confirm-sandbox',
    'permission-auto-confirm-cost',
    'permission-auto-confirm-risk',
];
function AutoReviewConfirm({ onConfirm, onCancel, }) {
    return (_jsxs(Pane, { color: "permission", children: [_jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: "warning", bold: true, children: t('permission-auto-confirm-title') }) }), AUTO_CONFIRM_POINTS.map(key => (_jsxs(Box, { children: [_jsx(Text, { children: "\u00B7 " }), _jsx(Box, { flexShrink: 1, children: _jsx(Text, { children: t(key) }) })] }, key))), onConfirm !== undefined && onCancel !== undefined && (_jsx(Box, { marginTop: 1, children: _jsx(Select, { options: [
                                { value: 'enable', label: t('permission-auto-confirm-enable') },
                                { value: 'back', label: t('permission-auto-confirm-back') },
                            ], focusIndex: 0, selectedValue: undefined, onPick: index => (index === 0 ? onConfirm() : onCancel()) }) }))] }), _jsx(Text, { dimColor: true, italic: true, children: _jsx(HintLine, { text: t('permission-auto-confirm-actions') }) })] }));
}

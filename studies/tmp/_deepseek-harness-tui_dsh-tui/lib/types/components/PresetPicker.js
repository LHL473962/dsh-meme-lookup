import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { t } from '../i18n.js';
import { Box, Text } from '../ui.js';
import { Pane } from './design-system/Pane.js';
import { Select } from './Select.js';
import { HintLine } from './design-system/HintLine.js';
/**
 * Agent-preset picker (issue #8) using the ActivityPicker layout: a
 * permission-colored Pane listing every roster
 * preset with its display name and description, `❯` focus pointer and `✓`
 * on the preset the current session runs. Enter applies through
 * `channel.switchPreset`, Esc cancels. Broken presets are listed (the
 * roster's discovery contract) but marked with their reason; the roster
 * default is tagged.
 *
 * The header says "内核 Agent 预设 / Kernel agent preset" (not just "Agent
 * preset"): this screen changes the model-facing tool catalog, and must never
 * be confused with the `/settings → 极简界面` (Minimal UI) display switch.
 */
export function PresetPicker({ presets, focusIndex, currentPreset, onPick, }) {
    return (_jsx(Pane, { color: "permission", children: _jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: "remember", bold: true, children: t('preset-picker-title') }) }), _jsx(Select, { options: presets.map(preset => ({
                        value: preset.id,
                        label: (preset.name ?? preset.id) +
                            (preset.isDefault ? t('preset-default-tag') : '') +
                            (preset.broken !== undefined ? t('preset-broken-tag') : ''),
                        description: preset.broken ?? preset.description ?? preset.id,
                    })), focusIndex: focusIndex, selectedValue: currentPreset, onPick: onPick ? index => onPick(index) : undefined }), _jsx(Text, { dimColor: true, italic: true, children: _jsx(HintLine, { text: t('hint-confirm-exit') }) })] }) }));
}

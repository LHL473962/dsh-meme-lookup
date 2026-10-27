import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { LANGS, t } from '../i18n.js';
import { Box, Text } from '../ui.js';
import { Pane } from './design-system/Pane.js';
import { Select } from './Select.js';
import { HintLine } from './design-system/HintLine.js';
/**
 * `/lang` en/zh picker: bare `/lang` opens this picker (the current language
 * marked) and Enter applies the choice through the same path as `/lang <id>`.
 */
export function LangPicker({ focusIndex, currentLang, onPick, }) {
    return (_jsx(Pane, { color: "permission", children: _jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: "remember", bold: true, children: t('lang-picker-title') }) }), _jsx(Select, { options: LANGS.map(lang => ({
                        value: lang,
                        label: lang === 'zh' ? '中文' : 'English',
                        description: t(lang === 'zh' ? 'lang-zh-desc' : 'lang-en-desc'),
                    })), focusIndex: focusIndex, selectedValue: currentLang, onPick: onPick ? index => onPick(index) : undefined }), _jsx(Text, { dimColor: true, italic: true, children: _jsx(HintLine, { text: t('hint-confirm-exit') }) })] }) }));
}

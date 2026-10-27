import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { t } from '../i18n.js';
import { Box, Text } from '../ui.js';
import { Pane } from './design-system/Pane.js';
import { ListItem } from './design-system/ListItem.js';
import { HintLine } from './design-system/HintLine.js';
export function ChannelPicker({ rows, focusIndex, onPick }) {
    return (_jsx(Pane, { color: "permission", children: _jsxs(Box, { flexDirection: "column", children: [_jsx(Box, { marginBottom: 1, children: _jsx(Text, { color: "remember", bold: true, children: t('channel-picker-title') }) }), !rows.some(row => row.kind === 'channel') && (_jsx(Box, { paddingLeft: 2, marginBottom: 1, children: _jsx(Text, { dimColor: true, wrap: "wrap", children: t('channel-empty-hint') }) })), rows.map((row, index) => {
                    const focused = index === focusIndex;
                    if (row.kind === 'channel') {
                        return (_jsx(ListItem, { isFocused: focused, isSelected: row.active, description: row.option.connection === undefined
                                ? t('channel-row-summary', { models: String(row.option.models.length), tiers: String(row.option.tiers.length) })
                                : t('channel-row-summary-conn', {
                                    url: row.option.connection.baseUrl ?? t('channel-row-no-url'),
                                    token: row.option.connection.hasToken ? '✓' : '—',
                                    env: String(row.option.connection.envKeys.length),
                                    models: String(row.option.models.length),
                                    tiers: String(row.option.tiers.length),
                                }), styled: false, onClick: onPick === undefined ? undefined : () => onPick(index), children: _jsx(Text, { color: row.active ? 'success' : focused ? 'suggestion' : undefined, bold: focused, wrap: "truncate-end", children: row.option.name }) }, row.option.id));
                    }
                    return (_jsx(ListItem, { isFocused: focused, styled: false, onClick: onPick === undefined ? undefined : () => onPick(index), children: _jsx(Text, { color: focused ? 'suggestion' : undefined, bold: focused, wrap: "truncate-end", children: t(row.kind === 'import' ? 'channel-action-import'
                                : row.kind === 'add' ? 'channel-action-add'
                                    : row.kind === 'manage' ? 'channel-action-manage'
                                        : 'channel-action-view') }) }, row.kind));
                }), _jsx(Text, { dimColor: true, italic: true, children: _jsx(HintLine, { text: t('channel-picker-hint') }) })] }) }));
}

import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { t } from '../i18n.js';
import { Box, Text, useTerminalSize } from '../ui.js';
import { RECENTS_GROUP_PROVIDER } from '../modelGroups.js';
import { useDeclaredCursor, useNativeCursor } from '../ink/hooks/use-declared-cursor.js';
import { stringWidth } from '../ink/stringWidth.js';
import { truncateToWidth } from '../ink/truncateToWidth.js';
import { Pane } from './design-system/Pane.js';
import { ListItem } from './design-system/ListItem.js';
import { HintLine } from './design-system/HintLine.js';
import { listWindow } from './listWindow.js';
import { useOverlayListRows } from './OverlayAbove.js';
/**
 * Optional provider tabs, a windowed model list, and the focused model's effort draft.
 *
 * The native caret is parked on the region the user last touched
 * (`cursorZone`): the provider strip, the focused model row, or the effort
 * strip. Terminals with cursor animation or trail effects then glide the
 * caret from one region to the next. Static rendering keeps the painted
 * highlights (inverse tabs, ❯ pointer) as the fallback.
 */
export function ModelPicker({ groups, provider, models, focusIndex, currentModel, loading, efforts, effortId, effortsLoading, effortError, levelsFallback, cursorZone = 'model', onProvider, onFocus, onEffort, onMove, onConfirm, onCancel, }) {
    const { columns } = useTerminalSize();
    const width = Math.max(1, columns - 4); // Pane's horizontal padding.
    const availableRows = useOverlayListRows(0);
    const showProviders = groups.length > 0;
    const shortcuts = [
        ...(showProviders ? [{ text: t('hint-model-provider'), onPick: undefined }] : []),
        { text: t('hint-model-navigation'), onPick: undefined },
        { text: t('hint-model-select'), onPick: onConfirm },
        { text: t('hint-model-cancel'), onPick: onCancel },
    ];
    const shortcutRows = [];
    let usedWidth = 0;
    for (const shortcut of shortcuts) {
        const cellWidth = stringWidth(shortcut.text.replaceAll('**', ''));
        if (shortcutRows.length === 0 || usedWidth + 3 + cellWidth > width) {
            shortcutRows.push([shortcut]);
            usedWidth = cellWidth;
        }
        else {
            shortcutRows.at(-1).push(shortcut);
            usedWidth += 3 + cellWidth;
        }
    }
    const frameRows = showProviders ? 7 : 6;
    const gaps = showProviders ? 3 : 2;
    const compact = availableRows < frameRows + shortcutRows.length + gaps + 3;
    const showHeaderHints = availableRows >= frameRows + shortcutRows.length + 2;
    const description = efforts.find(effort => effort.id === effortId)?.description
        ?? (levelsFallback ? t('effort-fallback-tier-note') : undefined);
    const showDescription = !compact && description !== undefined;
    const showEfforts = availableRows >= 3;
    // Pane 2 + title 1 + optional tabs 1 + effort 2 + wrapper margin 1,
    // plus the width-aware header, section gaps and optional description.
    // Short anchors show just the focused name before effort and actions.
    // At two rows, omit effort too; only decorative headers may be clipped.
    const listRows = Math.max(1, availableRows - (showHeaderHints
        ? frameRows + shortcutRows.length + (compact ? 0 : gaps) + (showDescription ? 1 : 0)
        : frameRows - (showEfforts ? 0 : 1)));
    const showModelDescriptions = listRows >= 2;
    const modelHeights = models.map(model => showModelDescriptions && model.description ? 2 : 1);
    const { start, end } = listWindow(modelHeights, focusIndex, listRows);
    const providerFocus = groups.findIndex(group => group.provider === provider);
    const effortFocus = efforts.findIndex(effort => effort.id === effortId);
    const showEffortTabs = showEfforts && !effortsLoading && !effortError && efforts.length > 0;
    // Without header hints the overlay clips from the top. A mounted provider
    // strip is visible only if the models, effort row and footer leave it space.
    const rowsBelowProviders = Math.max(1, modelHeights.slice(start, end).reduce((sum, rows) => sum + rows, 0))
        + (showEfforts ? 1 : 0) + 1;
    const providerVisible = showHeaderHints || availableRows > rowsBelowProviders;
    // The caret follows the last-touched region, but only while that region is
    // rendered with a focused cell; otherwise it rests on the model list so it
    // can never be parked nowhere (which reads as a vanished caret).
    const caretZone = cursorZone === 'provider' && showProviders && providerVisible && providerFocus >= 0 ? 'provider'
        : cursorZone === 'effort' && showEffortTabs && effortFocus >= 0 ? 'effort'
            : 'model';
    const shortcutBar = (_jsx(Box, { flexDirection: "column", children: (showHeaderHints ? shortcutRows : [shortcuts.slice(-2)]).map((row, rowIndex) => (_jsx(Box, { height: 1, flexShrink: 0, overflow: "hidden", gap: 1, children: row.map((shortcut, index) => (_jsxs(React.Fragment, { children: [index > 0 ? _jsx(Text, { dimColor: true, children: "\u00B7" }) : null, _jsx(Box, { flexShrink: 0, maxWidth: width, onClick: shortcut.onPick ? event => {
                            event.stopImmediatePropagation();
                            shortcut.onPick();
                        } : undefined, children: _jsx(Text, { dimColor: true, wrap: "truncate", children: _jsx(HintLine, { text: shortcut.text }) }) })] }, shortcut.text))) }, rowIndex))) }));
    return (_jsx(Box, { flexDirection: "column", children: _jsxs(Pane, { color: "permission", children: [_jsx(Text, { color: "remember", bold: true, wrap: "truncate", children: t('picker-title-model') }), showHeaderHints ? shortcutBar : null, showProviders ? _jsx(Box, { marginTop: compact ? 0 : 1, marginBottom: compact ? 0 : 1, children: _jsx(PickerTabs, { labels: groups.map(group => group.provider === RECENTS_GROUP_PROVIDER ? t('picker-group-recent') : group.label), focusIndex: providerFocus, width: width, cursor: caretZone === 'provider', onPick: index => onProvider(groups[index].provider) }) }) : null, _jsx(Box, { flexDirection: "column", marginTop: !showProviders && !compact ? 1 : 0, onWheel: event => {
                        event.stopImmediatePropagation();
                        if (event.deltaY !== 0)
                            onMove(event.deltaY < 0 ? -1 : 1);
                    }, children: models.length === 0 ? (_jsx(Text, { dimColor: true, wrap: "truncate", children: t(loading ? 'model-loading' : provider === RECENTS_GROUP_PROVIDER ? 'picker-recents-empty' : 'picker-models-empty') })) : models.slice(start, end).map((model, index) => {
                        const absoluteIndex = start + index;
                        return (_jsx(ListItem, { isFocused: absoluteIndex === focusIndex, isSelected: `${model.provider}/${model.id}` === currentModel, description: showModelDescriptions ? model.description : undefined, showScrollUp: absoluteIndex === start && start > 0, showScrollDown: absoluteIndex === end - 1 && end < models.length, declareCursor: caretZone === 'model', nativeCursor: true, onClick: event => { event.stopImmediatePropagation(); onFocus(absoluteIndex); }, children: provider === RECENTS_GROUP_PROVIDER ? `${model.provider} / ${model.name}` : model.name }, `${model.provider}/${model.id}`));
                    }) }), showEfforts ? _jsxs(Box, { marginTop: compact ? 0 : 1, flexDirection: showHeaderHints ? 'column' : 'row', children: [_jsxs(Box, { height: 1, flexShrink: 0, overflow: "hidden", children: [_jsxs(Text, { color: "remember", bold: true, children: [t('picker-title-effort'), showHeaderHints ? '' : '  '] }), showHeaderHints && !effortsLoading && !effortError && efforts.length > 1 ? (_jsxs(Text, { dimColor: true, children: ['  ', _jsx(HintLine, { text: t('hint-model-effort') })] })) : null] }), _jsx(Box, { height: 1, flexShrink: 0, overflow: "hidden", children: effortsLoading || effortError || efforts.length === 0 ? (_jsx(Text, { dimColor: true, wrap: "truncate", children: models.length === 0 ? '—' : t(effortsLoading ? 'picker-effort-loading' : effortError ? 'picker-effort-error' : 'picker-effort-unavailable') })) : (_jsxs(_Fragment, { children: [effortId === undefined ? _jsxs(Text, { color: "text", children: [t('picker-effort-default'), '  '] }) : null, _jsx(PickerTabs, { labels: efforts.map(effort => effort.name), focusIndex: effortFocus, width: Math.max(1, width - (showHeaderHints ? 0 : stringWidth(t('picker-title-effort')) + 2)
                                            - (effortId === undefined ? stringWidth(t('picker-effort-default')) + 2 : 0)), muted: false, cursor: caretZone === 'effort', onPick: onEffort, onConfirm: onConfirm })] })) })] }) : null, showDescription ? _jsx(Text, { dimColor: true, wrap: "truncate", children: description.replace(/[\r\n]+/g, ' ') }) : null, !showHeaderHints ? shortcutBar : null] }) }));
}
/** Keep the active cell visible when a provider or effort strip exceeds its width. */
function PickerTabs({ labels, focusIndex, width, muted = true, cursor = false, onPick, onConfirm }) {
    const singleLines = labels.map(label => label.replace(/[\r\n]+/g, ' '));
    const allFit = singleLines.reduce((sum, label) => sum + stringWidth(label) + 2, 0)
        + Math.max(0, labels.length - 1) <= width;
    const cells = allFit ? singleLines : singleLines.map(singleLine => {
        const limit = Math.max(1, width - 6);
        return stringWidth(singleLine) > limit ? `${truncateToWidth(singleLine, limit - 1)}…` : singleLine;
    });
    const { start, end } = allFit ? { start: 0, end: cells.length }
        : listWindow(cells.map(label => stringWidth(label) + 2), Math.max(0, focusIndex), Math.max(1, width - 4), 1);
    return (_jsxs(Box, { height: 1, flexShrink: 0, overflow: "hidden", gap: 1, children: [start > 0 ? _jsx(Box, { onClick: event => { event.stopImmediatePropagation(); onPick(start - 1); }, children: _jsx(Text, { dimColor: true, children: "\u2039" }) }) : null, cells.slice(start, end).map((label, index) => (_jsx(PickerTab, { label: label, isFocused: start + index === focusIndex, muted: muted, cursor: cursor, onPick: () => {
                    onPick(start + index);
                    onConfirm?.();
                } }, start + index))), end < cells.length ? _jsx(Box, { onClick: event => { event.stopImmediatePropagation(); onPick(end); }, children: _jsx(Text, { dimColor: true, children: "\u203A" }) }) : null] }));
}
/**
 * One tab cell. The focused tab declares the native caret when its strip owns
 * it (terminals animate the caret between providers/levels); a strip is
 * structural focus, so its native caret hides after 500 ms at rest. The
 * inverse block stays painted either way so static rendering keeps a focus
 * mark.
 */
function PickerTab({ label, isFocused, muted, cursor, onPick }) {
    const nativeCursor = useNativeCursor();
    const cursorRef = useDeclaredCursor({
        line: 0,
        column: 0,
        active: isFocused && cursor,
        visible: nativeCursor,
        hideOnIdle: true,
    });
    return (_jsx(Box, { ref: cursorRef, flexShrink: 0, onClick: event => { event.stopImmediatePropagation(); onPick(); }, children: _jsx(Text, { color: isFocused ? 'remember' : muted ? undefined : 'text', inverse: isFocused, bold: isFocused, dimColor: muted && !isFocused, children: ` ${label} ` }) }));
}

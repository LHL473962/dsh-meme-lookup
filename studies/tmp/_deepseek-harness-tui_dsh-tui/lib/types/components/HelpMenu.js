import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React from 'react';
import { Box, ScrollBox, Text } from '../ui.js';
import { localizedDescription } from '../commands.js';
import { t } from '../i18n.js';
import { primaryComboString } from '../utils/keymap.js';
import { modLabel } from '../utils/modifiers.js';
/**
 * The `?` help menu with a three-column shortcut layout, trimmed to the keys
 * dsh-tui actually binds.
 * The command column lists the merged slash-command surface: built-in
 * commands plus plugin-registered ones from the DSH registry (plan/goal/…).
 * Skill entries (user-invocable skills merged for `/` completion, issue
 * #86) are hidden — a skills directory can hold dozens of entries and the
 * menu is for chrome commands. Modifier labels always read ctrl+ (see
 * modLabel): Ctrl works in every terminal, ⌘ is only a macOS alias.
 */
export function HelpMenu({ commands, viewportHeight, viewportWidth, scrollRef, onCommandPick, }) {
    const chrome = commands.filter(command => !command.skill);
    const primaryShortcuts = (_jsxs(Box, { flexDirection: "column", width: 26, flexShrink: 0, children: [_jsx(Box, { children: _jsx(Text, { dimColor: true, children: t('help-for-commands') }) }), _jsx(Box, { children: _jsx(Text, { dimColor: true, children: t('help-this-help') }) }), _jsx(Box, { children: _jsx(Text, { dimColor: true, children: t('help-verbose-output', { key: primaryComboString('transcript') }) }) }), _jsx(Box, { children: _jsx(Text, { dimColor: true, children: t('help-open-trajectory', { key: primaryComboString('trajectory') }) }) }), _jsx(Box, { children: _jsx(Text, { dimColor: true, children: t('help-search-history', { key: primaryComboString('history') }) }) }), _jsx(Box, { children: _jsx(Text, { dimColor: true, children: t('help-interrupt') }) }), _jsx(Box, { children: _jsx(Text, { dimColor: true, children: t('help-exit') }) }), _jsx(Box, { children: _jsx(Text, { dimColor: true, children: t('help-redraw', { key: primaryComboString('redraw') }) }) })] }));
    const secondaryShortcuts = (_jsxs(Box, { flexDirection: "column", width: 24, flexShrink: 0, children: [_jsx(Box, { children: _jsx(Text, { dimColor: true, children: t('help-clear-input') }) }), _jsx(Box, { children: _jsx(Text, { dimColor: true, children: t('help-history-nav') }) }), _jsx(Box, { children: _jsx(Text, { dimColor: true, children: t('help-move-cursor') }) }), _jsx(Box, { children: _jsx(Text, { dimColor: true, children: t('help-word-jumps', { mod: modLabel }) }) }), _jsx(Box, { children: _jsx(Text, { dimColor: true, children: t('help-complete-command') }) }), _jsx(Box, { children: _jsx(Text, { dimColor: true, children: t('help-cycle-mode') }) }), _jsx(Box, { children: _jsx(Text, { dimColor: true, children: t('help-open-editor', { key: primaryComboString('editor') }) }) }), _jsx(Box, { children: _jsx(Text, { dimColor: true, children: t('help-fold-todos', { key: primaryComboString('todoFold') }) }) })] }));
    const commandRows = chrome.map(command => (_jsx(HelpCommandRow, { command: command, onPick: onCommandPick }, command.name)));
    const compactCommandRows = chrome.map(command => (_jsx(HelpCommandRow, { command: command, onPick: onCommandPick }, command.name)));
    const commandList = (_jsxs(Box, { flexDirection: "column", flexShrink: 0, children: [_jsx(Text, { dimColor: true, children: t('help-commands-title') }), commandRows] }));
    const content = (_jsxs(Box, { paddingX: 2, flexDirection: "row", gap: 4, children: [primaryShortcuts, secondaryShortcuts, _jsx(Box, { flexDirection: "column", flexShrink: 1, children: commandList })] }));
    // Standalone renders (notably the i18n verifier) keep the historical
    // intrinsic-height layout. The real prompt overlay supplies an explicit
    // height so a growing command registry cannot escape the terminal.
    if (viewportHeight === undefined)
        return content;
    const compact = viewportWidth !== undefined && viewportWidth < 72;
    return (_jsxs(Box, { height: viewportHeight, flexDirection: "column", children: [compact ? (_jsxs(ScrollBox, { ref: scrollRef, flexDirection: "column", flexGrow: 1, flexShrink: 1, paddingX: 2, children: [primaryShortcuts, secondaryShortcuts, _jsx(Text, { dimColor: true, children: t('help-commands-title') }), compactCommandRows] })) : (_jsxs(Box, { paddingX: 2, flexDirection: "row", gap: 4, flexGrow: 1, children: [primaryShortcuts, secondaryShortcuts, _jsx(ScrollBox, { ref: scrollRef, flexDirection: "column", flexGrow: 1, flexShrink: 1, children: commandList })] })), _jsx(Box, { paddingX: 2, flexShrink: 0, children: _jsx(Text, { dimColor: true, wrap: "truncate-end", children: t('help-scroll-hint') }) })] }));
}
/** One `/name — description` row; clickable (hover background) when the
 *  host wired a pick handler — the menu IS a control surface. */
function HelpCommandRow({ command, onPick, }) {
    const [hovered, setHovered] = React.useState(false);
    const clickable = onPick !== undefined;
    return (_jsx(Box, { flexShrink: 0, onClick: clickable ? () => onPick(command.name) : undefined, onMouseEnter: clickable ? () => setHovered(true) : undefined, onMouseLeave: clickable ? () => setHovered(false) : undefined, backgroundColor: clickable && hovered ? 'userMessageBackgroundHover' : undefined, children: _jsxs(Text, { dimColor: true, wrap: "truncate-end", children: ["/", command.name, " \u2014 ", localizedDescription(command)] }) }));
}

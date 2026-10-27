import { jsx as _jsx } from "react/jsx-runtime";
import Box from '../ink/components/Box.js';
import { ListItem } from './design-system/ListItem.js';
/**
 * A single-choice select list with the standard dsh-TUI visual treatment:
 * ListItem rows with ❯ focus pointer, ✓ selected checkmark, descriptions,
 * scroll arrows). Keyboard navigation is owned by the parent dialog, which
 * passes focus/selection indices back in.
 */
export function Select({ options, focusIndex, selectedValue, visibleOptionCount = 5, onPick, }) {
    // Window around the focus row, with scroll hints at the edges.
    const startIndex = Math.max(0, Math.min(focusIndex - Math.floor(visibleOptionCount / 2), options.length - visibleOptionCount));
    const endIndex = Math.min(startIndex + visibleOptionCount, options.length);
    const visible = options.slice(startIndex, endIndex);
    return (_jsx(Box, { flexDirection: "column", children: visible.map((option, index) => {
            const absoluteIndex = startIndex + index;
            return (_jsx(ListItem, { isFocused: absoluteIndex === focusIndex, isSelected: option.value === selectedValue, description: option.description, showScrollUp: absoluteIndex === startIndex && startIndex > 0, showScrollDown: absoluteIndex === endIndex - 1 && endIndex < options.length, onClick: onPick
                    ? (event) => onPick(absoluteIndex, option.value, event)
                    : undefined, children: option.label }, option.value));
        }) }));
}

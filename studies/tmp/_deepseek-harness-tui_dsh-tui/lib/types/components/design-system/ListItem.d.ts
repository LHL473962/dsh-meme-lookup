import React, { type ReactNode } from 'react';
import type { ClickEvent } from '../../ink/events/click-event.js';
export type ListItemProps = {
    /** Whether this item is currently focused (keyboard selection).
     *  Shows the pointer indicator (❯) when true. */
    isFocused: boolean;
    /** Whether this item is selected (chosen/checked).
     *  Shows the checkmark indicator (✓) when true. */
    isSelected?: boolean;
    /** The content to display for this item. */
    children: ReactNode;
    /** Optional description text displayed below the main content. */
    description?: string;
    /** Show a down arrow indicator instead of pointer (scroll hints). */
    showScrollDown?: boolean;
    /** Show an up arrow indicator instead of pointer (scroll hints). */
    showScrollUp?: boolean;
    /** Whether to apply automatic styling based on focus/selection state. */
    styled?: boolean;
    /** Disabled items show dimmed text and no indicators. */
    disabled?: boolean;
    /**
     * Whether this ListItem should declare the terminal cursor position.
     * Set false when a child (e.g. BaseTextInput) declares its own cursor —
     * or when a sibling region of the same picker currently owns it, so the
     * caret stays where the user last interacted.
     * @default true
     */
    declareCursor?: boolean;
    /**
     * Show the terminal's native caret on the focused row (terminals with
     * cursor animation or trail effects then glide between rows) instead of
     * leaving an invisible accessibility anchor. Retain the terminal's cursor
     * style and hide it after 500 ms at rest. Opt-in: a plain
     * list keeps the painted ❯ pointer as its only focus mark.
     * @default false
     */
    nativeCursor?: boolean;
    /**
     * Mouse click handler (fullscreen mode). When provided the row becomes
     * clickable and gains a subtle hover background so the affordance is
     * visible; when absent the row renders exactly as before.
     */
    onClick?: (event: ClickEvent) => void;
};
/**
 * A list item for selection UIs: `❯` marks the focused row, `✓`
 * checkmark for the selected row, description on an indented second line,
 * and its color states (focused = suggestion blue, selected = success
 * green).
 */
export declare function ListItem({ isFocused, isSelected, children, description, showScrollDown, showScrollUp, styled, disabled, declareCursor, nativeCursor, onClick, }: ListItemProps): React.ReactNode;
//# sourceMappingURL=ListItem.d.ts.map
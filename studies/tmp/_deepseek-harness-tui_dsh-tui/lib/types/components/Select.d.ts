import React from 'react';
import type { ClickEvent } from '../ink/events/click-event.js';
export type SelectOption = {
    value: string;
    /** Row content; plain strings render inline, richer rows may carry color swatches. */
    label: React.ReactNode;
    description?: string;
};
/**
 * A single-choice select list with the standard dsh-TUI visual treatment:
 * ListItem rows with ❯ focus pointer, ✓ selected checkmark, descriptions,
 * scroll arrows). Keyboard navigation is owned by the parent dialog, which
 * passes focus/selection indices back in.
 */
export declare function Select({ options, focusIndex, selectedValue, visibleOptionCount, onPick, }: {
    options: readonly SelectOption[];
    /** Index of the keyboard-focused row (shows the ❯ pointer). */
    focusIndex: number;
    /** Value of the chosen row (shows the ✓ checkmark). */
    selectedValue: string | undefined;
    visibleOptionCount?: number;
    /**
     * Mouse pick handler (fullscreen). Clicking a row reports the row's
     * absolute index — the parent typically applies it with the same code
     * path as the keyboard Enter. Absent → rows are not clickable.
     */
    onPick?: (index: number, value: string, event: ClickEvent) => void;
}): React.ReactNode;
//# sourceMappingURL=Select.d.ts.map
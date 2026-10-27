import React from 'react';
import type { ClickEvent } from '../../ink/events/click-event.js';
/** One tab of the session screen's source strip. */
export interface SourceTab {
    readonly id: string;
    readonly label: string;
}
/** Which tabs the strip draws and which fold into the `+N` cell. */
export interface SourceTabsLayout {
    readonly shown: readonly SourceTab[];
    readonly hidden: readonly SourceTab[];
}
/**
 * Display width of a strip: its cells, the `│` after the leading DSH tab when
 * anything follows it, and the `+N` cell when tabs are folded.
 * @param shown - Tabs drawn in full; the first is the DSH tab when present.
 * @param hidden - How many tabs fold into `+N`.
 * @param leadId - Id of the tab the separator follows.
 * @returns Terminal cells the strip occupies.
 */
export declare function sourceTabsWidth(shown: readonly SourceTab[], hidden: number, leadId: string): number;
/**
 * Fit the strip into `budget` cells.
 *
 * Tabs fold from the END (the strip is sorted by recency, so the oldest source
 * goes first) into one `+N` cell. The active tab never folds — a strip that
 * hid the tab you are on could not tell you where you are — and the leading
 * tab is the last to go after it.
 * @param tabs - Every tab, leading tab first.
 * @param active - Id of the active tab.
 * @param budget - Cells available to the strip.
 * @returns The tabs to draw and the tabs behind `+N`.
 */
export declare function layoutSourceTabs(tabs: readonly SourceTab[], active: string, budget: number): SourceTabsLayout;
/**
 * The source strip in the session screen's header: `DSH │ Claude Code  Codex`.
 *
 * The active tab is a reverse block in the remember colour; the others are dim
 * until the pointer is over them. Every click stops propagation, because the
 * screen's root closes open menus on click and a tab click is not a click on
 * the background.
 */
export declare function SourceTabs({ layout, active, leadId, onSelect, onOverflow, }: {
    layout: SourceTabsLayout;
    active: string;
    /** Id of the tab the `│` separator follows. */
    leadId: string;
    onSelect(id: string): void;
    /** Click on `+N`: open the list of folded tabs at the pointer. */
    onOverflow(event: ClickEvent): void;
}): React.ReactNode;
//# sourceMappingURL=SourceTabs.d.ts.map
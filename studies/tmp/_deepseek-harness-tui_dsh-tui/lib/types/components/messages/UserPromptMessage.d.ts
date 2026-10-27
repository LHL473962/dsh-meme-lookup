import React from 'react';
import type { ClickEvent } from '../../ink/events/click-event.js';
type Props = {
    text: string;
    /** Adds the top margin between turns. */
    marginTopOnTurn: boolean;
    /** Message-selection mode highlight. */
    isSelected?: boolean;
    onClick?(event: ClickEvent): void;
};
/**
 * User prompt bubble: `❯ text` in bold userPromptLabel tint with no background
 * fill (Kimi Code style: the user turn gets a distinct bold tint — the
 * kernel-rotated brand colour of the active theme — so it reads apart from
 * assistant text; only selection mode paints a highlight).
 */
export declare function UserPromptMessage({ text, marginTopOnTurn, isSelected, onClick, }: Props): React.ReactNode;
export {};
//# sourceMappingURL=UserPromptMessage.d.ts.map
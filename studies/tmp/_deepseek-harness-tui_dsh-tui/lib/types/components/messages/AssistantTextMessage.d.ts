import React from 'react';
type Props = {
    text: string;
    /** Adds the top margin between messages. */
    marginTopOnTurn: boolean;
    /** Message-selection mode highlight. */
    isSelected?: boolean;
    /** Row expanded on its own (persistent hover-grey background). */
    isExpanded?: boolean;
};
/**
 * Assistant text message: bullet + markdown body.
 *
 * Deliberately not clickable: the transcript is reading material and the
 * mouse's job there is text selection (user feedback — row hover tints and
 * fold toggling were noise, not affordance).
 */
export declare function AssistantTextMessage({ text, marginTopOnTurn, isSelected, isExpanded, }: Props): React.ReactNode;
export {};
//# sourceMappingURL=AssistantTextMessage.d.ts.map
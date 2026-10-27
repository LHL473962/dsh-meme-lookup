import React from 'react';
type Props = {
    /** The sending team member's name. */
    sender: string;
    text: string;
    /** Adds the top margin between turns. */
    marginTopOnTurn: boolean;
    /** Message-selection mode highlight. */
    isSelected?: boolean;
};
/**
 * An Agent Teams peer message delivered to this session: a `✉ <sender>` line
 * in the agent tint, then the body in plain text with a hanging indent — it
 * reads apart from the human's bold `❯` prompt it shares a log role with.
 * The body wraps in its own flex column, so it fits whatever column hosts it
 * (the main list, a child scene's padded page, a split with the workbench).
 */
export declare function TeamMessageBubble({ sender, text, marginTopOnTurn, isSelected }: Props): React.ReactNode;
export {};
//# sourceMappingURL=TeamMessageBubble.d.ts.map
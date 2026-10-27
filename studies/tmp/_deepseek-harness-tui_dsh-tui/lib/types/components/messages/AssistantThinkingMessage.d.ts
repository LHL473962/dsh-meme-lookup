import React from 'react';
import type { ClickEvent } from '../../ink/events/click-event.js';
type Props = {
    thinking: string;
    /** The FULL un-revealed text (reasoning rows under smooth streaming):
     *  `thinking` carries the revealed slice the expanded body paints, while
     *  the live preview ticker must follow the newest ARRIVED content — never
     *  a lagging reveal. Falls back to `thinking`. */
    textFull?: string;
    /** Adds the top margin between messages. */
    marginTopOnTurn: boolean;
    /** Show the full text (Ctrl+O, per-row expansion, or live click toggle). */
    verbose: boolean;
    /** True while the reasoning block is still streaming — the leading anchor
     *  becomes a rotating braille spinner (Kimi Code style) and settles back
     *  to the anchor once the step ends. */
    streaming?: boolean;
    /** Streaming compact mode (thinkingFold=preview): a 3-row live ticker of
     *  the model's latest reasoning lines instead of the full block —
     *  kimicode-style constant height; the block never resizes mid-stream. */
    preview?: boolean;
    /** Thinking wall-clock duration once the reasoning block settled (ms). */
    durationMs?: number;
    /** Estimated thinking tokens when the backend reports thinking only as a
     *  count (no text). Renders a one-line `Thinking · ~N tokens` header while
     *  streaming and `Thought · ~N tokens` once settled; text, when present,
     *  still wins. */
    reasoningTokens?: number;
    /** Message-selection mode highlight. */
    isSelected?: boolean;
    onClick?(event: ClickEvent): void;
};
/**
 * Thinking block: settled rows fold to `⚓ Thinking` plus the localized
 * ctrl+o expand hint (hint-expand-ctrl-o);
 * streaming rows switch between a three-line preview and the full reasoning
 * text on click. The live leading mark is a rotating braille spinner
 * (`⠋⠙⠹…`, Kimi Code style), settling back to the static anchor (`⚓`). When
 * the channel records the reasoning duration, the label carries it
 * (`⚓ Thinking · 12s …`) — dsh-tui's take on making thinking time visible in
 * the transcript.
 */
export declare function AssistantThinkingMessage({ thinking, textFull, marginTopOnTurn, verbose, streaming, preview, durationMs, reasoningTokens, isSelected, onClick, }: Props): React.ReactNode;
export {};
//# sourceMappingURL=AssistantThinkingMessage.d.ts.map
import React from 'react';
import type { Theme } from '../../theme.js';
import type { ClickEvent } from '../../ink/events/click-event.js';
import type { ToolRow } from '../../dsh-adapter/channel.js';
import type { ToolBackground } from '../../tuiDisplayPrefs.js';
import type { TranscriptImage } from '../../dsh-adapter/transcript-images.js';
import type { AgentMessageState, AgentMessageVia, AgentMessageView } from './agentTeam.js';
/** Delivery-state badge color: only what the channel reported — green is
 *  reserved for an explicit `delivered` fact, dim for `unknown`/`expired`. */
export declare function agentMessageStateColor(state: AgentMessageState): keyof Theme;
/** The localized state word (issued/queued/delivered/held/refused/expired/
 *  unknown) — one vocabulary across composer status lines and flow rows. */
export declare function agentMessageStateText(state: AgentMessageState): string;
/** One endpoint's short label: `user`/`parent`/`child` for the relations the
 *  view itself proves (own id, parentSessionId), the stable short id for any
 *  other agent. Absent ids stay unnamed — the caller decides whether that is
 *  an unknown-relation row (no arrow). */
export declare function agentMessagePartyLabel(id: string | undefined, selfAgentId: string, parentSessionId?: string): string | undefined;
/** The localized transport word. */
export declare function agentMessageViaText(via: AgentMessageVia): string;
/**
 * One agent↔agent message as a transcript leaf: a `⇄ from → to · state`
 * header plus an indented preview, paged together with the thinking/text/
 * tool leaves. Without both endpoints it shows the unknown-relation line
 * and no arrow.
 */
export declare function AgentMessageLeafRow({ message, selfAgentId, marginTopOnTurn }: {
    message: AgentMessageView;
    /** This child's agent id — resolves `child` in the party labels. */
    selfAgentId: string;
    marginTopOnTurn: boolean;
}): React.ReactNode;
/**
 * Transcript leaf rows: the main MessageList and the subagent transcript
 * pages render thinking / tool / text rows through these thin adapters, so
 * a child transcript reads like the main one. Presentation only: fold
 * state, reveal cursors and row anchoring stay with the callers.
 */
/** A settled/live thinking row (`⚓ Thinking` preview or expanded body). */
export declare function ThinkingLeafRow({ thinking, textFull, marginTopOnTurn, streaming, preview, verbose, durationMs, reasoningTokens, isSelected, onClick, }: {
    thinking: string;
    /** The full un-revealed text the live preview ticker follows. */
    textFull?: string;
    marginTopOnTurn: boolean;
    streaming?: boolean;
    preview?: boolean;
    verbose: boolean;
    durationMs?: number;
    /** Thinking reported only as a count (no body) — the one-line header. */
    reasoningTokens?: number;
    isSelected?: boolean;
    onClick?(event: ClickEvent): void;
}): React.ReactNode;
/** A tool-call card (args / result / error / diff), optionally with images. */
export declare function ToolLeafRow({ tool, marginTopOnTurn, verbose, isSelected, isExpanded, footnote, diffLayout, toolBackground, smoothReveal, fresh, revealVersion, foldTerminalCommand, onClick, onOpenFile, images, onPreviewImage, suppressImageGraphics, sourceFolded, fullscreen, }: {
    tool: ToolRow;
    marginTopOnTurn: boolean;
    verbose: boolean;
    isSelected?: boolean;
    isExpanded?: boolean;
    footnote?: string;
    diffLayout?: 'auto' | 'split' | 'unified';
    toolBackground?: ToolBackground;
    smoothReveal?: boolean;
    fresh?: boolean;
    revealVersion?: number;
    foldTerminalCommand?: boolean;
    onClick?(event: ClickEvent): void;
    onOpenFile?: (path: string) => void;
    images?: readonly TranscriptImage[];
    onPreviewImage?(image: TranscriptImage): void;
    suppressImageGraphics?: boolean;
    /** The transcript window folded this row's source (previews only). */
    sourceFolded?: boolean;
    /** Fullscreen layout (more live output lines on a running card). */
    fullscreen?: boolean;
}): React.ReactNode;
/** An assistant text row (`●` bullet + markdown body). */
export declare function AssistantTextLeafRow({ text, marginTopOnTurn, isSelected, isExpanded, }: {
    text: string;
    marginTopOnTurn: boolean;
    isSelected?: boolean;
    isExpanded?: boolean;
}): React.ReactNode;
//# sourceMappingURL=TranscriptLeaves.d.ts.map
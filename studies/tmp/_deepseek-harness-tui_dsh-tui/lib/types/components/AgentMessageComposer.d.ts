import React from 'react';
import type { AgentComposeTarget, AgentMessageControl, AgentMessageView } from './messages/agentTeam.js';
export interface AgentMessageComposerProps {
    /** Resolved target: unique name, or the stable id when ambiguous. */
    readonly target: AgentComposeTarget;
    /** The channel's message control (`subagentControl.message`); the wiring
     *  already proved the member exists. */
    readonly control: AgentMessageControl;
    /** The durable feed for this child — later facts about our intents. */
    readonly messages: readonly AgentMessageView[];
    /** Keyboard focus; the scene yields plain typing here while true. */
    readonly focused: boolean;
    onFocusChange(focused: boolean): void;
    /** Side-panel form: the panel's own key handler forwards keys through
     *  this ref instead of the composer listening with useInput. The panel
     *  host swallows every plain key before a later-mounted listener sees it,
     *  so a direct listener would never get the typing, and one left active
     *  after focus moves back to chat would pick up the chat's keystrokes. */
    readonly keyHandlerRef?: React.MutableRefObject<ComposerKeyHandler | null>;
}
/** Ink's key flags as the composer reads them (the panel dispatcher passes
 *  the same runtime object, with `return_` added). */
type ComposerKey = {
    readonly escape?: boolean;
    readonly return?: boolean;
    readonly return_?: boolean;
    readonly ctrl?: boolean;
    readonly meta?: boolean;
    readonly shift?: boolean;
    readonly backspace?: boolean;
    readonly delete?: boolean;
    readonly leftArrow?: boolean;
    readonly rightArrow?: boolean;
    readonly home?: boolean;
    readonly end?: boolean;
};
/** true = the composer consumed the key. */
export type ComposerKeyHandler = (input: string, key: ComposerKey) => boolean;
/** Caret steps over whole code points, so an emoji is never split. */
export declare function previousCodePoint(text: string, caret: number): number;
export declare function nextCodePoint(text: string, caret: number): number;
/**
 * The user→child send box. It owns its own draft (never the parent's
 * PromptInput, dock or queue) and submits only through the channel's
 * AgentMessageControl (Claude: relayed by the parent; DSH: a direct prompt
 * to a continuable child). A failure keeps the draft and says why.
 */
export declare function AgentMessageComposer({ target, control, messages, focused, onFocusChange, keyHandlerRef }: AgentMessageComposerProps): React.ReactNode;
export {};
//# sourceMappingURL=AgentMessageComposer.d.ts.map
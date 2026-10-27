import React from 'react';
import type { SubagentState } from '../dsh-adapter/subagents.js';
import { type TranscriptLoader } from '../components/messages/subagentTranscript.js';
import type { AgentComposeTarget, AgentMessageControl, AgentMessageView, AgentViewSource } from '../components/messages/agentTeam.js';
export interface AgentTranscriptSceneProps {
    /** The child this view reads. Readonly by contract — the scene never
     *  mutates the roster, the Channel or the parent's queues. */
    readonly subagent: SubagentState;
    /** Called when this failed child is shown, never for its siblings. */
    onFailureRead?: (subagent: SubagentState) => void;
    /** Where Esc returns to. */
    readonly source: AgentViewSource;
    onExit(): void;
    /** The child's full transcript (`subagentControl.history`). Absent = no
     *  transcript source: the bounded live tail with its retained-range note,
     *  not an empty history. */
    loadTranscript?: TranscriptLoader;
    /** The durable agent↔agent feed for this child (newest last), if any. */
    readonly messages?: readonly AgentMessageView[];
    /** The channel's message control + resolved target
     *  (`subagentControl.message`); absent = no composer. */
    readonly compose?: {
        readonly control: AgentMessageControl;
        readonly target: AgentComposeTarget;
    };
    /** The session roster: drives the workbench rail (metadata, tools,
     *  parent, sibling switcher). Absent, or a narrow terminal = the single
     *  transcript column. */
    readonly roster?: readonly SubagentState[];
    /** Switch the viewed agent IN PLACE (sibling/parent navigation): the
     *  source stack is preserved — Esc still returns to the original entry
     *  point. Absent = the panel renders read-only rows without switching. */
    onSwitchAgent?: (agentId: string) => void;
}
/**
 * The main-screen read-only view of one subagent: a scene over the mounted
 * parent Chat, not a second Channel. The parent's rows, draft, pending
 * queue and usage keep living underneath; Esc returns to where the view
 * was opened from (chat, agents dashboard, agent detail, transcript card).
 * The body uses the same transcript pager as the Detail page, with the
 * live SubagentState tail merged in.
 */
export declare function AgentTranscriptScene({ subagent, onFailureRead, source, onExit, loadTranscript, messages, compose, roster, onSwitchAgent }: AgentTranscriptSceneProps): React.ReactNode;
//# sourceMappingURL=AgentTranscriptScene.d.ts.map
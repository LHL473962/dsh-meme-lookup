import type { Agent, AssistantStreamFrame } from '@deepseek-ai/dsh-agent';
import { SubagentActivityStore } from '../subagents.js';
import type { SubagentTranscriptPage, SubagentTranscriptWindow } from '../../agent/capabilities.js';
import type { AgentIdentity, AgentMessageSubmitInput, AgentMessageSubmitResult, AgentMessageView } from '../../adapter/ports/channel-view.js';
import type { ChannelState } from './types.js';
type ProjectionState = Pick<ChannelState, 'rows' | 'subagents' | 'subagentCost' | 'emit' | 'emitStream'>;
/**
 * Structural view of the host `ctx.subagents` continuation service
 * (@deepseek-ai/dsh-subagent's SubagentRuntime) as this projection uses it.
 * Reached by an optional service lookup, so every member is optional and
 * the capability is the method's presence. Nothing here bypasses the
 * continuation manager: `prompt` goes through its exact-parent authority,
 * cold resume and inbox admission, `interrupt` through its authority check.
 */
export interface SubagentsServiceView {
    interrupt?(target: string, reason: unknown): void;
    /** Browser-authored prompt to a direct continuable child: resolves with
     *  the accepted message's inbox id. */
    prompt?(request: {
        readonly requestId: string;
        readonly parentSessionId: string;
        readonly childSessionId: string;
        readonly mode: 'continuable';
        readonly delivery: 'queue' | 'steer';
        readonly content: readonly {
            readonly type: 'text';
            readonly text: string;
        }[];
    }, signal: AbortSignal): Promise<{
        readonly messageId: string;
    }>;
    /** Durable direct-child catalog read; no Agent is loaded, so the rows
     *  carry no liveness guarantee. */
    listChildren?(parentSessionId: string, signal?: AbortSignal): Promise<readonly SubagentCatalogEntryView[]>;
}
/** One `listChildren` catalog row (SubagentCatalogEntry, structural). */
export interface SubagentCatalogEntryView {
    readonly id: string;
    readonly createdAt: number;
    readonly mode: 'one-shot' | 'continuable' | 'unknown';
    readonly label?: string;
}
interface ProjectionDependencies {
    rowIds: {
        value: number;
    };
    agent(): Agent;
    subagents(): SubagentsServiceView | undefined;
    /** Optional child metadata lookup; failures must not suppress spawning. */
    lookupChild(id: string): {
        status?: string;
        session?: unknown;
        options?: {
            provider?: string;
            model?: string;
        };
    } | undefined;
    /** Aborted when the channel owner releases: cancels a prompt that has not
     *  been accepted yet (an accepted child inbox belongs to the continuation
     *  manager from then on). */
    ownerSignal?: AbortSignal;
    /** The DSH child transcript source (docs/dsh-child-transcript.md),
     *  injected only when the host composition serves session persistence.
     *  Its presence is the `SubagentControl.history` capability: the shared
     *  transcript tab renders exactly when it exists, with no backend-specific
     *  UI. The reader re-captures parent identity, binding generation and
     *  child ownership on every call, so a plain pass-through is fence-safe. */
    readChildTranscript?: (agentId: string, window?: SubagentTranscriptWindow) => Promise<SubagentTranscriptPage | null>;
}
/**
 * Keep each parked parent's reducer alive, including session links and the
 * stream attempt/settlement cursor. A display snapshot cannot resume either
 * a run epoch or an in-flight assistant attempt faithfully.
 */
export declare function createSubagentProjection(getState: () => ProjectionState, deps: ProjectionDependencies): {
    readonly store: SubagentActivityStore;
    readonly pendingTaskDescriptions: string[];
    control: {
        message: {
            via: "direct-continuable";
            steer: true;
            listTargets: () => Promise<readonly AgentIdentity[]>;
            submit: (input: AgentMessageSubmitInput) => Promise<AgentMessageSubmitResult>;
            messages: () => AgentMessageView[];
        };
        history?: ((agentId: string, window?: SubagentTranscriptWindow) => Promise<SubagentTranscriptPage | null>) | undefined;
        interrupt: (id: string) => boolean;
    };
    onSessionEvent(session: unknown, event: {
        type?: string;
    }): boolean;
    onStreamFrame(agent: unknown, frame: AssistantStreamFrame): boolean;
    onStart(info: Parameters<(info: {
        id: string;
        runId?: string;
        provider: string;
        local?: boolean;
    }) => void>[0], parent?: object | null): void;
    onEnd(info: Parameters<(info: {
        id: string;
        runId?: string;
        stopReason: string;
        lastAssistantMessage?: unknown[];
    }) => void>[0], parent?: object | null): void;
    onParentEvent: (event: unknown) => void;
    bootstrapFromLog(events: readonly unknown[]): void;
    syncNow: () => void;
    flush: () => boolean;
    dropRows: () => void;
    park: (agent: Agent) => void;
    restore: (agent: Agent) => void;
    forget(agent: Agent): void;
    dispose(): void;
    reset(): void;
};
export {};
//# sourceMappingURL=subagent-projection.d.ts.map
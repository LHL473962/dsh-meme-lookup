import type { Agent, AgentHandle } from '@deepseek-ai/dsh-agent';
import type { Context } from '@deepseek-ai/cordis';
import { type SessionSummary } from '../sessions/index.js';
import type { DshChannelBinding } from './binding.js';
import type { ChannelOwner } from './owner.js';
import type { AgentViewDispatchResult, AgentViewRow, BackgroundResult, ResumeResult } from './types.js';
import type { PreviewEntry } from '../sessions/index.js';
type Binding = DshChannelBinding;
type ApprovalStore = {
    pendingAgentIds(): readonly string[];
    pendingAgentDetail(agentId: string): {
        toolName: string;
        reason?: string;
        command?: string;
    } | undefined;
    subscribe(listener: () => void): () => void;
};
/** Owns detached background handles and the agent-view projection. */
export declare function createAgentViewProjection(ctx: Context, deps: {
    owner: Pick<ChannelOwner, 'current' | 'assertActive' | 'own'>;
    binding: Pick<Binding, 'agent' | 'capture' | 'isCurrent' | 'prepare' | 'abandon' | 'waitForDisposal'>;
    cwd(): string;
    configuredPreset?: string;
    configuredProvider?: string;
    configuredModel?: string;
    provider: string;
    model: string;
    notify(text: string, options?: {
        color?: 'error' | 'warning';
        timeoutMs?: number;
    }): unknown;
    listPersisted(): Promise<readonly SessionSummary[]>;
    createDetached(create: () => Promise<AgentHandle>): Promise<{
        handle: AgentHandle;
        transfer(): void;
        release(): Promise<void>;
    }>;
    sessionSwitchVetoed(kind: 'agent-view', targetSessionId?: string): Promise<boolean>;
    adoptLive(target: Agent): Promise<ResumeResult>;
    resumeInto(sessionId: string, kind: 'agent-view', keepCurrent: boolean): Promise<ResumeResult>;
    /** The foreground binding transaction for `/bg`; the caller owns only
     * resetting/binding the foreground projection, never the parked handle. */
    backgroundCurrent?(): Promise<BackgroundResult>;
    backgroundHandles?: Map<string, AgentHandle>;
}): {
    start: () => void;
    backgroundHandles: Map<string, AgentHandle>;
    notify: () => void;
    schedule: () => void;
    refreshPersisted: () => void;
    bindApprovalStore: (store: ApprovalStore) => void;
    rows: () => readonly AgentViewRow[];
    subscribe(listener: () => void): () => boolean;
    dispatch: (prompt: string) => Promise<AgentViewDispatchResult>;
    stop: (sessionId: string) => Promise<boolean>;
    attach: (sessionId: string) => Promise<ResumeResult>;
    peek: (sessionId: string) => Promise<PreviewEntry[]>;
    reply: (sessionId: string, text: string) => Promise<boolean>;
    backgroundCurrent: () => Promise<BackgroundResult>;
    setPersisted(rows: readonly SessionSummary[]): void;
    forget(sessionId: string): void;
};
export {};
//# sourceMappingURL=agent-view-projection.d.ts.map
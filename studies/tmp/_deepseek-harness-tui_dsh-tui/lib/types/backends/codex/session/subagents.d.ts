/** Parent-owned Codex subagents: independent translators and bounded history pages. */
import type { SubagentTranscriptPage, SubagentTranscriptWindow } from '../../../agent/capabilities.js';
import type { AgentEvent, AgentEventMeta } from '../../../agent/events.js';
import { type Rec } from '../narrow.js';
import { type CodexHub } from '../rpc/hub.js';
export declare function createCodexSubagents(deps: {
    readonly hub: Pick<CodexHub, 'call'>;
    readonly cwd: string;
    threadId(): string;
    /** One monotonic sequence shared with the parent's ItemContext. */
    nextSeq(): number;
    emit(events: readonly AgentEvent[], wake?: AgentEventMeta['wake']): void;
    readonly now?: () => number;
    debug?(message: string): void;
}): {
    capability: {
        interrupt(agentId: string): Promise<boolean>;
        history?(agentId: string, window?: SubagentTranscriptWindow): Promise<SubagentTranscriptPage>;
        messaging?: "parent-mediated";
        readonly messagingTool?: string;
    };
    decorate: (events: readonly AgentEvent[]) => AgentEvent[];
    seed(events: readonly AgentEvent[]): void;
    notification(method: string, params: Rec): boolean;
    reset(): void;
    close(): void;
};
//# sourceMappingURL=subagents.d.ts.map
import type { ChannelUi } from '../../adapter/channel/ui-policy.js';
import type { SubagentState } from '../../adapter/ports/channel-view.js';
type Failure = Pick<SubagentState, 'agentId' | 'runId' | 'startedAt' | 'completedAt' | 'endedAt' | 'status' | 'error' | 'stopReason'>;
export declare function subagentFailureScope(channel: Pick<ChannelUi, 'sessionRef' | 'sessionId'>): string;
export declare function createSubagentFailureReadStore(): {
    subscribe(listener: () => void): () => void;
    getSnapshot: () => number;
    unread(scope: string, agents: readonly Failure[]): ReadonlySet<string>;
    acknowledge(scope: string, agent: Failure): void;
    forgetRecovered(scope: string, agents: readonly Failure[]): void;
};
export declare const subagentFailureRead: {
    subscribe(listener: () => void): () => void;
    getSnapshot: () => number;
    unread(scope: string, agents: readonly Failure[]): ReadonlySet<string>;
    acknowledge(scope: string, agent: Failure): void;
    forgetRecovered(scope: string, agents: readonly Failure[]): void;
};
export declare function useUnreadSubagentFailures(channel: ChannelUi): ReadonlySet<string>;
export {};
//# sourceMappingURL=subagentFailureRead.d.ts.map
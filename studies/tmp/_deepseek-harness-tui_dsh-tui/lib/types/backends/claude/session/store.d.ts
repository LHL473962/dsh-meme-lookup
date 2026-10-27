import type { AgentEvent } from '../../../agent/events.js';
import type { AgentSessionRef } from '../../../agent/refs.js';
import type { AgentSession } from '../../../agent/session.js';
import type { ClaudeSessionDeps, Run } from './types.js';
export declare function createSessionStore(context: {
    readonly deps: ClaudeSessionDeps;
    readonly run: Run;
    readonly persisted: boolean;
    readonly currentSessionId: string;
    readonly ownRef: AgentSessionRef;
    emit(events: readonly AgentEvent[]): void;
}): {
    sessionStoreCapabilities: () => Pick<AgentSession["capabilities"], "fork" | "rewind">;
    renameCapability: () => Pick<AgentSession["capabilities"], "rename">;
    flushRename: () => void;
};
//# sourceMappingURL=store.d.ts.map
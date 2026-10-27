/** A compact working line driven by native thread notifications, not every token. */
import type { WorkingActivityView } from '../../../agent/index.js';
import type { AgentEvent } from '../../../agent/events.js';
import { type Rec } from '../narrow.js';
import type { RpcClock } from '../rpc/client.js';
export declare function createCodexActivity(deps: {
    readonly clock: RpcClock;
    now(): number;
    emit(events: readonly AgentEvent[]): void;
}): {
    capability: {
        subscribe(listener: (value: WorkingActivityView) => void): () => void;
    };
    notification(method: string, params: Rec): void;
    reset(): void;
    close(): void;
};
//# sourceMappingURL=activity.d.ts.map